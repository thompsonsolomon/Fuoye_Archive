import { BlogFeed } from "../components/blog/BlogFeed"
import { BlogFilters } from "../components/blog/BlogFilters"
import { SearchInput } from "../components/ui/SearchInput"

export default function BlogPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Campus Blog</h1>
        <p className="text-gray-600 mb-6">Discover stories, insights, and experiences from the FUOYE community</p>
        <SearchInput placeholder="Search blog posts..." />
      </div>

      <BlogFilters />
      <BlogFeed />
    </div>
  )
}
