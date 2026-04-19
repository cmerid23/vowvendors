import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '../../../components/ui/Button'

interface QuizStartScreenProps {
  onStart: () => void
}

const PREVIEW_IMAGES = [
  'https://images.unsplash.com/photo-1519741347-338c2c5bc9e4?w=300&h=400&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=300&h=400&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&h=400&fit=crop&auto=format&q=80',
  'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&h=400&fit=crop&auto=format&q=80',
]

export function QuizStartScreen({ onStart }: QuizStartScreenProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
      {/* Floating image collage */}
      <div className="relative w-64 h-48 mb-10 mx-auto">
        {PREVIEW_IMAGES.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: [-8, 0, 6, -4][i] }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="absolute rounded-xl overflow-hidden shadow-card w-24 h-32"
            style={{
              left: ['0%', '30%', '52%', '22%'][i],
              top: ['10%', '0%', '15%', '35%'][i],
              zIndex: [1, 3, 2, 4][i],
            }}
          >
            <img src={src} alt="" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center max-w-md"
      >
        <div className="inline-flex items-center gap-2 bg-blush-50 text-brand px-3 py-1.5 rounded-full text-xs font-body font-medium uppercase tracking-widest mb-5">
          <Sparkles size={12} /> Style Quiz
        </div>

        <h1 className="font-display text-4xl sm:text-5xl text-ink font-semibold leading-tight mb-4">
          What's Your Wedding Style?
        </h1>

        <p className="font-body text-ink-400 text-lg mb-3 leading-relaxed">
          Answer 8 visual questions and discover your unique wedding style profile — then get matched with vendors who share your aesthetic.
        </p>

        <p className="font-body text-ink-300 text-sm mb-8">Takes about 2 minutes · No sign-up needed</p>

        <Button onClick={onStart} size="lg" className="justify-center px-10">
          Start My Style Quiz <ArrowRight size={16} />
        </Button>

        <div className="mt-8 flex items-center justify-center gap-6 text-ink-300">
          {['12 Style Profiles', '8 Questions', 'Instant Results'].map((item) => (
            <div key={item} className="flex items-center gap-1.5 text-xs font-body">
              <span className="w-1 h-1 rounded-full bg-brand inline-block" />
              {item}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
