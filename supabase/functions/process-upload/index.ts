import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { S3Client, GetObjectCommand, PutObjectCommand } from 'npm:@aws-sdk/client-s3'
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigned'
import Sharp from 'npm:sharp'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SIZES = {
  thumbnail: 400,
  medium: 1200,
  compressed: 2400,
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return new Response('Unauthorized', { status: 401, headers: corsHeaders })

    const { mediaFileId, fileType } = await req.json()
    if (!mediaFileId) return new Response('Missing mediaFileId', { status: 400, headers: corsHeaders })

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Fetch media file record
    const { data: mediaFile, error: fetchErr } = await adminClient
      .from('media_files')
      .select('*')
      .eq('id', mediaFileId)
      .single()

    if (fetchErr || !mediaFile) {
      return new Response('Media file not found', { status: 404, headers: corsHeaders })
    }

    const r2AccountId = Deno.env.get('R2_ACCOUNT_ID')!
    const r2AccessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')!
    const r2SecretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')!
    const r2BucketName = Deno.env.get('R2_BUCKET_NAME')!
    const r2PublicUrl = Deno.env.get('R2_PUBLIC_URL') || ''

    const r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: r2AccessKeyId, secretAccessKey: r2SecretAccessKey },
    })

    const isPhoto = (fileType || mediaFile.file_type) === 'photo'

    if (!isPhoto) {
      // Videos: just mark as ready without re-encoding (deferred feature)
      await adminClient
        .from('media_files')
        .update({ upload_status: 'ready' })
        .eq('id', mediaFileId)

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      )
    }

    // Download original from R2
    const getCmd = new GetObjectCommand({ Bucket: r2BucketName, Key: mediaFile.r2_original_key })
    const getResp = await r2.send(getCmd)
    const chunks: Uint8Array[] = []
    for await (const chunk of getResp.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    const originalBuffer = Buffer.concat(chunks)

    // Parse key prefix (everything before /original/filename)
    const originalKey: string = mediaFile.r2_original_key
    const keyPrefix = originalKey.replace(/\/original\/[^/]+$/, '')
    const fileId = originalKey.split('/').pop()?.replace(/\.[^.]+$/, '') || crypto.randomUUID()

    // Generate WebP variants with Sharp
    const results: Record<string, { key: string; bytes: number }> = {}

    for (const [variant, maxPx] of Object.entries(SIZES)) {
      const webpBuffer = await Sharp(originalBuffer)
        .resize(maxPx, maxPx, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: variant === 'thumbnail' ? 70 : variant === 'medium' ? 80 : 85 })
        .toBuffer()

      const variantKey = `${keyPrefix}/${variant}/${fileId}.webp`

      await r2.send(new PutObjectCommand({
        Bucket: r2BucketName,
        Key: variantKey,
        Body: webpBuffer,
        ContentType: 'image/webp',
      }))

      results[variant] = { key: variantKey, bytes: webpBuffer.byteLength }
    }

    const compressedBytes = results.compressed.bytes + results.medium.bytes + results.thumbnail.bytes

    // Update media_files with processed keys and sizes
    const { error: updateErr } = await adminClient
      .from('media_files')
      .update({
        r2_thumbnail_key: results.thumbnail.key,
        r2_medium_key: results.medium.key,
        r2_compressed_key: results.compressed.key,
        file_size_bytes: originalBuffer.byteLength,
        compressed_size_bytes: compressedBytes,
        upload_status: 'ready',
        processed_at: new Date().toISOString(),
      })
      .eq('id', mediaFileId)

    if (updateErr) throw new Error(updateErr.message)

    // Update owner storage usage
    await adminClient.rpc('update_storage_usage', {
      p_owner_id: mediaFile.owner_id,
      p_bytes_delta: originalBuffer.byteLength,
    })

    const publicBase = r2PublicUrl ? r2PublicUrl.replace(/\/$/, '') : ''

    return new Response(
      JSON.stringify({
        success: true,
        thumbnailUrl: publicBase ? `${publicBase}/${results.thumbnail.key}` : null,
        mediumUrl: publicBase ? `${publicBase}/${results.medium.key}` : null,
        compressedUrl: publicBase ? `${publicBase}/${results.compressed.key}` : null,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('process-upload error:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
