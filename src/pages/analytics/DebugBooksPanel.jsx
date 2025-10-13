import React from 'react';
import { Box, Text } from '@chakra-ui/react';

export default function DebugBooksPanel({ books }) {
  return (
    <Box
      mb={4}
      p={2}
      bg="gray.100"
      borderRadius="md"
      fontSize="xs"
      maxH="200px"
      overflowY="auto"
    >
      <Text fontWeight="bold" mb={1}>
        DEBUG: Raw books data
      </Text>
      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {JSON.stringify(books, null, 2)}
      </pre>
    </Box>
  );
}
