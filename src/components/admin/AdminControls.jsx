import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function AdminControls() {
  return (
    <Box p={6}>
      <Heading mb={4}>Admin Controls & Tools</Heading>
      <Text>
        Manual backup/restore, feature flags, and beta tester management.
      </Text>
      {/* TODO: Implement controls and toggles */}
    </Box>
  );
}
