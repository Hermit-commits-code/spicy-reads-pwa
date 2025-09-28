import {
  Box,
  Heading,
  Stack,
  Switch,
  FormControl,
  FormLabel,
  Select,
  Text,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import db from "../db/booksDB";
import {
  suggestMoods,
  suggestContentWarnings,
  suggestSpice,
  suggestGenre,
} from "../utils/autotagging";
import { useTranslation } from "react-i18next";

// Accept onBooksChanged as a prop
export default function Settings({ onBooksChanged }) {
  const toast = useToast();
  // Import books from CSV (Amazon/Goodreads)
  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data;
        if (!rows.length) {
          toast({
            title: "No books found in CSV.",
            status: "warning",
            duration: 2000,
          });
          return;
        }
        // Map CSV fields to your book schema (try to auto-detect common fields)
        let mapped = rows
          .map((row) => {
            // Try to get ISBN or ASIN
            const isbn = row.ISBN || row["ISBN-13"] || row["isbn"] || "";
            const asin = row.ASIN || row["asin"] || row["ASIN"] || "";
            // Try to get title
            const title =
              row.Title ||
              row["Book Title"] ||
              row["title"] ||
              row["Name"] ||
              "";
            // Try to get author
            const author =
              row.Author ||
              row["Author(s)"] ||
              row["author"] ||
              row["Authors"] ||
              "";
            // Try to get series and seriesOrder from CSV fields if present
            let series = row.Series || row["series"] || "";
            let seriesOrder =
              row.SeriesOrder ||
              row["seriesOrder"] ||
              row["Series Number"] ||
              row["series_number"] ||
              "";
            // If not present, try to extract from title
            if (!series || !seriesOrder) {
              // e.g. (Dawn of The Alphas Book 3) or (Series Name #3)
              const match = title.match(/\(([^)]+)\s+(Book|#)\s*(\d+)\)/i);
              if (match) {
                series = series || match[1].trim();
                seriesOrder = seriesOrder || match[3];
              }
            }
            return {
              title,
              author,
              isbn,
              asin,
              cover: row.Cover || row["cover"] || "",
              description: row.Description || row["description"] || "",
              series,
              seriesOrder: seriesOrder ? Number(seriesOrder) : "",
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
          })
          .filter((b) => b.title);
        if (!mapped.length) {
          toast({
            title: "No valid books found in CSV.",
            status: "warning",
            duration: 2000,
          });
          return;
        }
        // Fetch missing metadata for books with ISBN or ASIN
        const fetchBookData = async (book) => {
          // Prefer ISBN, fallback to ASIN if present
          let info = null;
          let fetched = false;
          if (book.isbn) {
            try {
              const res = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=isbn:${book.isbn}`
              );
              const data = await res.json();
              if (data.totalItems > 0 && data.items[0].volumeInfo) {
                info = data.items[0].volumeInfo;
                fetched = true;
              }
            } catch {
              /* ignore fetch errors */
            }
          }
          // If no ISBN info, try ASIN (Google Books doesn't support ASIN directly, so fallback to title/author search)
          if (!fetched && book.asin) {
            try {
              const q = encodeURIComponent(
                `${book.title} ${book.author}`.trim()
              );
              const res = await fetch(
                `https://www.googleapis.com/books/v1/volumes?q=${q}`
              );
              const data = await res.json();
              if (data.totalItems > 0 && data.items[0].volumeInfo) {
                info = data.items[0].volumeInfo;
                fetched = true;
              }
            } catch {
              /* ignore fetch errors */
            }
          }
          if (info) {
            // Try to extract series info from subtitle or title if not already set
            let { series, seriesOrder } = book;
            if ((!series || !seriesOrder) && info.title) {
              const match = info.title.match(/\(([^)]+)\s+(Book|#)\s*(\d+)\)/i);
              if (match) {
                series = series || match[1].trim();
                seriesOrder = seriesOrder || match[3];
              }
            }
            return {
              ...book,
              title: book.title || info.title || "",
              author:
                book.author || (info.authors ? info.authors.join(", ") : ""),
              cover:
                book.cover ||
                (info.imageLinks ? info.imageLinks.thumbnail : ""),
              description: book.description || info.description || "",
              series,
              seriesOrder: seriesOrder ? Number(seriesOrder) : "",
            };
          }
          return book;
        };
        toast({
          title: "Fetching book details from Google Books...",
          status: "info",
          duration: 2000,
        });
        mapped = await Promise.all(mapped.map(fetchBookData));

        // Remove ASIN from final book object (not in schema) and apply autotagging
        mapped = mapped.map((book) => {
          const { asin: _, ...rest } = book;
          const text = `${rest.title || ""} ${rest.description || ""}`;
          const moods = suggestMoods(text);
          const contentWarnings = suggestContentWarnings(text);
          const spice = suggestSpice(text);
          const genreSuggestion = suggestGenre(text);
          return {
            ...rest,
            moods: moods.length ? moods : undefined,
            contentWarnings: contentWarnings.length
              ? contentWarnings
              : undefined,
            spice: spice || undefined,
            // Only set genre if not already set and suggestion is valid
            genre:
              (!rest.genre && genreSuggestion) ||
              (rest.genre && typeof rest.genre === "string" && rest.genre) ||
              undefined,
          };
        });

        // Update or add books: if ISBN exists, update; else if title+author match, update; else add new
        let updatedCount = 0;
        let addedCount = 0;
        for (const book of mapped) {
          let existing = null;
          if (book.isbn) {
            existing = await db.books.where("isbn").equals(book.isbn).first();
          }
          if (!existing && book.title && book.author) {
            existing = await db.books
              .where({ title: book.title, author: book.author })
              .first();
          }
          if (existing) {
            await db.books.update(existing.id, {
              ...existing,
              ...book,
              updatedAt: Date.now(),
            });
            updatedCount++;
          } else {
            await db.books.add({
              ...book,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
            addedCount++;
          }
        }
        toast({
          title: `Imported: ${addedCount} new, Updated: ${updatedCount} books!`,
          status: "success",
          duration: 2000,
        });
        if (onBooksChanged) await onBooksChanged();
        e.target.value = "";
      },
      error: () => {
        toast({
          title: "Failed to parse CSV.",
          status: "error",
          duration: 2000,
        });
        e.target.value = "";
      },
    });
  };
  const { i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language || "en");
  const [sort, setSort] = useState("recent");
  const fileInputRef = useRef();

  // Export data as JSON
  const handleExportJSON = async () => {
    const books = await db.books.toArray();
    const lists = await db.lists.toArray();
    const listBooks = await db.listBooks.toArray();
    const data = { books, lists, listBooks };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spicy-reads-backup-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Export data as CSV (books only)
  const handleExportCSV = async () => {
    const books = await db.books.toArray();
    if (!books.length) return;
    const header = Object.keys(books[0]).join(",");
    const rows = books.map((b) =>
      Object.values(b)
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spicy-reads-books-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import data (JSON)
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (data.books && data.lists && data.listBooks) {
        await db.books.clear();
        await db.lists.clear();
        await db.listBooks.clear();
        await db.books.bulkAdd(data.books);
        await db.lists.bulkAdd(data.lists);
        await db.listBooks.bulkAdd(data.listBooks);
        alert("Import successful!");
      } else {
        alert("Invalid backup file.");
      }
    } catch {
      alert("Failed to import file.");
    }
    fileInputRef.current.value = "";
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSort = localStorage.getItem("settings:sort");
    if (savedSort) setSort(savedSort);
    // Optionally, sync theme with localStorage (Chakra handles theme persistence by default)
  }, []);

  // Save sort preference to localStorage
  useEffect(() => {
    localStorage.setItem("settings:sort", sort);
  }, [sort]);

  // Language change handler
  const handleLangChange = (e) => {
    const lng = e.target.value;
    setLang(lng);
    i18n.changeLanguage(lng);
    localStorage.setItem("settings:lang", lng);
  };

  // Load language from localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("settings:lang");
    if (savedLang && savedLang !== lang) {
      setLang(savedLang);
      i18n.changeLanguage(savedLang);
    }
  }, [i18n, lang]);

  return (
    <Box
      py={{ base: 6, md: 10 }}
      px={{ base: 4, md: 8 }}
      maxW={{ base: "480px", md: "700px" }}
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
          </Stack>
        </Box>
        {/* Sorting Section */}
        <Box
          borderWidth="1px"
          borderRadius="md"
          p={{ base: 4, md: 8 }}
          bg="gray.50"
        >
          <Heading as="h2" size="sm" mb={4} color="red.600">
            Sorting
          </Heading>
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
        </Box>
        {/* Data Management Section */}
        <Box
          borderWidth="1px"
          borderRadius="md"
          p={{ base: 4, md: 8 }}
          bg="gray.50"
        >
          <Heading as="h2" size="sm" mb={4} color="red.600">
            Data Management
          </Heading>
          <Stack
            direction={{ base: "column", sm: "row" }}
            spacing={3}
            align="center"
          >
            <Button
              colorScheme="red"
              onClick={handleExportJSON}
              aria-label="Export as JSON"
              size="md"
            >
              Export JSON
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={handleExportCSV}
              aria-label="Export as CSV"
              size="md"
            >
              Export CSV
            </Button>
            <Button
              as="label"
              htmlFor="import-file"
              colorScheme="red"
              variant="ghost"
              size="md"
              cursor="pointer"
            >
              Import JSON
              <input
                id="import-file"
                ref={fileInputRef}
                type="file"
                accept="application/json"
                style={{ display: "none" }}
                onChange={handleImport}
                aria-label="Import JSON backup"
              />
            </Button>
            <Button
              as="label"
              htmlFor="import-csv-file"
              colorScheme="red"
              variant="ghost"
              size="md"
              cursor="pointer"
            >
              Import CSV
              <input
                id="import-csv-file"
                type="file"
                accept=".csv,text/csv"
                style={{ display: "none" }}
                onChange={handleImportCSV}
                aria-label="Import CSV backup"
              />
            </Button>
            <Button
              colorScheme="red"
              variant="outline"
              onClick={async () => {
                if (
                  window.confirm(
                    "Are you sure you want to delete ALL books? This cannot be undone."
                  )
                ) {
                  await db.books.clear();
                  toast({
                    title: "All books deleted.",
                    status: "success",
                    duration: 2000,
                  });
                  if (onBooksChanged) await onBooksChanged();
                }
              }}
              aria-label="Delete all books"
              size="md"
            >
              Delete All Books
            </Button>
          </Stack>
          <Text fontSize="xs" color="gray.500" mt={2}>
            Export your data for backup, or import a previous backup (JSON or
            CSV).
            <br />
            <b>CSV import:</b> Supports Amazon and Goodreads export files. Only
            book title and author are required; other fields are optional.
            <br />
            <b>Delete All Books:</b> This will permanently remove all books from
            your library.
          </Text>
        </Box>
        {/* Premium Features Section */}
        <Box
          borderWidth="1px"
          borderRadius="md"
          p={{ base: 4, md: 8 }}
          bg="gray.50"
        >
          <Heading as="h2" size="sm" mb={4} color="red.600">
            Premium Features
          </Heading>
          <Stack direction="row" align="center" justify="space-between">
            <Box>
              <Text fontWeight="semibold">
                Cloud Sync{" "}
                <Text as="span" color="red.400">
                  (Premium)
                </Text>
              </Text>
              <Text fontSize="sm" color="gray.500">
                Sync your books and lists across devices. Coming soon!
              </Text>
            </Box>
            <Switch
              isDisabled
              colorScheme="red"
              aria-label="Cloud sync premium (coming soon)"
              size="lg"
            />
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
