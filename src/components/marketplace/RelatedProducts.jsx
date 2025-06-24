"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "./ProductCard"

export function RelatedProducts({ currentProductId }) {
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (currentProductId) {
      fetchRelatedProducts()
    }
  }, [currentProductId])

  const fetchRelatedProducts = async () => {
    try {
    

      if (error) throw error

      const formattedProducts = data.map((product) => ({
        id: product.id,
        name: product.title,
        description: product.description,
        price: product.price,
        image: product.images?.[0] || "/placeholder.svg?height=200&width=200",
        seller: product.profiles?.full_name || "Anonymous",
        whatsapp: product.profiles?.whatsapp_number || "",
        category: product.category,
        createdAt: product.created_at,
      }))

      setRelatedProducts(formattedProducts)
    } catch (error) {
      console.error("Error fetching related products:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fuoye-card p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div className="fuoye-card p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Related Products</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
