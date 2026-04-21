import { WedPoseCategory } from '../../../features/wedpose/pages/WedPoseCategory'

export function PublicWedPoseCategory() {
  return (
    <div className="wedpose-embedded" style={{ background: 'transparent', padding: 0, minHeight: 'unset' }}>
      <WedPoseCategory basePath="/wedpose/poses" />
    </div>
  )
}
