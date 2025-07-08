// Path: src/components/Agreement/Hook/usePagination.js (Adjust path as needed)
import { useState, useEffect } from "react"; // Added useEffect

const usePagination = (data = [], itemsPerPage = 5) => {
  // Added default values
  const [currentPage, setCurrentPage] = useState(1);
  // Calculate maxPage based on the potentially changing data length
  const maxPage = Math.ceil(data.length / itemsPerPage);

  // Reset to page 1 if the data length changes such that the current page becomes invalid
  useEffect(() => {
    if (currentPage > maxPage && maxPage > 0) {
      setCurrentPage(1);
    }
    // Also handle the case where data becomes empty
    if (data.length === 0) {
      setCurrentPage(1);
    }
  }, [data.length, maxPage, currentPage]); // Re-run when data length or maxPage changes

  function currentData() {
    if (!data || data.length === 0) return []; // Handle empty or undefined data
    const begin = (currentPage - 1) * itemsPerPage;
    const end = begin + itemsPerPage;
    return data.slice(begin, end);
  }

  function nextPage() {
    // Ensure maxPage is at least 1 if data exists, otherwise 0
    const currentMaxPage = Math.max(1, Math.ceil(data.length / itemsPerPage));
    setCurrentPage((current) => Math.min(current + 1, currentMaxPage));
  }

  function prevPage() {
    setCurrentPage((current) => Math.max(current - 1, 1));
  }

  function jump(page) {
    const currentMaxPage = Math.max(1, Math.ceil(data.length / itemsPerPage));
    const pageNumber = Math.max(1, page);
    setCurrentPage(() => Math.min(pageNumber, currentMaxPage));
  }

  // Return maxPage calculated based on current data length
  return {
    currentPage,
    maxPage: Math.max(1, maxPage),
    currentData,
    nextPage,
    prevPage,
    jump,
  };
};

export default usePagination;
