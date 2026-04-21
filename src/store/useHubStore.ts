import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type {
  WeddingHub,
  HubTimelineEvent,
  HubPhoto,
  HubVendor,
  HubSongRequest,
  HubSeatingTable,
  HubAnalytics,
  HubTravel,
  HubHotel,
  HubThingToDo,
  HubFaqItem,
  CreateHubData,
  CreateTimelineEvent,
  CreateHubVendor,
  CreateSongRequest,
  ThingsToDoSuggestion,
} from '../types/hub'
import { suggestThingsToDo } from '../features/hub/lib/suggestThingsToDo'

interface HubState {
  hub: WeddingHub | null
  timeline: HubTimelineEvent[]
  photos: HubPhoto[]
  vendors: HubVendor[]
  songRequests: HubSongRequest[]
  seatingTables: HubSeatingTable[]
  analytics: HubAnalytics | null
  isLoading: boolean
  isCreating: boolean
  myHubs: WeddingHub[]

  loadHub: (accessCode: string) => Promise<void>
  loadMyHubs: (userId: string) => Promise<void>
  createHub: (data: CreateHubData) => Promise<WeddingHub>
  updateHub: (id: string, data: Partial<WeddingHub>) => Promise<void>

  addTimelineEvent: (hubId: string, event: CreateTimelineEvent) => Promise<void>
  updateTimelineEvent: (id: string, data: Partial<HubTimelineEvent>) => Promise<void>
  deleteTimelineEvent: (id: string) => Promise<void>
  reorderTimeline: (events: HubTimelineEvent[]) => Promise<void>

  addVendor: (hubId: string, vendor: CreateHubVendor) => Promise<void>
  removeVendor: (id: string) => Promise<void>

  uploadPhoto: (hubId: string, r2Key: string, uploaderName: string, uploaderEmail?: string, uploaderId?: string) => Promise<HubPhoto>
  approvePhoto: (id: string) => Promise<void>
  hidePhoto: (id: string) => Promise<void>
  featurePhoto: (id: string, featured: boolean) => Promise<void>

  addSongRequest: (hubId: string, data: CreateSongRequest) => Promise<void>
  voteSong: (requestId: string, sessionId: string) => Promise<void>
  markSongPlayed: (id: string) => Promise<void>

  addSeatingTable: (hubId: string, tableName: string, seats: Array<{ name: string; seat: number }>) => Promise<void>
  updateSeatingTable: (id: string, data: Partial<HubSeatingTable>) => Promise<void>
  deleteSeatingTable: (id: string) => Promise<void>

  generateAccessCode: (partnerOne: string, partnerTwo: string, year: number) => string
  trackScan: (hubId: string, sessionId: string) => Promise<void>

  // Travel
  travel: HubTravel | null
  hotels: HubHotel[]
  loadTravel: (hubId: string) => Promise<void>
  saveTravel: (hubId: string, data: Partial<HubTravel>) => Promise<void>
  addHotel: (hubId: string, hotel: Omit<HubHotel, 'id' | 'hub_id' | 'display_order'>) => Promise<void>
  updateHotel: (id: string, data: Partial<HubHotel>) => Promise<void>
  removeHotel: (id: string) => Promise<void>

  // Things To Do
  thingsToDo: HubThingToDo[]
  aiSuggestions: ThingsToDoSuggestion[]
  isLoadingAISuggestions: boolean
  loadThingsToDo: (hubId: string) => Promise<void>
  addThingToDo: (hubId: string, item: Omit<HubThingToDo, 'id' | 'hub_id' | 'display_order'>) => Promise<void>
  updateThingToDo: (id: string, data: Partial<HubThingToDo>) => Promise<void>
  removeThingToDo: (id: string) => Promise<void>
  generateAISuggestions: (city: string, state: string, weddingDate: string) => Promise<void>
  clearAISuggestions: () => void

  // FAQ
  faqItems: HubFaqItem[]
  loadFaq: (hubId: string) => Promise<void>
  addFaqItem: (hubId: string, item: Omit<HubFaqItem, 'id' | 'hub_id' | 'display_order'>) => Promise<void>
  updateFaqItem: (id: string, data: Partial<HubFaqItem>) => Promise<void>
  removeFaqItem: (id: string) => Promise<void>
}

export const useHubStore = create<HubState>((set, get) => ({
  hub: null,
  timeline: [],
  photos: [],
  vendors: [],
  songRequests: [],
  seatingTables: [],
  analytics: null,
  isLoading: false,
  isCreating: false,
  myHubs: [],
  travel: null,
  hotels: [],
  thingsToDo: [],
  aiSuggestions: [],
  isLoadingAISuggestions: false,
  faqItems: [],

  loadHub: async (accessCode) => {
    set({ isLoading: true })
    try {
      const { data: hub } = await supabase
        .from('wedding_hubs')
        .select('*')
        .eq('access_code', accessCode)
        .single()

      if (!hub) { set({ isLoading: false }); return }

      const [
        { data: timeline },
        { data: photos },
        { data: vendors },
        { data: songs },
        { data: seating },
        { data: travel },
        { data: hotels },
        { data: thingsToDo },
        { data: faqItems },
      ] = await Promise.all([
        supabase.from('hub_timeline_events').select('*').eq('hub_id', hub.id).order('display_order'),
        supabase.from('hub_photos').select('*').eq('hub_id', hub.id).eq('is_approved', true).order('is_featured', { ascending: false }).order('created_at', { ascending: false }).limit(40),
        supabase.from('hub_vendors').select('*').eq('hub_id', hub.id).order('display_order'),
        supabase.from('hub_song_requests').select('*').eq('hub_id', hub.id).order('vote_count', { ascending: false }),
        supabase.from('hub_seating_tables').select('*').eq('hub_id', hub.id).order('display_order'),
        supabase.from('hub_travel').select('*').eq('hub_id', hub.id).single(),
        supabase.from('hub_hotels').select('*').eq('hub_id', hub.id).order('display_order'),
        supabase.from('hub_things_to_do').select('*').eq('hub_id', hub.id).order('display_order'),
        supabase.from('hub_faq').select('*').eq('hub_id', hub.id).order('display_order'),
      ])

      set({
        hub: hub as WeddingHub,
        timeline: (timeline as HubTimelineEvent[]) || [],
        photos: (photos as HubPhoto[]) || [],
        vendors: (vendors as HubVendor[]) || [],
        songRequests: (songs as HubSongRequest[]) || [],
        seatingTables: (seating as HubSeatingTable[]) || [],
        travel: (travel as HubTravel) || null,
        hotels: (hotels as HubHotel[]) || [],
        thingsToDo: (thingsToDo as HubThingToDo[]) || [],
        faqItems: (faqItems as HubFaqItem[]) || [],
        isLoading: false,
      })
    } catch {
      set({ isLoading: false })
    }
  },

  loadMyHubs: async (userId) => {
    const { data } = await supabase
      .from('wedding_hubs')
      .select('*')
      .or(`couple_id.eq.${userId},created_by.eq.${userId}`)
      .order('created_at', { ascending: false })
    set({ myHubs: (data as WeddingHub[]) || [] })
  },

  createHub: async (data) => {
    set({ isCreating: true })
    const accessCode = get().generateAccessCode(
      data.partner_one_name,
      data.partner_two_name,
      new Date(data.wedding_date).getFullYear(),
    )
    const { data: hub, error } = await supabase
      .from('wedding_hubs')
      .insert({ ...data, access_code: accessCode })
      .select()
      .single()
    if (error) throw new Error(error.message)
    set((s) => ({ myHubs: [hub as WeddingHub, ...s.myHubs], isCreating: false }))
    return hub as WeddingHub
  },

  updateHub: async (id, data) => {
    const { error } = await supabase.from('wedding_hubs').update(data).eq('id', id)
    if (error) throw new Error(error.message)
    set((s) => ({
      hub: s.hub?.id === id ? { ...s.hub, ...data } as WeddingHub : s.hub,
      myHubs: s.myHubs.map((h) => h.id === id ? { ...h, ...data } as WeddingHub : h),
    }))
  },

  addTimelineEvent: async (hubId, event) => {
    const order = get().timeline.length
    const { data, error } = await supabase
      .from('hub_timeline_events')
      .insert({ hub_id: hubId, ...event, display_order: event.display_order ?? order })
      .select()
      .single()
    if (error) throw new Error(error.message)
    set((s) => ({ timeline: [...s.timeline, data as HubTimelineEvent] }))
  },

  updateTimelineEvent: async (id, data) => {
    const { error } = await supabase.from('hub_timeline_events').update(data).eq('id', id)
    if (error) throw new Error(error.message)
    set((s) => ({ timeline: s.timeline.map((e) => e.id === id ? { ...e, ...data } : e) }))
  },

  deleteTimelineEvent: async (id) => {
    await supabase.from('hub_timeline_events').delete().eq('id', id)
    set((s) => ({ timeline: s.timeline.filter((e) => e.id !== id) }))
  },

  reorderTimeline: async (events) => {
    set({ timeline: events })
    await Promise.all(
      events.map((e, i) => supabase.from('hub_timeline_events').update({ display_order: i }).eq('id', e.id))
    )
  },

  addVendor: async (hubId, vendor) => {
    const order = get().vendors.length
    const { data, error } = await supabase
      .from('hub_vendors')
      .insert({ hub_id: hubId, ...vendor, display_order: order })
      .select()
      .single()
    if (error) throw new Error(error.message)
    set((s) => ({ vendors: [...s.vendors, data as HubVendor] }))
  },

  removeVendor: async (id) => {
    await supabase.from('hub_vendors').delete().eq('id', id)
    set((s) => ({ vendors: s.vendors.filter((v) => v.id !== id) }))
  },

  uploadPhoto: async (hubId, r2Key, uploaderName, uploaderEmail, uploaderId) => {
    const { data, error } = await supabase
      .from('hub_photos')
      .insert({
        hub_id: hubId,
        r2_original_key: r2Key,
        uploader_name: uploaderName,
        uploader_email: uploaderEmail || null,
        uploader_id: uploaderId || null,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    await supabase.rpc('increment_hub_photos', { p_hub_id: hubId })
    return data as HubPhoto
  },

  approvePhoto: async (id) => {
    await supabase.from('hub_photos').update({ is_approved: true }).eq('id', id)
    set((s) => ({ photos: s.photos.map((p) => p.id === id ? { ...p, is_approved: true } : p) }))
  },

  hidePhoto: async (id) => {
    await supabase.from('hub_photos').update({ is_approved: false }).eq('id', id)
    set((s) => ({ photos: s.photos.filter((p) => p.id !== id) }))
  },

  featurePhoto: async (id, featured) => {
    await supabase.from('hub_photos').update({ is_featured: featured }).eq('id', id)
    set((s) => ({ photos: s.photos.map((p) => p.id === id ? { ...p, is_featured: featured } : p) }))
  },

  addSongRequest: async (hubId, data) => {
    const { data: req, error } = await supabase
      .from('hub_song_requests')
      .insert({ hub_id: hubId, ...data })
      .select()
      .single()
    if (error) throw new Error(error.message)
    set((s) => ({ songRequests: [req as HubSongRequest, ...s.songRequests] }))
  },

  voteSong: async (requestId, sessionId) => {
    set((s) => ({
      songRequests: s.songRequests
        .map((r) => r.id === requestId ? { ...r, vote_count: r.vote_count + 1 } : r)
        .sort((a, b) => b.vote_count - a.vote_count),
    }))
    const { error } = await supabase.from('hub_song_votes').insert({ request_id: requestId, session_id: sessionId })
    if (!error) {
      await supabase.rpc('increment_song_vote', { p_request_id: requestId })
    } else {
      // Revert optimistic update on duplicate vote
      set((s) => ({
        songRequests: s.songRequests
          .map((r) => r.id === requestId ? { ...r, vote_count: r.vote_count - 1 } : r)
          .sort((a, b) => b.vote_count - a.vote_count),
      }))
    }
  },

  markSongPlayed: async (id) => {
    await supabase.from('hub_song_requests').update({ is_played: true }).eq('id', id)
    set((s) => ({ songRequests: s.songRequests.map((r) => r.id === id ? { ...r, is_played: true } : r) }))
  },

  addSeatingTable: async (hubId, tableName, seats) => {
    const order = get().seatingTables.length
    const { data, error } = await supabase
      .from('hub_seating_tables')
      .insert({ hub_id: hubId, table_name: tableName, seats, display_order: order })
      .select()
      .single()
    if (error) throw new Error(error.message)
    set((s) => ({ seatingTables: [...s.seatingTables, data as HubSeatingTable] }))
  },

  updateSeatingTable: async (id, data) => {
    await supabase.from('hub_seating_tables').update(data).eq('id', id)
    set((s) => ({ seatingTables: s.seatingTables.map((t) => t.id === id ? { ...t, ...data } : t) }))
  },

  deleteSeatingTable: async (id) => {
    await supabase.from('hub_seating_tables').delete().eq('id', id)
    set((s) => ({ seatingTables: s.seatingTables.filter((t) => t.id !== id) }))
  },

  generateAccessCode: (partnerOne, partnerTwo, year) => {
    const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12)
    const base = `${slug(partnerOne)}-${slug(partnerTwo)}-${year}`
    const suffix = Math.random().toString(36).slice(2, 6)
    return `${base}-${suffix}`
  },

  trackScan: async (hubId, sessionId) => {
    await supabase.from('hub_scans').insert({ hub_id: hubId, session_id: sessionId })
    await supabase.rpc('increment_hub_scan', { p_hub_id: hubId })
  },

  // ── Travel ────────────────────────────────────────────────────────────────
  loadTravel: async (hubId) => {
    const { data: travel } = await supabase.from('hub_travel').select('*').eq('hub_id', hubId).single()
    const { data: hotels } = await supabase.from('hub_hotels').select('*').eq('hub_id', hubId).order('display_order')
    set({ travel: (travel as HubTravel) || null, hotels: (hotels as HubHotel[]) || [] })
  },

  saveTravel: async (hubId, data) => {
    const existing = get().travel
    if (existing) {
      await supabase.from('hub_travel').update(data).eq('hub_id', hubId)
      set({ travel: { ...existing, ...data } as HubTravel })
    } else {
      const { data: row, error } = await supabase
        .from('hub_travel')
        .insert({ hub_id: hubId, ...data })
        .select()
        .single()
      if (error) throw new Error(error.message)
      set({ travel: row as HubTravel })
    }
  },

  addHotel: async (hubId, hotel) => {
    const order = get().hotels.length
    const { data, error } = await supabase
      .from('hub_hotels')
      .insert({ hub_id: hubId, ...hotel, display_order: order })
      .select()
      .single()
    if (error) throw new Error(error.message)
    set((s) => ({ hotels: [...s.hotels, data as HubHotel] }))
  },

  updateHotel: async (id, data) => {
    await supabase.from('hub_hotels').update(data).eq('id', id)
    set((s) => ({ hotels: s.hotels.map((h) => h.id === id ? { ...h, ...data } : h) }))
  },

  removeHotel: async (id) => {
    await supabase.from('hub_hotels').delete().eq('id', id)
    set((s) => ({ hotels: s.hotels.filter((h) => h.id !== id) }))
  },

  // ── Things To Do ─────────────────────────────────────────────────────────
  loadThingsToDo: async (hubId) => {
    const { data } = await supabase.from('hub_things_to_do').select('*').eq('hub_id', hubId).order('display_order')
    set({ thingsToDo: (data as HubThingToDo[]) || [] })
  },

  addThingToDo: async (hubId, item) => {
    const order = get().thingsToDo.length
    const { data, error } = await supabase
      .from('hub_things_to_do')
      .insert({ hub_id: hubId, ...item, display_order: order })
      .select()
      .single()
    if (error) throw new Error(error.message)
    set((s) => ({ thingsToDo: [...s.thingsToDo, data as HubThingToDo] }))
  },

  updateThingToDo: async (id, data) => {
    await supabase.from('hub_things_to_do').update(data).eq('id', id)
    set((s) => ({ thingsToDo: s.thingsToDo.map((t) => t.id === id ? { ...t, ...data } : t) }))
  },

  removeThingToDo: async (id) => {
    await supabase.from('hub_things_to_do').delete().eq('id', id)
    set((s) => ({ thingsToDo: s.thingsToDo.filter((t) => t.id !== id) }))
  },

  generateAISuggestions: async (city, state, weddingDate) => {
    set({ isLoadingAISuggestions: true, aiSuggestions: [] })
    try {
      const suggestions = await suggestThingsToDo(city, state, weddingDate)
      set({ aiSuggestions: suggestions, isLoadingAISuggestions: false })
    } catch {
      set({ isLoadingAISuggestions: false })
    }
  },

  clearAISuggestions: () => set({ aiSuggestions: [] }),

  // ── FAQ ───────────────────────────────────────────────────────────────────
  loadFaq: async (hubId) => {
    const { data } = await supabase.from('hub_faq').select('*').eq('hub_id', hubId).order('display_order')
    set({ faqItems: (data as HubFaqItem[]) || [] })
  },

  addFaqItem: async (hubId, item) => {
    const order = get().faqItems.length
    const { data, error } = await supabase
      .from('hub_faq')
      .insert({ hub_id: hubId, ...item, display_order: order })
      .select()
      .single()
    if (error) throw new Error(error.message)
    set((s) => ({ faqItems: [...s.faqItems, data as HubFaqItem] }))
  },

  updateFaqItem: async (id, data) => {
    await supabase.from('hub_faq').update(data).eq('id', id)
    set((s) => ({ faqItems: s.faqItems.map((f) => f.id === id ? { ...f, ...data } : f) }))
  },

  removeFaqItem: async (id) => {
    await supabase.from('hub_faq').delete().eq('id', id)
    set((s) => ({ faqItems: s.faqItems.filter((f) => f.id !== id) }))
  },
}))
