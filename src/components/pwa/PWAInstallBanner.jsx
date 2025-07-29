import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { X, Download } from "lucide-react"

export function PWAInstallBanner() {
  console.log("PWA banner")
  const [showBanner, setShowBanner] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowBanner(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  useEffect(() => {
    const downloadedApp = localStorage.getItem("downloadedApp")
    if (downloadedApp) {
      setInstalled(true)
      setShowBanner(false)
    } else {
      setInstalled(false)
      setShowBanner(true)
    }
  }, [])


  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setDeferredPrompt(null)
      setShowBanner(false)
    }
    localStorage.setItem("downloadedApp", "true")
  }

  if (!showBanner) return null
  if(installed) return null

  return (
    <div className="bg-emerald-800 text-white p-4 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Download className="h-5 w-5" />
          <div>
            <p className="font-medium">Install FUOYE Archive</p>
            <p className="text-sm text-emerald-100">Get the full app experience on your device</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="secondary" onClick={handleInstall}>
            Install
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowBanner(false)}
            className="text-white hover:bg-emerald-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
