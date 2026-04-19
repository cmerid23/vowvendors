import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle } from 'lucide-react'
import { Input, Textarea } from '../ui/Input'
import { Button } from '../ui/Button'
import { contactSchema, type ContactFormData } from '../../utils/validators'
import { supabase } from '../../lib/supabase'

interface ContactFormProps {
  vendorId: string
  vendorName: string
}

export function ContactForm({ vendorId, vendorName }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    await supabase.from('contact_requests').insert({ ...data, vendor_id: vendorId })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="card p-6 text-center">
        <CheckCircle className="text-success mx-auto mb-3" size={40} />
        <h3 className="font-display text-xl text-ink mb-1">Message sent!</h3>
        <p className="text-ink-400 font-body text-sm">{vendorName} will get back to you shortly.</p>
      </div>
    )
  }

  return (
    <div className="card p-6">
      <h3 className="font-display text-xl text-ink font-semibold mb-4">Contact {vendorName}</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input label="Your name" placeholder="Jane Smith" error={errors.from_name?.message} {...register('from_name')} />
        <Input label="Email" type="email" placeholder="jane@example.com" error={errors.from_email?.message} {...register('from_email')} />
        <Input label="Phone (optional)" type="tel" placeholder="(555) 000-0000" {...register('from_phone')} />
        <Input label="Wedding date (optional)" type="date" {...register('event_date')} />
        <Textarea
          label="Your message"
          placeholder="Hi! I'm interested in your services for my wedding..."
          rows={4}
          error={errors.message?.message}
          {...register('message')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full justify-center" size="lg">
          Send Message
        </Button>
      </form>
    </div>
  )
}
