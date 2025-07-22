import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function StarRating({ rating, onRatingChange, readonly = false, size = "md" }) {
  const [hoverRating, setHoverRating] = useState(0)

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const handleClick = (newRating) => {
    if (!readonly && onRatingChange) {
      onRatingChange(newRating)
    }
  }

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={cn(
            "transition-colors",
            !readonly && "hover:scale-110 cursor-pointer",
            readonly && "cursor-default",
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              "transition-colors",
              hoverRating >= star || rating >= star ? "fill-yellow-400 text-yellow-400" : "text-gray-300",
            )}
          />
        </button>
      ))}
    </div>
  )
}
