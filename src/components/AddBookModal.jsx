import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Text,
  Checkbox,
  CheckboxGroup,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Radio,
  RadioGroup,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Box,
} from "@chakra-ui/react";
import {
  loadQuagga,
  scanBarcode,
  stopBarcodeScan,
} from "../utils/barcodeScanner";
import { startDictation } from "../utils/voiceDictation";
import db from "../db/booksDB";
import SeriesFields from "./SeriesFields";
import FormModal from "./FormModal";
import QuickAddBook from "./QuickAddBook";
import {
  suggestMoods,
  suggestContentWarnings,
  suggestSpice,
  suggestGenre,
} from "../utils/autotagging";

const COMMON_WARNINGS = [
  "Sexual Content",
  "Abuse",
  "Death",
  "Substance Use",
  "Language",
  "Other",
];

const COMMON_MOODS = [
  "Cozy",
  "Dark",
  "Funny",
  "Adventurous",
  "Emotional",
  "Inspiring",
  "Steamy",
  "Chilling",
  "Feel-Good",
  "Heartbreaking",
  "Other",
];
import SpiceMeter from "./SpiceMeter";
import StarRating from "./StarRating";

const genres = [
  {
    value: "romance",
    label: "Romance",
    subGenres: [
      "Contemporary",
      "Historical",
      "Paranormal",
      "Gothic Romance",
      "Romantic Comedy",
      "Romantic Suspense",
      "Fantasy Romance",
      "LGBTQ+",
      "Dark Romance",
      "Erotica",
      "Regency",
      "Sports",
      "Military",
      "Billionaire",
      "Other",
    ],
  },
  {
    value: "fantasy",
    label: "Fantasy",
    subGenres: [
      "Epic",
      "Urban",
      "Dark",
      "Romantasy",
      "High Fantasy",
      "Low Fantasy",
      "Sword & Sorcery",
      "Portal",
      "Arthurian",
      "Mythic",
      "Steampunk",
      "Gaslamp",
      "Other",
    ],
  },
  {
    value: "mystery",
    label: "Mystery",
    subGenres: [
      "Cozy",
      "Detective",
      "Thriller",
      "Crime",
      "Police Procedural",
      "Legal",
      "Historical",
      "Noir",
      "Hardboiled",
      "Amateur Sleuth",
      "Locked Room",
      "Other",
    ],
  },
  {
    value: "sci-fi",
    label: "Sci-Fi",
    subGenres: [
      "Space Opera",
      "Dystopian",
      "Cyberpunk",
      "Time Travel",
      "Military",
      "Hard SF",
      "Soft SF",
      "Alien",
      "Post-Apocalyptic",
      "Steampunk",
      "Biopunk",
      "Other",
    ],
  },
  {
    value: "nonfiction",
    label: "Nonfiction",
    subGenres: [
      "Memoir",
      "Self-Help",
      "History",
      "Biography",
      "True Crime",
      "Science",
      "Business",
      "Politics",
      "Psychology",
      "Health",
      "Travel",
      "Essays",
      "Other",
    ],
  },
  {
    value: "other",
    label: "Other",
    subGenres: [
      "Anthology",
      "Short Stories",
      "Poetry",
      "Graphic Novel",
      "Young Adult",
      "Middle Grade",
      "Children’s",
      "Other",
    ],
  },
];

export default function AddBookModal({
  opened,
  onClose,
  onAdd,
  initialValues,
  isEdit = false,
}) {
  const { t } = useTranslation();
  const [allLists, setAllLists] = useState([]);
  const [selectedLists, setSelectedLists] = useState(
    initialValues?.lists || []
  );

  // Autotagging suggestion state (must be inside component)
  const [suggestedMoods, setSuggestedMoods] = useState([]);
  const [suggestedWarnings, setSuggestedWarnings] = useState([]);
  // ...existing code...
  const [suggestedSpice, setSuggestedSpice] = useState(null);
  const [suggestedGenre, setSuggestedGenre] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSuggestTags = () => {
    const text = `${title} ${description}`;
    setSuggestedMoods(suggestMoods(text));
    setSuggestedWarnings(suggestContentWarnings(text));
    setSuggestedSpice(suggestSpice(text));
    setSuggestedGenre(suggestGenre(text));
    setShowSuggestions(true);
  };

  const applySuggestions = () => {
    if (suggestedMoods.length)
      setMoods((prev) => Array.from(new Set([...prev, ...suggestedMoods])));
    if (suggestedWarnings.length)
      setContentWarnings((prev) =>
        Array.from(new Set([...prev, ...suggestedWarnings]))
      );
    if (
      suggestedSpice !== null &&
      suggestedSpice !== undefined &&
      suggestedSpice !== 0
    )
      setSpice(suggestedSpice);
    if (suggestedGenre && genres.some((g) => g.label === suggestedGenre))
      setGenre(genres.find((g) => g.label === suggestedGenre).value);
    setShowSuggestions(false);
  };

  useEffect(() => {
    db.lists.toArray().then(setAllLists);
  }, []);

  useEffect(() => {
    setSelectedLists(initialValues?.lists || []);
  }, [initialValues]);
  const safeInitialValues = useMemo(() => initialValues || {}, [initialValues]);
  const [title, setTitle] = useState(safeInitialValues.title || "");
  const [author, setAuthor] = useState(safeInitialValues.author || "");
  const [genre, setGenre] = useState(safeInitialValues.genre || "");
  const [subGenre, setSubGenre] = useState(safeInitialValues.subGenre || "");
  const [description, setDescription] = useState(
    safeInitialValues.description || ""
  );
  const [spice, setSpice] = useState(
    typeof safeInitialValues.spice === "number" ? safeInitialValues.spice : 0
  );
  const [rating, setRating] = useState(
    typeof safeInitialValues.rating === "number" ? safeInitialValues.rating : 0
  );
  const [contentWarnings, setContentWarnings] = useState(
    safeInitialValues.contentWarnings || []
  );
  const [customWarning, setCustomWarning] = useState("");
  const [cover, setCover] = useState(safeInitialValues.cover || "");
  const [readingProgress, setReadingProgress] = useState(
    typeof safeInitialValues.readingProgress === "number"
      ? safeInitialValues.readingProgress
      : 0
  );
  const [lastRead, setLastRead] = useState(
    safeInitialValues.lastRead ? safeInitialValues.lastRead.slice(0, 10) : ""
  );
  const [moods, setMoods] = useState(safeInitialValues.moods || []);
  const [customMood, setCustomMood] = useState("");
  const [series, setSeries] = useState(safeInitialValues.series || "");
  const [seriesOrder, setSeriesOrder] = useState(
    typeof safeInitialValues.seriesOrder === "number"
      ? safeInitialValues.seriesOrder
      : ""
  );
  const [bookStatus, setBookStatus] = useState(
    safeInitialValues.bookStatus || ""
  );
  // Review/Notes fields
  const [review, setReview] = useState(safeInitialValues.review || "");
  const [notes, setNotes] = useState(safeInitialValues.notes || "");

  // Barcode scan modal state
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const [barcodeScanError, setBarcodeScanError] = useState("");
  const videoRef = useRef(null);

  // Voice dictation state
  const [dictatingField, setDictatingField] = useState(null); // 'title' | 'author' | null
  const [dictationError, setDictationError] = useState("");

  // Handle file input and convert to data URL
  const handleCoverChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new window.FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setCover(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Update state when initialValues changes (for edit mode)
  useEffect(() => {
    setTitle(safeInitialValues.title || "");
    setAuthor(safeInitialValues.author || "");
    setGenre(safeInitialValues.genre || "");
    setSubGenre(safeInitialValues.subGenre || "");
    setDescription(safeInitialValues.description || "");
    setSpice(
      typeof safeInitialValues.spice === "number" ? safeInitialValues.spice : 0
    );
    setRating(
      typeof safeInitialValues.rating === "number"
        ? safeInitialValues.rating
        : 0
    );
    setContentWarnings(safeInitialValues.contentWarnings || []);
    setCustomWarning("");
    setCover(safeInitialValues.cover || "");
    setReadingProgress(
      typeof safeInitialValues.readingProgress === "number"
        ? safeInitialValues.readingProgress
        : 0
    );
    setLastRead(
      safeInitialValues.lastRead ? safeInitialValues.lastRead.slice(0, 10) : ""
    );
    setMoods(safeInitialValues.moods || []);
    setCustomMood("");
    setSeries(safeInitialValues.series || "");
    setSeriesOrder(
      typeof safeInitialValues.seriesOrder === "number"
        ? safeInitialValues.seriesOrder
        : ""
    );
    setReview(safeInitialValues.review || "");
    setNotes(safeInitialValues.notes || "");
  }, [safeInitialValues]);

  // Check for extension book data when modal opens
  useEffect(() => {
    if (opened && !isEdit && window.extensionBookData) {
      const bookData = window.extensionBookData;
      console.log("Loading extension book data:", bookData);

      if (bookData.title) setTitle(bookData.title);
      if (bookData.author) setAuthor(bookData.author);
      if (bookData.description) setDescription(bookData.description);
      if (bookData.cover) setCover(bookData.cover);
      if (bookData.sourceUrl) {
        setNotes(`Source: ${bookData.sourceUrl}`);
      }

      // Set series information from extension
      if (bookData.seriesName) {
        setSeries(bookData.seriesName);
        console.log("Set series name:", bookData.seriesName);
      }
      if (bookData.seriesNumber) {
        setSeriesOrder(parseInt(bookData.seriesNumber, 10));
        console.log("Set series number:", bookData.seriesNumber);
      }

      // Clear the data after using it
      window.extensionBookData = null;
    }
  }, [opened, isEdit]);

  const handleAddCustomWarning = () => {
    if (customWarning && !contentWarnings.includes(customWarning)) {
      setContentWarnings([...contentWarnings, customWarning]);
      setCustomWarning("");
    }
  };

  const handleRemoveWarning = (warning) => {
    setContentWarnings(contentWarnings.filter((w) => w !== warning));
  };

  const handleAddCustomMood = () => {
    if (customMood && !moods.includes(customMood)) {
      setMoods([...moods, customMood]);
      setCustomMood("");
    }
  };

  const handleRemoveMood = (mood) => {
    setMoods(moods.filter((m) => m !== mood));
  };

  const handleSubmit = () => {
    if (!title || !author || !genre) return;
    onAdd({
      title,
      author,
      genre,
      subGenre,
      description,
      spice: Number(spice),
      rating: Number(rating),
      contentWarnings,
      cover,
      lists: selectedLists,
      readingProgress: Number(readingProgress),
      lastRead: lastRead ? new Date(lastRead).toISOString() : null,
      moods,
      series,
      seriesOrder: seriesOrder === "" ? null : Number(seriesOrder),
      review,
      notes,
      bookStatus,
    });
    if (!isEdit) {
      setTitle("");
      setAuthor("");
      setGenre("");
      setSubGenre("");
      setDescription("");
      setSpice(0);
      setRating(0);
      setContentWarnings([]);
      setCustomWarning("");
      setCover("");
      setSelectedLists([]);
      setReadingProgress(0);
      setLastRead("");
      setMoods([]);
      setCustomMood("");
      setSeries("");
      setSeriesOrder("");
      setReview("");
      setNotes("");
    }
    onClose();
  };

  return (
    <>
      {/* Barcode Scan Modal (remains Chakra Modal for now) */}
      <Modal
        isOpen={barcodeModalOpen}
        onClose={() => {
          setBarcodeModalOpen(false);
          stopBarcodeScan();
          setBarcodeScanError("");
        }}
        isCentered
        size="sm"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("scan_barcode", "Scan Book Barcode")}</ModalHeader>
          <ModalCloseButton
            onClick={() => {
              setBarcodeModalOpen(false);
              stopBarcodeScan();
              setBarcodeScanError("");
            }}
          />
          <ModalBody>
            <Box mb={2}>
              <video
                ref={videoRef}
                style={{ width: "100%", borderRadius: 8 }}
                autoPlay
                muted
                playsInline
              />
            </Box>
            {barcodeScanError && (
              <Text color="red.500">{barcodeScanError}</Text>
            )}
            <Text fontSize="sm" color="gray.500">
              {t(
                "scan_barcode_hint",
                "Point your camera at the barcode (ISBN) on the back of the book."
              )}
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={() => {
                setBarcodeModalOpen(false);
                stopBarcodeScan();
                setBarcodeScanError("");
              }}
            >
              {t("cancel")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <FormModal
        isOpen={opened}
        onClose={onClose}
        title={isEdit ? t("edit_book") : t("add_book")}
        footer={
          <>
            <Button
              colorScheme={isEdit ? "yellow" : "red"}
              mr={3}
              onClick={handleSubmit}
              disabled={!title || !author || !genre || !subGenre}
            >
              {isEdit ? t("save_changes") : t("add_book")}
            </Button>
            <Button variant="ghost" onClick={onClose}>
              {t("cancel")}
            </Button>
          </>
        }
      >
        {/* Autotagging Suggestion Button */}
        <Box mb={4}>
          <Button
            size="sm"
            colorScheme="purple"
            variant="outline"
            onClick={handleSuggestTags}
          >
            {t("suggest_tags", "Suggest Tags (AI)")}
          </Button>
        </Box>
        {/* Autotagging Suggestions Review UI */}
        {showSuggestions && (
          <Box mb={4} p={3} borderWidth="1px" borderRadius="md" bg="purple.50">
            <Text fontWeight="bold" mb={2}>
              {t("autotagging_suggestions", "Suggested Tags:")}
            </Text>
            {suggestedGenre && (
              <Text fontSize="sm">
                {t("genre", "Genre")}: <b>{suggestedGenre}</b>
              </Text>
            )}
            {suggestedMoods.length > 0 && (
              <Text fontSize="sm">
                {t("moods_vibes", "Moods/Vibes")}: {suggestedMoods.join(", ")}
              </Text>
            )}
            {suggestedWarnings.length > 0 && (
              <Text fontSize="sm">
                {t("content_warnings", "Content Warnings")}:{" "}
                {suggestedWarnings.join(", ")}
              </Text>
            )}
            {suggestedSpice !== null &&
              suggestedSpice !== undefined &&
              suggestedSpice !== 0 && (
                <Text fontSize="sm">
                  {t("spice_meter", "Spice")}: <b>{suggestedSpice}</b>
                </Text>
              )}
            <HStack mt={2}>
              <Button size="xs" colorScheme="purple" onClick={applySuggestions}>
                {t("apply_suggestions", "Apply")}
              </Button>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setShowSuggestions(false)}
              >
                {t("dismiss", "Dismiss")}
              </Button>
            </HStack>
          </Box>
        )}

        {/* Quick Add Book - Only for new books */}
        {!isEdit && (
          <Box mb={4} p={4} borderWidth="1px" borderRadius="md" bg="blue.50">
            <Text fontWeight="bold" mb={3} color="blue.600">
              {t("quick_add", "Quick Add Book")}
            </Text>
            <Text fontSize="sm" color="gray.600" mb={3}>
              {t(
                "quick_add_help",
                "Scan ISBN, paste Amazon/Goodreads links, or search to auto-fill book details"
              )}
            </Text>
            <QuickAddBook
              onBookAdd={(bookData) => {
                // Pre-fill form with book data from QuickAdd
                if (bookData.title) setTitle(bookData.title);
                if (bookData.author) setAuthor(bookData.author);
                if (bookData.description) setDescription(bookData.description);
                if (bookData.cover) setCover(bookData.cover);
                if (bookData.genre) setGenre(bookData.genre);
                if (bookData.subGenre) setSubGenre(bookData.subGenre);
                if (bookData.isbn) {
                  // Store ISBN in notes for reference
                  setNotes(
                    notes
                      ? `${notes}\n\nISBN: ${bookData.isbn}`
                      : `ISBN: ${bookData.isbn}`
                  );
                }

                // Scroll down to show the filled form
                setTimeout(() => {
                  const formElement = document.querySelector(
                    '[role="dialog"] form, [role="dialog"] .chakra-modal__body'
                  );
                  if (formElement) {
                    formElement.scrollTop = formElement.scrollHeight;
                  }
                }, 100);
              }}
            />
          </Box>
        )}

        {/* All form fields below */}
        <FormControl>
          <FormLabel htmlFor="book-cover-input">
            {t("book_cover", "Book Cover")}
          </FormLabel>
          <Input
            id="book-cover-input"
            type="file"
            accept="image/*"
            onChange={handleCoverChange}
            aria-label="Upload book cover"
            size="md"
            p={2}
          />
          {cover && (
            <Box mt={2} textAlign="center">
              <img
                src={cover}
                alt={title ? `${title} cover preview` : "Book cover preview"}
                style={{
                  maxWidth: "100px",
                  maxHeight: "140px",
                  margin: "0 auto",
                  borderRadius: "8px",
                }}
              />
            </Box>
          )}
        </FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor="book-title-input">{t("book_title")}</FormLabel>
          <HStack>
            <Input
              id="book-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              aria-label={t("book_title")}
              autoComplete="off"
              size="md"
            />
            <Button
              size="sm"
              onClick={async () => {
                setDictationError("");
                setDictatingField("title");
                try {
                  const transcript = await startDictation();
                  setTitle(transcript);
                } catch (err) {
                  setDictationError(
                    "Voice input failed: " + (err?.message || err)
                  );
                }
                setDictatingField(null);
              }}
              aria-label={t("voice_input_title", "Voice input for title")}
              isLoading={dictatingField === "title"}
            >
              🎤
            </Button>
          </HStack>
          <Button
            mt={2}
            size="sm"
            onClick={async () => {
              setBarcodeScanError("");
              setBarcodeModalOpen(true);
              await loadQuagga();
              setTimeout(() => {
                if (videoRef.current) {
                  scanBarcode(videoRef.current, async (code) => {
                    setBarcodeModalOpen(false);
                    stopBarcodeScan();
                    // Try to fetch book info from Open Library API
                    try {
                      const resp = await fetch(
                        `https://openlibrary.org/api/books?bibkeys=ISBN:${code}&format=json&jscmd=data`
                      );
                      const data = await resp.json();
                      const book = data[`ISBN:${code}`];
                      if (book) {
                        setTitle(book.title || "");
                        setAuthor(book.authors?.[0]?.name || "");
                      } else {
                        setBarcodeScanError(
                          "Book not found for scanned barcode."
                        );
                      }
                    } catch {
                      setBarcodeScanError("Failed to fetch book info.");
                    }
                  });
                }
              }, 300);
            }}
            leftIcon={
              <span role="img" aria-label="Scan barcode">
                📷
              </span>
            }
            aria-label={t("scan_barcode_info", "Scan barcode for book info")}
            variant="outline"
          >
            Scan Barcode
          </Button>
          {dictationError && <Text color="red.500">{dictationError}</Text>}
        </FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor="book-author-input">{t("book_author")}</FormLabel>
          <HStack>
            <Input
              id="book-author-input"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              aria-label={t("book_author")}
              autoComplete="off"
              size="md"
            />
            <Button
              size="sm"
              onClick={async () => {
                setDictationError("");
                setDictatingField("author");
                try {
                  const transcript = await startDictation();
                  setAuthor(transcript);
                } catch (err) {
                  setDictationError(
                    "Voice input failed: " + (err?.message || err)
                  );
                }
                setDictatingField(null);
              }}
              aria-label={t("voice_input_author", "Voice input for author")}
              isLoading={dictatingField === "author"}
            >
              🎤
            </Button>
          </HStack>
          {dictationError && <Text color="red.500">{dictationError}</Text>}
        </FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor="book-genre-input">{t("book_genre")}</FormLabel>
          <Select
            id="book-genre-input"
            placeholder="Select genre"
            value={genre}
            onChange={(e) => {
              setGenre(e.target.value);
              setSubGenre("");
            }}
            aria-label={t("book_genre")}
            size="md"
          >
            {genres.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl isRequired>
          <FormLabel htmlFor="book-subgenre-input">
            {t("book_subgenre")}
          </FormLabel>
          <Select
            id="book-subgenre-input"
            placeholder="Select sub-genre"
            value={subGenre}
            onChange={(e) => setSubGenre(e.target.value)}
            isDisabled={!genre}
            aria-label={t("book_subgenre")}
            size="md"
          >
            {genre &&
              genres
                .find((g) => g.value === genre)
                ?.subGenres.map((sg) => (
                  <option key={sg} value={sg}>
                    {sg}
                  </option>
                ))}
          </Select>
        </FormControl>
        {/* Insert modular series fields here */}
        <SeriesFields
          series={series}
          setSeries={setSeries}
          seriesOrder={seriesOrder}
          setSeriesOrder={setSeriesOrder}
        />
        <FormControl>
          <FormLabel htmlFor="book-description-input">
            {t("book_description")}
          </FormLabel>
          <Input
            id="book-description-input"
            placeholder="Short description or notes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            aria-label={t("book_description")}
            size="md"
          />
        </FormControl>
        <FormControl>
          <FormLabel>{t("spice_meter")}</FormLabel>
          <SpiceMeter
            value={spice}
            onChange={setSpice}
            aria-label="Spice meter"
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            {t("spice_meter_hint", "How spicy is this book?")}
          </Text>
        </FormControl>
        <FormControl>
          <FormLabel>{t("rating")}</FormLabel>
          <StarRating
            value={rating}
            onChange={setRating}
            aria-label="Star rating"
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            {t("rating_hint", "Your personal rating")}
          </Text>
        </FormControl>
        <FormControl>
          <FormLabel>Book Status</FormLabel>
          <RadioGroup value={bookStatus} onChange={setBookStatus}>
            <Stack direction="row">
              <Radio value="checkedOut">Checked Out</Radio>
              <Radio value="ownDigital">Own Digitally</Radio>
              <Radio value="ownPhysical">Own Physically</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>
        <FormControl>
          <FormLabel>{t("content_warnings")}</FormLabel>
          <CheckboxGroup
            value={contentWarnings}
            onChange={setContentWarnings}
            aria-label={t("content_warnings")}
          >
            <Stack direction="row" flexWrap="wrap">
              {COMMON_WARNINGS.map((warning) => (
                <Checkbox key={warning} value={warning}>
                  {warning}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          <HStack mt={2} spacing={2} flexWrap="wrap">
            {contentWarnings.map((warning) => (
              <Tag
                key={warning}
                size="sm"
                colorScheme="red"
                borderRadius="full"
              >
                <TagLabel>{warning}</TagLabel>
                <TagCloseButton
                  onClick={() => handleRemoveWarning(warning)}
                  aria-label={t("remove_warning", { warning })}
                />
              </Tag>
            ))}
          </HStack>
          <HStack mt={2}>
            <Input
              size="sm"
              placeholder={t("add_custom_warning", "Add custom warning")}
              value={customWarning}
              onChange={(e) => setCustomWarning(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCustomWarning();
              }}
              aria-label={t("add_custom_warning", "Add custom warning")}
            />
            <Button
              size="sm"
              onClick={handleAddCustomWarning}
              aria-label={t("add_custom_warning", "Add custom warning")}
            >
              Add
            </Button>
          </HStack>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {t("select_all_apply", "Select all that apply or add your own.")}
          </Text>
        </FormControl>
        {/* Assign to Lists */}
        <FormControl>
          <FormLabel>{t("assign_to_lists")}</FormLabel>
          <CheckboxGroup
            value={selectedLists}
            onChange={setSelectedLists}
            aria-label={t("assign_to_lists")}
          >
            <Stack direction="row" flexWrap="wrap">
              {allLists.map((list) => (
                <Checkbox key={list.id} value={list.id}>
                  {list.name}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {t(
              "assign_lists_hint",
              "You can assign this book to multiple lists."
            )}
          </Text>
        </FormControl>
        <FormControl>
          <FormLabel>{t("reading_progress")}</FormLabel>
          <Stack direction="row" align="center">
            <Slider
              min={0}
              max={100}
              step={1}
              value={readingProgress}
              onChange={setReadingProgress}
              flex={1}
              aria-label={t("reading_progress")}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
            <Text minW="40px" textAlign="right">
              {readingProgress}%
            </Text>
          </Stack>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {t("reading_progress_hint", "How much of this book have you read?")}
          </Text>
        </FormControl>
        <FormControl>
          <FormLabel>{t("last_read_date")}</FormLabel>
          <Input
            type="date"
            value={lastRead}
            onChange={(e) => setLastRead(e.target.value)}
            aria-label={t("last_read_date")}
            size="md"
            max={new Date().toISOString().slice(0, 10)}
          />
          <Text fontSize="xs" color="gray.500" mt={1}>
            {t("last_read_hint", "When did you last read this book?")}
          </Text>
        </FormControl>
        <FormControl>
          <FormLabel>{t("moods_vibes")}</FormLabel>
          <CheckboxGroup
            value={moods}
            onChange={setMoods}
            aria-label={t("moods_vibes")}
          >
            <Stack direction="row" flexWrap="wrap">
              {COMMON_MOODS.map((mood) => (
                <Checkbox key={mood} value={mood}>
                  {mood}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          <HStack mt={2} spacing={2} flexWrap="wrap">
            {moods.map((mood) => (
              <Tag
                key={mood}
                size="sm"
                colorScheme="purple"
                borderRadius="full"
              >
                <TagLabel>{mood}</TagLabel>
                <TagCloseButton
                  onClick={() => handleRemoveMood(mood)}
                  aria-label={t("remove_mood", { mood })}
                />
              </Tag>
            ))}
          </HStack>
          <HStack mt={2}>
            <Input
              size="sm"
              placeholder={t("add_custom_mood", "Add custom mood/vibe")}
              value={customMood}
              onChange={(e) => setCustomMood(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCustomMood();
              }}
              aria-label={t("add_custom_mood", "Add custom mood")}
            />
            <Button
              size="sm"
              onClick={handleAddCustomMood}
              aria-label={t("add_custom_mood", "Add custom mood")}
            >
              Add
            </Button>
          </HStack>
          <Text fontSize="xs" color="gray.500" mt={1}>
            {t("select_all_apply", "Select all that apply or add your own.")}
          </Text>
        </FormControl>
        {/* Review/Notes fields */}
        <FormControl>
          <FormLabel>{t("review", "Review")}</FormLabel>
          <Input
            placeholder={t(
              "review_placeholder",
              "Write your review (optional)"
            )}
            value={review}
            onChange={(e) => setReview(e.target.value)}
            aria-label={t("review", "Review")}
            size="md"
          />
        </FormControl>
        <FormControl>
          <FormLabel>{t("notes", "Notes")}</FormLabel>
          <Input
            placeholder={t("notes_placeholder", "Personal notes (optional)")}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            aria-label={t("notes", "Notes")}
            size="md"
          />
        </FormControl>
        {/* All form fields end here. FormModal handles closing tags. */}
      </FormModal>
    </>
  );
}
