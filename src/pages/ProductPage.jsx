"use client"

import { useParams } from "react-router-dom"
import { ProductDetails } from "../components/marketplace/ProductDetails"
import { RelatedProducts } from "../components/marketplace/RelatedProducts"

export default function ProductPage() {
  const { id } = useParams()

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <ProductDetails id={id} />
      {/* <RelatedProducts currentProductId={id} /> */}
    </div>
  )
}
