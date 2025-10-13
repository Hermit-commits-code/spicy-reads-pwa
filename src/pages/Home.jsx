import BookDetailsModal from '../components/BookDetailsModal';
import React, { useState, useRef } from 'react';
import { getRecommendedBooks } from '../utils/recommendations';
import { useTranslation } from 'react-i18next';
import { Box } from '@chakra-ui/react';
import RecommendedShelf from '../components/RecommendedShelf';
import GenreShelf from '../components/GenreShelf';

const COMMON_MOODS = [
  'Cozy',
  'Dark',
  'Funny',
  'Adventurous',
  'Emotional',
  'Inspiring',
  'Steamy',
  'Chilling',
  'Feel-Good',
  'Heartbreaking',
  'Other',
];

export default function Home({
  books,
  onEditBook,
  onDeleteBook,
  autoOpenAddBook,
}) {
  const { t } = useTranslation();
  // Use theme tokens for colors
  const cardBg = 'gray.50';
  const cardInnerBg = 'brand.50';
  const text = 'gray.700';
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  // Track if an edit just completed to block details modal
  const justEditedRef = useRef(false);

  // Auto-open add book modal
  React.useEffect(() => {
    if (autoOpenAddBook) {
      // Trigger the floating add book button click
      const event = new CustomEvent('openAddBook');
      window.dispatchEvent(event);
    }
  }, [autoOpenAddBook]);
  const recommended = getRecommendedBooks(books, { max: 5 });
  const groupedBooks = Array.from(
    books.reduce((acc, book) => {
      const genre = book.genre || 'Other';
      if (!acc.has(genre)) acc.set(genre, []);
      acc.get(genre).push(book);
      return acc;
    }, new Map()),
  );

  // Only open details modal if edit modal is NOT open
  const handleOpenDetails = (book) => {
    // Prevent details modal if edit modal is open or just edited
    if (window.editBookModalOpen || justEditedRef.current) return;
    // Extra guard: block if editBookModalOpen is true for a short time after closing
    setTimeout(() => {
      if (!window.editBookModalOpen && !justEditedRef.current) {
        setSelectedBook(book);
        setDetailsOpen(true);
      }
    }, 150);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedBook(null);
    justEditedRef.current = false;
  };

  // Listen for openBookDetails event (from BookDetailsModal recommendations)
  React.useEffect(() => {
    const handler = (e) => {
      const bookId = e.detail;
      const found = books.find((b) => b.id === bookId);
      if (found) {
        setSelectedBook(found);
        setDetailsOpen(true);
      }
    };
    window.addEventListener('openBookDetails', handler);
    return () => window.removeEventListener('openBookDetails', handler);
  }, [books]);

  // Listen for edit modal close event (from App.jsx)
  React.useEffect(() => {
    const handler = () => {
      justEditedRef.current = true;
      setTimeout(() => {
        justEditedRef.current = false;
      }, 1200); // Block for a longer time after edit to prevent details modal flicker
    };
    window.addEventListener('editBookModalClosed', handler);
    return () => window.removeEventListener('editBookModalClosed', handler);
  }, []);

  return (
    <Box
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
      maxW={{ base: '100%', md: '900px' }}
      mx="auto"
    >
      <RecommendedShelf
        recommended={recommended}
        onEditBook={onEditBook}
        onDeleteBook={onDeleteBook}
        onOpenDetails={handleOpenDetails}
        cardBg={cardBg}
        cardInnerBg={cardInnerBg}
        text={text}
        t={t}
      />
      <GenreShelf
        groupedBooks={groupedBooks}
        onEditBook={onEditBook}
        onDeleteBook={onDeleteBook}
        onOpenDetails={handleOpenDetails}
        cardBg={cardBg}
        cardInnerBg={cardInnerBg}
        text={text}
        t={t}
      />
      <BookDetailsModal
        book={selectedBook}
        opened={detailsOpen}
        onClose={handleCloseDetails}
      />
    </Box>
  );
}
