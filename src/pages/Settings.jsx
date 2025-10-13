import {
  Box,
  Stack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Select,
  Button,
  Switch,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
// ...existing code...
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import db from '../firebase/db';
// ...existing code...
import { exportUserData, importUserData } from '../firebase/db';
import BackupRestoreSection from '../components/BackupRestoreSection';
import AdminPanel from '../components/AdminPanel';
import DeleteAccountButton from '../components/DeleteAccountButton';

export default function Settings({ onBooksChanged }) {
  const { user } = useAuth();
  const isPremiumUser = true; // All users are premium in paid/early access
  const [isAdmin, setIsAdmin] = useState(false);
  const toast = useToast();
  const [lang, setLang] = useState('en');
  const [sort, setSort] = useState('recent');
  const fileInputRef = useRef();

  // Fetch admin flag from Firestore (premium is always true)
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const fetchFlags = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setIsAdmin(!!data.admin);
        }
      } catch (e) {
        setIsAdmin(false);
      }
    };
    fetchFlags();
  }, [user]);

  useEffect(() => {
    const savedLang = localStorage.getItem('settings:lang');
    if (savedLang) setLang(savedLang);
    const savedSort = localStorage.getItem('settings:sort');
    if (savedSort) setSort(savedSort);
  }, []);

  useEffect(() => {
    localStorage.setItem('settings:lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('settings:sort', sort);
  }, [sort]);

  const handleLangChange = (e) => {
    const lng = e.target.value;
    setLang(lng);
  };

  return (
    <Box
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
      maxW={{ base: '480px', md: '700px' }}
      mx="auto"
    >
      <Heading as="h1" size="lg" mb={6}>
        Settings
      </Heading>
      <Stack spacing={{ base: 8, md: 12 }}>
        {/* General Section */}
        <Box
          borderWidth="1px"
          borderRadius="md"
          p={{ base: 4, md: 8 }}
          bg="gray.50"
        >
          <Heading as="h2" size="sm" mb={4} color="red.600">
            General
          </Heading>
          <Stack spacing={{ base: 4, md: 6 }}>
            <FormControl>
              <FormLabel htmlFor="lang-select">Language</FormLabel>
              <Select
                id="lang-select"
                value={lang}
                onChange={handleLangChange}
                maxW="240px"
                aria-label="Language selector"
                size="md"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
              </Select>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Change the app language.
              </Text>
            </FormControl>
            <FormControl>
              <FormLabel htmlFor="default-sort-select">Default Sort</FormLabel>
              <Select
                id="default-sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                maxW="240px"
                aria-label="Default sort order"
                size="md"
              >
                <option value="recent">Recently Added</option>
                <option value="title">Title (A-Z)</option>
                <option value="author">Author (A-Z)</option>
                <option value="spice">Spice Level</option>
                <option value="rating">Rating</option>
              </Select>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Choose how books are sorted by default.
              </Text>
            </FormControl>
          </Stack>
        </Box>
        {/* Backup & Restore Section */}
        <BackupRestoreSection
          user={user}
          isPremiumUser={true}
          toast={toast}
          onBooksChanged={onBooksChanged}
        />
        {/* Delete Account Button (all users) */}
        <DeleteAccountButton />
        {/* Admin Panel (only for admins) */}
        {isAdmin && <AdminPanel />}
      </Stack>
    </Box>
  );
}
