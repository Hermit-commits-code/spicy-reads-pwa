import BookDetailsModal from '../components/bookDetails/BookDetailsModal';
import AddBookModal from '../components/addBook/AddBookModal';
import { IconButton, useToast } from '@chakra-ui/react';
import { FiPlus } from 'react-icons/fi';
import React, { useState, useRef } from 'react';
import { getRecommendedBooks } from '../utils/recommendations';
import { useTranslation } from 'react-i18next';
import { Box } from '@chakra-ui/react';
import RecommendedShelf from '../components/bookDetails/RecommendedShelf';
import GenreShelf from '../components/bookDetails/GenreShelf';

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
  books = [],
  onEditBook,
  onDeleteBook,
  autoOpenAddBook,
  onAddBook, // optional callback for parent to update books
}) {
  const { t } = useTranslation();
  // Use theme tokens for colors
  const cardBg = 'gray.50';
  const cardInnerBg = 'brand.50';
  const text = 'gray.700';
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const toast = useToast();
  // Track if an edit just completed to block details modal
  const justEditedRef = useRef(false);

  // Auto-open add book modal
  React.useEffect(() => {
    if (autoOpenAddBook) {
      setAddBookOpen(true);
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
      position="relative"
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
      {/* Floating Add Book Button */}
      <IconButton
        icon={<FiPlus />}
        colorScheme="red"
        aria-label="Add Book"
        size="lg"
        position="fixed"
        bottom={{ base: 20, md: 24 }}
        right={{ base: 6, md: 10 }}
        borderRadius="full"
        boxShadow="lg"
        zIndex={100}
        onClick={() => setAddBookOpen(true)}
        _hover={{ bg: 'red.400' }}
      />
      <AddBookModal
        opened={addBookOpen}
        onClose={() => setAddBookOpen(false)}
        onAdd={async (book) => {
          setAddBookOpen(false);
          toast({
            title: t('Book added!'),
            status: 'success',
            duration: 2000,
            isClosable: true,
          });
          if (onAddBook) onAddBook(book);
        }}
      />
    </Box>
  );
}
