import React from 'react';
import { VStack, Box, Text, Link as ChakraLink } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';

const adminLinks = [
  { to: '/admin/users', label: 'User Management' },
  { to: '/admin/moderation', label: 'Content Moderation' },
  { to: '/admin/analytics', label: 'Analytics Dashboard' },
  { to: '/admin/system', label: 'System Health' },
  { to: '/admin/controls', label: 'Admin Controls' },
  { to: '/admin/audit', label: 'Audit Log' },
  { to: '/admin/notifications', label: 'Notifications' },
  { to: '/admin/announcements', label: 'Announcements' },
  { to: '/admin/support', label: 'Support Desk' },
];

export default function AdminSidebar() {
  return (
    <Box
      w={{ base: '100%', md: '240px' }}
      bg="gray.50"
      p={4}
      borderRight="1px solid #eee"
      minH="100vh"
    >
      <Text fontWeight="bold" fontSize="lg" mb={6} color="red.600">
        Admin Panel
      </Text>
      <VStack align="stretch" spacing={3}>
        {adminLinks.map((link) => (
          <ChakraLink
            as={NavLink}
            to={link.to}
            key={link.to}
            fontWeight="medium"
            color="gray.700"
            _activeLink={{ color: 'red.600', fontWeight: 'bold' }}
          >
            {link.label}
          </ChakraLink>
        ))}
      </VStack>
    </Box>
  );
}
