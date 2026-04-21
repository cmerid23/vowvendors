import { WedPoseHome } from '../../../features/wedpose/pages/WedPoseHome'

export function PublicWedPoseHome() {
  return (
    <div className="wedpose-embedded" style={{ background: 'transparent', padding: 0, minHeight: 'unset' }}>
      <WedPoseHome basePath="/wedpose/poses" />
    </div>
  )
}
