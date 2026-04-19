import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { SERVICE_CATEGORIES } from '../../utils/constants'

const PERKS = [
  'Free profile page with portfolio gallery',
  'Receive direct inquiries from engaged couples',
  'Built-in messaging system',
  'WedPose posing reference tool (photographers/videographers)',
  'Featured listing opportunities',
  'Verified vendor badge',
]

export function JoinPage() {
  const navigate = useNavigate()
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blush-50 to-surface py-20 px-4 sm:px-6 text-center">
        <h1 className="font-display text-5xl sm:text-6xl text-ink font-semibold mb-4">
          Grow your wedding<br />business with VowVendors
        </h1>
        <p className="font-body text-ink-400 text-lg max-w-xl mx-auto mb-8">
          Join hundreds of photographers, videographers, décor specialists, and musicians reaching engaged couples every day.
        </p>
        <Button onClick={() => navigate('/register?role=vendor')} size="lg">
          Create Free Profile <ArrowRight size={16} />
        </Button>
      </section>

      {/* Categories */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="font-display text-3xl text-ink text-center mb-8">We welcome these professionals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {SERVICE_CATEGORIES.map((cat) => (
            <div key={cat.id} className="card p-5 text-center">
              <span className="text-3xl block mb-2">{cat.icon}</span>
              <p className="font-display text-lg text-ink font-semibold">{cat.label}</p>
              <p className="text-ink-400 text-xs font-body mt-1">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Perks */}
      <section className="bg-ink text-white py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl text-center mb-8">Everything you need to succeed</h2>
          <ul className="space-y-3">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <CheckCircle className="text-brand-200 shrink-0 mt-0.5" size={18} />
                <span className="font-body text-ink-200">{perk}</span>
              </li>
            ))}
          </ul>
          <div className="text-center mt-10">
            <Button onClick={() => navigate('/register?role=vendor')} size="lg">
              Get Started Free <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
