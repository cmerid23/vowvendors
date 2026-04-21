import { supabase } from './supabase'
import type { StorageQuotaStatus, StoragePlanName } from '../types/storage'

const FREE_PLAN_BYTES = 5 * 1024 * 1024 * 1024 // 5 GB
const FREE_DOWNLOADS_PER_MONTH = 50

export async function getUserStorageStatus(userId: string): Promise<StorageQuotaStatus> {
  const [usageResult, subResult, downloadResult] = await Promise.all([
    supabase.from('storage_usage').select('used_bytes,file_count').eq('user_id', userId).single(),
    supabase.from('storage_subscriptions').select('status, storage_plans(name,storage_limit_bytes,download_limit_monthly)').eq('user_id', userId).single(),
    supabase.from('download_tracking').select('id', { count: 'exact' }).eq('user_id', userId).eq('month_year', new Date().toISOString().slice(0, 7)),
  ])

  const usedBytes = usageResult.data?.used_bytes || 0
  const planRow = (subResult.data as { storage_plans?: { name: StoragePlanName; storage_limit_bytes: number | null; download_limit_monthly: number | null } } | null)?.storage_plans

  const planName: StoragePlanName = planRow?.name || 'free'
  const limitBytes: number | null = planRow?.storage_limit_bytes ?? FREE_PLAN_BYTES
  const downloadLimit: number | null = planRow?.download_limit_monthly ?? FREE_DOWNLOADS_PER_MONTH
  const downloadsThisMonth = downloadResult.count || 0

  const usedPercent = limitBytes ? (usedBytes / limitBytes) * 100 : 0
  const canDownload = downloadLimit === null || downloadsThisMonth < downloadLimit
  const canUpload = limitBytes === null || usedBytes < limitBytes

  let warningLevel: StorageQuotaStatus['warningLevel'] = 'none'
  if (limitBytes) {
    if (usedPercent >= 100) warningLevel = 'exceeded'
    else if (usedPercent >= 95) warningLevel = 'critical'
    else if (usedPercent >= 80) warningLevel = 'warning'
  }

  return {
    usedBytes,
    limitBytes,
    usedPercent,
    downloadsThisMonth,
    downloadLimitMonthly: downloadLimit,
    planName,
    canDownload,
    canUpload,
    warningLevel,
  }
}

export async function trackDownload(userId: string, mediaId: string): Promise<void> {
  await supabase.from('download_tracking').insert({ user_id: userId, media_id: mediaId })
}

export async function updateStorageUsage(
  userId: string,
  deltaBytes: number,
  deltaFiles: number,
): Promise<void> {
  await supabase.rpc('update_storage_usage', {
    p_user_id: userId,
    p_delta_bytes: deltaBytes,
    p_delta_files: deltaFiles,
  })
}

export async function ensureFreeSubscription(userId: string): Promise<void> {
  const { data: existing } = await supabase
    .from('storage_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (!existing) {
    const { data: freePlan } = await supabase
      .from('storage_plans')
      .select('id')
      .eq('name', 'free')
      .single()
    if (freePlan) {
      await supabase.from('storage_subscriptions').insert({ user_id: userId, plan_id: freePlan.id, status: 'active' })
    }
  }
}
