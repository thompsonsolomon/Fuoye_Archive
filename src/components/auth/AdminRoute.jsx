"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Loader2 } from "lucide-react"

export function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role !== "admin") {
    return <Navigate to="/" replace />
  }

  return children
}
