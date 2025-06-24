import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Upload, DollarSign, MessageCircle, X } from "lucide-react"
import { useOffline } from "../../contexts/OfflineContext"
import { useAuth } from "../../contexts/AuthContext"
import { db } from "../../utils/firebase"
import { addDoc, collection, updateDoc, doc } from "firebase/firestore"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const categories = ["Books", "Electronics", "Clothing", "Furniture", "Sports", "Others"]
const conditions = ["New", "Like New", "Good", "Fair", "Poor"]

export function ProductForm() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    condition: "",
    whatsapp: "",
  })
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const { isOnline } = useOffline()
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (images.length + files.length > 5) {
      toast.error("You can upload maximum 5 images")
      return
    }

    const validFiles = files.filter((file) => file.type.startsWith("image/"))
    if (validFiles.length !== files.length) {
      toast.error("Please select only image files")
      return
    }

    setImages((prev) => [...prev, ...validFiles])
    validFiles.forEach((file) => {
      const url = URL.createObjectURL(file)
      setImagePreviews((prev) => [...prev, url])
    })
  }

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }
  const uploadImagesToCloudinary = async () => {
    const uploadedUrls = []

    for (const image of images) {
      const formData = new FormData()
      formData.append("file", image)
      formData.append("upload_preset", "Fuoye-archive") // 🔁 Replace with your Cloudinary upload preset
      formData.append("folder", "marketplace") // Optional: organize images in a folder

      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dhg6j65ok/image/upload", {
          method: "POST",
          body: formData,
        })
        const data = await res.json()
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url)
        } else {
          throw new Error("Image upload failed")
        }
      } catch (err) {
        console.error("Cloudinary Upload Error:", err)
        toast.error("Failed to upload images")
        throw err
      }
    }

    return uploadedUrls
  }


  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.whatsapp.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    if (!user) {
      toast.error("Please sign in to list products")
      return
    }

    setSubmitting(true)

    try {
      let imageUrls = []

      if (images.length > 0 && isOnline) {
        imageUrls = await uploadImagesToCloudinary()
      }

      const productData = {
        title: formData.name.trim(),
        description: formData.description.trim(),
        price: Number.parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        images: imageUrls,
        // ================= Send only seller id ============= 
        seller_id: user.uid,
        seller_name: profile.fullName || "Unknown",
        seller_email: user.email || "",
        whatsapp: formData.whatsapp.trim(), // Only stored in product
        status: "active",
        created_at: new Date().toISOString(),
      }

      if (!isOnline) {
        const drafts = JSON.parse(localStorage.getItem("fuoye-marketplace-drafts") || "[]")
        drafts.push({ ...productData, id: Date.now().toString() })
        localStorage.setItem("fuoye-marketplace-drafts", JSON.stringify(drafts))
        toast.success("Saved locally. Will upload when you're online.")
      } else {
        await addDoc(collection(db, "marketplace_items"), productData)
        toast.success("Product listed successfully!")

        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          category: "",
          condition: "",
          whatsapp: "",
        })
        setImages([])
        setImagePreviews([])

        navigate("/marketplace")
      }
    } catch (error) {
      console.error("Error listing product:", error)
      toast.error("Failed to list product. Try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="fuoye-card p-6">
      {!isOnline && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            You're offline. Your product will be saved locally and uploaded when you reconnect.
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter product name..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <Textarea
            value={formData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            placeholder="Describe your product..."
            rows={4}
            required
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="0"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
            <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-50">
                {categories.map((category) => (
                  <SelectItem key={category} value={category.toLowerCase()}
                    className="hover:bg-slate-200 cursor-pointer">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Condition *</label>
          <Select value={formData.condition} onValueChange={(value) => handleInputChange("condition", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent className="bg-slate-50">
              {conditions.map((condition) => (
                <SelectItem key={condition} value={condition.toLowerCase()} className="hover:bg-slate-200 cursor-pointer">
                  {condition}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number *</label>
          <div className="relative">
            <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => handleInputChange("whatsapp", e.target.value)}
              placeholder="+234XXXXXXXXXX"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Max 5)</label>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <img
                    src={preview || "/placeholder.svg"}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {images.length < 5 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Click to upload product images</p>
                <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 5MB each (Max 5 images)</p>
              </label>
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-200">
          <Button type="submit" className="w-full fuoye-button" size="lg" disabled={submitting}>
            {submitting ? "Listing Product..." : "List Product"}
          </Button>
        </div>
      </div>
    </form>
  )
}
