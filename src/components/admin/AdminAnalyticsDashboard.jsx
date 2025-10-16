import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function AdminAnalyticsDashboard() {
  return (
    <Box p={6}>
      <Heading mb={4}>Analytics Dashboard</Heading>
      <Text>
        User activity, book trends, and feature usage analytics will appear
        here.
      </Text>
      {/* TODO: Implement analytics charts and tables */}
    </Box>
  );
}
