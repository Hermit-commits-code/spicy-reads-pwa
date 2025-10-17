import React, { useState } from 'react';
import {
  Box,
  Heading,
  Stack,
  Text,
  Button,
  Switch,
  HStack,
  useToast,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react';
import { db } from '../../utils/db';

export default function DataBackupsSection({ onRestore }) {
  const toast = useToast();
  const [autoBackup, setAutoBackup] = useState(false);
  const [creating, setCreating] = useState(false);
  const [backups, setBackups] = useState([]);
  const [frequencyMinutes, setFrequencyMinutes] = useState(60);
  const [timerId, setTimerId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBackup, setSelectedBackup] = useState(null);
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const [selectedDeleteBackup, setSelectedDeleteBackup] = useState(null);
  const [prevSnapshot, setPrevSnapshot] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [retentionCount, setRetentionCount] = useState(10);
  const [pruneTimer, setPruneTimer] = useState(null);
  const [lastPruneAt, setLastPruneAt] = useState(null);

  const handleExport = async () => {
    setCreating(true);
    try {
      const books = await db.books.toArray();
      const lists = db.lists ? await db.lists.toArray() : [];
      const listBooks = db.listBooks ? await db.listBooks.toArray() : [];
      const data = { books, lists, listBooks };
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spicy-reads-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Backup exported', status: 'success' });
      // Also save to local backups store
      try {
        const id = await db.backups.add({
          createdAt: new Date().toISOString(),
          data,
        });
        // enforce retention policy after adding
        try {
          await pruneBackups(retentionCount);
        } catch (e) {
          // non-fatal
        }
        loadBackups();
        // return id in case caller wants it (not used here)
        id;
      } catch (err) {
        // non-fatal
      }
    } catch (e) {
      toast({
        title: 'Export failed',
        status: 'error',
        description: e.message,
      });
    }
    setCreating(false);
  };

  const loadBackups = async () => {
    try {
      const list = await db.backups.orderBy('createdAt').reverse().toArray();
      // filter out transient undo snapshots
      const visible = list.filter((b) => !(b.meta && b.meta.undoSnapshot));
      setBackups(visible);
    } catch (e) {
      // ignore
    }
  };

  const pruneBackups = async (keep = 10) => {
    if (!keep || keep <= 0) return; // keep all
    try {
      const all = await db.backups.orderBy('createdAt').reverse().toArray();
      if (all.length <= keep) return;
      const toDelete = all.slice(keep);
      await Promise.all(toDelete.map((b) => db.backups.delete(b.id)));
      const now = new Date().toISOString();
      setLastPruneAt(now);
      try {
        await db.settings.put({
          key: 'backupLastPrune',
          value: JSON.stringify({ at: now }),
        });
      } catch (e) {
        // ignore
      }
      toast({ title: 'Prune complete', status: 'success' });
    } catch (e) {
      toast({ title: 'Prune failed', status: 'error' });
    }
  };

  // Remove transient undo snapshots older than 24 hours
  const cleanupOldUndoSnapshots = async () => {
    try {
      const all = await db.backups.orderBy('createdAt').reverse().toArray();
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      const old = all.filter(
        (b) =>
          b.meta &&
          b.meta.undoSnapshot &&
          new Date(b.createdAt).getTime() < cutoff,
      );
      if (old.length)
        await Promise.all(old.map((b) => db.backups.delete(b.id)));
    } catch (e) {
      // ignore
    }
  };

  const saveAutoBackupSetting = async (val) => {
    try {
      await db.settings.put({
        key: 'autoBackup',
        value: JSON.stringify({ enabled: val, frequencyMinutes }),
      });
    } catch (e) {
      // ignore
    }
  };

  // Simple scheduler while the app is open
  React.useEffect(() => {
    loadBackups();
    let mounted = true;
    (async function loadSetting() {
      try {
        const s = await db.settings.where('key').equals('autoBackup').first();
        if (s && mounted) {
          const v = JSON.parse(s.value);
          setAutoBackup(!!v.enabled);
          if (v.frequencyMinutes) setFrequencyMinutes(v.frequencyMinutes);
        }
        // load retention setting
        const r = await db.settings
          .where('key')
          .equals('backupRetention')
          .first();
        if (r && mounted) {
          const rv = JSON.parse(r.value);
          if (rv && typeof rv.keepLast === 'number')
            setRetentionCount(rv.keepLast);
        }
        // load last prune timestamp
        const p = await db.settings
          .where('key')
          .equals('backupLastPrune')
          .first();
        if (p && mounted) {
          const pv = JSON.parse(p.value);
          if (pv && pv.at) setLastPruneAt(pv.at);
        }
      } catch (e) {
        // ignore
      }
    })();

    return () => {
      mounted = false;
      if (timerId) clearInterval(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    saveAutoBackupSetting(autoBackup);
    if (timerId) clearInterval(timerId);
    if (autoBackup) {
      const id = setInterval(() => {
        // create backup
        handleExport();
      }, Math.max(1000 * 60, frequencyMinutes * 60 * 1000));
      setTimerId(id);
    }
    return () => {
      if (timerId) clearInterval(timerId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoBackup, frequencyMinutes]);

  // Run prune when retentionCount changes (debounced)
  React.useEffect(() => {
    if (pruneTimer) clearTimeout(pruneTimer);
    const t = setTimeout(() => {
      pruneBackups(retentionCount).then(() => loadBackups());
    }, 1000);
    setPruneTimer(t);
    return () => {
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retentionCount]);

  const saveRetentionSetting = async (keep) => {
    try {
      await db.settings.put({
        key: 'backupRetention',
        value: JSON.stringify({ keepLast: keep }),
      });
    } catch (e) {
      // ignore
    }
  };

  const handleRestoreBackup = async (backup) => {
    // Open confirmation modal with preview
    setSelectedBackup(backup);
    onOpen();
  };

  const handleDeleteBackup = async (id) => {
    // open confirm modal for deletion
    const b = backups.find((x) => x.id === id) || { id };
    setSelectedDeleteBackup(b);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!selectedDeleteBackup) return;
    try {
      await db.backups.delete(selectedDeleteBackup.id);
      loadBackups();
      onDeleteClose();
      toast({ title: 'Backup deleted', status: 'success' });
    } catch (e) {
      toast({ title: 'Delete failed', status: 'error' });
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      // show preview and confirm before applying
      setSelectedBackup({ createdAt: new Date().toISOString(), data });
      onOpen();
    } catch (err) {
      toast({
        title: 'Import failed',
        status: 'error',
        description: err.message,
      });
    }
  };

  const takeSnapshot = async () => {
    try {
      const books = await db.books.toArray();
      const lists = db.lists ? await db.lists.toArray() : [];
      const listBooks = db.listBooks ? await db.listBooks.toArray() : [];
      return { books, lists, listBooks };
    } catch (e) {
      return { books: [], lists: [], listBooks: [] };
    }
  };

  const applyData = async (data) => {
    // If page provided an onRestore handler, prefer that; otherwise apply locally
    if (onRestore) return onRestore(data);
    // local application
    if (!data) return;
    const books = data.books || [];
    const lists = data.lists || [];
    const listBooks = data.listBooks || [];
    // overwrite local stores
    try {
      await db.transaction('rw', db.books, db.lists, db.listBooks, async () => {
        if (db.books) {
          await db.books.clear();
          if (books.length) await db.books.bulkAdd(books);
        }
        if (db.lists) {
          await db.lists.clear();
          if (lists.length) await db.lists.bulkAdd(lists);
        }
        if (db.listBooks) {
          await db.listBooks.clear();
          if (listBooks.length) await db.listBooks.bulkAdd(listBooks);
        }
      });
    } catch (e) {
      throw e;
    }
  };

  const confirmRestore = async () => {
    if (!selectedBackup) return;
    setRestoring(true);
    try {
      // capture previous snapshot for undo
      const prev = await takeSnapshot();
      // persist undo snapshot to backups with meta flag
      let undoId = null;
      try {
        undoId = await db.backups.add({
          createdAt: new Date().toISOString(),
          data: prev,
          meta: { undoSnapshot: true },
        });
      } catch (e) {
        // ignore
      }
      await applyData(selectedBackup.data);
      // refresh any UI
      loadBackups();
      onClose();
      // show toast with undo option
      toast({
        position: 'bottom-right',
        duration: 10000,
        render: ({ onClose: onToastClose }) => (
          <Box p={3} bg="gray.800" color="white" borderRadius="md">
            <HStack justify="space-between">
              <Text>Backup restored</Text>
              <HStack>
                <Button
                  size="sm"
                  onClick={async () => {
                    try {
                      // attempt to load persisted undo snapshot if available
                      if (undoId) {
                        const doc = await db.backups.get(undoId);
                        if (doc && doc.data) {
                          await applyData(doc.data);
                          onToastClose();
                          toast({ title: 'Undo complete', status: 'success' });
                          return;
                        }
                      }
                      // fallback to in-memory prev if available
                      if (prev) {
                        await applyData(prev);
                        onToastClose();
                        toast({ title: 'Undo complete', status: 'success' });
                        return;
                      }
                      onToastClose();
                      toast({ title: 'Undo unavailable', status: 'warning' });
                    } catch (err) {
                      onToastClose();
                      toast({ title: 'Undo failed', status: 'error' });
                    }
                  }}
                >
                  Undo
                </Button>
              </HStack>
            </HStack>
          </Box>
        ),
      });
    } catch (e) {
      toast({
        title: 'Restore failed',
        status: 'error',
        description: e.message,
      });
    }
    setRestoring(false);
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
      <Heading as="h2" size="md" mb={5} color="red.600">
        Data & Backups
      </Heading>
      <Stack spacing={4}>
        <Text fontSize="sm" color="gray.600">
          Export and import your library. Local exports download a JSON file you
          can store anywhere.
        </Text>
        <HStack spacing={3}>
          <Button
            colorScheme="gray"
            onClick={handleExport}
            isLoading={creating}
          >
            Export Local Backup
          </Button>
          <Button as="label" variant="outline">
            Import Local Backup
            <input
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleImport}
            />
          </Button>
        </HStack>
        <HStack align="center" justify="space-between">
          <Text>Automatic local backups</Text>
          <HStack>
            <Switch
              isChecked={autoBackup}
              onChange={(e) => setAutoBackup(e.target.checked)}
            />
            <Text fontSize="sm">Every</Text>
            <input
              type="number"
              min={1}
              value={frequencyMinutes}
              onChange={(e) =>
                setFrequencyMinutes(Number(e.target.value || 60))
              }
              style={{ width: 72 }}
            />
            <Text fontSize="sm">minutes</Text>
          </HStack>
        </HStack>
        <HStack align="center" justify="space-between">
          <Text>Retention (keep last N backups)</Text>
          <HStack>
            <input
              type="number"
              min={0}
              value={retentionCount}
              onChange={(e) => {
                const v = Number(e.target.value || 0);
                setRetentionCount(v);
                saveRetentionSetting(v);
              }}
              style={{ width: 80 }}
            />
            <Text fontSize="sm">(0 = keep all)</Text>
            <Button
              size="sm"
              variant="outline"
              onClick={() => pruneBackups(retentionCount)}
            >
              Prune now
            </Button>
          </HStack>
          <Box>
            {lastPruneAt && (
              <Text fontSize="xs" color="gray.500">
                Last prune: {new Date(lastPruneAt).toLocaleString()}
              </Text>
            )}
          </Box>
        </HStack>
        <Box>
          <Text fontSize="sm" fontWeight="semibold">
            Recent Backups
          </Text>
          <Stack spacing={2} mt={2}>
            {backups.length === 0 && (
              <Text fontSize="sm" color="gray.500">
                No backups yet
              </Text>
            )}
            {backups.map((b) => (
              <HStack key={b.id} justify="space-between">
                <Text fontSize="sm">
                  {new Date(b.createdAt).toLocaleString()}
                </Text>
                <HStack>
                  <Button size="sm" onClick={() => handleRestoreBackup(b)}>
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteBackup(b.id)}
                  >
                    Delete
                  </Button>
                </HStack>
              </HStack>
            ))}
          </Stack>
        </Box>
        {/* Confirmation modal for restore/import preview */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Confirm restore</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedBackup ? (
                <Stack spacing={3}>
                  <Text fontSize="sm">
                    This will replace your local library with the backup from{' '}
                    <strong>
                      {selectedBackup.createdAt
                        ? new Date(selectedBackup.createdAt).toLocaleString()
                        : 'imported file'}
                    </strong>
                    .
                  </Text>
                  <Text fontSize="sm" fontWeight="semibold">
                    Preview
                  </Text>
                  <Text fontSize="sm">
                    Books: {selectedBackup.data?.books?.length || 0}
                  </Text>
                  <Text fontSize="sm">
                    Lists: {selectedBackup.data?.lists?.length || 0}
                  </Text>
                  <Text fontSize="sm">
                    List items: {selectedBackup.data?.listBooks?.length || 0}
                  </Text>
                </Stack>
              ) : (
                <Text>No backup selected</Text>
              )}
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onClose} variant="ghost">
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmRestore}
                isLoading={restoring}
              >
                Restore backup
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {/* Delete confirmation modal */}
        <Modal isOpen={isDeleteOpen} onClose={onDeleteClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete backup</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete the backup from{' '}
                <strong>
                  {selectedDeleteBackup?.createdAt
                    ? new Date(selectedDeleteBackup.createdAt).toLocaleString()
                    : 'this backup'}
                </strong>
                ? This action cannot be undone.
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onDeleteClose} variant="ghost">
                Cancel
              </Button>
              <Button colorScheme="red" onClick={confirmDelete}>
                Delete backup
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Stack>
    </Box>
  );
}
