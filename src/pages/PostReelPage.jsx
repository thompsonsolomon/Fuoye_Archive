import { CreateReel } from "../components/reels/create-reel";

export default function PostReelPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Reel</h1>
        <p className="text-gray-600">Share short videos with the FUOYE community</p>
      </div>

      <CreateReel />
    </div>
  )
}
