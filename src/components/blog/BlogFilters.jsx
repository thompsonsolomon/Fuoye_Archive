"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import { Link } from "react-router-dom"
import { Video } from "lucide-react"

const filters = ["Most Recent", "Trending", "Popular"]

export function BlogFilters() {
  const [activeFilter, setActiveFilter] = useState("Most Recent")

  return (
    <div className="flex flex-wrap gap-2 mb-8 p-4 bg-gray-50 rounded-lg">
      <div className="flex flex-wrap gap-2 flex-1">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveFilter(filter)}
            className={activeFilter === filter ? "fuoye-button" : ""}
          >
            {filter}
          </Button>
        ))}
      </div>

      <Link to="/reels">
        <Button
          variant="outline"
          size="sm"
          className="bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
        >
          <Video className="h-4 w-4 mr-1" />
          Reels
        </Button>
      </Link>
    </div>
  )
}
