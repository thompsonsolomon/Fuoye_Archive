"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { MessageCircle, Calendar, MapPin } from "lucide-react"
import { useOffline } from "../../contexts/OfflineContext"
import { toast } from "react-hot-toast"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../../utils/firebase" // adjust path as needed

export function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { isOnline } = useOffline()

  useEffect(() => {
    if (id) {
      fetchProduct()
    }
  }, [id])

  const fetchProduct = async () => {
    try {
      const productRef = doc(db, "marketplace_items", id)
      const productSnap = await getDoc(productRef)

      if (!productSnap.exists()) {
        throw new Error("Product not found")
      }

      const productData = productSnap.data()

      if (productData.status !== "active") {
        throw new Error("Product is not active")
      }

      let sellerData = {
        name: "Anonymous",
        avatar: "/placeholder.svg?height=50&width=50",
        whatsapp: "",
        location: "FUOYE Campus",
      }

      if (productData.seller_id) {
        const sellerRef = doc(db, "users", productData.seller_id)
        const sellerSnap = await getDoc(sellerRef)

        if (sellerSnap.exists()) {
          const seller = sellerSnap.data()
          sellerData = {
            name: seller.fullName || "Anonymous",
            avatar: seller.profileImage || "/placeholder.svg?height=50&width=50",
            whatsapp: seller.whatsapp_number || "",
            location: "FUOYE Campus",
          }
        }
      }
      setProduct({
        id: productSnap.id,
        name: productData.title,
        description: productData.description,
        price: productData.price,
        images: productData.images || ["/placeholder.svg?height=400&width=400"],
        seller: sellerData,
        category: productData.category,
        condition: productData.condition || "Used - Good",
        createdAt: productData.created_at,
        whatsapp: productData.whatsapp,
      })
    } catch (error) {
      console.error("Error fetching product:", error)
      toast.error("Failed to load product")
    } finally {
      setLoading(false)
    }
  }

  const handleWhatsAppContact = () => {
    if (!isOnline) {
      toast.error("You need an internet connection to contact the seller.")
      return
    }

    if (!product.whatsapp) {
      toast.error("Seller's WhatsApp number is not available.")
      return
    }

    const message = `Hi! I'm interested in your ${product.name} listed on FUOYE Archive.`
    const whatsappUrl = `https://wa.me/${product.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Product not found</h3>
        <p className="text-gray-600">The product you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-8 mb-12">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="aspect-square">
          <img
            src={product.images[currentImageIndex] || "/placeholder.svg?height=400&width=400"}
            alt={product.name}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        {product.images.length > 1 && (
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image || "/placeholder.svg?height=120&width=120"}
                alt={`${product.name} ${index + 1}`}
                className={`w-full h-24 object-cover rounded-lg cursor-pointer transition-opacity ${
                  index === currentImageIndex ? "ring-2 ring-emerald-800" : "hover:opacity-80"
                }`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 mb-3">
            {product.category}
          </Badge>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <div className="text-3xl font-bold text-emerald-800 mb-4">₦{product.price.toLocaleString()}</div>
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(product.createdAt).toLocaleDateString()}
            </div>
            <Badge variant="outline">{product.condition}</Badge>
          </div>
        </div>

        {/* Seller Info */}
        <div className="fuoye-card p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Seller Information</h3>
          <div className="flex items-center space-x-3 mb-4">
            <img
              src={product.seller.avatar}
              alt={product.seller.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-gray-900">{product.seller.name}</p>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                {product.seller.location}
              </div>
            </div>
          </div>

          {!isOnline && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-yellow-800 text-sm">You need an internet connection to contact the seller.</p>
            </div>
          )}

          <Button
            onClick={handleWhatsAppContact}
            className="w-full fuoye-button"
            size="lg"
            disabled={!isOnline || !product.whatsapp}
          >
            <MessageCircle className="h-5 w-5 mr-2" />
            {!isOnline
              ? "Offline - Can't Contact"
              : !product.whatsapp
                ? "No Contact Info"
                : "Contact Seller on WhatsApp"}
          </Button>
        </div>

        {/* Product Description */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Description</h3>
          <div className="text-gray-700 whitespace-pre-line">{product.description}</div>
        </div>
      </div>
    </div>
  )
}
