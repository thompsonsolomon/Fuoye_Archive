import { ProfileContent } from "../components/profile/profile-content";
import { ProfileHeader } from "../components/profile/profile-header";
import { ProfileStats } from "../components/profile/profile-stats";

export default function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <ProfileHeader />
      <ProfileStats />
      <ProfileContent />
    </div>
  )
}
