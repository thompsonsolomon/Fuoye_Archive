"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { WifiOff } from "lucide-react"

const OfflineContext = createContext()

export function useOffline() {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error("useOffline must be used within OfflineProvider")
  }
  return context
}

export function OfflineProvider({ children }) {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineBanner, setShowOfflineBanner] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineBanner(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineBanner(true)
    }

    // Check initial status
    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <OfflineContext.Provider value={{ isOnline }}>
      {showOfflineBanner && (
        <div className="bg-red-600 text-white p-3 text-center">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="h-4 w-4" />
            <span>You're offline. Some features may not work.</span>
          </div>
        </div>
      )}
      {children}
    </OfflineContext.Provider>
  )
}
