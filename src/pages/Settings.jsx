import {
  Box,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Select,
  useToast,
  Button,
  Text,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import OnboardingModal from '../components/OnboardingModal';
import BackupRestoreSection from '../components/BackupRestoreSection';
import CloudBackupSection from '../components/CloudBackupSection';
import AdminPanel from '../components/AdminPanel';
import DeleteAccountButton from '../components/DeleteAccountButton';
import AuthModal from '../components/AuthModal';
// import GreetingBar from '../components/GreetingBar';
import { useSettingsLogic } from './SettingsLogic';
import {
  requestNotificationPermission,
  registerServiceWorker,
} from '../utils/pushNotifications';
import { useState } from 'react';

export default function Settings({ onBooksChanged }) {
  const { user: rawUser, signOut } = useAuth();
  // TEMP: Add a premium flag for demo; replace with real premium check
  const user = rawUser
    ? { ...rawUser, premium: rawUser?.premium ?? true }
    : null;
  const [authModalOpen, setAuthModalOpen] = useState(false);
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
  const [notifStatus, setNotifStatus] = useState(null);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  const handleEnableNotifications = async () => {
    const reg = await registerServiceWorker();
    const result = await requestNotificationPermission();
    setNotifStatus(result.granted ? 'enabled' : `denied (${result.reason})`);
    toast({
      title: result.granted ? 'Notifications enabled!' : 'Notifications denied',
      status: result.granted ? 'success' : 'error',
    });
  };

  // Show onboarding tour button if completed
  const onboardingComplete =
    localStorage.getItem('onboardingComplete') === 'true';

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
      {/* Gold-standard: Show Sign In button if not logged in */}
      {!user && (
        <Box textAlign="center" mb={6}>
          <Button
            colorScheme="red"
            size="lg"
            onClick={() => setAuthModalOpen(true)}
          >
            Sign In
          </Button>
        </Box>
      )}
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
          {/* Gold-standard sign out button for logged-in users */}
          <Button
            colorScheme="gray"
            variant="outline"
            size="md"
            mt={3}
            onClick={signOut}
            leftIcon={<i className="fi fi-rr-sign-out" />}
          >
            Sign Out
          </Button>
        </Box>
      )}
      {user && (
        <Stack spacing={{ base: 10, md: 14 }}>
          {/* Onboarding Tour Button */}
          {onboardingComplete && (
            <Box textAlign="center">
              <Button
                colorScheme="purple"
                variant="outline"
                onClick={() => setOnboardingOpen(true)}
              >
                Show Onboarding Tour
              </Button>
            </Box>
          )}
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
                <FormLabel htmlFor="default-sort-select">
                  Default Sort
                </FormLabel>
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
          {/* Push Notifications Section (Premium Only) */}
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
              color="purple.600"
              fontWeight="bold"
              letterSpacing="tight"
            >
              Push Notifications
            </Heading>
            {user.premium ? (
              <>
                <Button
                  colorScheme="purple"
                  onClick={handleEnableNotifications}
                  mb={3}
                >
                  Enable Push Notifications
                </Button>
                {notifStatus && (
                  <Text
                    fontSize="sm"
                    color={notifStatus === 'enabled' ? 'green.600' : 'red.600'}
                  >
                    Status: {notifStatus}
                  </Text>
                )}
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Get reminders for reading, backups, and goals. You can manage
                  notification permissions in your browser settings.
                </Text>
              </>
            ) : (
              <Text fontSize="md" color="gray.500" mt={2}>
                <b>Premium required:</b> Push notifications are available for
                premium users only.
              </Text>
            )}
          </Box>
          {/* Delete Account Button (all users) */}
          <DeleteAccountButton />
          {/* Admin Panel (only for admins) */}
          {isAdmin && <AdminPanel />}
        </Stack>
      )}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        onSetDisplayName={() => {}}
        initialDisplayName={user?.displayName || ''}
        onComplete={() => setOnboardingOpen(false)}
      />
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </Box>
  );
}
