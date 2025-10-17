import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Input,
  VStack,
  Text,
  Alert,
  AlertIcon,
  useToast,
  HStack,
  Badge,
} from "@chakra-ui/react";
import { FiLink, FiMagic } from "react-icons/fi";
import { extractBookFromUrl } from "../utils/bookUrlExtractor";

/**
 * SmartPasteDetector - Automatically detects and processes pasted book URLs
 * Shows up when user pastes content anywhere on the page
 */
export default function SmartPasteDetector({ onBookAdd }) {
  const [pastedContent, setPastedContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extractedBook, setExtractedBook] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const handlePaste = async (e) => {
      const pastedText = e.clipboardData.getData("text");

      // Check if it looks like a book URL
      if (pastedText && isBookUrl(pastedText)) {
        setPastedContent(pastedText);

        // Auto-extract book info
        setLoading(true);
        try {
          const bookData = await extractBookFromUrl(pastedText);
          if (bookData) {
            setExtractedBook(bookData);
            toast({
              title: "Book detected!",
              description: `Found: ${bookData.title}`,
              status: "success",
              duration: 3000,
            });
          }
        } catch (error) {
          console.error("Auto-extraction failed:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    // Listen for paste events globally
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [toast]);

  const isBookUrl = (url) => {
    const bookSites = [
      "amazon.com",
      "amazon.co.uk",
      "amazon.ca",
      "amazon.de",
      "goodreads.com",
      "openlibrary.org",
      "barnesandnoble.com",
      "bookdepository.com",
      "waterstones.com",
    ];
    return bookSites.some((site) => url.includes(site));
  };

  const handleAddBook = () => {
    if (extractedBook) {
      onBookAdd(extractedBook);
      dismiss();
    }
  };

  const dismiss = () => {
    setPastedContent(null);
    setExtractedBook(null);
  };

  if (!pastedContent) return null;

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      maxW="350px"
      bg="white"
      borderRadius="lg"
      boxShadow="xl"
      border="1px solid"
      borderColor="gray.200"
      p={4}
      zIndex={1000}
      animation="slideIn 0.3s ease-out"
    >
      <VStack spacing={3} align="stretch">
        <HStack>
          <FiMagic color="#ef4444" />
          <Text fontWeight="bold" fontSize="sm">
            Book URL Detected!
          </Text>
          <Badge colorScheme="green" fontSize="xs">
            Auto
          </Badge>
        </HStack>

        {loading ? (
          <Text fontSize="sm" color="gray.600">
            🔍 Extracting book information...
          </Text>
        ) : extractedBook ? (
          <Box>
            <Text fontSize="sm" fontWeight="medium">
              {extractedBook.title}
            </Text>
            <Text fontSize="xs" color="gray.600">
              by {extractedBook.author}
            </Text>
            <Badge colorScheme="blue" fontSize="xs" mt={1}>
              {extractedBook.source}
            </Badge>
          </Box>
        ) : (
          <Alert status="warning" size="sm">
            <AlertIcon />
            <Text fontSize="xs">Couldn't extract book info automatically</Text>
          </Alert>
        )}

        <HStack spacing={2}>
          {extractedBook ? (
            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<FiLink />}
              onClick={handleAddBook}
              flex={1}
            >
              Add Book
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Open the manual add with the URL pre-filled
                window.open(
                  `/add-book?url=${encodeURIComponent(pastedContent)}`,
                  "_blank"
                );
              }}
              flex={1}
            >
              Add Manually
            </Button>
          )}

          <Button size="sm" variant="ghost" onClick={dismiss}>
            ✕
          </Button>
        </HStack>

        <Text fontSize="xs" color="gray.500">
          From: {new URL(pastedContent).hostname}
        </Text>
      </VStack>
    </Box>
  );
}
