import type { StyleDimensions } from './dimensions'

export interface QuizOption {
  id: string
  label: string
  imageUrl: string
  dimensionAdjustments: Partial<StyleDimensions>
}

export interface QuizQuestion {
  id: string
  number: number
  question: string
  subtitle?: string
  options: [QuizOption, QuizOption, QuizOption, QuizOption]
}

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=400&h=500&fit=crop&auto=format&q=80`

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1-setting',
    number: 1,
    question: 'Where do you picture your ceremony?',
    options: [
      {
        id: 'church',
        label: 'A grand church or cathedral',
        imageUrl: img('1511285560929-80b3c7ef675b'),
        dimensionAdjustments: { formality: 3, setting: -3, era: 2, scale: 2 },
      },
      {
        id: 'garden',
        label: 'A lush garden or botanical space',
        imageUrl: img('1537633552985-df8429e8048b'),
        dimensionAdjustments: { setting: 3, mood: 2, palette: 1 },
      },
      {
        id: 'beach',
        label: 'A beach or waterfront',
        imageUrl: img('1520854221256-17451cc331bf'),
        dimensionAdjustments: { setting: 4, palette: 2, formality: -2, mood: 2 },
      },
      {
        id: 'urban',
        label: 'A rooftop or industrial loft',
        imageUrl: img('1529156069-1ab22f4f6c43'),
        dimensionAdjustments: { setting: -3, era: -3, formality: 1 },
      },
    ],
  },
  {
    id: 'q2-palette',
    number: 2,
    question: 'Which color story feels like you?',
    options: [
      {
        id: 'blush',
        label: 'Ivory, champagne & blush',
        imageUrl: img('1519225421980-9c9bdee2c60b'),
        dimensionAdjustments: { palette: -2, era: 2, mood: 2 },
      },
      {
        id: 'earthy',
        label: 'Sage, terracotta & rust',
        imageUrl: img('1465495976277-4387d4b0b4c6'),
        dimensionAdjustments: { setting: 2, palette: 1, era: -1, mood: 2 },
      },
      {
        id: 'jewel',
        label: 'Rich jewel tones',
        imageUrl: img('1508672019048-c69efeb5b48e'),
        dimensionAdjustments: { palette: 4, mood: -2, formality: 1, era: 2 },
      },
      {
        id: 'mono',
        label: 'Black, white & gold',
        imageUrl: img('1548101734-b72b5b456b19'),
        dimensionAdjustments: { formality: 3, era: 2, palette: -1, scale: 1 },
      },
    ],
  },
  {
    id: 'q3-tables',
    number: 3,
    question: 'Your reception tables look like...',
    options: [
      {
        id: 'farm',
        label: 'Long farm tables with wildflowers',
        imageUrl: img('1464047736614-af63643285bf'),
        dimensionAdjustments: { setting: 3, era: -1, formality: -2, mood: 2 },
      },
      {
        id: 'formal',
        label: 'Round tables with towering florals',
        imageUrl: img('1490806843957-31f4c9a98122'),
        dimensionAdjustments: { formality: 3, era: 2, scale: 2 },
      },
      {
        id: 'minimal',
        label: 'Minimalist with geometric touches',
        imageUrl: img('1493637001073-33d04b3e3a72'),
        dimensionAdjustments: { era: -3, formality: 1, palette: -2 },
      },
      {
        id: 'eclectic',
        label: 'Colorful eclectic tablescape',
        imageUrl: img('1518049362265-d5b2a6467637'),
        dimensionAdjustments: { palette: 4, mood: 4, formality: -3 },
      },
    ],
  },
  {
    id: 'q4-dress',
    number: 4,
    question: 'Your bridal style is closest to...',
    options: [
      {
        id: 'ballgown',
        label: 'Ballgown with cathedral veil',
        imageUrl: img('1515934751635-c81365b73921'),
        dimensionAdjustments: { formality: 4, era: 3, scale: 1 },
      },
      {
        id: 'boho',
        label: 'Flowy boho lace dress',
        imageUrl: img('1522673607200-f8a8e73f50a3'),
        dimensionAdjustments: { setting: 3, era: -1, mood: 3, formality: -2 },
      },
      {
        id: 'sleek',
        label: 'Sleek modern minimalist gown',
        imageUrl: img('1583939003579-730e3918a45a'),
        dimensionAdjustments: { era: -4, formality: 2, palette: -2 },
      },
      {
        id: 'vintage',
        label: 'Vintage-inspired A-line or tea length',
        imageUrl: img('1487530811176-3780de880c2d'),
        dimensionAdjustments: { era: 4, formality: 1, mood: 2 },
      },
    ],
  },
  {
    id: 'q5-guests',
    number: 5,
    question: 'How many guests are you imagining?',
    subtitle: 'Your answer shapes the whole vibe',
    options: [
      {
        id: 'micro',
        label: 'Under 50 — just our people',
        imageUrl: img('1474552226370-0a9c38dce3ed'),
        dimensionAdjustments: { scale: -4, mood: 2 },
      },
      {
        id: 'medium',
        label: '50–150 — close friends & family',
        imageUrl: img('1519741347-338c2c5bc9e4'),
        dimensionAdjustments: { scale: 0 },
      },
      {
        id: 'large',
        label: '150–250 — everyone we love',
        imageUrl: img('1519167758-be329c82f8b0'),
        dimensionAdjustments: { scale: 3, formality: 1 },
      },
      {
        id: 'grand',
        label: '300+ — the more the merrier',
        imageUrl: img('1533174072-28ae2dc96490'),
        dimensionAdjustments: { scale: 5, formality: 1 },
      },
    ],
  },
  {
    id: 'q6-music',
    number: 6,
    question: 'Your ideal soundtrack is...',
    options: [
      {
        id: 'classical',
        label: 'String quartet or jazz ensemble',
        imageUrl: img('1507003211-95b4640b6f0c'),
        dimensionAdjustments: { formality: 3, era: 2, mood: -1 },
      },
      {
        id: 'acoustic',
        label: 'Live acoustic or folk band',
        imageUrl: img('1516450360452-9312f5e86fc7'),
        dimensionAdjustments: { setting: 2, formality: -1, mood: 3 },
      },
      {
        id: 'dj',
        label: 'DJ and dance floor all night',
        imageUrl: img('1493225457-6d2bef55e07a'),
        dimensionAdjustments: { formality: -2, mood: -2, palette: 2, scale: 1 },
      },
      {
        id: 'indie',
        label: 'Indie or alternative live band',
        imageUrl: img('1530569233370-4be7a5c1813e'),
        dimensionAdjustments: { era: -2, mood: 1, formality: -1 },
      },
    ],
  },
  {
    id: 'q7-photo',
    number: 7,
    question: 'Which photo speaks to your soul?',
    subtitle: 'Trust your gut — go with your first reaction',
    options: [
      {
        id: 'cathedral',
        label: 'Grand cathedral aisle moment',
        imageUrl: img('1519740066738-b95bb2700fb4'),
        dimensionAdjustments: { formality: 4, scale: 3, era: 2 },
      },
      {
        id: 'sunset',
        label: 'Candid sunset portrait in a field',
        imageUrl: img('1518495973542-4542c06a5843'),
        dimensionAdjustments: { setting: 4, mood: 3, era: -1 },
      },
      {
        id: 'rooftop',
        label: 'Rooftop skyline evening reception',
        imageUrl: img('1546069901-522a6b2e3c94'),
        dimensionAdjustments: { setting: -4, era: -3, formality: 2 },
      },
      {
        id: 'lights',
        label: 'Fairy lights and dancing under stars',
        imageUrl: img('1504701954957-2010ec3bcec1'),
        dimensionAdjustments: { mood: 5, setting: 2, formality: -4 },
      },
    ],
  },
  {
    id: 'q8-honeymoon',
    number: 8,
    question: 'Your dream honeymoon is...',
    subtitle: 'A window into your heart',
    options: [
      {
        id: 'europe',
        label: 'Paris or a European city',
        imageUrl: img('1522012183-0304e321d4e2'),
        dimensionAdjustments: { era: 3, formality: 2, palette: -1 },
      },
      {
        id: 'tropical',
        label: 'Bali or a tropical beach',
        imageUrl: img('1507525428034-b723cf961d3e'),
        dimensionAdjustments: { setting: 4, palette: 3, formality: -2, mood: 2 },
      },
      {
        id: 'city',
        label: 'New York or a big city',
        imageUrl: img('1499678042416-62ca67dba361'),
        dimensionAdjustments: { setting: -3, era: -2, formality: 1 },
      },
      {
        id: 'countryside',
        label: 'Countryside cottage or cabin',
        imageUrl: img('1449844908441-8829af56fd44'),
        dimensionAdjustments: { setting: 3, scale: -2, era: 1, mood: 2 },
      },
    ],
  },
]
