import { BlogEditor } from "../components/blog/BlogEditor"

export default function PostBlogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Blog Post</h1>
        <p className="text-gray-600">Share your thoughts and experiences with the FUOYE community</p>
      </div>

      <BlogEditor />
    </div>
  )
}
