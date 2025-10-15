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
import {
  saveCloudBackup,
  listCloudBackups,
  deleteCloudBackup,
} from '../firebase/cloudBackup';
import { restoreFromBackup } from '../utils/restoreFromBackup';
import { exportUserData } from '../firebase/db';

export default function CloudBackupSection({ user, toast, onBooksChanged }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const handleRestore = async (backup) => {
    if (!user) return;
    setRestoringId(backup.id);
    try {
      await restoreFromBackup(user, backup, toast, onBooksChanged);
    } catch (e) {
      toast({ title: 'Restore failed: ' + e.message, status: 'error' });
    }
    setRestoringId(null);
  };

  const fetchBackups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const list = await listCloudBackups(user.uid);
      setBackups(
        list.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds),
      );
    } catch (e) {
      toast({ title: 'Failed to load backups', status: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBackups();
    // eslint-disable-next-line
  }, [user]);

  const handleBackup = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const data = await exportUserData(user.uid);
      await saveCloudBackup(user.uid, data);
      toast({ title: 'Cloud backup saved!', status: 'success' });
      fetchBackups();
    } catch (e) {
      toast({ title: 'Backup failed: ' + e.message, status: 'error' });
    }
    setSaving(false);
  };

  const handleDownload = (backup) => {
    const blob = new Blob([JSON.stringify(backup.data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spicy-reads-cloud-backup-${new Date(
      backup.createdAt.seconds * 1000,
    )
      .toISOString()
      .slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (backupId) => {
    if (!user) return;
    try {
      await deleteCloudBackup(user.uid, backupId);
      toast({ title: 'Backup deleted', status: 'info' });
      fetchBackups();
    } catch (e) {
      toast({ title: 'Delete failed: ' + e.message, status: 'error' });
    }
  };

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
        <Button colorScheme="purple" onClick={handleBackup} isLoading={saving}>
          Save Cloud Backup
        </Button>
        {loading ? (
          <Spinner />
        ) : backups.length === 0 ? (
          <Text color="gray.500">No cloud backups yet.</Text>
        ) : (
          <Stack spacing={2}>
            {backups.map((backup) => (
              <HStack
                key={backup.id}
                justify="space-between"
                p={2}
                borderWidth={1}
                borderRadius="md"
                bg="white"
              >
                <Text fontSize="sm">
                  {new Date(backup.createdAt.seconds * 1000).toLocaleString()}
                </Text>
                <HStack>
                  <IconButton
                    icon={<RepeatIcon />}
                    aria-label="Restore backup"
                    size="sm"
                    colorScheme="green"
                    isLoading={restoringId === backup.id}
                    onClick={() => handleRestore(backup)}
                  />
                  <IconButton
                    icon={<DownloadIcon />}
                    aria-label="Download backup"
                    size="sm"
                    onClick={() => handleDownload(backup)}
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete backup"
                    size="sm"
                    colorScheme="red"
                    onClick={() => handleDelete(backup.id)}
                  />
                </HStack>
              </HStack>
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
