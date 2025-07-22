import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, BookOpen } from "lucide-react"
import { addBook, uploadToCloudinary, uploadToUploadcare } from "../../lib/utils"
import { Textarea } from "../ui/textarea"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useAuth } from "../../contexts/AuthContext"

export default function AddBooks() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  })
  const [thumbnailFile, setThumbnailFile] = useState(null)
  const [bookFile, setBookFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState("")
  const { user } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!thumbnailFile || !bookFile) {
      setUploadStatus("Please select both thumbnail and book file")
      return
    }

    setIsUploading(true)
    setUploadStatus("Uploading files...")

    try {
      // Upload thumbnail to Cloudinary
      const thumbnailUrl = await uploadToCloudinary(thumbnailFile)
      setUploadStatus("Thumbnail uploaded, uploading book file...")

      // Upload book file to Cloudinary
      const fileUrl = await uploadToUploadcare(bookFile, "raw")
      setUploadStatus("Files uploaded, saving to database...")

      // Save book data to Firebase
      await addBook({
        title: formData.title,
        description: formData.description,
        thumbnailUrl,
        fileUrl,
        userId: user?.uid
      })

      setUploadStatus("Book uploaded successfully!")  

      // Reset form
      setFormData({ title: "", description: "" })
      setThumbnailFile(null)
      setBookFile(null)

      // Clear file inputs
      const fileInputs = document.querySelectorAll('input[type="file"]')
      fileInputs.forEach((input) => (input.value = ""))
    } catch (error) {
      console.error("Upload error:", error)
      setUploadStatus("Upload failed. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <BookOpen className="mx-auto h-12 w-12 text-emerald-800 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Upload new books to the library</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload New Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="title">Book Title</label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div>
                <label htmlFor="description">Description</label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter book description"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="thumbnail">Thumbnail Image</label>
                <Input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <div>
                <label htmlFor="bookFile">Book File (PDF)</label>
                <Input
                  id="bookFile"
                  type="file"
                  accept=".pdf,.epub,.mobi"
                  onChange={(e) => setBookFile(e.target.files?.[0] || null)}
                  required
                />
              </div>

              <Button type="submit" disabled={isUploading} className="w-full bg-emerald-800 text-white hover:bg-emerald-700 transition-colors">
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Book
                  </>
                )}
              </Button>

              {uploadStatus && (
                <div
                  className={`text-center p-3 rounded ${uploadStatus.includes("successfully")
                      ? "bg-green-100 text-green-700"
                      : uploadStatus.includes("failed")
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                >
                  {uploadStatus}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
