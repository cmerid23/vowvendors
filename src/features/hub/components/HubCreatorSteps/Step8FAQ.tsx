import { useState } from 'react'
import { Plus, Check, Edit2, X } from 'lucide-react'
import { FAQ_TEMPLATES, FAQ_CATEGORY_LABELS, FAQ_CATEGORIES } from '../../data/faqTemplates'
import type { HubFaqItem } from '../../../../types/hub'

type DraftFaq = Omit<HubFaqItem, 'id' | 'hub_id' | 'display_order'>

interface Props {
  items: DraftFaq[]
  onChange: (items: DraftFaq[]) => void
}

export function Step8FAQ({ items, onChange }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('schedule')
  const [editingIdx, setEditingIdx] = useState<number | null>(null)
  const [editAnswer, setEditAnswer] = useState('')
  const [addingCustom, setAddingCustom] = useState(false)
  const [customDraft, setCustomDraft] = useState<DraftFaq>({
    category: 'general', question: '', answer: '', is_from_template: false,
  })

  // Adding from template: stores the index being answered
  const [answeringTemplate, setAnsweringTemplate] = useState<{ question: string; placeholder: string } | null>(null)
  const [templateAnswer, setTemplateAnswer] = useState('')

  const alreadyAdded = (question: string) => items.some((q) => q.question === question)

  const addFromTemplate = (question: string, placeholder: string) => {
    setAnsweringTemplate({ question, placeholder })
    setTemplateAnswer(placeholder)
  }

  const confirmTemplate = () => {
    if (!answeringTemplate || !templateAnswer.trim()) return
    onChange([...items, {
      category: activeCategory,
      question: answeringTemplate.question,
      answer: templateAnswer.trim(),
      is_from_template: true,
    }])
    setAnsweringTemplate(null)
    setTemplateAnswer('')
  }

  const startEdit = (i: number) => {
    setEditingIdx(i)
    setEditAnswer(items[i].answer)
  }

  const saveEdit = () => {
    if (editingIdx === null) return
    onChange(items.map((item, i) => i === editingIdx ? { ...item, answer: editAnswer } : item))
    setEditingIdx(null)
  }

  const removeItem = (i: number) => onChange(items.filter((_, idx) => idx !== i))

  const saveCustom = () => {
    if (!customDraft.question.trim() || !customDraft.answer.trim()) return
    onChange([...items, { ...customDraft }])
    setCustomDraft({ category: 'general', question: '', answer: '', is_from_template: false })
    setAddingCustom(false)
  }

  const templates = FAQ_TEMPLATES[activeCategory] || []

  return (
    <div className="space-y-5">
      <p className="font-body text-sm text-ink-400">
        Answer common questions so guests have everything they need. Pick from templates — we write the questions, you fill in the answers.
      </p>

      {/* Category tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {FAQ_CATEGORIES.map((cat) => {
          const { label, emoji } = FAQ_CATEGORY_LABELS[cat]
          const count = items.filter((q) => q.category === cat).length
          return (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setAnsweringTemplate(null) }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-body font-medium whitespace-nowrap shrink-0 transition-all ${
                activeCategory === cat
                  ? 'bg-brand text-white'
                  : 'bg-ink-50 text-ink-400 hover:bg-ink-100'
              }`}
            >
              {emoji} {label}
              {count > 0 && (
                <span className={`ml-0.5 w-4 h-4 rounded-full text-xs flex items-center justify-center ${
                  activeCategory === cat ? 'bg-white/30 text-white' : 'bg-brand text-white'
                }`}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Template Q&A picker */}
      {answeringTemplate ? (
        <div className="border-2 border-brand/30 rounded-xl p-4 space-y-3 bg-brand/5">
          <p className="font-body text-sm font-semibold text-ink">{answeringTemplate.question}</p>
          <div>
            <label className="block font-body text-xs text-ink-400 mb-1">Your answer</label>
            <textarea
              value={templateAnswer}
              onChange={(e) => setTemplateAnswer(e.target.value)}
              rows={4}
              className="input w-full text-sm resize-none"
              style={{
                backgroundColor: templateAnswer === answeringTemplate.placeholder ? '#FFFBEB' : undefined,
                borderColor: templateAnswer === answeringTemplate.placeholder ? '#F59E0B' : undefined,
              }}
            />
            <p className="font-body text-xs text-amber-600 mt-1">Edit the placeholder text with your specific details.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={confirmTemplate} className="btn-primary text-sm px-4 py-1.5 flex items-center gap-1.5">
              <Check size={13} /> Add to FAQ
            </button>
            <button onClick={() => setAnsweringTemplate(null)} className="btn-ghost text-sm px-4 py-1.5">Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider">
            {FAQ_CATEGORY_LABELS[activeCategory]?.label} questions
          </p>
          {templates.map((t) => {
            const added = alreadyAdded(t.question)
            return (
              <div key={t.question} className={`flex items-center gap-3 p-3 rounded-xl border ${added ? 'border-green-200 bg-green-50' : 'border-border'}`}>
                <p className="flex-1 font-body text-sm text-ink">{t.question}</p>
                {added ? (
                  <span className="text-xs font-body text-green-600 flex items-center gap-1 shrink-0">
                    <Check size={12} /> Added
                  </span>
                ) : (
                  <button
                    onClick={() => addFromTemplate(t.question, t.placeholder)}
                    className="text-xs font-body font-semibold text-brand hover:text-brand/80 shrink-0 whitespace-nowrap"
                  >
                    + Add
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Added FAQ items */}
      {items.length > 0 && (
        <div className="space-y-2">
          <p className="font-body text-xs font-semibold text-ink-400 uppercase tracking-wider">Your FAQ ({items.length})</p>
          {items.map((item, i) => (
            <div key={i} className="border border-border rounded-xl overflow-hidden">
              <div className="flex items-start gap-2 px-4 py-3 bg-ink-50/50">
                <span className="text-sm">{FAQ_CATEGORY_LABELS[item.category]?.emoji}</span>
                <p className="flex-1 font-body text-sm font-medium text-ink">{item.question}</p>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => startEdit(i)} className="text-ink-300 hover:text-brand"><Edit2 size={13} /></button>
                  <button onClick={() => removeItem(i)} className="text-ink-300 hover:text-red-500"><X size={13} /></button>
                </div>
              </div>
              {editingIdx === i ? (
                <div className="px-4 py-3 space-y-2">
                  <textarea
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    rows={3}
                    className="input w-full text-sm resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} className="text-xs font-body font-medium text-white bg-brand rounded-full px-3 py-1">Save</button>
                    <button onClick={() => setEditingIdx(null)} className="text-xs font-body text-ink-400 hover:text-ink">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <p className="font-body text-sm text-ink-400 leading-relaxed">{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Custom question add */}
      {addingCustom ? (
        <div className="border border-border rounded-xl p-4 space-y-3">
          <p className="font-body text-sm font-semibold text-ink">Add custom question</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Category</label>
              <select
                value={customDraft.category}
                onChange={(e) => setCustomDraft({ ...customDraft, category: e.target.value })}
                className="input w-full text-sm"
              >
                {FAQ_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{FAQ_CATEGORY_LABELS[c]?.emoji} {FAQ_CATEGORY_LABELS[c]?.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-body text-xs text-ink-400 mb-1">Question *</label>
            <input
              value={customDraft.question}
              onChange={(e) => setCustomDraft({ ...customDraft, question: e.target.value })}
              placeholder="Is there a dress code?"
              className="input w-full text-sm"
            />
          </div>
          <div>
            <label className="block font-body text-xs text-ink-400 mb-1">Answer *</label>
            <textarea
              value={customDraft.answer}
              onChange={(e) => setCustomDraft({ ...customDraft, answer: e.target.value })}
              rows={3}
              placeholder="Write your answer here"
              className="input w-full text-sm resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={saveCustom} className="btn-primary text-sm px-4 py-1.5">Add</button>
            <button onClick={() => setAddingCustom(false)} className="btn-ghost text-sm px-4 py-1.5">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAddingCustom(true)}
          className="flex items-center gap-2 text-sm font-body font-medium text-brand hover:text-brand/80 transition-colors"
        >
          <Plus size={16} /> Add a custom question
        </button>
      )}
    </div>
  )
}
