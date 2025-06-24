import { ProductForm } from "../components/marketplace/ProductForm"

export default function PostProductPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">List New Product</h1>
        <p className="text-gray-600">Sell your items to fellow FUOYE students</p>
      </div>

      <ProductForm />
    </div>
  )
}
