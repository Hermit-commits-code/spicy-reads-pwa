import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function AdminSystemHealth() {
  return (
    <Box p={6}>
      <Heading mb={4}>System Health & Status</Heading>
      <Text>
        Monitor Firestore usage, error logs, and app performance here.
      </Text>
      {/* TODO: Implement system health widgets */}
    </Box>
  );
}
