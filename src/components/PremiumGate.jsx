import React from 'react';
import { Box, Text, Button } from '@chakra-ui/react';

export default function PremiumGate({ children }) {
  // All users are premium or lapsed logic handled at a higher level
  return children;
}
