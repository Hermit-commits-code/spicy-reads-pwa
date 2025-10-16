import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function AdminContentModeration() {
  return (
    <Box p={6}>
      <Heading mb={4}>Content Moderation</Heading>
      <Text>Flag, remove, or edit inappropriate posts/books here.</Text>
      {/* TODO: Implement moderation table and actions */}
    </Box>
  );
}
