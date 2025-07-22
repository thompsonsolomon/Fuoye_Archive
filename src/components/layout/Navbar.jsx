import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { Button } from "../ui/button"
import { Menu, X, User, LogOut, Settings, Video, ShoppingBasket, Book, BookOpen } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useOffline } from "../../contexts/OfflineContext"
import { useAuth } from "../../contexts/AuthContext"
import { truncateText } from "../../utils/helpers"
import { logoutUser } from "../../lib/api"
import toast from "react-hot-toast"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, profile } = useAuth()
  const { isOnline } = useOffline()
  const location = useLocation()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/reels", label: "Reels" },
    { href: "/books", label: "Books" },
    { href: "/marketplace", label: "Marketplace" },
  ]

  const isActive = (path) => location.pathname === path
  const handleLogout = async () => {
    try {
      await logoutUser()
      // redirect or update state as needed
      window.location.href = "/login"
    } catch (err) {
      toast.error("Logout failed")
      console.error(err)
    }
  }
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-800 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="font-bold text-xl text-emerald-800">FUOYE Archive</span>
            {!isOnline && <span className="text-xs text-red-500 ml-2">(Offline)</span>}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`font-medium transition-colors ${isActive(link.href) ? "text-emerald-800" : "text-gray-700 hover:text-emerald-800"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />

                    <span>{profile && truncateText(profile?.fullName || profile?.email, 10)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/post-product">Post Product</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/add-books">New Books</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {profile?.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/post-reel">
                      <Video className="mr-2 h-4 w-4" />
                      Create Reel
                    </Link>
                  </DropdownMenuItem>
                  {(profile?.role === "admin" || profile?.role === "subadmin") && (
                    <DropdownMenuItem asChild>
                      <Link to="/post-blog">Create Blog Post</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link to="/signup">
                  <Button className="fuoye-button">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className={`font-medium transition-colors ${isActive(link.href) ? "text-emerald-800" : "text-gray-700 hover:text-emerald-800"
                    }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user && (
                <>
                  <div className="pt-4 border-t border-gray-200">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-gray-700 hover:text-emerald-800"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                  </div>
                  <Link
                    to="/post-reel"
                    className="flex items-center space-x-2 text-gray-700 hover:text-emerald-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <Video className="h-5 w-5" />
                    <span>Create Reel</span>
                  </Link>
                  
                  <Link
                    to="/post-product"
                    className="flex items-center space-x-2 text-gray-700 hover:text-emerald-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShoppingBasket className="h-5 w-5" />
                    <span>Post Product</span>
                  </Link>

                  <Link
                    to="/add-books"
                    className="flex items-center space-x-2 text-gray-700 hover:text-emerald-800"
                    onClick={() => setIsOpen(false)}
                  >
                    <BookOpen className="h-5 w-5" />
                    <span>Add Books</span>
                  </Link>


                  {(profile?.role === "admin" || profile?.role === "subadmin") && (
                    <Link
                      to="/post-blog"
                      className="flex items-center space-x-2 text-gray-700 hover:text-emerald-800"
                      onClick={() => setIsOpen(false)}
                    >
                      <span>Create Blog Post</span>
                    </Link>
                  )}

{profile?.role === "admin" && (
                    <div>
                      <Link to="/admin"
                        className="flex items-center space-x-2 text-gray-700 hover:text-emerald-800"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </div>
                  )}
                </>
              )}
              {!user && (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full fuoye-button">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
