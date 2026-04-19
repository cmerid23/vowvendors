import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Input, Select, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { leadSchema, type LeadFormData } from '../../utils/validators'
import { supabase } from '../../lib/supabase'
import { US_STATES, SERVICE_CATEGORIES } from '../../utils/constants'

interface LeadCaptureModalProps {
  open: boolean
  onClose: () => void
  vendorId?: string
  source?: string
}

export function LeadCaptureModal({ open, onClose, vendorId, source = 'homepage' }: LeadCaptureModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: { service_interest: [] },
  })

  const onSubmit = async (data: LeadFormData) => {
    await supabase.from('leads').insert({
      ...data,
      vendor_id: vendorId || null,
      source,
    })
    setSubmitted(true)
  }

  return (
    <Modal open={open} onClose={onClose} title="Tell us about your wedding" maxWidth="max-w-md">
      <div className="px-6 py-5">
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle className="text-success mx-auto mb-3" size={48} />
            <h3 className="font-display text-2xl text-ink mb-2">You're on the list!</h3>
            <p className="text-ink-400 font-body text-sm">We'll match you with top vendors in your area shortly.</p>
            <Button onClick={onClose} className="mt-5 w-full justify-center">Close</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Your name" placeholder="Jane Smith" error={errors.name?.message} {...register('name')} />
            <Input label="Email address" type="email" placeholder="jane@example.com" error={errors.email?.message} {...register('email')} />
            <Input label="Phone number (optional)" type="tel" placeholder="(555) 000-0000" {...register('phone')} />

            <Select
              label="Your state"
              placeholder="Select state..."
              options={US_STATES.map((s) => ({ value: s, label: s }))}
              error={errors.state?.message}
              {...register('state')}
            />

            <Input label="Wedding date (optional)" type="date" {...register('event_date')} />

            <div className="space-y-1">
              <p className="text-sm font-body font-medium text-ink-600">Services you need</p>
              <div className="grid grid-cols-2 gap-2">
                {SERVICE_CATEGORIES.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm font-body text-ink-500 cursor-pointer">
                    <input type="checkbox" value={cat.id} {...register('service_interest')} className="accent-brand" />
                    {cat.icon} {cat.label}
                  </label>
                ))}
              </div>
              {errors.service_interest && <p className="text-red-500 text-xs">{errors.service_interest.message}</p>}
            </div>

            <Textarea label="Anything else? (optional)" placeholder="Tell us about your vision, guest count, venue..." rows={3} {...register('message')} />

            <Button type="submit" loading={isSubmitting} className="w-full justify-center" size="lg">
              Get Matched with Vendors
            </Button>
            <p className="text-center text-ink-300 text-xs font-body">
              No spam. We only share your info with vendors you approve.
            </p>
          </form>
        )}
      </div>
    </Modal>
  )
}
