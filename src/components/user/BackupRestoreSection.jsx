import React from 'react';
import { db } from '../../utils/db';
import {
  Box,
  Heading,
  Stack,
  Text,
  Button,
  Badge,
  Tooltip,
  Divider,
  Alert,
  AlertIcon,
  Flex,
} from '@chakra-ui/react';

function BackupRestoreSection({
  user,
  handleExportJSON,
  handleImport,
  handleImportCloud,
}) {
  return (
    <Stack spacing={8}>
      <Box
        p={6}
        borderWidth={1}
        borderRadius="lg"
        bg="white"
        boxShadow="sm"
        maxW="600px"
        mx="auto"
      >
        <Flex align="center" mb={3} gap={2}>
          <Text fontWeight="bold" fontSize="lg">
            Cloud Backup & Restore
          </Text>
        </Flex>
        <Text fontSize="sm" color="gray.600" mb={3}>
          Sync your library to the cloud and restore it on any device.
        </Text>
        {!user && (
          <Alert status="info" mb={3} borderRadius="md">
            <AlertIcon />
            Sign in to unlock cloud sync options.
          </Alert>
        )}
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          align="center"
          justify="center"
        >
          <Button
            colorScheme="purple"
            w={{ base: '100%', md: '220px' }}
            onClick={handleExportJSON}
            isDisabled={!user}
            aria-label="Export cloud backup"
          >
            Export Cloud Backup
          </Button>
          <Button
            colorScheme="purple"
            variant="outline"
            w={{ base: '100%', md: '220px' }}
            as="label"
            htmlFor="cloud-import-file"
            isDisabled={!user}
            aria-label="Import cloud backup"
          >
            Import Cloud Backup
            <input
              id="cloud-import-file"
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleImportCloud}
              aria-label="Import cloud backup"
            />
          </Button>
        </Stack>
      </Box>
      <Box
        p={6}
        borderWidth={1}
        borderRadius="lg"
        bg="white"
        boxShadow="sm"
        maxW="600px"
        mx="auto"
      >
        <Flex align="center" mb={3} gap={2}>
          <Text fontWeight="bold" fontSize="lg">
            Local Backup & Restore
          </Text>
        </Flex>
        <Text fontSize="sm" color="gray.600" mb={3}>
          Export or import your library to your device. Works offline and for
          all users.
        </Text>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          align="center"
          justify="center"
        >
          <Button
            colorScheme="gray"
            w={{ base: '100%', md: '220px' }}
            onClick={async () => {
              const books = await db.books.toArray();
              const lists = await db.lists.toArray();
              const listBooks = await db.listBooks.toArray();
              const data = { books, lists, listBooks };
              const blob = new Blob([JSON.stringify(data, null, 2)], {
                type: 'application/json',
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `velvet-volumes-backup-${new Date()
                .toISOString()
                .slice(0, 10)}.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
            aria-label="Export local backup"
          >
            Export Local Backup
          </Button>
          <Button
            colorScheme="gray"
            variant="outline"
            w={{ base: '100%', md: '220px' }}
            as="label"
            htmlFor="local-import-file"
            aria-label="Import local backup"
          >
            Import Local Backup
            <input
              id="local-import-file"
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleImport}
              aria-label="Import local backup"
            />
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
}

export default BackupRestoreSection;
