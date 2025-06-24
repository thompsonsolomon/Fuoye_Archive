// export function ProfileStats() {
//   const stats = [
//     { label: "Blog Posts", value: 12 },
//     { label: "Products Listed", value: 5 },
//     { label: "Total Likes", value: 234 },
//     { label: "Comments", value: 89 },
//   ]

//   return (
//     <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//       {stats.map((stat) => (
//         <div key={stat.label} className="fuoye-card p-4 text-center">
//           <div className="text-2xl font-bold text-emerald-800 mb-1">{stat.value}</div>
//           <div className="text-sm text-gray-600">{stat.label}</div>
//         </div>
//       ))}
//     </div>
//   )
// }




"use client"

import { useEffect, useState } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../utils/firebase"
import { useAuth } from "../../contexts/AuthContext"

export function ProfileStats() {
  const [stats, setStats] = useState({
    posts: 0,
    products: 0,
    likes: 0,
    comments: 0,
  })

  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return

    const fetchStats = async () => {
      try {
        // Fetch blog post count
        const postsSnap = await getDocs(
          query(collection(db, "blog_posts"), where("author_id", "==", user.uid))
        )

        // Fetch product count
        const productsSnap = await getDocs(
          query(collection(db, "marketplace_items"), where("seller_id", "==", user.uid))
        )

        // Fetch reels and calculate total likes & comments
        const reelsSnap = await getDocs(
          query(collection(db, "reels"), where("userId", "==", user.uid))
        )

        let totalLikes = 0
        let totalComments = 0

        for (const doc of reelsSnap.docs) {
          const reel = doc.data()
          totalLikes += reel.likes || 0
          totalComments += reel.comments || 0
        }

        setStats({
          posts: postsSnap.size,
          products: productsSnap.size,
          likes: totalLikes,
          comments: totalComments,
        })
      } catch (error) {
        console.error("Failed to fetch profile stats:", error)
      }
    }

    fetchStats()
  }, [user?.uid])

  const statData = [
    { label: "Blog Posts", value: stats.posts },
    { label: "Products Listed", value: stats.products },
    { label: "Total Likes", value: stats.likes },
    { label: "Comments", value: stats.comments },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {statData.map((stat) => (
        <div key={stat.label} className="fuoye-card p-4 text-center">
          <div className="text-2xl font-bold text-emerald-800 mb-1">{stat.value}</div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}
