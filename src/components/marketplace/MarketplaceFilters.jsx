"use client"

import { useState } from "react"
import { Button } from "../ui/button"

const categories = ["All", "Books", "Electronics", "Clothing", "Furniture", "Sports", "Others"]

export function MarketplaceFilters() {
  const [activeCategory, setActiveCategory] = useState("All")

  return (
    <div className="flex flex-wrap gap-2 mb-8 p-4 bg-gray-50 rounded-lg">
      {categories.map((category) => (
        <Button
          key={category}
          variant={activeCategory === category ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveCategory(category)}
          className={activeCategory === category ? "fuoye-button" : ""}
        >
          {category}
        </Button>
      ))}
    </div>
  )
}
