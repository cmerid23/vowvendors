import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { S3Client, PutObjectCommand } from 'npm:@aws-sdk/client-s3'
import { getSignedUrl } from 'npm:@aws-sdk/s3-request-presigned'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { filename, contentType, context, contextId, ownerId } = await req.json()
    if (!filename || !contentType || !context || !ownerId) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders })
    }

    const r2AccountId = Deno.env.get('R2_ACCOUNT_ID')!
    const r2AccessKeyId = Deno.env.get('R2_ACCESS_KEY_ID')!
    const r2SecretAccessKey = Deno.env.get('R2_SECRET_ACCESS_KEY')!
    const r2BucketName = Deno.env.get('R2_BUCKET_NAME')!

    const fileId = crypto.randomUUID()
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
    const r2Key = contextId
      ? `${context}/${ownerId}/${contextId}/original/${fileId}.${ext}`
      : `${context}/${ownerId}/original/${fileId}.${ext}`

    const r2 = new S3Client({
      region: 'auto',
      endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: r2AccessKeyId, secretAccessKey: r2SecretAccessKey },
    })

    const command = new PutObjectCommand({
      Bucket: r2BucketName,
      Key: r2Key,
      ContentType: contentType,
    })
    const presignedUrl = await getSignedUrl(r2, command, { expiresIn: 3600 })

    // Create pending media_files record using service role
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: mediaFile, error: dbErr } = await adminClient
      .from('media_files')
      .insert({
        owner_id: ownerId,
        owner_type: context === 'gallery' ? 'vendor' : context === 'guest_upload' ? 'guest' : 'couple',
        context,
        context_id: contextId || null,
        original_filename: filename,
        file_type: contentType.startsWith('image/') ? 'photo' : 'video',
        mime_type: contentType,
        r2_original_key: r2Key,
        upload_status: 'uploaded',
      })
      .select('id')
      .single()

    if (dbErr) throw new Error(dbErr.message)

    return new Response(
      JSON.stringify({ presignedUrl, r2Key, mediaFileId: mediaFile?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('get-upload-url error:', err)
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
