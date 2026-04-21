import { useState } from 'react'
import type { HubSeatingTable } from '../../../types/hub'

interface Props {
  tables: HubSeatingTable[]
  accentColor: string
}

export function HubSeating({ tables, accentColor }: Props) {
  const [search, setSearch] = useState('')

  if (tables.length === 0) return null

  const q = search.trim().toLowerCase()

  const matches = (name: string) => q && name.toLowerCase().includes(q)

  return (
    <section id="seating" className="px-4 py-10 max-w-2xl mx-auto">
      <h2 className="font-display text-2xl font-semibold text-ink text-center mb-2">Find Your Seat 🪑</h2>
      <p className="font-body text-sm text-ink-400 text-center mb-6">Type your name to find your table.</p>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search for your name…"
        className="input w-full mb-6"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tables.map((table) => {
          const hasMatch = q && table.seats.some((s) => matches(s.name))
          if (q && !hasMatch) return null

          return (
            <div
              key={table.id}
              className={`rounded-2xl border-2 p-4 transition-all ${
                hasMatch ? 'shadow-md' : 'border-border'
              }`}
              style={hasMatch ? { borderColor: accentColor } : {}}
            >
              <p className="font-body text-sm font-semibold text-ink mb-3">{table.table_name}</p>
              <div className="space-y-1.5">
                {table.seats.map((seat) => (
                  <div
                    key={seat.seat}
                    className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all ${
                      matches(seat.name) ? 'bg-[var(--ac)]/10' : 'hover:bg-ink-50'
                    }`}
                    style={{ '--ac': accentColor } as React.CSSProperties}
                  >
                    <span className="font-body text-xs text-ink-400 w-4 text-right shrink-0">{seat.seat}.</span>
                    <span
                      className={`font-body text-sm ${matches(seat.name) ? 'font-semibold' : 'text-ink'}`}
                      style={matches(seat.name) ? { color: accentColor } : {}}
                    >
                      {seat.name}
                      {matches(seat.name) && <span className="ml-1.5 text-xs">← You!</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
