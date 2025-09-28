import React from "react";
import {
  Box,
  Heading,
  Stack,
  Text,
  HStack,
  Tag,
  TagLabel,
} from "@chakra-ui/react";

export default function RecommendationsPage({ books, recommended }) {
  // books: all books in library
  // recommended: array of recommended book objects (ids or full objects)
  return (
    <Box
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
      maxW={{ base: "100%", md: "900px" }}
      mx="auto"
    >
      <Heading as="h1" size="lg" mb={6} color="red.600">
        Recommended for You
      </Heading>
      <Text fontSize="md" color="gray.600" mb={4}>
        These suggestions are based on your reading history, ratings, and
        favorite moods/genres.
      </Text>
      <HStack spacing={4} flexWrap="wrap" align="flex-start">
        {recommended && recommended.length > 0 ? (
          recommended.map((book) => (
            <Box
              key={book.id}
              minW={{ base: "120px", sm: "140px", md: "180px" }}
              maxW={{ base: "140px", sm: "160px", md: "200px" }}
              p={2}
              borderWidth={1}
              borderRadius="lg"
              bg="white"
              boxShadow="sm"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="space-between"
              _hover={{ boxShadow: "lg" }}
              position="relative"
              color="gray.700"
              cursor="pointer"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("openBookDetails", { detail: book.id })
                );
              }}
            >
              {/* Series order badge */}
              {book.series &&
                book.seriesOrder &&
                !isNaN(Number(book.seriesOrder)) && (
                  <Box
                    position="absolute"
                    top={1}
                    left={1}
                    bg="purple.500"
                    color="white"
                    fontSize="xs"
                    fontWeight="bold"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    zIndex={2}
                    boxShadow="sm"
                    aria-label={`Book ${book.seriesOrder} in series`}
                  >
                    {book.seriesOrder}
                  </Box>
                )}
              <Box
                w="100%"
                h={{ base: "120px", sm: "140px", md: "180px" }}
                mb={2}
                borderRadius="md"
                overflow="hidden"
                bg="gray.100"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <Text
                    fontSize="xs"
                    color="gray.400"
                    textAlign="center"
                    px={2}
                  >
                    No Cover
                  </Text>
                )}
              </Box>
              <Text
                fontSize="sm"
                color="gray.700"
                fontWeight="medium"
                mb={1}
                noOfLines={1}
                textAlign="center"
              >
                {book.title}
              </Text>
              {Array.isArray(book.moods) && book.moods.length > 0 && (
                <HStack spacing={1} mb={1} flexWrap="wrap" justify="center">
                  {book.moods.map((mood) => (
                    <Tag
                      key={mood}
                      size="sm"
                      colorScheme="purple"
                      borderRadius="full"
                    >
                      <TagLabel>{mood}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              )}
              <Text fontSize="xs" color="gray.500">
                {book.author}
              </Text>
            </Box>
          ))
        ) : (
          <Text color="gray.500">
            No recommendations yet. Add ratings and moods to your books for
            better suggestions!
          </Text>
        )}
      </HStack>
    </Box>
  );
}
