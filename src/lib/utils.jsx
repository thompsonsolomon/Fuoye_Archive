import { clsx } from "clsx"
import { collection, doc, getDoc, getDocs, query, setDoc, where,   addDoc,  updateDoc, orderBy, Timestamp, serverTimestamp } from "firebase/firestore"
import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { db } from "../utils/firebase"
import { Download } from "lucide-react"
import toast from "react-hot-toast"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatRelativeTime(date) {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInSeconds = Math.floor((now - targetDate) / 1000)

  if (diffInSeconds < 60) return "Just now"
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`

  return formatDate(date)
}

export function generateUniqueFileName(originalName) {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split(".").pop()
  return `${timestamp}_${randomString}.${extension}`
}

export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password) {
  return password.length >= 6
}

export function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function compressImage(file, maxWidth = 800, quality = 0.8) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height)
      canvas.width = img.width * ratio
      canvas.height = img.height * ratio

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(resolve, "image/jpeg", quality)
    }

    img.src = URL.createObjectURL(file)
  })
}


// /utils/uploadToCloudinary.js

export async function uploadToCloudinary(file, type) {
  const cloudName = "dhg6j65ok"      // Replace with your cloud name
  const uploadPreset = "Fuoye-archive" // Replace with your unsigned upload preset

  if (!file) throw new Error("No file provided")

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${type? type : "auto"}/upload`

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    const data = await response.json()
    return data.secure_url // This is the final URL of the uploaded file
  } catch (error) {
    console.error("Cloudinary upload error:", error)
    throw error
  }
}

export async function uploadToUploadcare(file) {
  const publicKey = "11885640b3e12b251886"

  if (!file) throw new Error("No file provided")

  const url = "https://upload.uploadcare.com/base/"
  const formData = new FormData()

  formData.append("UPLOADCARE_PUB_KEY", publicKey)
  formData.append("UPLOADCARE_STORE", "1") // Automatically store the file
  formData.append("file", file)

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Uploadcare upload failed")
    }

    const data = await response.json()
    const fileUUID = data.file
    const cdnUrl = `https://ucarecdn.com/${fileUUID}/`
    return cdnUrl
  } catch (error) {
    console.error("Uploadcare upload error:", error)
    throw error
  }
}




export function usePendingRoleRequests() {
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const q = query(
          collection(db, "role_requests"),
          where("status", "==", "pending")
        )

        const snapshot = await getDocs(q)
        const results = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setPendingRequests(results)
      } catch (err) {
        console.error("Failed to fetch pending role requests:", err)
        setError("Failed to load role requests.")
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [])

  return { pendingRequests, loading, error }
}







// Generate random device ID
const generateDeviceId = () => {
  return 'dev-' + Math.random().toString(36).substr(2, 9)
}

export default function DeviceTracker() {
  useEffect(() => {
    const trackDevice = async () => {
      const localIdKey = "fuoye-device-id"
      let deviceId = localStorage.getItem(localIdKey)

      if (!deviceId) {
        deviceId = generateDeviceId()
        localStorage.setItem(localIdKey, deviceId)
      }

      const deviceRef = doc(db, "device_tracking", deviceId)
      const docSnap = await getDoc(deviceRef)

      if (!docSnap.exists()) {
        await setDoc(deviceRef, {
          deviceId,
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          screen: {
            width: window.screen.width,
            height: window.screen.height,
          },
          firstSeen: serverTimestamp(),
        })
      } else {
      }
    }

    trackDevice()
  }, [])

  return null // runs silently
}





export async function addBook(bookData) {
  const docRef = await addDoc(collection(db, "books"), {
    ...bookData,
    uploadedAt: Timestamp.now(),
    averageRating: 0,
    totalRatings: 0,
  })
  return docRef.id
}

export async function getBooks() {
  const querySnapshot = await getDocs(query(collection(db, "books"), orderBy("uploadedAt", "desc")))

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    uploadedAt: doc.data().uploadedAt.toDate(),
  }))
}

export async function addRating(bookId, userId, rating) {
  // Check if user already rated this book
  const existingRatingQuery = query(
    collection(db, "ratings"),
    where("bookId", "==", bookId),
    where("userId", "==", userId),
  )

  const existingRating = await getDocs(existingRatingQuery)

  if (!existingRating.empty) {
    throw new Error("User has already rated this book")
  }

  // Add the rating
  await addDoc(collection(db, "ratings"), {
    bookId,
    userId,
    rating,
    createdAt: Timestamp.now(),
  })

  // Update book's average rating
  await updateBookRating(bookId)
}

async function updateBookRating(bookId) {
  const ratingsQuery = query(collection(db, "ratings"), where("bookId", "==", bookId))

  const ratingsSnapshot = await getDocs(ratingsQuery)
  const ratings = ratingsSnapshot.docs.map((doc) => doc.data().rating)

  const averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0

  const bookRef = doc(db, "books", bookId)
  await updateDoc(bookRef, {
    averageRating: Math.round(averageRating * 10) / 10,
    totalRatings: ratings.length,
  })
}

export async function getUserRating(bookId, userId) {
  const ratingQuery = query(collection(db, "ratings"), where("bookId", "==", bookId), where("userId", "==", userId))

  const ratingSnapshot = await getDocs(ratingQuery)

  if (ratingSnapshot.empty) {
    return null
  }

  return ratingSnapshot.docs[0].data().rating
}





export  function DownloadButton({ bookData }) {
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleDownload = async () => {
    setDownloading(true)
    setProgress(0)

    try {
      const response = await fetch(bookData?.fileUrl)
      const contentLength = response.headers.get("content-length")

      if (!response.ok) throw new Error("Failed to fetch file")
      if (!contentLength) throw new Error("Content-Length header not found")
      const total = parseInt(contentLength, 10)
      let loaded = 0

      const reader = response.body.getReader()
      const chunks = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        chunks.push(value)
        loaded += value.length
        setProgress(Math.floor((loaded / total) * 100))
      }

      const blob = new Blob(chunks);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `fuoye_archive_books_${bookData.title}.mp4`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success("Download completed!");
    } catch (error) {
      toast.error("Download failed!");
      console.error(error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`w-full bg-green-800 text-white py-2 px-4 rounded flex items-center justify-center hover:bg-green-600 ${
          downloading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <Download className="mr-2 h-4 w-4" />
        {downloading ? "Downloading..." : "Download Book"}
      </button>

      {downloading && (
        <div className="w-full bg-gray-200 h-2 rounded">
          <div
            className="h-2 bg-green-600 rounded"
            style={{ width: `${progress}%`, transition: "width 0.2s ease" }}
          />
        </div>
      )}
    </div>
  )
}
