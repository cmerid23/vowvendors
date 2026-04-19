export interface StyleDimensions {
  formality: number  // 0=ultra casual → 10=black tie
  palette: number    // 0=neutral/earthy → 10=bold/vibrant
  setting: number    // 0=indoor/urban → 10=outdoor/nature
  era: number        // 0=ultra modern → 10=vintage/timeless
  scale: number      // 0=micro/intimate → 10=grand/ballroom
  mood: number       // 0=dramatic/intense → 10=light/whimsical
}

export const DIMENSION_KEYS: (keyof StyleDimensions)[] = [
  'formality', 'palette', 'setting', 'era', 'scale', 'mood'
]

export const BASE_DIMENSIONS: StyleDimensions = {
  formality: 5,
  palette: 5,
  setting: 5,
  era: 5,
  scale: 5,
  mood: 5,
}
