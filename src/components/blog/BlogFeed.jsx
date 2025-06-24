import { useState, useEffect } from "react"
import { BlogCard } from "./BlogCard"
import { Button } from "../ui/button"
import { Loader2, WifiOff } from "lucide-react"
import { useOffline } from "../../contexts/OfflineContext"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  startAfter,
  getDoc,
  doc,
} from "firebase/firestore"
import { db } from "../../utils/firebase"

export function BlogFeed() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const [lastDoc, setLastDoc] = useState(null)
  const [offset, setOffset] = useState(0)

  const { isOnline } = useOffline()
  const POSTS_PER_PAGE = 12

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isOnline === undefined || isOnline === null) {
        loadPosts()
      }
    }, 3000)

    if (isOnline !== undefined && isOnline !== null) {
      loadPosts()
      clearTimeout(timeout)
    }

    return () => clearTimeout(timeout)
  }, [isOnline])

  const loadPosts = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true)
        setOffset(null)
      }
  
      setError(null)
  
      if (!isOnline) {
        const cachedPosts = localStorage.getItem("fuoye-blog-posts")
        if (cachedPosts) {
          setPosts(JSON.parse(cachedPosts))
        }
        return
      }
  
      // Base query: only approved posts, ordered by created_at
      let q = query(
        collection(db, "blog_posts"),
        where("status", "==", "approved"),
        orderBy("created_at", "desc"),
        limit(POSTS_PER_PAGE)
      )
  
      // If loading more, start after offset
      if (offset && isLoadMore) {
        q = query(
          collection(db, "blog_posts"),
          where("status", "==", "approved"),
          orderBy("created_at", "desc"),
          startAfter(offset),
          limit(POSTS_PER_PAGE)
        )
      }
  
      const snapshot = await getDocs(q)
      const blogDocs = snapshot.docs
      const formattedPosts = await Promise.all(
        blogDocs.map(async (docSnap) => {
          const post = docSnap.data()
          const postId = docSnap.id
  
          // Fetch author profile
          let author = "Anonymous"
          let authorAvatar = "/placeholder.svg?height=40&width=40"
  
          if (post.author_id) {
            const authorRef = doc(db, "users", post.author_id)
            const authorSnap = await getDoc(authorRef)
            if (authorSnap.exists()) {
              const authorData = authorSnap.data()
              author = authorData.fullName || author
              authorAvatar = authorData.profileImage || authorAvatar
            }
          }
  
          return {
            id: postId,
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            author,
            authorAvatar,
            thumbnail: post.thumbnail_url || "/placeholder.svg?height=200&width=300",
            likes: post.likes_count || 0,
            comments: post.comments_count || 0,
            createdAt: post.created_at,
            tags: post.tags || [],
          }
        })
      )
  
      if (isLoadMore) {
        setPosts((prev) => [...prev, ...formattedPosts])
      } else {
        setPosts(formattedPosts)
        localStorage.setItem("fuoye-blog-posts", JSON.stringify(formattedPosts))
      }
  
      setHasMore(blogDocs.length === POSTS_PER_PAGE)
      setOffset(blogDocs[blogDocs.length - 1])
    } catch (err) {
      console.error("Error loading posts:", err.message)
      setError("Failed to load posts. Please try again.")
      if (!isLoadMore) {
        const cachedPosts = localStorage.getItem("fuoye-blog-posts")
        if (cachedPosts) {
          setPosts(JSON.parse(cachedPosts))
        }
      }
    } finally {
      if (!isLoadMore) setLoading(false)
      setLoadingMore(false)
    }
  }
  

  const loadMore = async () => {
    if (!isOnline || !hasMore) return
    setLoadingMore(true)
    await loadPosts(true)
  }

  if (loading && posts.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-800 mx-auto mb-4" />
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
    )
  }

  if (error && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <WifiOff className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load posts</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => loadPosts()} className="fuoye-button">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!isOnline && posts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            You're viewing cached content. Connect to the internet to see the latest posts.
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 finalS lg:grid-cols-4 xl:grid-cols-4 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No posts available yet.</p>
        </div>
      )}

      {hasMore && isOnline && posts.length > 0 && (
        <div className="text-center pt-8">
          <Button onClick={loadMore} disabled={loadingMore} variant="outline" size="lg">
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Posts"
            )}
          </Button>
        </div>
      )}

      {!isOnline && (
        <div className="text-center pt-8">
          <p className="text-gray-500">Connect to the internet to load more posts</p>
        </div>
      )}
    </div>
  )
}
