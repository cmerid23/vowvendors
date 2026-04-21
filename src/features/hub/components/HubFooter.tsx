import { ArrowRight } from 'lucide-react'

export function HubFooter() {
  return (
    <footer className="bg-ink-950 text-white px-4 py-12 text-center space-y-6">
      <div className="max-w-sm mx-auto space-y-3">
        <p className="font-display text-xl font-semibold">Planning your own wedding?</p>
        <p className="font-body text-sm text-white/70 leading-relaxed">
          Find photographers, videographers, florists, and more on VowVendors — the wedding vendor marketplace built for couples.
        </p>
        <a
          href="/search"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-body font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#B8860B', color: 'white' }}
        >
          Find Wedding Vendors <ArrowRight size={14} />
        </a>
      </div>

      <div className="pt-6 border-t border-white/10">
        <p className="font-body text-xs text-white/40">Made with 💛 by VowVendors</p>
        <a href="/" className="font-body text-xs text-white/30 hover:text-white/60 transition-colors">vowvendors.com</a>
      </div>
    </footer>
  )
}
