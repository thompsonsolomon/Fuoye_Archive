import { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore"
import { db } from "../../utils/firebase"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Check, X, Eye, Video } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../ui/tabs"
import { Dialog } from "@headlessui/react"
import { BlogCard } from "../blog/BlogCard"
import { getUserProfile } from "../../lib/api"

export function PostApproval() {
  const [pendingBlogs, setPendingBlogs] = useState([])
  const [pendingReels, setPendingReels] = useState([])
  const [modalPost, setModalPost] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPendingBlogs = async () => {
      try {
        const blogSnap = await getDocs(query(collection(db, "blog_posts"), where("status", "==", "pending")))

        const blogs = await Promise.all(
          blogSnap.docs.map(async (docSnap) => {
            const data = docSnap.data()
            const authorSnap = await getDoc(doc(db, "profiles", data.author_id))
            const authorName = authorSnap.exists() ? authorSnap.data().fullName : "Unknown"
            const authorAvatar = authorSnap.exists() ? authorSnap.data().profileImage : "/placeholder.svg?height=40&width=40"

            return {
              id: docSnap.id,
              title: data.title,
              excerpt: data.excerpt,
              content: data.content,
              author: authorName,
              authorAvatar,
              thumbnail: data.thumbnail_url || "/placeholder.svg?height=200&width=300",
              likes: data.likes_count || 0,
              comments: data.comments_count || 0,
              createdAt: data.created_at,
              tags: data.tags || [],
            }
          })
        )

        setPendingBlogs(blogs)
      } catch (err) {
        console.error("Error fetching blogs:", err)
      }
    }

    const fetchReels = async () => {
      try {
        setLoading(true)
        const snapshot = await getDocs(collection(db, "reels"))
        const baseReels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        const enriched = await Promise.all(
          baseReels.map(async (reel) => {
            const user = await getUserProfile(reel.user?.id || reel.userId)
            return {
              ...reel,
              user: {
                id: user?.uid,
                name: user?.fullName,
                avatar: user?.profileImage || "/placeholder.svg?height=40&width=40",
              },
            }
          })
        )

        setPendingReels(enriched)
      } catch (err) {
        console.error("Failed to fetch reels:", err)
        setError("Failed to load reels.")
      } finally {
        setLoading(false)
      }
    }

    fetchPendingBlogs()
    fetchReels()
  }, [])

  const closeModal = () => setModalPost(null)

  const handleApprove = async (postId) => {
    await updateDoc(doc(db, "blog_posts", postId), { status: "approved" })
    setPendingBlogs(b => b.filter(p => p.id !== postId))
    closeModal()
  }

  const handleDecline = async (postId) => {
    await updateDoc(doc(db, "blog_posts", postId), { status: "rejected" })
    setPendingBlogs(b => b.filter(p => p.id !== postId))
    closeModal()
  }

  return (
    <div className="fuoye-card p-6">
      <h2 className="text-xl font-semibold mb-4">Content Approval</h2>

      <Tabs defaultValue="blogs">
        <TabsList className="mb-4">
          <TabsTrigger value="blogs">Blog Posts ({pendingBlogs.length})</TabsTrigger>
          <TabsTrigger value="reels">Reels ({pendingReels.length})</TabsTrigger>
        </TabsList>

        {/* Blogs */}
        <TabsContent value="blogs">
          {pendingBlogs.length === 0 && <p className="text-gray-600">No pending blogs.</p>}
          <div className="space-y-4">
            {pendingBlogs.map(post => (
              <div key={post.id} className="p-4 border rounded-lg flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{post.title}</h3>
                  <p className="text-sm text-gray-600">by {post.author}</p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setModalPost(post)}>
                    <Eye className="h-4 w-4 mr-1" /> Preview
                  </Button>
                  <Button size="sm" className="fuoye-button" onClick={() => handleApprove(post.id)}>
                    <Check className="h-4 w-4 mr-1" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDecline(post.id)}>
                    <X className="h-4 w-4 mr-1" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Reels */}
        <TabsContent value="reels">
          {pendingReels.length === 0 && <p className="text-gray-600">No pending reels.</p>}
          <div className="space-y-4">
            {pendingReels.map(reel => (
              <div key={reel.id} className="p-4 border rounded-lg flex items-center">
                <Video className="h-5 w-5 mr-3 text-emerald-800" />
                <div className="w-full">
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span>Caption:</span>
                        <p className="font-medium text-gray-900">{reel.caption || "Untitled Reel"}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>By:</span> <p>{reel.user.name}</p>
                      </div>
                    </div>
                    <div>
                      <img src={reel?.user?.avatar} className="w-[50px] h-[50px] rounded-full" alt="" />
                    </div>
                  </div>
                  <div className="flex w-full justify-between mt-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {reel.tags &&
                        reel.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-emerald-100 text-emerald-800">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {reel.createdAt?.toDate
                        ? reel.createdAt.toDate().toLocaleDateString()
                        : reel.created_at?.toDate
                          ? reel.created_at.toDate().toLocaleDateString()
                          : "Unknown date"}
                    </p>
                  </div>
                </div>

              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Blog Preview Modal */}
      {modalPost && (
        <Dialog open={true} onClose={closeModal} className="fixed inset-0 z-50">
          <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-50">
            <Dialog.Panel className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
              <Dialog.Title className="text-lg font-bold mb-4">{modalPost.title}</Dialog.Title>
              <button onClick={closeModal} className="absolute top-3 right-3 text-gray-500 hover:text-red-600 text-sm font-medium">
                ✕
              </button>
              <BlogCard key={modalPost.id} post={modalPost} />
              <div className="mt-4 flex justify-end space-x-2">
                <Button size="sm" className="fuoye-button" onClick={() => handleApprove(modalPost.id)}>
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDecline(modalPost.id)}>
                  <X className="h-4 w-4 mr-1" /> Decline
                </Button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  )
}
