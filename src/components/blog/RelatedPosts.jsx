"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Badge } from "../ui/badge"

export function RelatedPosts({ currentPostId }) {
  const [relatedPosts, setRelatedPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentPostId) {
      fetchRelatedPosts()
    }
  }, [currentPostId])

  const fetchRelatedPosts = async () => {
    try {
      if (error) throw error

      const formattedPosts = data.map((post) => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        thumbnail: post.thumbnail_url || "/placeholder.svg?height=150&width=200",
        tags: post.tags || [],
      }))

      setRelatedPosts(formattedPosts)
    } catch (error) {
      console.error("Error fetching related posts:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fuoye-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="fuoye-card p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Related Posts</h3>

      <div className="grid md:grid-cols-2 gap-6">
        {relatedPosts.map((post) => (
          <Link key={post.id} to={`/blog/${post.id}`} className="group">
            <div className="space-y-3">
              <img
                src={post.thumbnail || "/placeholder.svg?height=150&width=200"}
                alt={post.title}
                className="w-full h-32 object-cover rounded-lg group-hover:scale-105 transition-transform"
              />
              <div>
                <h4 className="font-medium text-gray-900 group-hover:text-emerald-800 transition-colors mb-2">
                  {post.title}
                </h4>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{post.excerpt}</p>
                <div className="flex flex-wrap gap-1">
                  {post.tags &&
                    post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
                        {tag}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
