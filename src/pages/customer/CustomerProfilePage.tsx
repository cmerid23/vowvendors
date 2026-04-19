import { useForm } from 'react-hook-form'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/useAuthStore'
import { Input, Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { US_STATES } from '../../utils/constants'
import { useState } from 'react'

export function CustomerProfilePage() {
  const { profile, setProfile } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      state: profile?.state || '',
    },
  })

  const onSubmit = async (data: { full_name: string; phone: string; state: string }) => {
    if (!profile) return
    const { data: updated } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', profile.id)
      .select()
      .single()
    if (updated) { setProfile(updated); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  }

  return (
    <div className="max-w-sm">
      <h1 className="font-display text-3xl text-ink font-semibold mb-6">My Profile</h1>
      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Full name" {...register('full_name')} />
          <Input label="Phone" type="tel" {...register('phone')} />
          <Select
            label="Your state"
            options={US_STATES.map((s) => ({ value: s, label: s }))}
            placeholder="Select state..."
            {...register('state')}
          />
          <Button type="submit" loading={isSubmitting} className={`w-full justify-center ${saved ? 'bg-success' : ''}`}>
            {saved ? '✓ Saved' : 'Save Changes'}
          </Button>
        </form>
      </div>
    </div>
  )
}
