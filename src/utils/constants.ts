export const SERVICE_CATEGORIES = [
  { id: 'photographer', label: 'Photographer', icon: '📷', description: 'Capture every moment beautifully' },
  { id: 'videographer', label: 'Videographer', icon: '🎬', description: 'Tell your story on film' },
  { id: 'decor', label: 'Décor', icon: '🌸', description: 'Design the space of your dreams' },
  { id: 'music', label: 'Music & Bands', icon: '🎵', description: 'Set the perfect soundtrack' },
] as const

export type CategoryId = typeof SERVICE_CATEGORIES[number]['id']

export const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire',
  'New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio',
  'Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina','South Dakota',
  'Tennessee','Texas','Utah','Vermont','Virginia','Washington','West Virginia',
  'Wisconsin','Wyoming',
]

export const PRICE_RANGES = [
  { label: 'Any price', min: 0, max: Infinity },
  { label: 'Under $1,000', min: 0, max: 999 },
  { label: '$1,000 – $2,500', min: 1000, max: 2500 },
  { label: '$2,500 – $5,000', min: 2500, max: 5000 },
  { label: '$5,000+', min: 5000, max: Infinity },
]
