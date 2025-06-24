"use client"

import { Link } from "react-router-dom"
import { MessageCircle, Calendar } from "lucide-react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { useOffline } from "../../contexts/OfflineContext"

export function ProductCard({ product }) {
  const { isOnline } = useOffline()

  if (!product) return null

  const handleWhatsAppContact = () => {
    if (!isOnline) {
      alert("You need an internet connection to contact the seller.")
      return
    }

    if (!product.whatsapp) {
      alert("Seller's WhatsApp number is not available.")
      return
    }

    const message = `Hi! I'm interested in your ${product.name} listed on FUOYE Archive.`
    const whatsappUrl = `https://wa.me/${product.whatsapp?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <div className="fuoye-card overflow-hidden hover:shadow-lg transition-all">
      <Link to={`/marketplace/${product.id}`}>
        <img
          src={product.image || "/placeholder.svg?height=200&width=200"}
          alt={product.name || "Product"}
          className="w-full h-48 object-cover hover:scale-105 transition-transform"
        />
      </Link>

      <div className="p-4 space-y-3">
        <div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 mb-2">
            {product.category || "Uncategorized"}
          </Badge>
          <Link to={`/marketplace/${product.id}`}>
            <h3 className="font-semibold text-gray-900 hover:text-emerald-800 transition-colors">
              {product.name || "Unnamed Product"}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description || "No description available"}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-emerald-800">
            ₦{product.price ? product.price.toLocaleString() : "0"}
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : "Unknown date"}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-600">Seller: {product.seller || "Unknown"}</p>
          <Button
            onClick={handleWhatsAppContact}
            className="w-full fuoye-button"
            size="sm"
            disabled={!isOnline || !product.whatsapp}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {!isOnline ? "Offline - Can't Contact" : !product.whatsapp ? "No Contact Info" : "Contact on WhatsApp"}
          </Button>
        </div>
      </div>
    </div>
  )
}
