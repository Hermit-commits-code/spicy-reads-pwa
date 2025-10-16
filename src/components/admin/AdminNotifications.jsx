import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function AdminNotifications() {
  return (
    <Box p={6}>
      <Heading mb={4}>Admin Notifications</Heading>
      <Text>System alerts and moderation requests will appear here.</Text>
      {/* TODO: Implement notifications list */}
    </Box>
  );
}
