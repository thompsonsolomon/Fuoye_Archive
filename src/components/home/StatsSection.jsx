export function StatsSection() {
  const stats = [
    { number: "15,000+", label: "Active Students" },
    { number: "2,500+", label: "Blog Posts" },
    { number: "8,000+", label: "Marketplace Items" },
    { number: "50+", label: "Student Organizations" },
  ]

  return (
    <section className="py-16 px-4 bg-emerald-800 text-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div key={index}>
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">{stat.number}</div>
              <div className="text-emerald-100">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
