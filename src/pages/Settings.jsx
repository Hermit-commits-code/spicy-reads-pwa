import {
  Box,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Button,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import BackupRestoreSection from '../components/BackupRestoreSection';
import CloudBackupSection from '../components/CloudBackupSection';
import AdminPanel from '../components/AdminPanel';
import DeleteAccountButton from '../components/DeleteAccountButton';
// import GreetingBar from '../components/GreetingBar';
import { useSettingsLogic } from './SettingsLogic';

export default function Settings({ onBooksChanged }) {
  const { user } = useAuth();
  const toast = useToast();
  const {
    lang,
    setLang,
    sort,
    setSort,
    isAdmin,
    firestoreDisplayName,
    handleLangChange,
    handleImport,
    handleExportCloud,
  } = useSettingsLogic({ user, onBooksChanged, toast });

  return (
    <Box
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
      maxW={{ base: '480px', md: '700px' }}
      mx="auto"
    >
      <Heading
        as="h1"
        size="lg"
        mb={2}
        fontWeight="extrabold"
        letterSpacing="tight"
      >
        Settings
      </Heading>
      {/* Gold-standard greeting under Settings title */}
      {user && (
        <Box mb={6}>
          <Heading as="h2" size="md" fontWeight="semibold" color="gray.700">
            {firestoreDisplayName
              ? `${firestoreDisplayName}, what would you like to do?`
              : user.displayName
              ? `${user.displayName}, what would you like to do?`
              : `${user.email}, what would you like to do?`}
          </Heading>
        </Box>
      )}
      <Stack spacing={{ base: 10, md: 14 }}>
        {/* Debug: Reset onboarding button */}
        {/* General Section */}
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
          <Heading
            as="h2"
            size="md"
            mb={5}
            color="red.600"
            fontWeight="bold"
            letterSpacing="tight"
          >
            General
          </Heading>
          <Stack spacing={{ base: 5, md: 7 }}>
            <FormControl>
              <FormLabel htmlFor="lang-select">Language</FormLabel>
              <Select
                id="lang-select"
                value={lang}
                onChange={handleLangChange}
                aria-label="Language selector"
                size="md"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="default-sort-select">Default Sort</FormLabel>
              <Select
                id="default-sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                aria-label="Default sort order"
                size="md"
              >
                <option value="recent">Recently Added</option>
                <option value="title">Title (A-Z)</option>
                <option value="author">Author (A-Z)</option>
                <option value="spice">Spice Level</option>
                <option value="rating">Rating</option>
              </Select>
            </FormControl>
          </Stack>
        </Box>
        {/* Gold-standard Cloud Backup Section */}
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
          <Heading
            as="h2"
            size="lg"
            mb={6}
            fontWeight="bold"
            letterSpacing="tight"
          >
            Cloud Backup & Restore
          </Heading>
          <CloudBackupSection
            user={user}
            toast={toast}
            onBooksChanged={onBooksChanged}
          />
        </Box>
        {/* Delete Account Button (all users) */}
        <DeleteAccountButton />
        {/* Admin Panel (only for admins) */}
        {isAdmin && <AdminPanel />}
      </Stack>
    </Box>
  );
}
