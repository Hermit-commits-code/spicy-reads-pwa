import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
} from 'react-router-dom';
import {
  ChakraProvider,
  Box,
  Flex,
  Button,
  IconButton,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { FiLogOut } from 'react-icons/fi';
import { AddIcon } from '@chakra-ui/icons';
import { AiFillHome } from 'react-icons/ai';
import { MdList, MdSettings, MdBarChart } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { useFirestoreDisplayName } from './hooks/useFirestoreDisplayName';
import OnboardingModal from './components/OnboardingModal';
import AuthModal from './components/AuthModal';
import { useAuth } from './context/AuthContext';
import EditBookPage from './pages/EditBookPage';
import Home from './pages/Home';
import Lists from './pages/Lists';
import Settings from './pages/Settings';
import Search from './pages/Search';
import Analytics from './pages/Analytics';
import AddBookModal from './components/AddBookModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import ShareHandler from './components/ShareHandler';
import RecommendationsPage from './pages/Recommendations';
import { getRecommendedBooks } from './utils/recommendations';
import db from './db/booksDB';
import {
  getUserBooks,
  addUserBook,
  updateUserBook,
  deleteUserBook,
  listenToUserBooks,
} from './firebase/db';
import { queueBookUpdate } from './utils/backgroundSync';
import { useTranslation } from 'react-i18next';

function BottomNav() {
  const { t } = useTranslation();
  const navBg = 'white';
  const navBorder = '#eee';
  const iconColor = 'gray.700';
  const activeColor = 'red.500';
  return (
    <Flex
      as="nav"
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      zIndex={100}
      borderTop={`1px solid ${navBorder}`}
      bg={navBg}
      h="60px"
      align="center"
      justify="space-around"
      w="100%"
      role="navigation"
      aria-label={t('main_navigation', 'Main navigation')}
    >
      <NavLink to="/" style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <Button
            variant="ghost"
            flexDir="column"
            alignItems="center"
            size="sm"
            aria-label={t('home')}
            color={isActive ? activeColor : iconColor}
            _hover={{ color: activeColor }}
          >
            <AiFillHome size={24} style={{ marginBottom: 2 }} />
            <Text fontSize="xs">{t('home')}</Text>
          </Button>
        )}
      </NavLink>
      <NavLink to="/search" style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <Button
            variant="ghost"
            flexDir="column"
            alignItems="center"
            size="sm"
            aria-label={t('search')}
            color={isActive ? activeColor : iconColor}
            _hover={{ color: activeColor }}
          >
            <MdList size={24} style={{ marginBottom: 2 }} />
            <Text fontSize="xs">{t('search')}</Text>
          </Button>
        )}
      </NavLink>
      <NavLink to="/lists" style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <Button
            variant="ghost"
            flexDir="column"
            alignItems="center"
            size="sm"
            aria-label={t('lists')}
            color={isActive ? activeColor : iconColor}
            _hover={{ color: activeColor }}
          >
            <MdList size={24} style={{ marginBottom: 2 }} />
            <Text fontSize="xs">{t('lists')}</Text>
          </Button>
        )}
      </NavLink>
      <NavLink to="/analytics" style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <Button
            variant="ghost"
            flexDir="column"
            alignItems="center"
            size="sm"
            aria-label={t('stats')}
            color={isActive ? activeColor : iconColor}
            _hover={{ color: activeColor }}
          >
            <MdBarChart size={24} style={{ marginBottom: 2 }} />
            <Text fontSize="xs">{t('stats')}</Text>
          </Button>
        )}
      </NavLink>
      <NavLink to="/settings" style={{ textDecoration: 'none' }}>
        {({ isActive }) => (
          <Button
            variant="ghost"
            flexDir="column"
            alignItems="center"
            size="sm"
            aria-label={t('settings')}
            color={isActive ? activeColor : iconColor}
            _hover={{ color: activeColor }}
          >
            <MdSettings size={24} style={{ marginBottom: 2 }} />
            <Text fontSize="xs">{t('settings')}</Text>
          </Button>
        )}
      </NavLink>
    </Flex>
  );
}

function FloatingAddBook({ onClick }) {
  return (
    <IconButton
      icon={<AddIcon boxSize={6} />}
      colorScheme="red"
      aria-label="Add Book"
      size="lg"
      borderRadius="full"
      position="fixed"
      bottom="80px"
      right="24px"
      zIndex={200}
      boxShadow="0 4px 16px rgba(0,0,0,0.12)"
      onClick={onClick}
    />
  );
}

function MainLayout() {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const firestoreDisplayName = useFirestoreDisplayName(user);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingDisplayName, setOnboardingDisplayName] = useState('');
  // Show onboarding if user is logged in and onboardingComplete is not set
  useEffect(() => {
    if (user && !localStorage.getItem('onboardingComplete')) {
      setOnboardingOpen(true);
      setOnboardingDisplayName(user.displayName || '');
    }
  }, [user]);

  // Save display name to Firebase Auth and Firestore, then refresh user
  const handleSetDisplayName = async (name) => {
    if (!user || !name) return;
    try {
      console.log('[ONBOARDING] Setting display name to:', name);
      // Update Firebase Auth profile
      if (user.displayName !== name && user.updateProfile) {
        await user.updateProfile({ displayName: name });
        console.log('[ONBOARDING] Updated Auth displayName');
      }
      // Update Firestore user profile
      const { doc, setDoc } = await import('firebase/firestore');
      const { db: firestoreDb } = await import('./firebase/db');
      await setDoc(
        doc(firestoreDb, 'users', user.uid),
        { displayName: name },
        { merge: true },
      );
      console.log(
        '[ONBOARDING] Wrote displayName to Firestore for uid',
        user.uid,
      );
      // Force AuthContext to refresh user
      window.location.reload();
    } catch (e) {
      console.error('[ONBOARDING] Error setting display name:', e);
    }
  };
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addBookOpen, setAddBookOpen] = useState(false);
  const [editBookOpen, setEditBookOpen] = useState(false);
  // Track edit modal open globally
  useEffect(() => {
    window.editBookModalOpen = editBookOpen;
    return () => {
      window.editBookModalOpen = false;
    };
  }, [editBookOpen]);
  const [editBook, setEditBook] = useState(null);
  const [books, setBooks] = useState([]);
  const appBg = 'gray.50';
  const recommended = getRecommendedBooks(books, { max: 20 });

  // Sync books from Firestore if logged in, else use local DB
  useEffect(() => {
    let unsubscribe;
    if (user) {
      unsubscribe = listenToUserBooks(user.uid, (snapshot) => {
        const cloudBooks = [];
        snapshot.forEach((doc) => {
          cloudBooks.push({ id: doc.id, ...doc.data() });
        });
        setBooks(cloudBooks);
      });
    } else {
      db.books.toArray().then(setBooks);
      // Listen for booksChanged event (e.g., after list assignments)
      const handler = async () => {
        setBooks(await db.books.toArray());
      };
      window.addEventListener('booksChanged', handler);
      return () => {
        window.removeEventListener('booksChanged', handler);
      };
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  // Listen for auto-open add book event
  useEffect(() => {
    const handleOpenAddBook = () => {
      setAddBookOpen(true);
    };

    window.addEventListener('openAddBook', handleOpenAddBook);
    return () => window.removeEventListener('openAddBook', handleOpenAddBook);
  }, []);

  const handleAddBook = async (book) => {
    console.log('[DEBUG] handleAddBook called', book);
    console.log('[DEBUG] db instance in App.jsx', db);
    console.log('[DEBUG] db.books in App.jsx', db.books);
    console.log(
      '[DEBUG] db.books methods in App.jsx',
      Object.getOwnPropertyNames(db.books),
    );
    console.log('[DEBUG] user value in handleAddBook:', user);
    const now = new Date().toISOString();
    let firestoreError = null;
    if (user) {
      console.log('[DEBUG] handleAddBook: user branch taken, using Firestore');
      try {
        await addUserBook(user.uid, {
          ...book,
          createdAt: now,
          updatedAt: now,
        });
      } catch (err) {
        firestoreError = err;
        console.error('[DEBUG] Firestore addUserBook error:', err);
      }
    } else {
      console.log('[DEBUG] handleAddBook: local branch taken, using Dexie');
    }
    // Always write to Dexie for local Analytics and offline support
    try {
      const bookToAdd = { ...book, createdAt: now, updatedAt: now };
      if ('id' in bookToAdd) {
        console.log('[DEBUG] Removing id from book before add:', bookToAdd.id);
        delete bookToAdd.id;
      }
      console.log('[DEBUG] before db.books.add', bookToAdd);
      await db.books.add(bookToAdd);
      console.log('[DEBUG] after db.books.add');
    } catch (err) {
      console.error('[DEBUG] Dexie add error:', err);
    }
    const booksArr = await db.books.toArray();
    console.log('[DEBUG] after setBooks, books:', booksArr);
    setBooks(booksArr);
    window.dispatchEvent(new Event('booksChanged'));
    setAddBookOpen(false);
  };

  const handleEditBook = async (book) => {
    if (!editBook) return;
    const now = new Date().toISOString();
    // Preserve cover unless user changed it (empty string means remove)
    const coverToSave =
      book.cover !== undefined && book.cover !== ''
        ? book.cover
        : editBook.cover || '';
    const bookToSave = {
      ...editBook,
      ...book,
      cover: coverToSave,
      updatedAt: now,
    };
    if (user) {
      try {
        await updateUserBook(user.uid, editBook.id, bookToSave);
      } catch (err) {
        // If offline or error, queue for background sync
        queueBookUpdate({ bookId: editBook.id, book: bookToSave });
      }
    } else {
      await db.books.update(editBook.id, bookToSave);
      setBooks(await db.books.toArray());
    }
    setTimeout(() => {
      setEditBookOpen(false);
      setEditBook(null);
      // Prevent details modal from opening after edit
      if (window.editBookModalOpen) window.editBookModalOpen = false;
      if (document.activeElement) document.activeElement.blur();
      // Notify Home page to block details modal
      window.dispatchEvent(new Event('editBookModalClosed'));
    }, 100);
  };

  const handleDeleteBook = async (bookId) => {
    if (user) {
      await deleteUserBook(user.uid, bookId);
    } else {
      await db.books.delete(bookId);
      setBooks(await db.books.toArray());
    }
    // Prevent details modal from opening after delete
    if (window.editBookModalOpen) window.editBookModalOpen = false;
    if (document.activeElement) document.activeElement.blur();
    window.dispatchEvent(new Event('editBookModalClosed'));
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
  const [fullscreenAdd, setFullscreenAdd] = useState(false);
  const [fullscreenEdit, setFullscreenEdit] = useState(false);
  return (
    <>
      <Box minH="100vh" bg={appBg} pb="72px">
        <Flex
          justify="flex-end"
          align="center"
          p={2}
          bg="white"
          borderBottom="1px solid #eee"
        >
          {!loading && !user && (
            <Button
              colorScheme="red"
              size="sm"
              onClick={() => setAuthModalOpen(true)}
            >
              Sign In
            </Button>
          )}
          {!loading && user && (
            <Flex align="center" gap={2}>
              <Text fontSize="md" color="gray.700" fontWeight="bold" mr={1}>
                {firestoreDisplayName
                  ? `Hey ${firestoreDisplayName}!`
                  : user.displayName
                  ? `Hey ${user.displayName}!`
                  : user.email}
              </Text>
              <Tooltip label="Sign Out" hasArrow>
                <IconButton
                  icon={<FiLogOut />}
                  aria-label="Sign Out"
                  size="sm"
                  colorScheme="gray"
                  variant="ghost"
                  onClick={signOut}
                />
              </Tooltip>
            </Flex>
          )}
        </Flex>
        <Routes>
          <Route
            path="/"
            element={
              <Home
                books={books}
                onEditBook={(book) => {
                  if (isMobile) {
                    setEditBook(book);
                    setFullscreenEdit(true);
                  } else {
                    setEditBook(book);
                    setEditBookOpen(true);
                  }
                }}
                onDeleteBook={handleDeleteBook}
              />
            }
          />
          <Route path="/search" element={<Search books={books} />} />
          <Route path="/lists" element={<Lists books={books} />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route
            path="/settings"
            element={
              <Settings
                onBooksChanged={async () => setBooks(await db.books.toArray())}
              />
            }
          />
          <Route
            path="/recommendations"
            element={
              <RecommendationsPage books={books} recommended={recommended} />
            }
          />
          <Route
            path="/add-book"
            element={
              <Home
                books={books}
                onEditBook={(book) => {
                  if (isMobile) {
                    setEditBook(book);
                    setFullscreenEdit(true);
                  } else {
                    setEditBook(book);
                    setEditBookOpen(true);
                  }
                }}
                onDeleteBook={handleDeleteBook}
                autoOpenAddBook={true}
              />
            }
          />
        </Routes>
        {/* Show Add Book button only on Home tab, using React Router location */}
        {location.pathname === '/' && (
          <FloatingAddBook
            onClick={() => {
              if (isMobile) {
                setFullscreenAdd(true);
              } else {
                setAddBookOpen(true);
              }
            }}
          />
        )}
        <BottomNav />
        {/* Fullscreen add/edit for mobile */}
        {fullscreenAdd && isMobile && (
          <EditBookPage
            onClose={() => setFullscreenAdd(false)}
            onAdd={handleAddBook}
            isEdit={false}
          />
        )}
        {fullscreenEdit && isMobile && (
          <EditBookPage
            onClose={() => {
              setFullscreenEdit(false);
              setEditBook(null);
            }}
            onAdd={handleEditBook}
            initialValues={editBook}
            isEdit={true}
          />
        )}
        {/* Modals for desktop/tablet */}
        <ErrorBoundary>
          <AddBookModal
            opened={addBookOpen && !isMobile}
            onClose={() => setAddBookOpen(false)}
            onAdd={handleAddBook}
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <AddBookModal
            opened={editBookOpen && !isMobile}
            onClose={() => {
              setEditBookOpen(false);
              setEditBook(null);
            }}
            onAdd={handleEditBook}
            initialValues={editBook}
            isEdit
          />
        </ErrorBoundary>
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </Box>
      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={onboardingOpen}
        onClose={() => {
          setOnboardingOpen(false);
          localStorage.setItem('onboardingComplete', '1');
        }}
        onSetDisplayName={handleSetDisplayName}
        initialDisplayName={onboardingDisplayName}
      />
    </>
  );
}

function App() {
  return (
    <ChakraProvider>
      <Router basename="/velvet-volumes-pwa">
        {/* Handle URL parameters */}
        <ShareHandler />
        <MainLayout />
      </Router>
    </ChakraProvider>
  );
}

export default App;
