import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Heading,
  Text,
  HStack,
  Tag,
  Box,
} from "@chakra-ui/react";
import SpiceMeter from "./SpiceMeter";
import StarRating from "./StarRating";

import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { useClipboard } from "@chakra-ui/react";
import { getRecommendedBooks } from "../utils/recommendations";
import db from "../db/booksDB";

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BookDetailsModal({ book, opened, onClose }) {
  const { t } = useTranslation();
  const [shareStatus, setShareStatus] = useState("");
  const { onCopy, setValue: setClipboardValue } = useClipboard("");

  // Contextual recommendations state
  const [similarBooks, setSimilarBooks] = useState([]);

  useEffect(() => {
    if (!book) return;
    // Fetch all books and recommend similar (exclude current book)
    db.books.toArray().then((allBooks) => {
      const recs = getRecommendedBooks(allBooks, {
        max: 4,
        excludeIds: [book.id],
        // Only use the current book as the 'user profile' for context
      }).filter((b) => b.id !== book.id);
      setSimilarBooks(recs);
    });
  }, [book]);

  if (!book) return null;

  // Prepare share data
  const shareData = {
    title: book.title,
    text: `${book.title} by ${book.author}${
      book.review ? `\n\nReview: ${book.review}` : ""
    }${book.notes ? `\n\nNotes: ${book.notes}` : ""}`,
    // Optionally add a URL if you have a public link
    // url: window.location.href,
  };

  const handleShare = async () => {
    setShareStatus("");
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareStatus("shared");
      } catch {
        setShareStatus("error");
      }
    } else {
      // Fallback: copy to clipboard
      setClipboardValue(
        `${shareData.title} by ${book.author}\n${
          book.review ? `Review: ${book.review}\n` : ""
        }${book.notes ? `Notes: ${book.notes}\n` : ""}`
      );
      onCopy();
      setShareStatus("copied");
    }
  };

  return (
    <Modal
      isOpen={opened}
      onClose={onClose}
      isCentered
      motionPreset="scale"
      initialFocusRef={null}
    >
      <ModalOverlay />
      <ModalContent
        role="dialog"
        aria-modal="true"
        aria-label={t("book_details", "Book details") + ": " + book.title}
      >
        <ModalHeader>{book.title}</ModalHeader>
        <Box mb={2} textAlign="right">
          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleShare}
            aria-label={t("share", "Share book details")}
          >
            {t("share", "Share")}
          </Button>
          {shareStatus === "copied" && (
            <Text fontSize="xs" color="green.500" ml={2} as="span">
              {t("copied_to_clipboard", "Copied!")}
            </Text>
          )}
          {shareStatus === "shared" && (
            <Text fontSize="xs" color="green.500" ml={2} as="span">
              {t("shared_success", "Shared!")}
            </Text>
          )}
          {shareStatus === "error" && (
            <Text fontSize="xs" color="red.500" ml={2} as="span">
              {t("share_error", "Share failed")}
            </Text>
          )}
        </Box>
        <ModalCloseButton aria-label={t("close", "Close")} />
        <ModalBody>
          <Heading
            as="h5"
            size="sm"
            mb={1}
            aria-label={t("book_author", "Author") + ": " + book.author}
          >
            {book.author}
          </Heading>
          {(book.genre || book.subGenre) && (
            <HStack mb={2} spacing={2} flexWrap="wrap">
              {book.genre && (
                <Tag
                  size="sm"
                  colorScheme="gray"
                  borderRadius="full"
                  aria-label={t("book_genre", "Genre") + ": " + book.genre}
                >
                  {t(book.genre.toLowerCase(), book.genre)}
                </Tag>
              )}
              {book.subGenre && (
                <Tag
                  size="sm"
                  colorScheme="gray"
                  borderRadius="full"
                  aria-label={
                    t("book_subgenre", "Sub-genre") + ": " + book.subGenre
                  }
                >
                  {t(book.subGenre.toLowerCase(), book.subGenre)}
                </Tag>
              )}
            </HStack>
          )}
          {book.description && (
            <Text
              fontSize="sm"
              color="gray.700"
              mb={2}
              aria-label={
                t("book_description", "Description") + ": " + book.description
              }
            >
              {book.description}
            </Text>
          )}
          <HStack spacing={4} mb={2} align="center">
            <SpiceMeter value={book.spice || 0} readOnly size={5} />
            <StarRating value={book.rating || 0} readOnly size={5} />
          </HStack>
          {/* Reading Progress and Last Read */}
          {typeof book.readingProgress === "number" &&
            book.readingProgress > 0 && (
              <Box mb={2}>
                <Text
                  fontSize="xs"
                  color="gray.500"
                  aria-label={
                    t("reading_progress", "Reading Progress") +
                    ": " +
                    book.readingProgress +
                    "%"
                  }
                >
                  {t("progress", "Progress")}: {book.readingProgress}%
                </Text>
              </Box>
            )}
          {book.lastRead && (
            <Box mb={2}>
              <Text
                fontSize="xs"
                color="gray.500"
                aria-label={
                  t("last_read", "Last read") + ": " + formatDate(book.lastRead)
                }
              >
                {t("last_read", "Last read")}: {formatDate(book.lastRead)}
              </Text>
            </Box>
          )}
          {book.contentWarnings && book.contentWarnings.length > 0 && (
            <Box mb={2}>
              <Text fontSize="xs" color="gray.500" mb={1}>
                {t("content_warnings", "Content Warnings")}
              </Text>
              <HStack spacing={2} flexWrap="wrap">
                {book.contentWarnings.map((warning) => (
                  <Tag
                    key={warning}
                    size="sm"
                    colorScheme="red"
                    borderRadius="full"
                    aria-label={
                      t("content_warning", "Content warning") + ": " + warning
                    }
                  >
                    {t(warning.toLowerCase(), warning)}
                  </Tag>
                ))}
              </HStack>
            </Box>
          )}
          {/* Review */}
          {book.review && (
            <Box mb={2}>
              <Text fontSize="sm" color="gray.700" mb={1} fontWeight="bold">
                {t("review", "Review")}
              </Text>
              <Text fontSize="sm" color="gray.700">
                {book.review}
              </Text>
            </Box>
          )}
          {/* Notes */}
          {book.notes && (
            <Box mb={2}>
              <Text fontSize="sm" color="gray.700" mb={1} fontWeight="bold">
                {t("notes", "Notes")}
              </Text>
              <Text fontSize="sm" color="gray.700">
                {book.notes}
              </Text>
            </Box>
          )}
        </ModalBody>
        {/* Contextual Recommendations */}
        {similarBooks && similarBooks.length > 0 && (
          <Box mt={4} mb={2}>
            <Text fontWeight="bold" fontSize="sm" mb={2} color="purple.700">
              {t("you_might_also_like", "You might also like...")}
            </Text>
            <HStack spacing={2} overflowX="auto">
              {similarBooks.map((rec) => (
                <Box
                  key={rec.id}
                  minW="100px"
                  maxW="120px"
                  p={2}
                  borderWidth={1}
                  borderRadius="md"
                  bg="gray.50"
                  boxShadow="sm"
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  cursor="pointer"
                  position="relative"
                  onClick={() => {
                    // Show details for this book in the modal
                    onClose();
                    setTimeout(() => {
                      // Use a custom event or callback to open the modal for rec.id if needed
                      window.dispatchEvent(
                        new CustomEvent("openBookDetails", { detail: rec.id })
                      );
                    }, 250);
                  }}
                >
                  {/* Series order badge */}
                  {rec.series &&
                    rec.seriesOrder &&
                    !isNaN(Number(rec.seriesOrder)) && (
                      <Box
                        position="absolute"
                        top={1}
                        left={1}
                        bg="purple.500"
                        color="white"
                        fontSize="xs"
                        fontWeight="bold"
                        px={2}
                        py={0.5}
                        borderRadius="md"
                        zIndex={2}
                        boxShadow="sm"
                        aria-label={`Book ${rec.seriesOrder} in series`}
                      >
                        {rec.seriesOrder}
                      </Box>
                    )}
                  {rec.cover ? (
                    <img
                      src={rec.cover}
                      alt={rec.title}
                      style={{
                        width: "100%",
                        height: "80px",
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    <Text
                      fontSize="xs"
                      color="gray.400"
                      textAlign="center"
                      px={2}
                    >
                      {t("no_cover", "No Cover")}
                    </Text>
                  )}
                  <Text
                    fontSize="xs"
                    color="gray.700"
                    fontWeight="medium"
                    mt={1}
                    noOfLines={2}
                    textAlign="center"
                  >
                    {rec.title}
                  </Text>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    noOfLines={1}
                    textAlign="center"
                  >
                    {rec.author}
                  </Text>
                </Box>
              ))}
            </HStack>
          </Box>
        )}
        <ModalFooter>
          <Button onClick={onClose} aria-label={t("close", "Close")}>
            {t("close", "Close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
