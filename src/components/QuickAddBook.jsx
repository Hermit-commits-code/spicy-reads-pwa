import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  Image,
  Badge,
  Flex,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
} from "@chakra-ui/react";
import {
  FiCamera,
  FiLink,
  FiSearch,
  FiType,
  FiCheck,
  FiX,
} from "react-icons/fi";
// import removed: extractBookFromUrl
import {
  fetchBookByISBN,
  searchBooks,
  parseBookText,
} from "../utils/bookDataFetcher";
import { scanBarcode } from "../utils/barcodeScanner";

/**
 * QuickAddBook - Streamlined book adding with multiple input methods
 * Replaces complex OCR with better UX
 */
export default function QuickAddBook({ onBookAdd }) {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [foundBooks, setFoundBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  // Input states
  const [searchInput, setSearchInput] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [scannerActive, setScannerActive] = useState(false);

  const videoRef = useRef(null);
  const toast = useToast();

  // Tab names and icons (removed Paste Link)
  const tabs = [
    { name: "Scan ISBN", icon: FiCamera, key: "scan" },
    { name: "Search", icon: FiSearch, key: "search" },
    { name: "Manual", icon: FiType, key: "manual" },
  ];

  // Handle barcode scanning
  const startBarcodeScanning = async () => {
    try {
      setLoading(true);
      setScannerActive(true);
      setError("");

      await scanBarcode(videoRef.current, async (barcode) => {
        setScannerActive(false);

        toast({
          title: "Barcode detected!",
          description: `ISBN: ${barcode}`,
          status: "success",
          duration: 2000,
        });

        // Fetch book data using ISBN
        const bookData = await fetchBookByISBN(barcode);
        if (bookData) {
          setSelectedBook(bookData);
        } else {
          setError("Book not found in our databases. Try manual entry.");
        }
      });
    } catch {
      setError("Camera access failed. Please check permissions.");
      setScannerActive(false);
    } finally {
      setLoading(false);
    }
  };

  // (URL extraction removed)

  // Handle book search
  const handleSearch = async () => {
    if (!searchInput.trim()) return;

    setLoading(true);
    setError("");

    try {
      const results = await searchBooks(searchInput.trim());
      if (results.length > 0) {
        setFoundBooks(results);
      } else {
        setError("No books found. Try different search terms.");
      }
    } catch {
      setError("Search failed. Try manual entry.");
    } finally {
      setLoading(false);
    }
  };

  // Handle manual text parsing
  const handleManualParse = () => {
    if (!manualInput.trim()) return;

    const parsed = parseBookText(manualInput.trim());

    if (parsed.title || parsed.author) {
      setSelectedBook({
        title: parsed.title || "",
        author: parsed.author || "",
        source: "Manual Entry",
        needsReview: true,
      });
    } else if (parsed.searchQuery) {
      setSearchInput(parsed.searchQuery);
      setActiveTab(2); // Switch to search tab
      handleSearch();
    }
  };

  // Handle book selection
  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setFoundBooks([]);
  };

  // Confirm book addition
  const handleConfirmAdd = () => {
    if (selectedBook) {
      onBookAdd({
        title: selectedBook.title,
        author: selectedBook.author,
        isbn: selectedBook.isbn,
        genre: selectedBook.genre,
        cover: selectedBook.cover,
        publishDate: selectedBook.publishDate,
        publisher: selectedBook.publisher,
        pageCount: selectedBook.pageCount,
        description: selectedBook.description,
        source: selectedBook.source,
      });
    }
  };

  return (
    <Box maxW="md" mx="auto" p={4}>
      {!selectedBook ? (
        <>
          <Text fontSize="lg" fontWeight="bold" mb={4} textAlign="center">
            Add a New Book
          </Text>

          <Tabs
            index={activeTab}
            onChange={setActiveTab}
            variant="soft-rounded"
            colorScheme="red"
          >
            <TabList mb={4} justifyContent="center">
              {tabs.map((tab) => (
                <Tab
                  key={tab.key}
                  fontSize="sm"
                  px={5}
                  py={2}
                  borderRadius="full"
                  _selected={{ bg: "red.500", color: "white" }}
                >
                  <Box as={tab.icon} mr={1} />
                  {tab.name}
                </Tab>
              ))}
            </TabList>

            <TabPanels>
              {/* ISBN Scanner Tab */}
              <TabPanel>
                <VStack spacing={4}>
                  <Text textAlign="center" color="gray.600">
                    Point your camera at the ISBN barcode (usually on the back
                    cover)
                  </Text>

                  {!scannerActive ? (
                    <Button
                      onClick={startBarcodeScanning}
                      colorScheme="red"
                      size="lg"
                      leftIcon={<FiCamera />}
                      isLoading={loading}
                      borderRadius="full"
                      px={8}
                    >
                      Start Scanning
                    </Button>
                  ) : (
                    <Box position="relative">
                      <video
                        ref={videoRef}
                        style={{
                          width: "100%",
                          maxWidth: "400px",
                          borderRadius: "16px",
                        }}
                        autoPlay
                        playsInline
                      />
                      <Button
                        position="absolute"
                        top={2}
                        right={2}
                        size="sm"
                        colorScheme="red"
                        borderRadius="full"
                        onClick={() => setScannerActive(false)}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </VStack>
              </TabPanel>

              {/* Search Tab */}
              <TabPanel>
                <VStack spacing={4}>
                  <Text textAlign="center" color="gray.600">
                    Search by title, author, or both
                  </Text>

                  <Input
                    placeholder="Title or Author name"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  />

                  <Button
                    onClick={handleSearch}
                    colorScheme="red"
                    isLoading={loading}
                    disabled={!searchInput.trim()}
                  >
                    Search Books
                  </Button>

                  {/* Search Results */}
                  {foundBooks.length > 0 && (
                    <VStack spacing={2} w="100%" maxH="300px" overflowY="auto">
                      {foundBooks.map((book, idx) => (
                        <Flex
                          key={idx}
                          p={3}
                          borderWidth={1}
                          borderRadius="md"
                          w="100%"
                          cursor="pointer"
                          _hover={{ bg: "gray.50" }}
                          onClick={() => handleBookSelect(book)}
                        >
                          {book.cover && (
                            <Image
                              src={book.cover}
                              alt={book.title}
                              boxSize="50px"
                              objectFit="cover"
                              mr={3}
                            />
                          )}
                          <Box flex={1}>
                            <Text
                              fontWeight="semibold"
                              fontSize="md"
                              color="red.700"
                            >
                              {book.title}
                            </Text>
                            <Text
                              fontSize="sm"
                              color="gray.600"
                              fontWeight="medium"
                            >
                              {book.author}
                            </Text>
                            {book.publishDate && (
                              <Text fontSize="xs" color="gray.400">
                                {book.publishDate}
                              </Text>
                            )}
                          </Box>
                        </Flex>
                      ))}
                    </VStack>
                  )}
                </VStack>
              </TabPanel>

              {/* Manual Tab */}
              <TabPanel>
                <VStack spacing={4}>
                  <Text textAlign="center" color="gray.600">
                    Type or paste book information in any format
                  </Text>

                  <Input
                    placeholder="e.g., 'Fourth Wing by Rebecca Yarros' or 'Rebecca Yarros - Fourth Wing'"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleManualParse()}
                  />

                  <Button
                    onClick={handleManualParse}
                    colorScheme="red"
                    disabled={!manualInput.trim()}
                  >
                    Parse Book Info
                  </Button>

                  <Text fontSize="xs" color="gray.500" textAlign="center">
                    We'll try to automatically separate the title and author, or
                    search for the book if needed.
                  </Text>
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      ) : (
        /* Book Confirmation */
        <VStack spacing={4}>
          <Text fontSize="lg" fontWeight="bold">
            Confirm Book Details
          </Text>

          <Box borderWidth={1} borderRadius="md" p={4} w="100%">
            <Flex>
              {selectedBook.cover && (
                <Image
                  src={selectedBook.cover}
                  alt={selectedBook.title}
                  boxSize="100px"
                  objectFit="cover"
                  mr={4}
                />
              )}
              <Box flex={1}>
                <Text fontWeight="bold">{selectedBook.title}</Text>
                <Text color="gray.600">{selectedBook.author}</Text>
                {selectedBook.publishDate && (
                  <Text fontSize="sm" color="gray.500">
                    {selectedBook.publishDate}
                  </Text>
                )}
                <Badge
                  colorScheme="purple"
                  mt={2}
                  borderRadius="full"
                  px={3}
                  py={1}
                  fontWeight="bold"
                  fontSize="0.85em"
                >
                  {selectedBook.source}
                </Badge>
                {selectedBook.needsReview && (
                  <Badge
                    colorScheme="orange"
                    ml={2}
                    borderRadius="full"
                    px={3}
                    py={1}
                    fontWeight="bold"
                    fontSize="0.85em"
                  >
                    Review & Edit
                  </Badge>
                )}
              </Box>
            </Flex>
          </Box>

          <HStack spacing={3}>
            <Button
              onClick={() => setSelectedBook(null)}
              variant="outline"
              leftIcon={<FiX />}
            >
              Back
            </Button>
            <Button
              onClick={handleConfirmAdd}
              colorScheme="red"
              leftIcon={<FiCheck />}
            >
              Add Book
            </Button>
          </HStack>
        </VStack>
      )}

      {error && (
        <Alert status="error" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      {loading && !scannerActive && (
        <Flex justify="center" mt={4}>
          <Spinner color="red.500" />
        </Flex>
      )}
    </Box>
  );
}
