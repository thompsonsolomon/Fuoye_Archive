import { Card, CardContent } from "@/components/ui/card"
import { StarRating } from "./star-rating"

export function BookCard({ book, onClick }) {
  return (
    <Card className="cursor-pointer hover:shadow-lg w-full max-md:min-w-[100%] min-w-[270px] transition-shadow duration-200" onClick={onClick}>
      <CardContent className="p-4 w-full">
        <div className="relative mb-3 overflow-hidden rounded-md">
          <img
            src={book.thumbnailUrl || "/placeholder.svg"}
            alt={book.title}
            loading="lazy"
            className="object-cover max-h-[1200px] w-full h-full"
          />
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.title}</h3>

        <p className="text-gray-600 text-sm mb-3 line-clamp-3">{book.description}</p>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <StarRating rating={book.averageRating} readonly size="sm" />
            <span className="text-sm text-gray-500">({book.totalRatings})</span>
          </div>

          <span className="text-xs text-gray-400">
            {book.averageRating > 0 ? book.averageRating.toFixed(1) : "No ratings"}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
