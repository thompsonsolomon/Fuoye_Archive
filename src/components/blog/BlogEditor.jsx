
import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Badge } from "../ui/badge"
import { X, Save, Send, ImageIcon } from "lucide-react"
import { useOffline } from "../../contexts/OfflineContext"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { db } from "../../utils/firebase"
import { uploadToCloudinary } from "../../lib/utils"

const availableTags = [
  "Academic",
  "Campus Life",
  "Technology",
  "Sports",
  "Events",
  "Study Tips",
  "News",
  "Entertainment",
]

export function BlogEditor() {
  const [title, setTitle] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [selectedTags, setSelectedTags] = useState([])
  const [thumbnail, setThumbnail] = useState(null)
  const [thumbnailPreview, setThumbnailPreview] = useState("")
  const [saving, setSaving] = useState(false)

  const { isOnline } = useOffline()
  const { user } = useAuth()
  const navigate = useNavigate()

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.type.startsWith("image/")) {
      setThumbnail(file)
      setThumbnailPreview(URL.createObjectURL(file))
    } else {
      toast.error("Please select an image file")
    }
  }

  const handleSave = async (asDraft) => {
    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required")
      return
    }

    if (!excerpt.trim()) {
      toast.error("Please add an excerpt")
      return
    }

    if (!user) {
      toast.error("Please sign in to create posts")
      return
    }

    setSaving(true)

    try {
      let thumbnailUrl = null
      if (thumbnail && isOnline) {
        toast.success("Uploading thumbnail...")
        const uploadResult = await uploadToCloudinary(thumbnail)
        thumbnailUrl = uploadResult
      }

      const postData = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        content: content.trim(),
        tags: selectedTags,
        thumbnail_url: thumbnailUrl,
        author_id: user.uid,
        status: asDraft ? "draft" : "pending",
        created_at: serverTimestamp(),
      }

      if (!isOnline) {
        const drafts = JSON.parse(localStorage.getItem("fuoye-blog-drafts") || "[]")
        drafts.push({ ...postData, id: Date.now().toString() })
        localStorage.setItem("fuoye-blog-drafts", JSON.stringify(drafts))
        toast.success("Post saved locally. Will upload when you're back online.")
      } else {
        await addDoc(collection(db, "blog_posts"), postData)
        toast.success(asDraft ? "Post saved as draft!" : "Post submitted!")
        navigate("/blog")
      }

      setTitle("")
      setExcerpt("")
      setContent("")
      setSelectedTags([])
      setThumbnail(null)
      setThumbnailPreview("")
    } catch (err) {
      console.error(err)
      toast.error("Something went wrong while saving post")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fuoye-card p-6">
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            You're offline. This post will be saved locally and uploaded when you're back online.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title..." />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
          <Textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short excerpt for blog feed"
            rows={3}
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post here..."
            rows={12}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className={`cursor-pointer ${selectedTags.includes(tag) ? "bg-emerald-800 text-white" : "hover:bg-emerald-100"
                  }`}
                onClick={() => toggleTag(tag)}
              >
                {tag}
                {selectedTags.includes(tag) && <X className="h-3 w-3 ml-1" />}
              </Badge>
            ))}
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
          {thumbnailPreview ? (
            <div className="relative">
              <img
                src={thumbnailPreview}
                alt="Thumbnail"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => {
                  setThumbnail(null)
                  setThumbnailPreview("")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                id="thumbnail-upload"
              />
              <label htmlFor="thumbnail-upload" className="cursor-pointer">
                <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to upload image</p>
                <p className="text-sm text-gray-500 mt-1">JPG or PNG up to 5MB</p>
              </label>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
          <Button onClick={() => handleSave(true)} variant="outline" className="flex-1" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save as Draft"}
          </Button>
          <Button onClick={() => handleSave(false)} className="flex-1 fuoye-button" disabled={saving}>
            <Send className="h-4 w-4 mr-2" />
            {saving ? "Submitting..." : "Submit for Approval"}
          </Button>
        </div>
      </div>
    </div>
  )
}
