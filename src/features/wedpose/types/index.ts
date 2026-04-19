export interface Subcategory {
  id: string
  name: string
  query: string
  orientation: 'landscape' | 'portrait' | 'squarish'
  tags: string[]
  tips: string[]
  cameraSettings: string
}

export interface Category {
  id: string
  name: string
  icon: string
  description: string
  subcategories: Subcategory[]
}

export interface UnsplashPhoto {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt_description: string | null
  description: string | null
  user: {
    name: string
    username: string
    links: { html: string }
  }
  links: { html: string }
  width: number
  height: number
}

export interface PoseCard {
  id: string
  poseId: string
  subcategoryId: string
  categoryId: string
  photo: UnsplashPhoto
  poseName: string
}

export interface FavoriteCollection {
  id: string
  name: string
  poseIds: string[]
  createdAt: number
}
