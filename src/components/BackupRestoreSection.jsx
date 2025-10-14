import React from 'react';
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
  isPremiumUser,
  handleExportJSON,
  handleImport,
  handleImportCloud,
  db,
}) {
  return (
    <Box maxW="600px" mx="auto" p={4}>
      <Heading size="md" mb={4}>
        Backup & Restore
      </Heading>
      <Box>
        <Box mb={6} p={4} borderWidth={1} borderRadius="md" bg="gray.50">
          <Flex align="center" mb={2} gap={2}>
            <Text fontWeight="bold">Cloud Backup & Restore</Text>
          </Flex>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Sync your library to the cloud and restore it on any device.
          </Text>
          {!user && (
            <Alert status="info" mb={2} borderRadius="md">
              <AlertIcon />
              Sign in to unlock cloud sync options.
            </Alert>
          )}
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <Button
              colorScheme="purple"
              onClick={handleExportJSON}
              isDisabled={!user}
              aria-label="Export cloud backup"
            >
              Export Cloud Backup
            </Button>
            <Button
              colorScheme="purple"
              variant="outline"
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
        <Divider my={6} />
        <Box mb={6} p={4} borderWidth={1} borderRadius="md" bg="white">
          <Flex align="center" mb={2} gap={2}>
            <Text fontWeight="bold">Local Backup & Restore</Text>
          </Flex>
          <Text fontSize="sm" color="gray.600" mb={2}>
            Export or import your library to your device. Works offline and for
            all users.
          </Text>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <Button
              colorScheme="gray"
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
        <Divider my={6} />
      </Box>
    </Box>
  );
}

export default BackupRestoreSection;
