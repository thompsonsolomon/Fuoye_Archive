"use client"

import { Link } from "react-router-dom"
import { Heart, MessageCircle, Calendar } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useEffect, useState } from "react"
import { useAuth } from "../../contexts/AuthContext"
import toast from "react-hot-toast"
import { truncateText } from "../../utils/helpers"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
  arrayRemove,
  arrayUnion,
} from "firebase/firestore"
import { db } from "../../utils/firebase"

export function BlogCard({ post }) {
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(post.likes || 0)
  const { user } = useAuth()

  if (!post) return null

  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like posts")
      return
    }

    const postRef = doc(db, "blog_posts", post.id)

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

  useEffect(() => {
    if (post?.liked_by && user?.uid) {
      setLiked(post.liked_by.includes(user.uid))
    } else {
      setLiked(false)
    }
  }, [post?.liked_by, user])
    return (
    <article className="fuoye-card p-6 hover:shadow-lg transition-all">
      <div className="flex flex-col gap-6">
        <div className="">
          <Link to={`/blog/${post.id}`}>
            <img
              src={post.thumbnail || post.thumbnail_url || "/placeholder.svg?height=200&width=300"}
              alt={post.title || "Blog post"}
              className="w-full h-48 object-cover rounded-lg hover:scale-105 transition-transform"
            />
          </Link>
        </div>

        <div className=" space-y-4">
          <div>
            <Link to={`/blog/${post.id}`}>
              <h2 className="text-xl font-bold text-gray-900 hover:text-emerald-800 transition-colors mb-2">
                {post.title || "Untitled Post"}
              </h2>
            </Link>
            <p className="text-gray-600 line-clamp-3">{post.excerpt || "No excerpt available"}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {post.tags &&
              post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-emerald-100 text-emerald-800">
                  {tag}
                </Badge>
              ))}
          </div>
          <div className="flex flex-col items-start justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={post.authorAvatar || "/placeholder.svg?height=32&width=32"}
                alt={post.author || "Author"}
                className="w-8 h-8 rounded-full"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-900">{post.author && truncateText(post.author, 20) || "Anonymous"}</p>
                <div className="flex items-center text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {post.createdAt?.toDate
                    ? post.createdAt.toDate().toLocaleDateString()
                    : post.created_at?.toDate
                      ? post.created_at.toDate().toLocaleDateString()
                      : "Unknown date"}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className={`text-gray-500 hover:text-red-500 ${liked ? "text-red-500" : ""}`}
                onClick={handleLike}
              >
                <Heart className={`h-4 w-4 mr-1 ${liked ? "fill-current" : ""}`} />
                {likes}
              </Button>
              <Link to={`/blog/${post.id}`}>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-emerald-600">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  {post.comments || 0}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
