"use client"

import { useParams } from "react-router-dom"
import { BlogPost } from "../components/blog/BlogPost"
import { CommentSection } from "../components/blog/CommentSection"
import { RelatedPosts } from "../components/blog/RelatedPosts"

export default function BlogPostPage() {
  const { id } = useParams()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BlogPost id={id} />
      <CommentSection postId={id} />
      {/* <RelatedPosts currentPostId={id} /> */}
    </div>
  )
}
