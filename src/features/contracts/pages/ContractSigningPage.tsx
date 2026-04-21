import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ArrowRight, Download, ChevronDown } from 'lucide-react'
import { supabase } from '../../../lib/supabase'
import { useAuthStore } from '../../../store/useAuthStore'
import { Button } from '../../../components/ui/Button'
import { ContractPreview } from '../components/ContractPreview'
import { SignatureBlock } from '../components/SignatureBlock'
import { generateSignedPDF, downloadPDFBlob } from '../components/ContractPDFGenerator'
import { onContractSigned } from '../lib/onContractSigned'
import type { Contract } from '../../../types/contracts'

type Phase = 'landing' | 'auth' | 'reading' | 'signed'

export function ContractSigningPage() {
  const { contractId } = useParams<{ contractId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)

  const [contract, setContract] = useState<Contract | null>(null)
  const [vendorName, setVendorName] = useState('')
  const [vendorEmail, setVendorEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [phase, setPhase] = useState<Phase>('landing')

  // Auth form state
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup')
  const [authName, setAuthName] = useState('')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)

  // Reading state
  const [showScrollHint, setShowScrollHint] = useState(false)
  const scrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!contractId) return
    supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .in('status', ['sent', 'viewed', 'signed', 'completed'])
      .single()
      .then(async ({ data: c }) => {
        if (!c) { setNotFound(true); setLoading(false); return }
        setContract(c as Contract)
        // Fetch vendor info
        const { data: v } = await supabase.from('vendors').select('business_name,user_id').eq('id', c.vendor_id).single()
        if (v) {
          setVendorName(v.business_name)
          const { data: p } = await supabase.from('profiles').select('email').eq('id', v.user_id).single()
          if (p) setVendorEmail(p.email)
        }
        setLoading(false)
        // Already signed?
        if (c.status === 'signed' || c.status === 'completed') setPhase('signed')
      })
  }, [contractId])

  // If user logs in, advance from landing/auth to reading
  useEffect(() => {
    if (user && (phase === 'landing' || phase === 'auth')) {
      setPhase('reading')
      if (contract && contract.status === 'sent') {
        supabase.from('contracts').update({ status: 'viewed', viewed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', contract.id).then(() => {
          setContract((c) => c ? { ...c, status: 'viewed', viewed_at: new Date().toISOString() } : c)
        })
        supabase.from('contract_audit_log').insert({ contract_id: contract.id, action: 'viewed', actor_type: 'couple', actor_email: user.email }).then(() => {})
      }
    }
  }, [user, phase]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll hint timer
  useEffect(() => {
    if (phase === 'reading') {
      scrollTimer.current = setTimeout(() => setShowScrollHint(true), 5000)
    }
    return () => { if (scrollTimer.current) clearTimeout(scrollTimer.current) }
  }, [phase])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError('')
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { full_name: authName, role: 'customer' } },
        })
        if (error) throw error
        const { data: { user: newUser } } = await supabase.auth.getUser()
        if (newUser) {
          await supabase.from('profiles').upsert({ id: newUser.id, email: authEmail, full_name: authName, role: 'customer' })
          useAuthStore.getState().setUser(newUser)
          useAuthStore.getState().setProfile({ id: newUser.id, email: authEmail, full_name: authName, role: 'customer', phone: null, state: null, created_at: new Date().toISOString() })
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
        if (error) throw error
        const { data: { user: u } } = await supabase.auth.getUser()
        if (u) {
          const { data: p } = await supabase.from('profiles').select('*').eq('id', u.id).single()
          useAuthStore.getState().setUser(u)
          if (p) useAuthStore.getState().setProfile(p)
        }
      }
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Authentication failed')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSign = async (signerName: string) => {
    if (!contract || !user) return
    const now = new Date().toISOString()
    const { data: updated } = await supabase
      .from('contracts')
      .update({
        status: 'signed',
        signed_at: now,
        signer_name: signerName,
        signer_user_id: user.id,
        signer_user_agent: navigator.userAgent,
        updated_at: now,
      })
      .eq('id', contract.id)
      .select()
      .single()

    if (!updated) throw new Error('Failed to save signature')
    const signedContract = updated as Contract

    await supabase.from('contract_audit_log').insert({
      contract_id: contract.id,
      action: 'signed',
      actor_type: 'couple',
      actor_id: user.id,
      actor_email: user.email,
      user_agent: navigator.userAgent,
    })

    setContract(signedContract)
    setPhase('signed')
    await onContractSigned(signedContract, vendorEmail, vendorName)
  }

  const handleDownload = async () => {
    if (!contract) return
    const blob = await generateSignedPDF(contract.body_html, {
      signerName: contract.signer_name || '',
      signerEmail: contract.couple_email,
      signedAt: contract.signed_at || '',
      ipAddress: '—',
      contractId: contract.id,
    })
    downloadPDFBlob(blob, `signed-contract-${contract.couple_name.replace(/\s+/g, '-')}.pdf`)
    await supabase.from('contract_audit_log').insert({
      contract_id: contract.id, action: 'downloaded', actor_type: 'couple', actor_email: contract.couple_email,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound || !contract) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-4 text-center">
        <div>
          <h1 className="font-display text-3xl text-ink font-semibold mb-2">Contract not found</h1>
          <p className="font-body text-ink-400">This contract link may have expired or been cancelled.</p>
        </div>
      </div>
    )
  }

  const weddingDate = contract.wedding_date
    ? new Date(contract.wedding_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''

  // ── Phase: landing ───────────────────────────────────────
  if (phase === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blush-50 to-surface flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-card p-8 w-full max-w-lg text-center">
          <p className="text-brand font-body text-xs font-semibold uppercase tracking-widest mb-3">Contract for Signature</p>
          <h1 className="font-display text-3xl font-semibold text-ink mb-1">{contract.couple_name}</h1>
          {weddingDate && <p className="font-body text-ink-400 text-sm mb-0.5">{weddingDate}</p>}
          {contract.wedding_venue && <p className="font-body text-ink-300 text-sm mb-4">{contract.wedding_venue}</p>}
          <div className="bg-ink-50 rounded-xl p-4 text-left space-y-2 mb-6 text-sm font-body">
            <p><span className="text-ink-400">Prepared by:</span> <span className="font-medium text-ink">{vendorName}</span></p>
            {contract.package_price && <p><span className="text-ink-400">Total investment:</span> <span className="font-medium text-ink">${Number(contract.package_price).toLocaleString()}</span></p>}
            {contract.retainer_amount && <p><span className="text-ink-400">Retainer due:</span> <span className="font-medium text-ink">${Number(contract.retainer_amount).toLocaleString()}{contract.retainer_due_date ? ` by ${new Date(contract.retainer_due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}</span></p>}
          </div>
          <Button onClick={() => setPhase(user ? 'reading' : 'auth')} size="lg" className="w-full justify-center">
            Review and Sign <ArrowRight size={16} />
          </Button>
          <p className="font-body text-xs text-ink-300 mt-3">You'll need a free VowVendors account to sign</p>
        </motion.div>
      </div>
    )
  }

  // ── Phase: auth ──────────────────────────────────────────
  if (phase === 'auth') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blush-50 to-surface flex items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-card p-8 w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-ink mb-1 text-center">
            {authMode === 'signup' ? 'Create account to sign' : 'Sign in to continue'}
          </h2>
          <p className="font-body text-sm text-ink-400 text-center mb-6">
            Your signed contract will be stored in your VowVendors account.
          </p>
          <form onSubmit={handleAuth} className="space-y-3">
            {authMode === 'signup' && (
              <input className="input-field w-full" placeholder="Your full name" value={authName} onChange={(e) => setAuthName(e.target.value)} required />
            )}
            <input className="input-field w-full" type="email" placeholder="Email address" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
            <input className="input-field w-full" type="password" placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required minLength={6} />
            {authError && <p className="text-red-500 text-sm font-body">{authError}</p>}
            <Button type="submit" loading={authLoading} className="w-full justify-center" size="lg">
              {authMode === 'signup' ? 'Create Account & Continue' : 'Sign In & Continue'}
            </Button>
          </form>
          <button
            onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
            className="w-full text-center text-sm font-body text-ink-400 hover:text-ink mt-4 transition-colors"
          >
            {authMode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Phase: reading ───────────────────────────────────────
  if (phase === 'reading') {
    return (
      <div className="min-h-screen bg-white">
        {/* Progress bar */}
        <div className="sticky top-0 z-10 bg-white border-b border-border">
          <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
            <ProgressStep label="Read" active done={false} />
            <div className="flex-1 h-px bg-border" />
            <ProgressStep label="Sign" active={false} done={false} />
            <div className="flex-1 h-px bg-border" />
            <ProgressStep label="Complete" active={false} done={false} />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          {/* Contract */}
          <div className="bg-white">
            <ContractPreview html={contract.body_html} showUnfilled={false} />
          </div>

          {/* Signature block */}
          <div className="mt-8">
            <SignatureBlock onSign={handleSign} />
          </div>

          <p className="text-center font-body text-xs text-ink-300 mt-4">
            Signing as: {profile?.email || user?.email}
          </p>
        </div>

        {/* Scroll hint */}
        <AnimatePresence>
          {showScrollHint && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => {
                setShowScrollHint(false)
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
              }}
              className="fixed bottom-6 right-6 flex items-center gap-2 bg-brand text-white text-sm font-body font-medium px-4 py-2.5 rounded-full shadow-lg hover:bg-brand/90 transition-colors z-20"
            >
              Scroll to sign <ChevronDown size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // ── Phase: signed ────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-surface flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-card p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle size={32} className="text-green-500" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-1">Contract Signed!</h1>
        <p className="font-body text-ink-400 text-sm mb-2">
          Thank you, {contract.signer_name || contract.couple_name}. Your contract with <strong>{vendorName}</strong> is now signed.
        </p>
        <p className="font-body text-xs text-ink-300 mb-6">A copy has been sent to {contract.couple_email}</p>

        <Button onClick={handleDownload} variant="outline" className="w-full justify-center mb-3">
          <Download size={15} /> Download PDF Copy
        </Button>

        {/* Cross-sell CTA */}
        <div className="mt-6 pt-6 border-t border-border">
          <p className="font-body text-sm text-ink-400 mb-3">
            You're on VowVendors now. Find more vendors for your wedding day.
          </p>
          <Button onClick={() => navigate('/search')} variant="ghost" className="w-full justify-center">
            Find More Vendors <ArrowRight size={15} />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

function ProgressStep({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 text-xs font-body font-medium ${active || done ? 'text-brand' : 'text-ink-300'}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${done ? 'bg-brand text-white' : active ? 'bg-brand/10 text-brand border border-brand' : 'bg-ink-100 text-ink-300'}`}>
        {done ? '✓' : ''}
      </div>
      {label}
    </div>
  )
}
