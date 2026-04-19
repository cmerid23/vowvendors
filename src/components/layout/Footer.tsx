import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-ink text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-2xl font-semibold mb-2">Vow<span className="text-brand-200">Vendors</span></p>
            <p className="text-ink-300 text-sm font-body leading-relaxed">
              Find the perfect team for your perfect day.
            </p>
          </div>
          <div>
            <p className="font-body font-medium text-sm mb-3 text-ink-100">Find Vendors</p>
            <ul className="space-y-2">
              {['Photographers', 'Videographers', 'Décor', 'Music & Bands'].map((cat) => (
                <li key={cat}>
                  <Link to={`/search?category=${cat.toLowerCase()}`} className="text-ink-300 hover:text-white text-sm font-body transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-body font-medium text-sm mb-3 text-ink-100">Company</p>
            <ul className="space-y-2">
              {[{ label: 'About', to: '/about' }, { label: 'Join as Vendor', to: '/join' }, { label: 'Sign In', to: '/login' }].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-ink-300 hover:text-white text-sm font-body transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-body font-medium text-sm mb-3 text-ink-100">For Vendors</p>
            <ul className="space-y-2">
              {[{ label: 'Create Profile', to: '/join' }, { label: 'Vendor Dashboard', to: '/vendor/overview' }].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-ink-300 hover:text-white text-sm font-body transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-ink-500 pt-6 text-center">
          <p className="text-ink-400 text-xs font-body">
            © {new Date().getFullYear()} VowVendors. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
