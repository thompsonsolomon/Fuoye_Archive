import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { OfflineProvider } from "./contexts/OfflineContext"
import { Navbar } from "./components/layout/Navbar"
import { Footer } from "./components/layout/Footer"
import { PWAInstallBanner } from "./components/pwa/PWAInstallBanner"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import { AdminRoute } from "./components/auth/AdminRoute"
import "./styles/globals.css"
// Pages
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/auth/LoginPage"
import SignupPage from "./pages/auth/SignupPage"
import BlogPage from "./pages/BlogPage"
import BlogPostPage from "./pages/BlogPostPage"
import ReelsPage from "./pages/ReelsPage"
import MarketplacePage from "./pages/MarketplacePage"
import ProductPage from "./pages/ProductPage"
import ProfilePage from "./pages/ProfilePage"
import AdminPage from "./pages/admin/AdminPage"
import PostBlogPage from "./pages/PostBlogPage"
import PostReelPage from "./pages/PostReelPage"
import PostProductPage from "./pages/PostProductPage"
import NotFoundPage from "./pages/NotFoundPage"

function App() {
  const { user } = useAuth()

  return (
    <AuthProvider>
      <OfflineProvider>
        <div className="min-h-screen bg-white text-gray-900">
          <PWAInstallBanner />
          <Navbar />
          <main className="min-h-screen">
            <Routes>
              {/* Public routes */}
              <Route
                path="/"
                element={user ? <Navigate to="/blog" replace /> : <HomePage />}
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<BlogPostPage />} />
              <Route path="/reels" element={<ReelsPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/marketplace/:id" element={<ProductPage />} />


              {/* Protected routes */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/post-reel"
                element={
                  <ProtectedRoute>
                    <PostReelPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/post-product"
                element={
                  <ProtectedRoute>
                    <PostProductPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin and SubAdmin routes */}
              <Route
                path="/post-blog"
                element={
                  <ProtectedRoute requireRole={["admin", "subadmin"]}>
                    <PostBlogPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin only routes */}
              <Route
                path="/admin"
                element={
                  // <AdminRoute>
                  <AdminPage />
                  //  </AdminRoute>
                }
              />
              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#065f46",
                color: "#fff",
              },
            }}
          />
        </div>
      </OfflineProvider>
    </AuthProvider>
  )
}

export default App
