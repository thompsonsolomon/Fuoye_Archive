import { useState, useEffect } from "react"
import { Download, Calendar } from "lucide-react"
import { StarRating } from "./star-rating"
import { addRating, DownloadButton, getUserRating } from "../../lib/utils"
import { useAuth } from "../../contexts/AuthContext"

export function BookModal({ book, isOpen, onClose, onRatingUpdate }) {
  const [userRating, setUserRating] = useState(null)
  const [isRating, setIsRating] = useState(false)
  const [ratingMessage, setRatingMessage] = useState("")
   const { user } = useAuth()
  const userId = user?.uid
  useEffect(() => {
    if (book && isOpen) {
      loadUserRating()
    }
  }, [book, isOpen])

  const loadUserRating = async () => {
    try {

      const rating = await getUserRating(book.id, userId)
      setUserRating(rating)
    } catch (error) {
      console.error("Error loading user rating:", error)
    }
  }

  const handleRating = async (rating) => {
    if (!book) return
    setIsRating(true)
    setRatingMessage("")
    try {
      await addRating(book.id, userId, rating)
      setUserRating(rating)
      setRatingMessage("Thank you for your rating!")
      onRatingUpdate()
    } catch (error) {
      if (error instanceof Error && error.message.includes("already rated")) {
        setRatingMessage("You have already rated this book.")
      } else {
        setRatingMessage("Failed to submit rating. Please try again.")
      }
    } finally {
      setIsRating(false)
    }
  }

  const handleDownload = () => {
    if (book?.fileUrl) {
      window.open(book.fileUrl, "_blank")
    }
  }

  if (!isOpen || !book) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white w-full max-w-4xl mx-auto rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl font-bold"
        >
          ×
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{book.title}</h2>
          <p className="text-gray-500">Download, read, and rate this book.</p>
        </div>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Book Image */}
          <div className="relative overflow-hidden rounded-lg">
            <img
              src={book.thumbnailUrl || "/placeholder.svg"}
              alt={`Cover of ${book.title}`}
              className="object-contain w-full h-full"
              loading="lazy"
            />
          </div>

          {/* Book Info */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-gray-600 leading-relaxed">{book.description}</p>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              <span>Uploaded {book.uploadedAt.toLocaleDateString()}</span>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Rating</h4>
              <div className="flex items-center space-x-3 mb-2">
                <StarRating rating={book.averageRating} readonly />
                <span className="text-sm text-gray-600">
                  {book.averageRating > 0 ? book.averageRating.toFixed(1) : "No ratings"} ({book.totalRatings}{" "}
                  {book.totalRatings === 1 ? "rating" : "ratings"})
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">
                {userRating ? "Your Rating" : "Rate this Book"}
              </h4>
              {userRating ? (
                <div className="flex items-center space-x-2">
                  <StarRating rating={userRating} readonly />
                  <span className="text-sm text-gray-600">You rated this book</span>
                </div>
              ) : (
                <div>
                  <StarRating rating={0} onRatingChange={handleRating} readonly={isRating} />
                  {isRating && <p className="text-sm text-blue-600 mt-1">Submitting rating...</p>}
                </div>
              )}
              {ratingMessage && (
                <p
                  className={`text-sm mt-2 ${ratingMessage.includes("Thank you") ? "text-green-600" : "text-red-600"
                    }`}
                >
                  {ratingMessage}
                </p>
              )}
            </div>

            <DownloadButton bookData={book} />
          </div>
        </div>
      </div>
    </div>
  )
}

