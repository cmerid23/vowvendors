import type { CreateHubData } from '../../../../types/hub'

interface Props {
  data: Partial<CreateHubData>
  onChange: (data: Partial<CreateHubData>) => void
}

export function Step1Details({ data, onChange }: Props) {
  const field = (key: keyof CreateHubData) => ({
    value: (data[key] as string) || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ ...data, [key]: e.target.value }),
  })

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block font-body text-sm font-medium text-ink mb-1.5">
            Partner 1 name <span className="text-red-400">*</span>
          </label>
          <input
            {...field('partner_one_name')}
            placeholder="Sarah"
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block font-body text-sm font-medium text-ink mb-1.5">
            Partner 2 name <span className="text-red-400">*</span>
          </label>
          <input
            {...field('partner_two_name')}
            placeholder="Michael"
            className="input w-full"
            required
          />
        </div>
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-ink mb-1.5">
          Wedding date <span className="text-red-400">*</span>
        </label>
        <input
          type="date"
          {...field('wedding_date')}
          className="input w-full"
          required
        />
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-ink mb-1.5">Venue name</label>
        <input {...field('venue_name')} placeholder="The Grand Estate" className="input w-full" />
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-ink mb-1.5">Venue location</label>
        <input {...field('venue_address')} placeholder="Austin, Texas" className="input w-full" />
      </div>

      <div>
        <label className="block font-body text-sm font-medium text-ink mb-1.5">Welcome message</label>
        <textarea
          value={(data.welcome_message as string) || ''}
          onChange={(e) => onChange({ ...data, welcome_message: e.target.value })}
          rows={3}
          placeholder="We are so glad you are here with us today!"
          className="input w-full resize-none"
        />
        <p className="font-body text-xs text-ink-300 mt-1">Shown as a greeting at the top of your hub.</p>
      </div>
    </div>
  )
}
