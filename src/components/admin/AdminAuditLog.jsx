import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

export default function AdminAuditLog() {
  return (
    <Box p={6}>
      <Heading mb={4}>Audit Log</Heading>
      <Text>Track admin actions for transparency and accountability.</Text>
      {/* TODO: Implement audit log table */}
    </Box>
  );
}
