"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Calendar, Heart, MessageCircle, Share2 } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import toast from "react-hot-toast"
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore"
import { db } from "../../utils/firebase"
import { useAuth } from "../../contexts/AuthContext"

export function BlogPost() {
  const { id } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(0)
  const { user } = useAuth()
  const fetchPost = async () => {
    try {
      const postRef = doc(db, "blog_posts", id)
      const postSnap = await getDoc(postRef)

      if (!postSnap.exists()) throw new Error("Post not found")
        // if (!id || !user?.uid) return

      const data = postSnap.data()

      // Optional: fetch author profile from a separate collection
      const authorRef = doc(db, "users", data.author_id)
      const authorSnap = await getDoc(authorRef)
      const author = authorSnap.exists() ? authorSnap.data() : {}

      const formattedPost = {
        id: postSnap.id,
        title: data.title,
        content: data.content,
        author: author.fullName || "Anonymous",
        authorAvatar: author.profileImage || "/placeholder.svg?height=50&width=50",
        thumbnail: data.thumbnail_url || "/placeholder.svg?height=400&width=800",
        likes: data.likes_count || 0,
        comments: data.comments_count || 0,
        createdAt: data.created_at,
        tags: data.tags || [],
        liked_by: data.liked_by || [],
      }

      setPost(formattedPost)
      setLikes(formattedPost.likes)
      if (!id || !user?.uid) {
        return
      }else{
        setLiked(user?.uid && formattedPost.liked_by.includes(user.uid))
      }
    } catch (error) {
      console.error("Error fetching post:", error)
      toast.error("Failed to load post")
    } finally {
      setLoading(false)
    }
  }


  const handleLike = async () => {
    if (!user) {
      toast.error("Please sign in to like posts")
      return
    }

    const postRef = doc(db, "blog_posts", id)

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
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.title,
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success("Link copied to clipboard!")
    }
  }


   useEffect(() => {
      if (!id) return
      fetchPost()
    }, [id, user])
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Post not found</h3>
        <p className="text-gray-600">The post you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <article className="fuoye-card p-8 mb-8">
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags &&
            post.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-emerald-100 text-emerald-800">
                {tag}
              </Badge>
            ))}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>

        <div className="flex items-center space-x-4 text-gray-600 mb-6">
          <div className="flex items-center space-x-2">
            <img
              src={post.authorAvatar || "/placeholder.svg?height=40&width=40"}
              alt={post.author}
              className="w-10 h-10 rounded-full"
            />
            <span className="font-medium">{post.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>
            {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString() : "Unknown date"}
              </span>

          </div>
        </div>
      </div>

      <img
        src={post.thumbnail || "/placeholder.svg?height=400&width=800"}
        alt={post.title}
        className="w-full h-64 md:h-96 object-cover rounded-lg mb-8"
      />

      <div className="prose prose-lg max-w-none mb-8">
        <div dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, "<br>") }} />
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            className={`text-gray-600 hover:text-red-500 ${liked ? "text-red-500" : ""}`}
            onClick={handleLike}
          >
            <Heart className={`h-5 w-5 mr-2 ${liked ? "fill-current" : ""}`} />
            {likes}
          </Button>
          <Button variant="ghost" className="text-gray-600 hover:text-emerald-600">
            <MessageCircle className="h-5 w-5 mr-2" />
            {post.comments}
          </Button>
        </div>
        <Button variant="ghost" className="text-gray-600 hover:text-emerald-600" onClick={handleShare}>
          <Share2 className="h-5 w-5 mr-2" />
          Share
        </Button>
      </div>
    </article>
  )
}
