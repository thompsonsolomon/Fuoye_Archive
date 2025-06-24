import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Button } from "../ui/button"
import { BlogCard } from "../blog/BlogCard"
import { Play } from "lucide-react"
import { Link } from "react-router-dom"
import { ProductCard } from "../marketplace/ProductCard"
import { useAuth } from "../../contexts/AuthContext"
import { db } from "../../utils/firebase"

export function ProfileContent() {
  const [activeTab, setActiveTab] = useState("posts")
  const [posts, setPosts] = useState([])
  const [reels, setReels] = useState([])
  const [products, setProducts] = useState([])
  const { user, profile } = useAuth()


  useEffect(() => {
    if (!user || !user.uid) return
  
    const fetchUserData = async () => {
      try {
        const [postsSnap, reelsSnap, productsSnap] = await Promise.all([
          getDocs(query(collection(db, "blog_posts"), where("author_id", "==", user.uid))),
          getDocs(query(collection(db, "reels"), where("userId", "==", user.uid))),
          getDocs(query(collection(db, "marketplace_items"), where("seller_id", "==", user.uid))),
        ])
  
        const fetchedPosts = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const fetchedReels = reelsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        const fetchedProducts = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        const finalPostData = fetchedPosts.map(post => ({
          ...post,
          author: profile.fullName,
          authorAvatar: profile.profileImage || "/placeholder.svg?height=40&width=40",
        }))
        setPosts(finalPostData)
        setReels(fetchedReels)
        setProducts(fetchedProducts)
  
      } catch (error) {
        console.error("Failed to fetch user data:", error)
      }
    }
  
    fetchUserData()
  }, [user?.uid])

  return (
    <div>
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <Button
          variant={activeTab === "posts" ? "default" : "ghost"}
          onClick={() => setActiveTab("posts")}
          className={activeTab === "posts" ? "fuoye-button" : ""}
        >
          My Posts
        </Button>
        <Button
          variant={activeTab === "reels" ? "default" : "ghost"}
          onClick={() => setActiveTab("reels")}
          className={activeTab === "reels" ? "fuoye-button" : ""}
        >
          My Reels
        </Button>
        <Button
          variant={activeTab === "products" ? "default" : "ghost"}
          onClick={() => setActiveTab("products")}
          className={activeTab === "products" ? "fuoye-button" : ""}
        >
          My Products
        </Button>
      </div>

      {activeTab === "posts" && (
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => <BlogCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-8 text-gray-500">No posts yet</div>
          )}
        </div>
      )}

      {activeTab === "reels" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {reels.length > 0 ? (
            reels.map((reel) => (
              <Link to={`/reels?id=${reel.id}`} key={reel.id} className="group">
                <div className="relative aspect-[9/16] rounded-lg overflow-hidden">
                  <video
                    src={reel.videoUrl || "/placeholder.svg"}
                    alt={reel.caption}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="h-10 w-10 text-white" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                    <p className="text-white text-xs line-clamp-1">{reel.caption}</p>
                    <div className="flex items-center justify-between text-xs text-white mt-1">
                      <span>{reel.likes || 0} likes</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">No reels yet</div>
          )}
        </div>
      )}

      {activeTab === "products" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} product={product} />)
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">No products listed yet</div>
          )}
        </div>
      )}
    </div>
  )
}
