import React from 'react'

import { useState, useEffect } from "react"
import { Search, BookOpen, Loader2 } from "lucide-react"
import { BookCard } from './BooksCard'
import { Input } from '../ui/input'
import { BookModal } from './BookModal'
import { getBooks } from '../../lib/utils'

function Books() {


  const [books, setBooks] = useState([])
  const [filteredBooks, setFilteredBooks] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBook, setSelectedBook] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBooks()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBooks(books)
    } else {
      const filtered = books.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.description.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredBooks(filtered)
    }
  }, [searchQuery, books])

  const loadBooks = async () => {
    try {
      const booksData = await getBooks()
      console.log(booksData)
      setBooks(booksData)
      setFilteredBooks(booksData)
    } catch (error) {
      console.error("Error loading books:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookClick = (book) => {
    setSelectedBook(book)
    setIsModalOpen(true)
  }

  const handleRatingUpdate = () => {
    // Refresh books to get updated ratings
    loadBooks()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8 text-emerald-800 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">BookShare Library</h1>
          </div>

          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search books by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
        <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-800 mx-auto mb-4" />
          <p className="text-gray-600">Loading posts...</p>
        </div>
      </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? "No books found" : "No books available"}
            </h3>
            <p className="text-gray-600">
              {searchQuery ? "Try adjusting your search terms." : "Books will appear here once they are uploaded."}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {searchQuery ? `Search Results (${filteredBooks.length})` : `All Books (${filteredBooks.length})`}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} onClick={() => handleBookClick(book)} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Book Details Modal */}
      <BookModal
        book={selectedBook}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRatingUpdate={handleRatingUpdate}
      />
    </div>
  )
}

export default Books
