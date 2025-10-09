import React from "react";
import { Box, Text } from "@chakra-ui/react";
import QuickAddBook from "../QuickAddBook";

export default function QuickAddSection({
  isEdit,
  t,
  setTitle,
  setAuthor,
  setDescription,
  setCover,
  setGenre,
  setSubGenre,
  setNotes,
  setSeries,
  setSeriesOrder,
  notes,
}) {
  if (isEdit) return null;
  return (
    <Box mb={4} p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
      <Text fontWeight="bold" mb={3} color="blue.600">
        {t("quick_add", "Quick Add Book")}
      </Text>
      <Text fontSize="sm" color="gray.600" mb={3}>
        {t(
          "quick_add_help",
          "Scan ISBN, paste Amazon/Goodreads links, or search to auto-fill book details"
        )}
      </Text>
      <QuickAddBook
        onBookAdd={(bookData) => {
          if (bookData.title) setTitle(bookData.title);
          if (bookData.author) setAuthor(bookData.author);
          if (bookData.description) setDescription(bookData.description);
          if (bookData.cover) setCover(bookData.cover);
          if (bookData.genre) setGenre(bookData.genre);
          if (bookData.subGenre) setSubGenre(bookData.subGenre);
          if (bookData.series) setSeries(bookData.series);
          if (bookData.seriesOrder) setSeriesOrder(bookData.seriesOrder);
          if (bookData.isbn) {
            setNotes(
              notes
                ? `${notes}\n\nISBN: ${bookData.isbn}`
                : `ISBN: ${bookData.isbn}`
            );
          }
          setTimeout(() => {
            const formElement = document.querySelector(
              '[role="dialog"] form, [role="dialog"] .chakra-modal__body'
            );
            if (formElement) {
              formElement.scrollTop = formElement.scrollHeight;
            }
          }, 100);
        }}
      />
    </Box>
  );
}
