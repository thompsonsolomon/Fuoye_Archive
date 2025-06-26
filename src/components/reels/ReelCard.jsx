import { useState, useRef, useEffect } from "react"
import { Heart, MessageCircle, Share2, Play, Download } from "lucide-react"
import { Button } from "../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useInView } from "react-intersection-observer"
import {
  doc, updateDoc, getDoc,
  arrayRemove, arrayUnion
} from "firebase/firestore"
import { db } from "../../utils/firebase"
import CommentModal from "./Comment"
import { Badge } from "../ui/badge"
import { useAuth } from "../../contexts/AuthContext"
import toast from "react-hot-toast"

export function ReelCard({ reel, isActive, currentUser }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(reel.likes_count || 0)
  const [playing, setPlaying] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const { user } = useAuth()
  const videoRef = useRef(null)
  const { ref, inView } = useInView({ threshold: 0.7 })

  // Auto-play when in view
  useEffect(() => {
    const video = videoRef.current
  
    if (!video) return
  
    if (inView && isActive) {
      console.log(isActive, inView)
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setPlaying(true))
          .catch((err) => {
            console.warn("Autoplay blocked:", err)
          })
      }
    } else {
      video.pause()
      setPlaying(false)
    }
  }, [inView, isActive])
  
  // Handle user like state
  useEffect(() => {
    if (user && reel?.liked_by) {
      setLiked(reel.liked_by.includes(user.uid))
    }
  }, [reel?.liked_by, user])

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return
    if (playing) {
      videoRef.current.pause()
      setPlaying(false)
    } else {
      videoRef.current.play().catch(() => {})
      setPlaying(true)
    }
  }

  // Handle like logic
  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like reels")
      return
    }

    const postRef = doc(db, "reels", reel.id)

    try {
      const postSnap = await getDoc(postRef)
      const postData = postSnap.data()

      const alreadyLiked = postData.liked_by?.includes(user.uid)
      const newLikesCount = alreadyLiked ? postData.likes_count - 1 : postData.likes_count + 1

      // Optimistic UI update
      setLiked(!alreadyLiked)
      setLikes(newLikesCount)

      await updateDoc(postRef, {
        liked_by: alreadyLiked ? arrayRemove(user.uid) : arrayUnion(user.uid),
        likes_count: newLikesCount,
      })
    } catch (error) {
      console.error("Like error:", error)
      toast.error("Failed to update like")
    }
  }

  // Handle share (copy link or download)
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: reel.caption,
        text: "Check out this reel on FUOYE Archive!",
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(reel.videoUrl)
      toast.success("Video link copied!")
    }
  }

  // Download video
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = reel.videoUrl
    link.download = `fuoye_reel_${reel.id}.mp4`
    link.click()
  }

  return (
    <div ref={ref} className="relative h-[97dvh] w-full snap-center flex items-center justify-center">
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

      {/* Reel Info */}
      <div className="absolute bottom-10 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent text-white">
        <div className="flex items-center space-x-2 mb-2">
          <span className="font-medium">{reel.user.name}</span>
        </div>
        <p className="text-sm mb-2">{reel.caption}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {reel.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-emerald-100 text-emerald-800">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center space-y-4">
        <Avatar className="h-8 w-8 border border-white">
          <AvatarImage src={reel.user.avatar || "/placeholder.svg"} alt={reel.user.name} />
          <AvatarFallback>{reel.user.name?.charAt(0)}</AvatarFallback>
        </Avatar>

        {/* Like */}
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

        {/* Comment */}
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

        {/* Share & Download */}
        <div className="flex flex-col items-center space-y-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            onClick={handleShare}
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70"
            onClick={handleDownload}
          >
            <Download className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Comment Modal */}
      <CommentModal open={showModal} setOpen={setShowModal} reelId={reel.id} currentUser={currentUser} />
    </div>
  )
}
