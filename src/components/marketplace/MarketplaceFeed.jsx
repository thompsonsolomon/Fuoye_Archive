import { useState, useEffect } from "react"
import { ProductCard } from "./ProductCard"
import { Button } from "../ui/button"
import { Loader2, WifiOff } from "lucide-react"
import { useOffline } from "../../contexts/OfflineContext"
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore"
import { db } from "../../utils/firebase"

export function MarketplaceFeed() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(null)
  const [lastVisible, setLastVisible] = useState(null)
  const { isOnline } = useOffline()

  const PRODUCTS_PER_PAGE = 12

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async (isLoadMore = false) => {
    try {
      if (!isLoadMore) {
        setLoading(true)
        setLastVisible(null)
      }
      setError(null)

      if (!isOnline) {
        const cachedProducts = localStorage.getItem("fuoye-marketplace-products")
        if (cachedProducts) {
          setProducts(JSON.parse(cachedProducts))
        }
        return
      }

      const productsRef = collection(db, "marketplace_items")
      let q = query(
        productsRef,
        where("status", "==", "active"),
        orderBy("created_at", "desc"),
        limit(PRODUCTS_PER_PAGE)
      )

      if (isLoadMore && lastVisible) {
        q = query(
          productsRef,
          where("status", "==", "active"),
          orderBy("created_at", "desc"),
          startAfter(lastVisible),
          limit(PRODUCTS_PER_PAGE)
        )
      }

      const snapshot = await getDocs(q)
      const Docs = snapshot.docs

      const fetchedProducts = await Promise.all(
        Docs.map(async (docSnap) => {
          const data = docSnap.data()
          // Fetch author profile
          let author = "Anonymous"
          let authorAvatar = "/placeholder.svg?height=40&width=40"

          if (data.seller_id) {
            const authorRef = doc(db, "users", data.seller_id)
            const authorSnap = await getDoc(authorRef)
            if (authorSnap.exists()) {
              const authorData = authorSnap.data()
              author = authorData.fullName || author
              authorAvatar = authorData.profileImage || authorAvatar
            }
          }

          return {
            id: docSnap.id,
            name: data.title,
            description: data.description,
            price: data.price,
            image: data.images?.[0] || "/placeholder.svg?height=200&width=200",
            images: data.images || [],
            sellerId: data.seller_id,
            seller:  author || "Anonymous",
            whatsapp: data.whatsapp || "",
            category: data.category,
            condition: data.condition,
            createdAt: data.created_at,
          }
        })
      )   
      if (isLoadMore) {
        setProducts((prev) => [...prev, ...fetchedProducts])
      } else {
        setProducts(fetchedProducts)
        localStorage.setItem("fuoye-marketplace-products", JSON.stringify(fetchedProducts))
      }

      setHasMore(fetchedProducts.length === PRODUCTS_PER_PAGE)
      setLastVisible(snapshot.docs[snapshot.docs.length - 1])
    } catch (err) {
      console.error("Error loading products:", err)
      setError("Failed to load products. Please try again.")

      if (!isLoadMore) {
        const cachedProducts = localStorage.getItem("fuoye-marketplace-products")
        if (cachedProducts) {
          setProducts(JSON.parse(cachedProducts))
        }
      }
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    if (!isOnline || !hasMore) return
    setLoadingMore(true)
    loadProducts(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-800 mx-auto mb-4" />
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error && products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <WifiOff className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load products</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => loadProducts()} className="fuoye-button">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!isOnline && products.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            You're viewing cached content. Connect to the internet to see the latest products.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <ProductCard key={`${product.id}-${index}`} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products available yet.</p>
        </div>
      )}

      {hasMore && isOnline && products.length > 0 && (
        <div className="text-center pt-8">
          <Button onClick={loadMore} disabled={loadingMore} variant="outline" size="lg">
            {loadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More Products"
            )}
          </Button>
        </div>
      )}

      {!isOnline && (
        <div className="text-center pt-8">
          <p className="text-gray-500">Connect to the internet to load more products</p>
        </div>
      )}
    </div>
  )
}
