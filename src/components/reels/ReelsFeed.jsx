import { useState, useEffect } from "react"
import { ReelCard } from "./ReelCard"
import { Loader2, WifiOff, Plus } from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "react-router-dom"
import { getDocs, collection, getCountFromServer } from "firebase/firestore"
import { getUserProfile } from "../../lib/api"
import { db } from "../../utils/firebase"

export function ReelsFeed() {
  const [reels, setReels] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadReels()
  }, [])

  const loadReels = async () => {
    setLoading(true)
    setError(null)

    try {
      const snapshot = await getDocs(collection(db, "reels"))
      const baseReels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      const reelsWithExtras = await Promise.all(
        baseReels.map(async (reel) => {
          const user = await getUserProfile(reel.user?.id || reel.userId)
          const commentCountSnap = await getCountFromServer(collection(db, "reels", reel.id, "comments"))

          return {
            ...reel,
            comments: commentCountSnap.data().count,
            user: {
              id: user.uid,
              name: user.fullName,
              avatar: user.profileImage || "/placeholder.svg?height=40&width=40",
            },
          }
        })
      )

      setReels(reelsWithExtras)
      localStorage.setItem("fuoye-reels", JSON.stringify(reelsWithExtras))
    } catch (err) {
      console.error("Failed to fetch reels:", err)
      setError("Failed to load reels. Please try again.")
      const cached = localStorage.getItem("fuoye-reels")
      setReels(cached ? JSON.parse(cached) : [])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-4" />
          <p className="text-white">Loading reels...</p>
        </div>
      </div>
    )
  }

  if (error && reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center p-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Unable to load reels</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <Button onClick={loadReels} className="fuoye-button">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-full bg-black">
      <div className="h-full w-full snap-y snap-mandatory overflow-y-scroll">
        {reels.map((reel, index) => (
          <div key={reel.id} className="h-screen w-full snap-start">
            <ReelCard reel={reel} isActive={index === activeIndex} />
          </div>
        ))}
      </div>

      <Link to="/post-reel">
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-emerald-800 hover:bg-emerald-700 text-white shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  )
}
