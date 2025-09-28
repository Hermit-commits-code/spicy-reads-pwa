import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import {
  ChakraProvider,
  Box,
  Flex,
  Button,
  IconButton,
  Text,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { AiFillHome } from "react-icons/ai";
import { MdList, MdSettings, MdBarChart } from "react-icons/md";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Lists from "./pages/Lists";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import Analytics from "./pages/Analytics";
import AddBookModal from "./components/AddBookModal";
import RecommendationsPage from "./pages/Recommendations";
import { getRecommendedBooks } from "./utils/recommendations";
import db from "./db/booksDB";

import { useTranslation } from "react-i18next";
function BottomNav() {
  const { t } = useTranslation();
  const navBg = "white";
  const navBorder = "#eee";
  const iconColor = "gray.700";
  const activeColor = "red.500";
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
      aria-label={t("main_navigation", "Main navigation")}
    >
      <NavLink to="/" style={{ textDecoration: "none" }}>
        {({ isActive }) => (
          <Button
            variant="ghost"
            flexDir="column"
            alignItems="center"
            size="sm"
            aria-label={t("home")}
            color={isActive ? activeColor : iconColor}
            _hover={{ color: activeColor }}
          >
            <AiFillHome size={24} style={{ marginBottom: 2 }} />
            <Text fontSize="xs">{t("home")}</Text>
          </Button>
        )}
      </NavLink>
      <NavLink to="/search" style={{ textDecoration: "none" }}>
        {({ isActive }) => (
          <Button
            variant="ghost"
            flexDir="column"
            alignItems="center"
            size="sm"
            aria-label={t("search")}
            color={isActive ? activeColor : iconColor}
            _hover={{ color: activeColor }}
          >
            <MdList size={24} style={{ marginBottom: 2 }} />
            <Text fontSize="xs">{t("search")}</Text>
          </Button>
        )}
      </NavLink>
      <NavLink to="/lists" style={{ textDecoration: "none" }}>
        {({ isActive }) => (
          <Button
            variant="ghost"
            flexDir="column"
            alignItems="center"
            size="sm"
            aria-label={t("lists")}
            color={isActive ? activeColor : iconColor}
            _hover={{ color: activeColor }}
          >
            <MdList size={24} style={{ marginBottom: 2 }} />
            <Text fontSize="xs">{t("lists")}</Text>
          </Button>
        )}
      </NavLink>
      <NavLink to="/analytics" style={{ textDecoration: "none" }}>
        {({ isActive }) => (
          <Button
            variant="ghost"
            flexDir="column"
            alignItems="center"
            size="sm"
            aria-label={t("stats")}
            color={isActive ? activeColor : iconColor}
            _hover={{ color: activeColor }}
          >
            <MdBarChart size={24} style={{ marginBottom: 2 }} />
            <Text fontSize="xs">{t("stats")}</Text>
          </Button>
        )}
      </NavLink>
      <NavLink to="/settings" style={{ textDecoration: "none" }}>
        {({ isActive }) => (
          <Button
            variant="ghost"
            flexDir="column"
            alignItems="center"
            size="sm"
            aria-label={t("settings")}
            color={isActive ? activeColor : iconColor}
            _hover={{ color: activeColor }}
          >
            <MdSettings size={24} style={{ marginBottom: 2 }} />
            <Text fontSize="xs">{t("settings")}</Text>
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
  const appBg = "gray.50";
  const recommended = getRecommendedBooks(books, { max: 20 });

  useEffect(() => {
    db.books.toArray().then(setBooks);
  }, []);

  const handleAddBook = async (book) => {
    const now = new Date().toISOString();
    await db.books.add({
      ...book,
      createdAt: now,
      updatedAt: now,
    });
    setBooks(await db.books.toArray());
    setAddBookOpen(false);
  };

  const handleEditBook = async (book) => {
    if (!editBook) return;
    const now = new Date().toISOString();
    await db.books.update(editBook.id, {
      ...editBook,
      ...book,
      updatedAt: now,
    });
    setBooks(await db.books.toArray());
    setEditBookOpen(false);
    setEditBook(null);
  };

  const handleDeleteBook = async (bookId) => {
    await db.books.delete(bookId);
    setBooks(await db.books.toArray());
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 600;
  const [fullscreenAdd, setFullscreenAdd] = useState(false);
  const [fullscreenEdit, setFullscreenEdit] = useState(false);
  return (
    <ChakraProvider>
      <Router basename="/spicy-reads-pwa">
        <Box minH="100vh" bg={appBg} pb="72px">
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
          <AddBookModal
            opened={addBookOpen && !isMobile}
            onClose={() => setAddBookOpen(false)}
            onAdd={handleAddBook}
          />
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
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
