import React from 'react';
import { Box, Text, Tag, TagLabel, HStack, IconButton } from '@chakra-ui/react';
import FormatTag from './FormatTag';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

export default function BookCard({
  book,
  onEditBook,
  onDeleteBook,
  onOpenDetails,
  cardBg,
  cardInnerBg,
  text,
}) {
  return (
    <Box
      minW={{ base: '120px', sm: '140px', md: '180px', lg: '200px' }}
      maxW={{ base: '140px', sm: '160px', md: '200px', lg: '220px' }}
      mr={0}
      p={{ base: 2, md: 4 }}
      borderWidth={1}
      borderRadius="lg"
      bg={cardBg}
      boxShadow="sm"
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="space-between"
      _hover={{ boxShadow: 'lg' }}
      position="relative"
      color={text}
      fontFamily="body"
      cursor="pointer"
      onClick={onOpenDetails ? () => onOpenDetails(book) : undefined}
    >
      {/* Series order badge */}
      {book.series && book.seriesOrder && !isNaN(Number(book.seriesOrder)) && (
        <Box
          position="absolute"
          top={2}
          left={2}
          bg="purple.500"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          px={3}
          py={1}
          borderRadius="full"
          zIndex={2}
          boxShadow="sm"
          aria-label={`Book ${book.seriesOrder} in series`}
          minW="48px"
          textAlign="center"
        >
          {book.seriesOrder}
        </Box>
      )}
      {/* Book cover image or fallback */}
      <Box
        w="100%"
        h={{ base: '120px', sm: '140px', md: '180px', lg: '240px' }}
        mb={2}
        borderRadius="md"
        overflow="hidden"
        bg={cardInnerBg}
        display="flex"
        alignItems="center"
        justifyContent="center"
        position="relative"
      >
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <Text fontSize="xs" color="gray.400" textAlign="center" px={2}>
            No Cover
          </Text>
        )}
        {/* ...existing code... */}
      </Box>
      {Array.isArray(book.formatsOwned) && book.formatsOwned.length > 0 && (
        <Box mt={2} mb={1} display="flex" justifyContent="center" w="100%">
          {book.formatsOwned.map((format) => (
            <FormatTag key={format} format={format} />
          ))}
        </Box>
      )}
      <Text
        fontSize="sm"
        color={text}
        fontWeight="medium"
        mb={1}
        noOfLines={1}
        textAlign="center"
        fontFamily="heading"
      >
        {book.title}
      </Text>
      {Array.isArray(book.moods) && book.moods.length > 0 && (
        <HStack spacing={1} mb={1} flexWrap="wrap" justify="center">
          {book.moods.map((mood) => (
            <Tag key={mood} size="sm" colorScheme="purple" borderRadius="full">
              <TagLabel>{mood}</TagLabel>
            </Tag>
          ))}
        </HStack>
      )}
      <Text fontSize="xs" color="gray.500" fontFamily="body">
        {book.author}
      </Text>
      <HStack mt={1} justify="center" w="100%">
        <IconButton
          icon={<EditIcon />}
          aria-label={`Edit ${book.title}`}
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            onEditBook(book);
          }}
          colorScheme="yellow"
          variant="ghost"
          isRound
          tabIndex={0}
        />
        <IconButton
          icon={<DeleteIcon />}
          aria-label={`Delete ${book.title}`}
          size="lg"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBook(book.id);
          }}
          colorScheme="red"
          variant="ghost"
          isRound
          tabIndex={0}
        />
      </HStack>
    </Box>
  );
}
