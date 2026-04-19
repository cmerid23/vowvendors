import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '../../components/ui/Button'
import { LeadCaptureModal } from '../../components/lead/LeadCaptureModal'
import { US_STATES, SERVICE_CATEGORIES } from '../../utils/constants'
import { BudgetWidget } from '../../features/budget/components/BudgetWidget'

const TESTIMONIALS = [
  { name: 'Sarah & James', state: 'California', text: 'Found our photographer in 10 minutes. The portfolio quality on VowVendors is incredible.' },
  { name: 'Mia & Derek', state: 'Texas', text: 'Our décor vendor made our dream wedding a reality. So easy to find and contact.' },
  { name: 'Grace & Marcus', state: 'New York', text: 'The band we found through VowVendors had everyone on the dance floor all night.' },
]

export function HomePage() {
  const navigate = useNavigate()
  const [state, setState] = useState('')
  const [category, setCategory] = useState('')
  const [leadOpen, setLeadOpen] = useState(false)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (state) params.set('state', state)
    if (category) params.set('category', category)
    navigate(`/search?${params.toString()}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blush-50 to-surface px-4 sm:px-6 pt-16 pb-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-brand font-body text-sm font-medium tracking-widest uppercase mb-4">Wedding Services Marketplace</p>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-ink font-semibold leading-tight mb-5">
              Find Your Perfect<br />Wedding Team
            </h1>
            <p className="font-body text-ink-400 text-lg sm:text-xl mb-10 max-w-xl mx-auto">
              Photographers, Videographers, Décor & Music — all in one place.
            </p>
          </motion.div>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-card shadow-card p-3 flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto"
          >
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field flex-1 sm:border-r sm:border-border sm:rounded-r-none"
            >
              <option value="">All services</option>
              {SERVICE_CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.label}</option>
              ))}
            </select>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="input-field flex-1"
            >
              <option value="">All states</option>
              {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <Button onClick={handleSearch} size="lg" className="shrink-0 justify-center sm:px-8">
              <Search size={16} /> Search
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Style Quiz CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-ink text-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-card-hover"
        >
          <div className="text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 text-brand text-xs font-body font-semibold uppercase tracking-widest mb-1.5">
              <Sparkles size={11} /> New · Style Quiz
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold leading-tight">
              What's Your Wedding Style?
            </h2>
            <p className="font-body text-ink-300 text-sm mt-1">
              8 questions → your style profile → matched vendors
            </p>
          </div>
          <Button
            onClick={() => navigate('/style-quiz')}
            size="lg"
            className="shrink-0 justify-center whitespace-nowrap"
          >
            Take the Quiz <ArrowRight size={15} />
          </Button>
        </motion.div>
      </section>

      {/* Budget Widget */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-4">
        <div className="max-w-md mx-auto">
          <BudgetWidget />
        </div>
      </section>

      {/* 4 Category Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl sm:text-4xl text-ink text-center mb-10">Browse by Category</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICE_CATEGORIES.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              onClick={() => navigate(`/search?category=${cat.id}`)}
              className="card p-6 text-left hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <span className="text-4xl mb-4 block">{cat.icon}</span>
              <h3 className="font-display text-xl text-ink font-semibold group-hover:text-brand transition-colors mb-1">
                {cat.label}
              </h3>
              <p className="font-body text-ink-400 text-sm">{cat.description}</p>
              <div className="flex items-center gap-1 text-brand text-sm font-body font-medium mt-3 group-hover:gap-2 transition-all">
                Browse <ArrowRight size={14} />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Lead capture CTA */}
      <section className="bg-ink text-white py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-4xl sm:text-5xl font-semibold mb-4">
            Not sure where to start?
          </h2>
          <p className="font-body text-ink-300 text-lg mb-8">
            Tell us about your wedding and we'll match you with the perfect vendors in your area.
          </p>
          <Button onClick={() => setLeadOpen(true)} size="lg" className="justify-center">
            Get Matched Free <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl sm:text-4xl text-ink text-center mb-10">Couples love VowVendors</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card p-6"
            >
              <p className="font-display text-lg text-ink italic mb-4">"{t.text}"</p>
              <p className="font-body font-medium text-ink-600 text-sm">{t.name}</p>
              <p className="font-body text-ink-300 text-xs">{t.state}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vendor CTA */}
      <section className="bg-blush-50 border-t border-blush-200 py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-ink font-semibold mb-3">Are you a wedding vendor?</h2>
          <p className="font-body text-ink-400 mb-6">Join hundreds of professionals already growing their business on VowVendors.</p>
          <Button onClick={() => navigate('/join')} variant="outline" size="lg">
            Join as a Vendor <ArrowRight size={16} />
          </Button>
        </div>
      </section>

      <LeadCaptureModal open={leadOpen} onClose={() => setLeadOpen(false)} source="homepage" />
    </div>
  )
}
