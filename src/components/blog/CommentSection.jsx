import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"
import { MessageCircle, Reply } from "lucide-react"
import { useOffline } from "../../contexts/OfflineContext"
import { useAuth } from "../../contexts/AuthContext"
import { db } from "../../utils/firebase" // your Firebase config file
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  addDoc,
  doc,
  serverTimestamp,
  getDoc,
} from "firebase/firestore"
import toast from "react-hot-toast"

export function CommentSection({ postId }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const { isOnline } = useOffline()
  const { user, profile } = useAuth()

  useEffect(() => {
    if (postId) {
      fetchComments()
    }
  }, [postId])

  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(db, "users", uid)
      const userSnap = await getDoc(userRef)
      const userdata = userSnap.data()
      if (userSnap.exists()) {
        return userdata
      }
    } catch (error) {
      console.error("Error fetching user profile", error)
    }
    return { fullName: "Anonymous", profileImage: "/placeholder.svg?height=40&width=40" }
  }

  const fetchComments = async () => {
    try {
      const q = query(
        collection(db, "comments"),
        where("postId", "==", postId),
        where("parentId", "==", null),
        orderBy("createdAt", "desc")
      )
      const querySnapshot = await getDocs(q)

      const commentPromises = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data()
        const author = await fetchUserProfile(data.authorId)

        const repliesQ = query(
          collection(db, "comments"),
          where("parentId", "==", docSnap.id),
          orderBy("createdAt", "asc")
        )
        const repliesSnapshot = await getDocs(repliesQ)
        const replies = await Promise.all(
          repliesSnapshot.docs.map(async (replyDoc) => {
            const replyData = replyDoc.data()
            const replyAuthor = await fetchUserProfile(replyData.authorId)
            return {
              id: replyDoc.id,
              author: replyAuthor.fullName,
              avatar: replyAuthor.profileImage || "/placeholder.svg?height=32&width=32",
              content: replyData.content,
              createdAt: replyData.createdAt?.toDate(),
            }
          })
        )

        return {
          id: docSnap.id,
          author: author.fullName,
          avatar: author.profileImage || "/placeholder.svg?height=40&width=40",
          content: data.content,
          createdAt: data.createdAt?.toDate(),
          replies,
        }
      })

      const resolvedComments = await Promise.all(commentPromises)
      setComments(resolvedComments)
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return
    setSubmitting(true)
    try {
      const commentRef = await addDoc(collection(db, "comments"), {
        postId,
        authorId: user.uid,
        content: newComment.trim(),
        parentId: null,
        createdAt: serverTimestamp(),
      })

      const author = await fetchUserProfile(user.uid)

      const newCommentData = {
        id: commentRef.id,
        author: author.fullName,
        avatar: author.profileImage || "/placeholder.svg?height=40&width=40",
        content: newComment.trim(),
        createdAt: new Date(),
        replies: [],
      }

      setComments((prev) => [newCommentData, ...prev])
      setNewComment("")
      toast.success("Comment posted successfully!")
    } catch (error) {
      console.error("Error posting comment:", error)
      toast.error("Failed to post comment")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReply = async (commentId) => {
    if (!replyText.trim() || !user) return
    setSubmitting(true)
    try {
      const replyRef = await addDoc(collection(db, "comments"), {
        postId,
        parentId: commentId,
        authorId: user.uid,
        content: replyText.trim(),
        createdAt: serverTimestamp(),
      })

      const author = await fetchUserProfile(user.uid)

      const newReply = {
        id: replyRef.id,
        author: author.fullName,
        avatar: author.profileImage || "/placeholder.svg?height=32&width=32",
        content: replyText.trim(),
        createdAt: new Date(),
      }

      setComments((prev) =>
        prev.map((comment) =>
          comment.id === commentId ? { ...comment, replies: [...comment.replies, newReply] } : comment
        )
      )

      setReplyText("")
      setReplyingTo(null)
      toast.success("Reply posted successfully!")
    } catch (error) {
      console.error("Error posting reply:", error)
      toast.error("Failed to post reply")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="fuoye-card p-6 mb-8">Loading comments...</div>
  }

  return (
    <div className="fuoye-card p-6 mb-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
        <MessageCircle className="h-5 w-5 mr-2" />
        Comments ({comments.length})
      </h3>

      {/* Comment Form */}
      <div className="mb-8">
        {!isOnline && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-yellow-800 text-sm">
            You need an internet connection to post comments.
          </div>
        )}
        {!user && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-blue-800 text-sm">
            Please sign in to post comments.
          </div>
        )}
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          className="mb-3"
          disabled={!isOnline || !user}
        />
        <Button
          onClick={handleSubmitComment}
          className="fuoye-button"
          disabled={!isOnline || !user || submitting || !newComment.trim()}
        >
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <div className="flex space-x-3">
              <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-full" />
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{comment.author}</span>
                    <span className="text-sm text-gray-500">
                      {comment.createdAt?.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(comment.id)}
                  className="mt-2 text-gray-600 hover:text-emerald-600"
                  disabled={!isOnline || !user}
                >
                  <Reply className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>

            {/* Replies */}
            {comment.replies &&
              comment.replies.map((reply) => (
                <div key={reply.id} className="ml-12 flex space-x-3">
                  <img src={reply.avatar} alt={reply.author} className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900 text-sm">{reply.author}</span>
                        <span className="text-xs text-gray-500">
                          {reply.createdAt?.toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{reply.content}</p>
                    </div>
                  </div>
                </div>
              ))}

            {/* Reply Form */}
            {replyingTo === comment.id && (
              <div className="ml-12">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={2}
                  className="mb-2"
                />
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    onClick={() => handleSubmitReply(comment.id)}
                    className="fuoye-button"
                    disabled={submitting || !replyText.trim()}
                  >
                    {submitting ? "Posting..." : "Reply"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {comments.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  )
}
