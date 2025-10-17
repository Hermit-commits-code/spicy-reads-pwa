import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Stack,
  Text,
  Spinner,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { DeleteIcon, DownloadIcon, RepeatIcon } from '@chakra-ui/icons';
// import {
//   saveCloudBackup,
//   listCloudBackups,
//   deleteCloudBackup,
// } from '../firebase/cloudBackup';
// import { exportUserData } from '../firebase/db';
// Cloud backups have been disabled per user request.
// This component is retained as a placeholder in case the feature is re-enabled.
// import { exportUserData } from '../firebase/db';

export default function CloudBackupSection({ user, toast, onBooksChanged }) {
  // cloud backups are disabled; placeholder component

  return (
    <Box
      p={6}
      borderWidth={1}
      borderRadius="lg"
      bg="white"
      boxShadow="sm"
      maxW="600px"
      mx="auto"
      w="100%"
    >
      <Stack spacing={4}>
        <Text color="gray.600">Cloud backups are disabled.</Text>
        <Text fontSize="sm" color="gray.500">
          This feature was removed. If you'd like to re-enable cloud backups in
          the future, contact the dev or re-enable the provider integration.
        </Text>
      </Stack>
    </Box>
  );
}
