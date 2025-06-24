"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Loader2 } from "lucide-react"

export function ProtectedRoute({ children, requireRole = [] }) {
  const { user, profile, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-800" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireRole.length > 0 && !requireRole.includes(profile?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}
