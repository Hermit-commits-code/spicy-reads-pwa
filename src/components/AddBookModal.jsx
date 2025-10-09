import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import BarcodeScanModal from "./addBook/BarcodeScanModal";
import QuickAddSection from "./addBook/QuickAddSection";
import BookCoverField from "./addBook/BookCoverField";
import BookTitleField from "./addBook/BookTitleField";
import BookAuthorField from "./addBook/BookAuthorField";
import GenreField from "./addBook/GenreField";
import DescriptionField from "./addBook/DescriptionField";
import SpiceMeterField from "./addBook/SpiceMeterField";
import StarRatingField from "./addBook/StarRatingField";
import BookStatusField from "./addBook/BookStatusField";
import ContentWarningsField from "./addBook/ContentWarningsField";
import AssignListsField from "./addBook/AssignListsField";
import ReadingProgressField from "./addBook/ReadingProgressField";
import LastReadField from "./addBook/LastReadField";
import MoodsField from "./addBook/MoodsField";
import ReviewField from "./addBook/ReviewField";
import NotesField from "./addBook/NotesField";
import SeriesFields from "./SeriesFields";
import FormModal from "./FormModal";
import { stopBarcodeScan } from "../utils/barcodeScanner";
import { startDictation } from "../utils/voiceDictation";

export default function AddBookModal({
  opened,
  onClose,
  initialValues,
  // isEdit removed
}) {
  const { t } = useTranslation();

  // Constants
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
    // Add more genres as needed
  ];

  // Book status state
  const [bookStatus, setBookStatus] = useState("");

  // Handlers for custom warnings and moods
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
  // State for all fields
  const [allLists] = useState([]);
  const [selectedLists, setSelectedLists] = useState(
    initialValues?.lists || []
  );
  // Used by QuickAddSection for autofill
  // eslint-disable-next-line no-unused-vars
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [genre, setGenre] = useState("");
  const [subGenre, setSubGenre] = useState("");
  const [description, setDescription] = useState("");
  const [spice, setSpice] = useState(0);
  const [rating, setRating] = useState(0);
  const [contentWarnings, setContentWarnings] = useState([]);
  const [customWarning, setCustomWarning] = useState("");
  // Used by QuickAddSection for autofill
  // eslint-disable-next-line no-unused-vars
  const [cover, setCover] = useState("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [lastRead, setLastRead] = useState("");
  const [moods, setMoods] = useState([]);
  const [customMood, setCustomMood] = useState("");
  const [dictationError, setDictationError] = useState("");
  const [dictatingField, setDictatingField] = useState(null);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  // barcodeScanError state removed (was unused)
  const videoRef = useRef(null);
  const [series, setSeries] = useState("");
  const [seriesOrder, setSeriesOrder] = useState("");
  const [notes, setNotes] = useState("");
  const [review, setReview] = useState("");

  useEffect(() => {
    // setTitle removed
    setAuthor(initialValues?.author || "");
    setGenre(initialValues?.genre || "");
    setSubGenre(initialValues?.subGenre || "");
    setDescription(initialValues?.description || "");
    setSpice(
      typeof initialValues?.spice === "number" ? initialValues.spice : 0
    );
    setRating(
      typeof initialValues?.rating === "number" ? initialValues.rating : 0
    );
    setContentWarnings(initialValues?.contentWarnings || []);
    setCustomWarning("");
    // setCover removed
    setReadingProgress(
      typeof initialValues?.readingProgress === "number"
        ? initialValues.readingProgress
        : 0
    );
    setLastRead(
      initialValues?.lastRead ? initialValues.lastRead.slice(0, 10) : ""
    );
    setMoods(initialValues?.moods || []);
    setCustomMood("");
  }, [initialValues]);

  return (
    <FormModal isOpen={opened} onClose={onClose}>
      <QuickAddSection
        isEdit={false}
        t={t}
        setTitle={setTitle}
        setAuthor={setAuthor}
        setDescription={setDescription}
        setCover={setCover}
        setGenre={setGenre}
        setSubGenre={setSubGenre}
        setNotes={setNotes}
        setSeries={setSeries}
        setSeriesOrder={setSeriesOrder}
        notes={notes}
      />
      <BarcodeScanModal
        isOpen={barcodeModalOpen}
        onClose={() => {
          setBarcodeModalOpen(false);
          stopBarcodeScan();
        }}
        videoRef={videoRef}
        t={t}
      />
      <BookAuthorField
        t={t}
        author={author}
        setAuthor={setAuthor}
        dictationError={dictationError}
        dictatingField={dictatingField}
        setDictationError={setDictationError}
        setDictatingField={setDictatingField}
        startDictation={startDictation}
      />
      <GenreField
        t={t}
        genre={genre}
        setGenre={setGenre}
        subGenre={subGenre}
        setSubGenre={setSubGenre}
        genres={genres}
      />
      <SeriesFields
        series={series}
        setSeries={setSeries}
        seriesOrder={seriesOrder}
        setSeriesOrder={setSeriesOrder}
      />
      <DescriptionField
        t={t}
        description={description}
        setDescription={setDescription}
      />
      <SpiceMeterField t={t} spice={spice} setSpice={setSpice} />
      <StarRatingField t={t} rating={rating} setRating={setRating} />
      <BookStatusField bookStatus={bookStatus} setBookStatus={setBookStatus} />
      <ContentWarningsField
        t={t}
        COMMON_WARNINGS={COMMON_WARNINGS}
        contentWarnings={contentWarnings}
        setContentWarnings={setContentWarnings}
        customWarning={customWarning}
        setCustomWarning={setCustomWarning}
        handleAddCustomWarning={handleAddCustomWarning}
        handleRemoveWarning={handleRemoveWarning}
      />
      <AssignListsField
        t={t}
        allLists={allLists}
        selectedLists={selectedLists}
        setSelectedLists={setSelectedLists}
      />
      <ReadingProgressField
        t={t}
        readingProgress={readingProgress}
        setReadingProgress={setReadingProgress}
      />
      <LastReadField t={t} lastRead={lastRead} setLastRead={setLastRead} />
      <MoodsField
        t={t}
        COMMON_MOODS={COMMON_MOODS}
        moods={moods}
        setMoods={setMoods}
        customMood={customMood}
        setCustomMood={setCustomMood}
        handleAddCustomMood={handleAddCustomMood}
        handleRemoveMood={handleRemoveMood}
      />
      <ReviewField t={t} review={review} setReview={setReview} />
      <NotesField t={t} notes={notes} setNotes={setNotes} />
    </FormModal>
  );
}
