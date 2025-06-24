"use client"

import { Search } from "lucide-react"
import { Input } from "./input"

export function SearchInput({ placeholder = "Search...", value, onChange }) {
 
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange && onChange(e.target.value)}
        className="pl-10 pr-4 py-2 w-full max-w-md"
      />
    </div>
  )
}
