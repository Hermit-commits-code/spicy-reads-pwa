import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function AdminAnnouncements() {
  return (
    <Box p={6}>
      <Heading mb={4}>App-wide Announcements</Heading>
      <Text>Send messages to all users from here.</Text>
      {/* TODO: Implement announcement composer and history */}
    </Box>
  );
}
