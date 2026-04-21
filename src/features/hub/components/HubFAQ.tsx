import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { HubFaqItem } from '../../../types/hub'
import { FAQ_CATEGORY_LABELS, FAQ_CATEGORIES } from '../data/faqTemplates'

interface Props {
  items: HubFaqItem[]
}

export function HubFAQ({ items }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [openId, setOpenId] = useState<string | null>(null)

  if (items.length === 0) return null

  const usedCategories = ['all', ...FAQ_CATEGORIES.filter((c) => items.some((i) => i.category === c))]
  const filtered = activeFilter === 'all' ? items : items.filter((i) => i.category === activeFilter)

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <section id="faq" className="px-4 py-10 max-w-2xl mx-auto">
      <h2 className="font-display text-2xl font-semibold text-ink text-center mb-8">FAQ ❓</h2>

      {/* Category filter pills */}
      {usedCategories.length > 2 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-6">
          {usedCategories.map((catId) => {
            const meta = catId === 'all' ? { label: 'All', emoji: '✨' } : FAQ_CATEGORY_LABELS[catId]
            const isActive = activeFilter === catId
            return (
              <button
                key={catId}
                onClick={() => { setActiveFilter(catId); setOpenId(null) }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-body font-medium whitespace-nowrap shrink-0 transition-all ${isActive ? 'text-white' : 'bg-ink-50 text-ink-400 hover:bg-ink-100'}`}
                style={isActive ? { backgroundColor: '#B8860B' } : {}}
              >
                {meta?.emoji} {meta?.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Accordion */}
      <div className="space-y-2">
        {filtered.map((item) => {
          const isOpen = openId === item.id
          return (
            <div
              key={item.id}
              className="border border-border rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggle(item.id)}
                className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-ink-50/50 transition-colors"
              >
                <span className="text-base shrink-0">{FAQ_CATEGORY_LABELS[item.category]?.emoji || '❓'}</span>
                <p className="flex-1 font-body text-sm font-semibold text-ink">{item.question}</p>
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0 text-ink-300"
                >
                  <ChevronDown size={16} />
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-4 pb-4 pt-0">
                      <div className="h-px bg-border mb-3" />
                      <p className="font-body text-sm text-ink-400 leading-relaxed">{item.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
