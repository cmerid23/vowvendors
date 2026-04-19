import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../lib/supabase'
import { Input, Select } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { registerSchema, type RegisterFormData } from '../../utils/validators'

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const defaultRole = (searchParams.get('role') || 'customer') as 'customer' | 'vendor'
  const [emailPending, setEmailPending] = useState(false)

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: defaultRole },
  })

  const onSubmit = async (data: RegisterFormData) => {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.full_name, role: data.role },
      },
    })
    if (error) { setError('root', { message: error.message }); return }

    // Email confirmation required — no session yet
    if (signUpData.user && !signUpData.session) {
      setEmailPending(true)
      return
    }

    // No email confirmation — session available immediately
    if (signUpData.user) {
      await supabase.from('profiles').upsert({
        id: signUpData.user.id,
        email: data.email,
        full_name: data.full_name,
        role: data.role,
      })
    }

    navigate(data.role === 'vendor' ? '/vendor/overview' : '/dashboard')
  }

  if (emailPending) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="font-display text-2xl text-ink font-semibold mb-2">Check your email</h1>
          <p className="text-ink-400 font-body text-sm mb-6 leading-relaxed">
            We sent a confirmation link to your email. Click it to activate your account and log in.
          </p>
          <Link to="/login" className="text-brand hover:underline font-body text-sm font-medium">
            Go to login →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl font-semibold text-ink">
            Vow<span className="text-brand">Vendors</span>
          </Link>
          <h1 className="font-display text-2xl text-ink mt-4 mb-1">Create your account</h1>
          <p className="text-ink-400 font-body text-sm">Free to join — always</p>
        </div>

        <div className="card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <Input label="Full name" autoComplete="name" error={errors.full_name?.message} {...register('full_name')} />
            <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            <Input label="Password" type="password" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
            <Select
              label="I am a..."
              options={[
                { value: 'customer', label: 'Couple / Planning a wedding' },
                { value: 'vendor', label: 'Vendor / Wedding professional' },
              ]}
              error={errors.role?.message}
              {...register('role')}
            />
            {errors.root && <p className="text-red-500 text-xs font-body">{errors.root.message}</p>}
            <Button type="submit" loading={isSubmitting} className="w-full justify-center mt-1" size="lg">
              Create Account
            </Button>
          </form>
        </div>

        <p className="text-center text-sm font-body text-ink-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
