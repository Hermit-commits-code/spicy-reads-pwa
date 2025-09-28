import BookDetailsModal from "../components/BookDetailsModal";
import React, { useState } from "react";
import { getRecommendedBooks } from "../utils/recommendations";
import { useTranslation } from "react-i18next";
import { Box } from "@chakra-ui/react";
import RecommendedShelf from "../components/RecommendedShelf";
import GenreShelf from "../components/GenreShelf";

const COMMON_MOODS = [
  "Cozy",
  "Dark",
  "Funny",
  "Adventurous",
  "Emotional",
  "Inspiring",
  "Steamy",
  "Chilling",
  "Feel-Good",
  "Heartbreaking",
  "Other",
];

export default function Home({ books, onEditBook, onDeleteBook }) {
  const { t } = useTranslation();
  // Use theme tokens for colors
  const cardBg = "gray.50";
  const cardInnerBg = "brand.50";
  const text = "gray.700";
  const [selectedBook, setSelectedBook] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const recommended = getRecommendedBooks(books, { max: 5 });
  const groupedBooks = Array.from(
    books.reduce((acc, book) => {
      const genre = book.genre || "Other";
      if (!acc.has(genre)) acc.set(genre, []);
      acc.get(genre).push(book);
      return acc;
    }, new Map())
  );

  const handleOpenDetails = (book) => {
    setSelectedBook(book);
    setDetailsOpen(true);
  };
  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedBook(null);
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
    window.addEventListener("openBookDetails", handler);
    return () => window.removeEventListener("openBookDetails", handler);
  }, [books]);

  return (
    <Box
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
      maxW={{ base: "100%", md: "900px" }}
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
