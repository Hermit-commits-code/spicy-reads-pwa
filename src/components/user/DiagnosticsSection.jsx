import React from 'react';
import {
  Box,
  Heading,
  Stack,
  Button,
  Text,
  useToast,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { db } from '../../utils/db';

export default function DiagnosticsSection() {
  const toast = useToast();
  const [savedDiagnostics, setSavedDiagnostics] = React.useState([]);

  const buildDiagnostics = async () => {
    const booksCount = (db.books && (await db.books.count())) || 0;
    const listsCount = (db.lists && (await db.lists.count())) || 0;
    const backupsCount = (db.backups && (await db.backups.count())) || 0;
    const usersCount = (db.users && (await db.users.count())) || 0;
    const settings = (await db.settings.toArray()).map((s) => ({ key: s.key }));
    return {
      timestamp: new Date().toISOString(),
      booksCount,
      listsCount,
      backupsCount,
      usersCount,
      settings,
      ua: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };
  };

  const exportDiagnostics = async () => {
    try {
      const diag = await buildDiagnostics();
      const blob = new Blob([JSON.stringify(diag, null, 2)], {
        type: 'application/json',
      });

      // Attempt download; if blocked (e.g. in some browsers) fall back to saving locally
      try {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `spicy-reads-diagnostics-${new Date()
          .toISOString()
          .slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast({ title: 'Diagnostics exported', status: 'success' });
      } catch (err) {
        // Persist to backups for later download
        await db.backups.add({
          createdAt: new Date().toISOString(),
          data: diag,
          meta: { diagnostics: true },
        });
        toast({ title: 'Diagnostics saved locally', status: 'success' });
        await loadSavedDiagnostics();
      }
    } catch (e) {
      console.error('exportDiagnostics error', e);
      toast({ title: 'Export failed', status: 'error' });
    }
  };

  const loadSavedDiagnostics = async () => {
    try {
      // Simpler: load all backups and filter client-side for meta.diagnostics
      const all = await db.backups.toArray();
      const items = all.filter((it) => it && it.meta && it.meta.diagnostics);
      // sort by createdAt desc
      items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      setSavedDiagnostics(items);
    } catch (e) {
      console.error('loadSavedDiagnostics', e);
      setSavedDiagnostics([]);
    }
  };

  React.useEffect(() => {
    loadSavedDiagnostics();
  }, []);

  const downloadSavedDiagnostic = async (item) => {
    try {
      const blob = new Blob([JSON.stringify(item.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spicy-reads-diagnostics-${item.createdAt}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: 'Downloaded', status: 'success' });
    } catch (e) {
      console.error('downloadSavedDiagnostic', e);
      toast({ title: 'Download failed', status: 'error' });
    }
  };

  const deleteSavedDiagnostic = async (id) => {
    try {
      await db.backups.delete(id);
      toast({ title: 'Saved diagnostic deleted', status: 'success' });
      await loadSavedDiagnostics();
    } catch (e) {
      console.error('deleteSavedDiagnostic', e);
      toast({ title: 'Delete failed', status: 'error' });
    }
  };

  const resetAppData = async () => {
    const ok = window.confirm(
      'Reset all local app data? This cannot be undone.',
    );
    if (!ok) return;
    try {
      await db.delete();
      localStorage.clear();
      toast({ title: 'Local data cleared. Reloading...', status: 'success' });
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      console.error('resetAppData', e);
      toast({ title: 'Reset failed', status: 'error' });
    }
  };

  const sendFeedback = () => {
    window.location.href = `mailto:hello@spicyreads.app?subject=${encodeURIComponent(
      'Spicy Reads feedback',
    )}`;
  };

  return (
    <Box
      p={6}
      borderWidth={1}
      borderRadius="lg"
      bg="white"
      boxShadow="sm"
      maxW="640px"
      mx="auto"
      w="100%"
    >
      <Heading as="h2" size="md" mb={5} color="red.600">
        Diagnostics & Support
      </Heading>
      <Stack spacing={4}>
        <Text fontSize="sm" color="gray.600">
          Export diagnostic data for troubleshooting or reset local app data.
        </Text>
        <HStack>
          <Button onClick={exportDiagnostics} aria-label="Export diagnostics">
            Export Diagnostics
          </Button>
          <Button
            variant="link"
            onClick={() => window.open('/privacy', '_blank')}
          >
            Privacy Policy
          </Button>
        </HStack>

        <VStack align="stretch" spacing={2}>
          <Text fontSize="xs" color="gray.500">
            If offline, exported diagnostics will be saved locally in your
            browser and you can download them later.
          </Text>
          <Text fontSize="xs" color="gray.500">
            Backups stored locally:{' '}
            {db.backups ? 'available' : 'not configured'}
          </Text>
        </VStack>

        <Box mt={3}>
          <Text fontSize="sm" fontWeight="semibold">
            Saved diagnostics
          </Text>
          {savedDiagnostics.length === 0 ? (
            <Text fontSize="sm" color="gray.500" mt={2}>
              No saved diagnostics
            </Text>
          ) : (
            savedDiagnostics.map((s) => (
              <HStack key={s.id} justify="space-between" mt={2}>
                <Text fontSize="sm">
                  {new Date(s.createdAt).toLocaleString()}
                </Text>
                <HStack>
                  <Button
                    size="sm"
                    onClick={() => downloadSavedDiagnostic(s)}
                    aria-label={`Download diagnostic ${s.id}`}
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteSavedDiagnostic(s.id)}
                    aria-label={`Delete diagnostic ${s.id}`}
                  >
                    Delete
                  </Button>
                </HStack>
              </HStack>
            ))
          )}
        </Box>

        <HStack pt={4} spacing={3}>
          <Button variant="outline" onClick={resetAppData} colorScheme="red">
            Reset App Data
          </Button>
          <Button variant="ghost" onClick={sendFeedback}>
            Send Feedback / Report Bug
          </Button>
        </HStack>
      </Stack>
    </Box>
  );
}
