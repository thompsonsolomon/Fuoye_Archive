import { useState, useRef, useEffect } from "react"
import { Heart, MessageCircle, Share2, Play } from "lucide-react"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useInView } from "react-intersection-observer"
import { doc, updateDoc, increment, onSnapshot, setDoc, getDoc, arrayRemove, arrayUnion } from "firebase/firestore"
import { db } from "../../utils/firebase"
import CommentModal from "./Comment"
import { Badge } from "../ui/badge"
import { useAuth } from "../../contexts/AuthContext"
import toast from "react-hot-toast"

export function ReelCard({ reel, isActive, currentUser }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(reel.likes || 0)
  const [playing, setPlaying] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { user } = useAuth()
  const videoRef = useRef(null)
  const { ref, inView } = useInView({ threshold: 0.7 })
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "reels", reel.id), (snap) => {
      if (snap.exists()) setLikes(snap.data().likes || 0)
    })
    return () => unsub()
  }, [reel.id])

  useEffect(() => {
    if (reel?.liked_by && user?.uid) {
      setLiked(reel.liked_by.includes(user.uid))
    } else {
      setLiked(false)
    }
  }, [likes?.likes, user])


  useEffect(() => {
    if (videoRef.current) {
      if (inView && isActive) {
        videoRef.current.play().catch(() => { })
        setPlaying(true)
      } else {
        videoRef.current.pause()
        setPlaying(false)
      }
    }
  }, [inView, isActive])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
    } else {
      videoRef.current.play().catch(() => { })
      setPlaying(true)
    }
  }

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like posts")
      return
    }

    const postRef = doc(db, "reels", reel.id)

    try {
      const postSnap = await getDoc(postRef)
      const postData = postSnap.data()

      const alreadyLiked = postData.liked_by?.includes(user.uid)
      const newLikesCount = alreadyLiked ? (postData.likes_count || 1) - 1 : (postData.likes_count || 0) + 1

      // Optimistically update local UI
      setLiked(!alreadyLiked)
      setLikes(newLikesCount)

      // Push update to Firestore
      await updateDoc(postRef, {
        liked_by: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likes_count: newLikesCount,
      })
    } catch (error) {
      console.error("Error toggling like:", error)
      toast.error("Failed to update like")
    }
  }

  return (
    <div ref={ref} className="relative h-full w-full snap-center flex items-center justify-center">
      {/* Video */}
      <div className="relative h-[100dvh] w-full">
        <video
          ref={videoRef}
          src={reel.videoUrl}
          className="h-[90dvh] w-full object-contain"
          loop
          playsInline
          onClick={togglePlay}
        />

        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <Play onClick={togglePlay} className="h-16 w-16 text-white opacity-80 cursor-pointer" />
          </div>
        )}
      </div>

      {/* Reel info */}
      <div className="absolute bottom-10 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent text-white">
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-medium">{reel.user.name}</span>
        </div>
        <p className="text-sm mb-2">{reel.caption}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {reel.tags &&
            reel.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-emerald-100 text-emerald-800">
                {tag}
              </Badge>
            ))}
        </div>
      </div>

      {/* Interaction buttons */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4">
        <Avatar className="h-8 w-8 border border-white">
          <AvatarImage src={reel.user.avatar || "/placeholder.svg"} alt={reel.user.name} />
          <AvatarFallback>{reel.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          </Button>
          <span className="text-xs text-white mt-1">{likes}</span>
        </div>

        <div className="flex flex-col items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            onClick={() => setShowModal(true)}
          >
            <MessageCircle className="h-5 w-5" />
          </Button>
          <span className="text-xs text-white mt-1">{reel.comments || 0}</span>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Comment Modal */}
      <CommentModal
        open={showModal}
        setOpen={setShowModal}
        reelId={reel.id}
        currentUser={currentUser}
      />
    </div>
  )
}
