import React from "react";
import { Box, Heading, HStack, VStack } from "@chakra-ui/react";
import BookCard from "./BookCard";

export default function GenreShelf({
  groupedBooks,
  onEditBook,
  onDeleteBook,
  onOpenDetails,
  cardBg,
  cardInnerBg,
  text,
  t,
}) {
  if (!groupedBooks || groupedBooks.length === 0)
    return (
      <Box color="gray.400" aria-live="polite">
        {t("no_books_found", "No books found.")}
      </Box>
    );
  return (
    <VStack align="stretch" spacing={{ base: 8, md: 12 }}>
      {groupedBooks.map(([genre, genreBooks]) => (
        <Box key={genre}>
          <Heading as="h3" size="sm" mb={2} color="red.600">
            {t(genre.toLowerCase(), genre)}
          </Heading>
          <HStack
            spacing={{ base: 3, md: 5 }}
            overflowX="auto"
            align="flex-start"
            py={2}
          >
            {genreBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEditBook={onEditBook}
                onDeleteBook={onDeleteBook}
                onOpenDetails={onOpenDetails}
                cardBg={cardBg}
                cardInnerBg={cardInnerBg}
                text={text}
              />
            ))}
          </HStack>
        </Box>
      ))}
    </VStack>
  );
}
