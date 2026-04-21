import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Camera, BookOpen, Heart } from 'lucide-react'
import { CATEGORIES } from '../../features/wedpose/data/categories'
import { useAuthStore } from '../../store/useAuthStore'

const HERO_IMAGE = 'https://images.unsplash.com/photo-1519741347-338c2c5bc9e4?w=1400&h=900&fit=crop&auto=format&q=80'

export function WedPoseLanding() {
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    document.title = 'WedPose — Free Wedding Photography Posing Reference'
    const meta = document.querySelector('meta[name="description"]')
    if (meta) meta.setAttribute('content', '600+ wedding pose references for photographers. Browse poses by category, save favourites, build shot lists. Free forever.')
  }, [])

  return (
    <div style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }} className="font-body">
      {/* Minimal nav */}
      <header className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-8 h-14"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)' }}
      >
        <Link to="/" className="font-display text-base text-white/70 hover:text-white transition-colors">
          VowVendors
        </Link>
        {user ? (
          <Link to="/wedpose/poses" className="wp-btn-gold text-xs px-3 py-1.5">Browse Poses →</Link>
        ) : (
          <Link to="/login" className="font-body text-sm text-white/70 hover:text-white transition-colors">Sign in</Link>
        )}
      </header>

      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <img
          src={HERO_IMAGE}
          alt="Wedding photography"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.75) 60%, #1a1a1a 100%)' }} />

        <div className="relative z-10 text-center px-5 sm:px-8 max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 text-gold text-xs font-body font-semibold uppercase tracking-widest mb-6 border border-gold/30 px-3 py-1.5 rounded-full">
              📷 Free for Wedding Photographers
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-white font-semibold leading-tight mb-5">
              The free posing reference for wedding photographers
            </h1>

            <p className="font-body text-white/70 text-lg sm:text-xl mb-8 max-w-xl mx-auto leading-relaxed">
              13 categories. 60+ subcategories. 600 pose references.
              Open on location. No subscription required.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate('/wedpose/poses')}
                className="wp-btn-gold text-base px-8 py-3.5 flex items-center gap-2 rounded-xl"
              >
                Browse Poses <ArrowRight size={16} />
              </button>
              <Link
                to="/register?role=vendor"
                className="font-body text-sm text-white/70 hover:text-white border border-white/30 hover:border-white/60 px-8 py-3.5 rounded-xl transition-colors"
              >
                Sign up free
              </Link>
            </div>

            <p className="font-body text-white/40 text-sm mt-4">
              Already a member?{' '}
              <Link to="/login" className="text-gold/80 hover:text-gold underline">Sign in</Link>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category strip */}
      <section className="py-8 border-b border-gold/10">
        <div className="px-4 sm:px-8 overflow-x-auto">
          <div className="flex gap-2.5 pb-2 min-w-max mx-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/wedpose/poses/${cat.id}`)}
                className="shrink-0 flex items-center gap-2 bg-charcoal-50 hover:bg-gold/10 border border-gold/15 hover:border-gold/40 text-cream-300 hover:text-gold transition-all duration-200 px-4 py-2 rounded-full font-body text-sm whitespace-nowrap"
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 py-20">
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: <Camera size={28} className="text-gold" />,
              title: '600 pose references',
              body: 'Browse poses for every wedding moment from getting ready to the sparkler exit. Real AI-generated reference images built for working photographers.',
            },
            {
              icon: <BookOpen size={28} className="text-gold" />,
              title: 'Posing tips + camera settings',
              body: 'Every pose includes 3–5 photographer tips and suggested camera settings. Built by wedding photographers, for wedding photographers.',
            },
            {
              icon: <Heart size={28} className="text-gold" />,
              title: 'Build shot lists',
              body: 'Save your favourite poses and build a custom shot list for each wedding. Export it as a PDF or share it with your couple. Free account required.',
            },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-charcoal-50 border border-gold/10 rounded-2xl p-6"
            >
              <div className="mb-4">{card.icon}</div>
              <h3 className="font-display text-xl text-cream font-semibold mb-2">{card.title}</h3>
              <p className="font-body text-cream-400 text-sm leading-relaxed">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-t border-b border-gold/10 py-5 px-5">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-cream-400 font-body text-sm">
          {['Used by photographers in 50 states', '600+ pose references', 'Free forever for working photographers'].map((s, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="hidden sm:inline text-gold/30">·</span>}
              {s}
            </span>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 text-center px-5">
        <h2 className="font-display text-4xl sm:text-5xl text-cream font-semibold mb-4">
          Start browsing poses
        </h2>
        <p className="font-body text-cream-400 text-lg mb-8">No account needed to browse</p>
        <button
          onClick={() => navigate('/wedpose/poses')}
          className="wp-btn-gold text-base px-10 py-4 rounded-xl flex items-center gap-2 mx-auto"
        >
          Browse All Poses <ArrowRight size={16} />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-gold/10 py-6 px-5 text-center">
        <p className="font-body text-cream-400 text-xs">
          WedPose is a free tool by{' '}
          <Link to="/" className="text-gold/80 hover:text-gold underline">VowVendors</Link>
          {' '}— the wedding vendor marketplace.
        </p>
      </footer>
    </div>
  )
}
