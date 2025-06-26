import { clsx } from "clsx"
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore"
import { useEffect, useState } from "react"
import { twMerge } from "tailwind-merge"
import { db } from "../utils/firebase"

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

export async function uploadToCloudinary(file, resourceType = "auto") {
  const cloudName = "dhg6j65ok"      // Replace with your cloud name
  const uploadPreset = "Fuoye-archive" // Replace with your unsigned upload preset

  if (!file) throw new Error("No file provided")

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`

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
        console.log("📡 New device tracked:", deviceId)
      } else {
        console.log("✅ Device already tracked:", deviceId)
      }
    }

    trackDevice()
  }, [])

  return null // runs silently
}
