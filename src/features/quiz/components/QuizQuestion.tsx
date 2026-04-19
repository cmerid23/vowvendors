import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { QuizQuestion as QuizQuestionType, QuizOption } from '../data/questions'
import { QuizOptionCard } from './QuizOptionCard'

interface QuizQuestionProps {
  question: QuizQuestionType
  onAnswer: (option: QuizOption) => void
}

export function QuizQuestion({ question, onAnswer }: QuizQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null)

  // Reset selection when question changes
  useEffect(() => { setSelected(null) }, [question.id])

  const handleSelect = (option: QuizOption) => {
    if (selected) return
    setSelected(option.id)
    // Short delay so user sees selection before advancing
    setTimeout(() => onAnswer(option), 400)
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25 }}
        className="space-y-5"
      >
        <div className="text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-ink font-semibold leading-tight">
            {question.question}
          </h2>
          {question.subtitle && (
            <p className="font-body text-ink-300 text-sm mt-1.5">{question.subtitle}</p>
          )}
        </div>

        {/* 2×2 grid — 48% width on mobile, equal on desktop */}
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt) => (
            <QuizOptionCard
              key={opt.id}
              option={opt}
              selected={selected === opt.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
