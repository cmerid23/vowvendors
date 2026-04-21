import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '../../../store/useAuthStore'
import { useHubStore } from '../../../store/useHubStore'
import { Step1Details } from '../components/HubCreatorSteps/Step1Details'
import { Step2CoverPhoto } from '../components/HubCreatorSteps/Step2CoverPhoto'
import { Step3Timeline } from '../components/HubCreatorSteps/Step3Timeline'
import { Step4Vendors } from '../components/HubCreatorSteps/Step4Vendors'
import { Step5Features } from '../components/HubCreatorSteps/Step5Features'
import { Step6Travel } from '../components/HubCreatorSteps/Step6Travel'
import { Step7ThingsToDo } from '../components/HubCreatorSteps/Step7ThingsToDo'
import { Step8FAQ } from '../components/HubCreatorSteps/Step8FAQ'
import { HubQRCode } from '../components/HubQRCode'
import type {
  CreateHubData,
  CreateTimelineEvent,
  CreateHubVendor,
  WeddingHub,
  HubTravel,
  HubHotel,
  HubThingToDo,
  HubFaqItem,
} from '../../../types/hub'

const STEPS = ['Your Wedding', 'Cover Photo', 'Timeline', 'Vendors', 'Features', 'Travel', 'Things To Do', 'FAQ']

const DEFAULT_DATA: Partial<CreateHubData> = {
  theme: 'romantic',
  accent_color: '#B8860B',
  show_timeline: true,
  show_photo_wall: true,
  show_seating: false,
  show_song_requests: false,
  show_vendors: true,
  show_travel: true,
  show_things_to_do: true,
  show_faq: true,
}

export function HubCreator() {
  const user = useAuthStore((s) => s.user)
  const {
    createHub, addTimelineEvent, addVendor, isCreating,
    saveTravel, addHotel, addThingToDo, addFaqItem,
    generateAISuggestions, aiSuggestions, isLoadingAISuggestions,
  } = useHubStore()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<Partial<CreateHubData>>(DEFAULT_DATA)
  const [timelineEvents, setTimelineEvents] = useState<CreateTimelineEvent[]>([])
  const [vendors, setVendors] = useState<CreateHubVendor[]>([])
  const [travelData, setTravelData] = useState<Partial<HubTravel>>({})
  const [hotelDrafts, setHotelDrafts] = useState<Omit<HubHotel, 'id' | 'hub_id' | 'display_order'>[]>([])
  const [activityDrafts, setActivityDrafts] = useState<Omit<HubThingToDo, 'id' | 'hub_id' | 'display_order'>[]>([])
  const [faqDrafts, setFaqDrafts] = useState<Omit<HubFaqItem, 'id' | 'hub_id' | 'display_order'>[]>([])
  const [createdHub, setCreatedHub] = useState<WeddingHub | null>(null)
  const [error, setError] = useState('')

  const canProceed = () => {
    if (step === 0) return !!(formData.partner_one_name && formData.partner_two_name && formData.wedding_date)
    return true
  }

  const next = () => {
    if (!canProceed()) { setError('Please fill in the required fields.'); return }
    setError('')
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleAISuggest = async () => {
    if (!formData.venue_city || !formData.venue_state) return
    await generateAISuggestions(formData.venue_city, formData.venue_state, formData.wedding_date || '')
  }

  const finish = async () => {
    if (!user) return
    setError('')
    try {
      const hub = await createHub({
        ...(formData as CreateHubData),
        created_by: user.id,
        couple_id: user.id,
      })

      // Save all data in parallel where possible
      const saves: Promise<unknown>[] = []

      for (let i = 0; i < timelineEvents.length; i++) {
        saves.push(addTimelineEvent(hub.id, { ...timelineEvents[i], display_order: i }))
      }
      for (const v of vendors) {
        saves.push(addVendor(hub.id, v))
      }

      // Travel
      const hasTravelData = Object.values(travelData).some((v) => v)
      if (hasTravelData) saves.push(saveTravel(hub.id, travelData))
      for (const h of hotelDrafts) saves.push(addHotel(hub.id, h))

      // Things to do
      for (const a of activityDrafts) saves.push(addThingToDo(hub.id, a))

      // FAQ
      for (const f of faqDrafts) saves.push(addFaqItem(hub.id, f))

      await Promise.all(saves)
      setCreatedHub(hub)
    } catch (e) {
      setError((e as Error).message)
    }
  }

  // Success screen
  if (createdHub) {
    const hubUrl = `${window.location.origin}/wedding/${createdHub.access_code}`
    return (
      <div className="max-w-lg mx-auto py-12 px-4 text-center space-y-6">
        <div className="text-5xl">🎉</div>
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Your Wedding Hub is Ready!</h1>
          <p className="font-body text-ink-400 mt-2">Share this with your guests — they will love it.</p>
        </div>

        <div className="bg-ink-50 rounded-2xl p-4">
          <p className="font-body text-xs text-ink-400 mb-2">Your hub link</p>
          <p className="font-body text-sm font-medium text-ink break-all">{hubUrl}</p>
          <button
            onClick={() => navigator.clipboard.writeText(hubUrl)}
            className="mt-2 text-xs font-body text-brand hover:underline"
          >
            Copy link
          </button>
        </div>

        <HubQRCode
          accessCode={createdHub.access_code}
          coupleName={`${createdHub.partner_one_name}-${createdHub.partner_two_name}`}
          size={220}
        />

        <div className="text-xs font-body text-ink-400 bg-amber-50 border border-amber-200 rounded-xl p-3">
          Print QR codes and place them on each guest table, at the entrance, and in ceremony programs.
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={`/wedding/${createdHub.access_code}`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary w-full text-center"
          >
            View Live Hub →
          </a>
          <button
            onClick={() => navigate(`/vendor/hub/${createdHub.id}`)}
            className="btn-ghost w-full"
          >
            Manage Hub
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink">Create Wedding Hub</h1>
        <p className="font-body text-sm text-ink-400 mt-1">Set up your guests&apos; wedding day experience in minutes.</p>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center gap-0.5 mb-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all ${i <= step ? 'bg-brand' : 'bg-ink-100'}`}
            />
          ))}
        </div>
        <p className="font-body text-xs text-ink-400">
          Step {step + 1} of {STEPS.length} — <span className="font-medium text-ink">{STEPS[step]}</span>
        </p>
      </div>

      {/* Step content */}
      <div className="card p-6 mb-6">
        {step === 0 && <Step1Details data={formData} onChange={setFormData} />}
        {step === 1 && <Step2CoverPhoto data={formData} onChange={setFormData} userId={user?.id || ''} />}
        {step === 2 && <Step3Timeline events={timelineEvents} onChange={setTimelineEvents} />}
        {step === 3 && <Step4Vendors vendors={vendors} onChange={setVendors} />}
        {step === 4 && <Step5Features data={formData} onChange={setFormData} />}
        {step === 5 && (
          <Step6Travel
            travel={travelData}
            hotels={hotelDrafts}
            venueAddress={formData.venue_address}
            onTravelChange={setTravelData}
            onHotelsChange={setHotelDrafts}
          />
        )}
        {step === 6 && (
          <Step7ThingsToDo
            items={activityDrafts}
            onChange={setActivityDrafts}
            onAISuggest={handleAISuggest}
            aiSuggestions={aiSuggestions}
            isLoadingAI={isLoadingAISuggestions}
            city={formData.venue_city}
            state={formData.venue_state}
          />
        )}
        {step === 7 && (
          <Step8FAQ
            items={faqDrafts}
            onChange={setFaqDrafts}
          />
        )}
      </div>

      {error && (
        <p className="font-body text-sm text-red-500 mb-4">{error}</p>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={back}
          disabled={step === 0}
          className="flex items-center gap-1.5 font-body text-sm text-ink-400 hover:text-ink disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={next} className="btn-primary flex items-center gap-1.5">
            Continue <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={isCreating}
            className="btn-primary flex items-center gap-1.5 disabled:opacity-60"
          >
            {isCreating ? 'Creating…' : (
              <><CheckCircle size={16} /> Finish — View My Hub</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
