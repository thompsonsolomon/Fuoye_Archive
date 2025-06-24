import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../utils/firebase"
import { getUserProfile } from "../lib/api"

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)

      if (currentUser) {
        try {
          const profileData = await getUserProfile(currentUser.uid)
          setProfile(profileData)
        } catch (error) {
          console.error("Failed to fetch profile:", error)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === "admin",
    isAgent: profile?.accountType === "agent",
    isUser: profile?.accountType === "user",
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
