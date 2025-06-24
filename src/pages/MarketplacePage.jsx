import { useState } from "react"
import { MarketplaceFeed } from "../components/marketplace/MarketplaceFeed"
import { MarketplaceFilters } from "../components/marketplace/MarketplaceFilters"
import { SearchInput } from "../components/ui/SearchInput"

export default function MarketplacePage() {
  const [SearchValue, setSearchValue] = useState("")
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Student Marketplace</h1>
        <p className="text-gray-600 mb-6">Buy and sell items within the FUOYE community</p>
        <SearchInput placeholder="Search products..." value={SearchValue} onclick={setSearchValue} />
      </div>

      <MarketplaceFilters />
      <MarketplaceFeed />
    </div>
  )
}
