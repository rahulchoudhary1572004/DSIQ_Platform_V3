import React from "react"

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const createPageNumbers = () => {
    if (totalPages <= 5) {
      return [...Array(totalPages)].map((_, i) => i + 1)
    } else if (currentPage <= 3) {
      return [1, 2, 3, 4, 5]
    } else if (currentPage >= totalPages - 2) {
      return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    } else {
      return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2]
    }
  }

  return (
    <div className="flex justify-center items-center mt-8 space-x-2">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border border-light-gray rounded-md bg-white hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed text-small"
      >
        First
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 border border-light-gray rounded-md bg-white hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed text-small"
      >
        Prev
      </button>

      {createPageNumbers().map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 border rounded-md text-small ${
            page === currentPage
              ? "bg-accent-magenta text-white border-accent-magenta hover:bg-gradient-from"
              : "bg-white border-light-gray hover:bg-cream"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border border-light-gray rounded-md bg-white hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed text-small"
      >
        Next
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border border-light-gray rounded-md bg-white hover:bg-cream disabled:opacity-50 disabled:cursor-not-allowed text-small"
      >
        Last
      </button>
    </div>
  )
}
