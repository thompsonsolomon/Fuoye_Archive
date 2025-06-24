import { useEffect, useState } from "react"
import { collection, getCountFromServer } from "firebase/firestore"
import { Users, FileText, ShoppingBag, TrendingUp, Video } from "lucide-react"
import { db } from "../../utils/firebase"

export function AdminStats() {
  const [counts, setCounts] = useState({
    users: 0,
    posts: 0,
    reels: 0,
    products: 0,
    activeUsers: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [userSnap, postSnap, reelSnap, productSnap] = await Promise.all([
          getCountFromServer(collection(db, "users")),
          getCountFromServer(collection(db, "blog_posts")),
          getCountFromServer(collection(db, "reels")),
          getCountFromServer(collection(db, "marketplace_items")),
        ])

        setCounts({
          users: userSnap.data().count,
          posts: postSnap.data().count,
          reels: reelSnap.data().count,
          products: productSnap.data().count,
          activeUsers: 1892, // 👈 Optional: Replace with logic for monthly active users
        })
      } catch (error) {
        console.error("Error fetching admin stats:", error)
      }
    }

    fetchStats()
  }, [])

  const stats = [
    {
      title: "Total Users",
      value: counts.users,
      change: "+12%",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Blog Posts",
      value: counts.posts,
      change: "+8%",
      icon: FileText,
      color: "text-emerald-600",
    },
    {
      title: "Reels",
      value: counts.reels,
      change: "+24%",
      icon: Video,
      color: "text-purple-600",
    },
    {
      title: "Products Listed",
      value: counts.products,
      change: "+15%",
      icon: ShoppingBag,
      color: "text-orange-600",
    },
    {
      title: "Monthly Active Users",
      value: counts.activeUsers,
      change: "+23%",
      icon: TrendingUp,
      color: "text-pink-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
      {stats.map((stat) => (
        <div key={stat.title} className="fuoye-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
            </div>
            <div className={`p-3 rounded-lg bg-gray-100 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
