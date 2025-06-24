import { Link } from "react-router-dom"
import { Button } from "../ui/button"
import { ArrowRight, BookOpen, ShoppingBag } from "lucide-react"

export function Hero() {
  return (
    <section className="fuoye-gradient text-white py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Welcome to <span className="text-yellow-400">FUOYE</span> Archive
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-emerald-100 max-w-3xl mx-auto">
            Your gateway to Federal University Oye-Ekiti's vibrant community. Share stories, discover opportunities, and
            connect with fellow students.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Link to="/blog">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto">
              <BookOpen className="mr-2 h-5 w-5" />
              Explore Blog
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-transparent border-white text-white hover:bg-white hover:text-emerald-800"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Visit Marketplace
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        <div className="text-emerald-200 text-sm">Join thousands of FUOYE students already connected</div>
      </div>
    </section>
  )
}
