import React from "react";
import { Box, Heading, HStack } from "@chakra-ui/react";
import BookCard from "./BookCard";

export default function RecommendedShelf({
  recommended,
  onEditBook,
  onDeleteBook,
  onOpenDetails,
  cardBg,
  cardInnerBg,
  text,
  t,
}) {
  if (!recommended || recommended.length === 0) return null;
  return (
    <Box mb={8}>
      <Heading as="h3" size="sm" mb={2} color="brand.500" fontFamily="heading">
        {t("recommended_for_you", "Recommended for You")}
      </Heading>
      <HStack spacing={3} overflowX="auto" align="flex-start">
        {recommended.map((book) => (
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
  );
}
