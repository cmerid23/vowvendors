import { useState } from 'react'
import { Plus, Trash2, ExternalLink } from 'lucide-react'
import { VENDOR_CATEGORIES } from '../../../../types/hub'
import type { CreateHubVendor } from '../../../../types/hub'

interface Props {
  vendors: CreateHubVendor[]
  onChange: (vendors: CreateHubVendor[]) => void
}

const BLANK: CreateHubVendor = {
  vendor_name: '',
  vendor_category: 'Photographer',
  vendor_instagram: '',
  vendor_website: '',
}

export function Step4Vendors({ vendors, onChange }: Props) {
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<CreateHubVendor>(BLANK)

  const save = () => {
    if (!draft.vendor_name.trim()) return
    onChange([...vendors, { ...draft }])
    setDraft(BLANK)
    setAdding(false)
  }

  const remove = (i: number) => onChange(vendors.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-5">
      <p className="font-body text-sm text-ink-400">
        Add the amazing people making your day happen. Every guest can discover and follow them.
      </p>

      {vendors.length > 0 && (
        <div className="space-y-2">
          {vendors.map((v, i) => (
            <div key={i} className="flex items-center gap-3 bg-ink-50 rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-medium text-ink">{v.vendor_name}</p>
                <p className="font-body text-xs text-ink-400">{v.vendor_category}</p>
              </div>
              {v.vendor_instagram && (
                <span className="font-body text-xs text-ink-300">@{v.vendor_instagram.replace('@', '')}</span>
              )}
              {v.vendor_vowvendors_slug && (
                <ExternalLink size={12} className="text-brand shrink-0" />
              )}
              <button onClick={() => remove(i)} className="text-ink-300 hover:text-red-500 shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {adding ? (
        <div className="border border-border rounded-xl p-4 space-y-3">
          <p className="font-body text-sm font-semibold text-ink">Add vendor</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Vendor name *</label>
              <input
                value={draft.vendor_name}
                onChange={(e) => setDraft({ ...draft, vendor_name: e.target.value })}
                placeholder="Golden Lens Photography"
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Role</label>
              <select
                value={draft.vendor_category || ''}
                onChange={(e) => setDraft({ ...draft, vendor_category: e.target.value })}
                className="input w-full text-sm"
              >
                {VENDOR_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Instagram handle</label>
              <input
                value={draft.vendor_instagram || ''}
                onChange={(e) => setDraft({ ...draft, vendor_instagram: e.target.value })}
                placeholder="@goldenlens"
                className="input w-full text-sm"
              />
            </div>
            <div>
              <label className="block font-body text-xs text-ink-400 mb-1">Website</label>
              <input
                value={draft.vendor_website || ''}
                onChange={(e) => setDraft({ ...draft, vendor_website: e.target.value })}
                placeholder="goldenlens.com"
                className="input w-full text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block font-body text-xs text-ink-400 mb-1">VowVendors profile slug (if on platform)</label>
            <input
              value={draft.vendor_vowvendors_slug || ''}
              onChange={(e) => setDraft({ ...draft, vendor_vowvendors_slug: e.target.value })}
              placeholder="golden-lens-photography"
              className="input w-full text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={save} className="btn-primary text-sm px-4 py-1.5">Add vendor</button>
            <button onClick={() => { setAdding(false); setDraft(BLANK) }} className="btn-ghost text-sm px-4 py-1.5">Cancel</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm font-body font-medium text-brand hover:text-brand/80 transition-colors"
        >
          <Plus size={16} /> Add a vendor
        </button>
      )}

      {vendors.length === 0 && !adding && (
        <p className="font-body text-xs text-ink-300">
          You can skip this step and add vendors later from your hub dashboard.
        </p>
      )}
    </div>
  )
}
