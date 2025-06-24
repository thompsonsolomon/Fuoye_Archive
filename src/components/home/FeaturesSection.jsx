import { BookOpen, ShoppingBag, Users, Zap } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Campus Blog",
    description: "Share your thoughts, experiences, and academic insights with the FUOYE community.",
  },
  {
    icon: ShoppingBag,
    title: "Student Marketplace",
    description: "Buy and sell textbooks, electronics, and other items within the university community.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Connect with fellow students, join discussions, and build lasting relationships.",
  },
  {
    icon: Zap,
    title: "Fast & Reliable",
    description: "Optimized for mobile devices with offline capabilities and instant loading.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need in One Place</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            FUOYE Archive brings together the best of campus life in a single, easy-to-use platform.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="fuoye-card p-6 text-center hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-emerald-800" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
