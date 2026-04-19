import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Input, Select, Textarea } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { vendorProfileSchema, type VendorProfileFormData } from '../../utils/validators'
import { US_STATES, SERVICE_CATEGORIES } from '../../utils/constants'

export function VendorProfileEditorPage() {
  const profile = useAuthStore((s) => s.profile)
  const [saved, setSaved] = useState(false)
  const [vendorId, setVendorId] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<VendorProfileFormData, unknown, VendorProfileFormData>({
    resolver: zodResolver(vendorProfileSchema) as never,
  })

  useEffect(() => {
    if (!profile) return
    supabase.from('vendors').select('*').eq('user_id', profile.id).single().then(({ data }) => {
      if (data) { setVendorId(data.id); reset({ ...data, website: data.website || '', instagram_handle: data.instagram_handle || '', bio: data.bio || '' }) }
    })
  }, [profile, reset])

  const onSubmit = async (data: VendorProfileFormData) => {
    if (!profile) return
    if (vendorId) {
      await supabase.from('vendors').update(data).eq('id', vendorId)
    } else {
      const { data: created } = await supabase.from('vendors').insert({ ...data, user_id: profile.id }).select().single()
      if (created) setVendorId(created.id)
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-ink font-semibold mb-6">My Vendor Profile</h1>
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input label="Business name" placeholder="Your Photography Studio" error={errors.business_name?.message} {...register('business_name')} />

          <Select
            label="Category"
            options={SERVICE_CATEGORIES.map((c) => ({ value: c.id, label: c.label }))}
            placeholder="Select your category..."
            error={errors.category?.message}
            {...register('category')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="State"
              options={US_STATES.map((s) => ({ value: s, label: s }))}
              placeholder="Select state..."
              error={errors.state?.message}
              {...register('state')}
            />
            <Input label="City" placeholder="Los Angeles" {...register('city')} />
          </div>

          <Textarea label="Bio" placeholder="Tell couples about your style, experience, and what makes you unique..." rows={4} error={errors.bio?.message} {...register('bio')} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Starting price ($)" type="number" placeholder="1500" {...register('starting_price')} />
            <Select
              label="Price unit"
              options={[
                { value: 'event', label: 'Per event' },
                { value: 'hour', label: 'Per hour' },
                { value: 'package', label: 'Per package' },
              ]}
              {...register('price_unit')}
            />
          </div>

          <Input label="Phone" type="tel" placeholder="(555) 000-0000" {...register('phone')} />
          <Input label="Website URL" type="url" placeholder="https://yoursite.com" error={errors.website?.message} {...register('website')} />
          <Input label="Instagram handle" placeholder="@yourstudio" {...register('instagram_handle')} hint="Just the handle — no @" />

          <Button type="submit" loading={isSubmitting} className={`w-full justify-center ${saved ? 'bg-success' : ''}`} size="lg">
            {saved ? '✓ Profile Saved' : vendorId ? 'Save Changes' : 'Create Profile'}
          </Button>
        </form>
      </div>
    </div>
  )
}
