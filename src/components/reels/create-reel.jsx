"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X, Video, Send } from "lucide-react"
import toast from "react-hot-toast"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from "../../utils/firebase"
import { uploadToCloudinary } from "../../lib/utils"
import { useOffline } from "../../contexts/OfflineContext"

export function CreateReel() {
  const [caption, setCaption] = useState("")
  const [tags, setTags] = useState([])
  const [tagInput, setTagInput] = useState("")
  const [videoFile, setVideoFile] = useState(null)
  const [videoPreview, setVideoPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const { isOnline } = useOffline()

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith("video/")) {
      toast.error("Only video files are allowed")
      return
    }

    const videoElement = document.createElement("video")
    videoElement.preload = "metadata"
    videoElement.onloadedmetadata = () => {
      const duration = videoElement.duration
      if (duration > 60) {
        toast.error("Video must be 60 seconds or less (TikTok-style)")
        return
      }

      const url = URL.createObjectURL(file)
      setVideoPreview(url)
      setVideoFile(file)
    }

    videoElement.src = URL.createObjectURL(file)
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!videoFile || !videoPreview) {
      toast.error("Please select a video to upload")
      return
    }

    if (!caption.trim()) {
      toast.error("Please add a caption")
      return
    }

    setUploading(true)

    const auth = getAuth()
    const currentUser = auth.currentUser
    const userId = currentUser?.uid || "anonymous"

    try {
      if (!isOnline) {
        const draftReels = JSON.parse(localStorage.getItem("fuoye-reel-drafts") || "[]")
        draftReels.push({
          id: `draft-${Date.now()}`,
          caption,
          tags,
          userId,
          createdAt: new Date().toISOString(),
        })
        localStorage.setItem("fuoye-reel-drafts", JSON.stringify(draftReels))
        toast.success("Saved as draft. Will upload when online.")
      } else {
        const videoUrl = await uploadToCloudinary(videoFile)

        const reelData = {
          caption: caption.trim(),
          tags,
          videoUrl,
          userId,
          createdAt: serverTimestamp(),
        }

        await addDoc(collection(db, "reels"), reelData)
        toast.success("Reel uploaded successfully!")
      }

      // Reset state
      setCaption("")
      setTags([])
      setVideoFile(null)
      setVideoPreview(null)
    } catch (error) {
      console.error("Upload failed:", error)
      toast.error("Upload failed. Try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fuoye-card p-6">
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            You're offline. Your reel will be saved locally and uploaded when you're online.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Video</label>
          {videoPreview ? (
            <div className="relative aspect-[9/16] max-h-80 mx-auto">
              <video src={videoPreview} className="h-full w-full object-contain rounded-lg" controls />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={() => {
                  setVideoFile(null)
                  setVideoPreview(null)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Click to upload a video</p>
              <p className="text-sm text-gray-500 mt-1">MP4, MOV — max 60 seconds</p>
              <input type="file" ref={fileInputRef} accept="video/*" className="hidden" onChange={handleFileChange} />
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption for your reel..."
            rows={3}
            className="w-full"
            required
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex items-center mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Add tags..."
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" onClick={addTag} className="ml-2 fuoye-button">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag) => (
              <Badge key={tag} className="bg-emerald-100 text-emerald-800 flex items-center gap-1">
                #{tag}
                <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button type="submit" className="w-full fuoye-button" size="lg" disabled={uploading || !videoPreview}>
            {uploading ? (
              <>
                <span className="animate-pulse">Uploading...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Post Reel
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
