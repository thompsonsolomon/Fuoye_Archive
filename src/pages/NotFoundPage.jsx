import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Home, ArrowLeft } from "lucide-react"

export default function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px] px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-emerald-800 mb-4">404</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <Link to="javascript:history.back()">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Link>
          </Button>
          <Button asChild className="fuoye-button">
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
