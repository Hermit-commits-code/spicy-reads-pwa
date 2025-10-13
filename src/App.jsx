import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from 'react-router-dom';
import {
  ChakraProvider,
  Box,
  Flex,
  Button,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { AiFillHome } from 'react-icons/ai';
import { MdList, MdSettings, MdBarChart } from 'react-icons/md';
import { useState, useEffect } from 'react';
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

function App() {
  const { user, loading, signOut } = useAuth();
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
    const now = new Date().toISOString();
    if (user) {
      await addUserBook(user.uid, {
        ...book,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      await db.books.add({
        ...book,
        createdAt: now,
        updatedAt: now,
      });
      setBooks(await db.books.toArray());
    }
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
      await updateUserBook(user.uid, editBook.id, bookToSave);
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
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;
  const [fullscreenAdd, setFullscreenAdd] = useState(false);
  const [fullscreenEdit, setFullscreenEdit] = useState(false);
  return (
    <ChakraProvider>
      <Router basename="/velvet-volumes-pwa">
        {/* Handle URL parameters */}
        <ShareHandler />

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
                <Text fontSize="sm" color="gray.600">
                  {user.email || user.displayName}
                </Text>
                <Button
                  colorScheme="gray"
                  size="xs"
                  variant="outline"
                  onClick={signOut}
                >
                  Sign Out
                </Button>
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
                  onBooksChanged={async () =>
                    setBooks(await db.books.toArray())
                  }
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
          <FloatingAddBook
            onClick={() => {
              if (isMobile) {
                setFullscreenAdd(true);
              } else {
                setAddBookOpen(true);
              }
            }}
          />
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
      </Router>
    </ChakraProvider>
  );
}
export default App;
