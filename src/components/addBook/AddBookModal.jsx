import { Button } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { useAddBookForm } from './useAddBookForm';
import BarcodeScanModal from './BarcodeScanModal';
import QuickAddSection from './QuickAddSection';
import BookCoverField from './BookCoverField';
import BookTitleField from './BookTitleField';
import BookAuthorField from './BookAuthorField';
import ReleaseDateField from './ReleaseDateField';
import GenreField from './GenreField';
import DescriptionField from './DescriptionField';
import SpiceMeterField from './SpiceMeterField';
import StarRatingField from './StarRatingField';
import FormatsOwnedField from './FormatsOwnedField';
import ContentWarningsField from './ContentWarningsField';
import AssignListsField from './AssignListsField';
import ReadingProgressField from './ReadingProgressField';
import LastReadField from './LastReadField';
import MoodsField from './MoodsField';
import ReviewField from './ReviewField';
import NotesField from './NotesField';
import SeriesFields from './SeriesFields';
import FormModal from './FormModal';
import RemindMeAfterAddModal from './RemindMeAfterAddModal';

import { stopBarcodeScan } from '../../utils/barcodeScanner';
import { startDictation } from '../../utils/voiceDictation';
// Mock constants for frontend-only
const COMMON_WARNINGS = [
  'Violence',
  'Explicit Language',
  'Drug Use',
  'Sexual Content',
  'Abuse',
  'Death',
  'Self-harm',
  'Suicide',
  'Racism',
  'Homophobia',
  'Transphobia',
  'Ableism',
  'Other',
];
const COMMON_MOODS = [
  'Cozy',
  'Dark',
  'Funny',
  'Hopeful',
  'Sad',
  'Suspenseful',
  'Romantic',
  'Adventurous',
  'Wholesome',
  'Angsty',
  'Other',
];
const GENRES = [
  {
    value: 'fantasy',
    label: 'Fantasy',
    subGenres: ['Epic', 'Urban', 'Paranormal', 'Dark', 'Other'],
  },
  {
    value: 'romance',
    label: 'Romance',
    subGenres: ['Contemporary', 'Historical', 'Paranormal', 'Dark', 'Other'],
  },
  {
    value: 'mystery',
    label: 'Mystery',
    subGenres: ['Cozy', 'Detective', 'Thriller', 'Other'],
  },
  {
    value: 'thriller',
    label: 'Thriller',
    subGenres: ['Psychological', 'Crime', 'Legal', 'Other'],
  },
  {
    value: 'science_fiction',
    label: 'Science Fiction',
    subGenres: ['Dystopian', 'Space Opera', 'Cyberpunk', 'Other'],
  },
  {
    value: 'historical',
    label: 'Historical',
    subGenres: ['Fiction', 'Romance', 'Mystery', 'Other'],
  },
  {
    value: 'nonfiction',
    label: 'Nonfiction',
    subGenres: ['Memoir', 'Biography', 'Self-Help', 'Other'],
  },
  {
    value: 'young_adult',
    label: 'Young Adult',
    subGenres: ['Fantasy', 'Romance', 'Contemporary', 'Other'],
  },
  {
    value: 'children',
    label: 'Children',
    subGenres: ['Picture Book', 'Middle Grade', 'Other'],
  },
  {
    value: 'horror',
    label: 'Horror',
    subGenres: ['Gothic', 'Supernatural', 'Other'],
  },
  { value: 'other', label: 'Other', subGenres: ['Other'] },
];

import React, { useState, useId } from 'react';

export default function AddBookModal(props) {
  const {
    opened,
    onClose,
    initialValues,
    onAdd, // callback to save book (renamed for consistency)
    isEdit,
  } = props;
  const { t } = useTranslation();
  const form = useAddBookForm(initialValues || {});
  const [error, setError] = useState(null);
  const [remindMeModalOpen, setRemindMeModalOpen] = useState(false);
  const [lastAddedBook, setLastAddedBook] = useState(null);
  const idPrefix = useId();

  // Handlers for custom warnings and moods (now use form state)
  const handleAddCustomWarning = () => {
    if (
      form.customWarning &&
      !form.contentWarnings.includes(form.customWarning)
    ) {
      form.setContentWarnings([...form.contentWarnings, form.customWarning]);
      form.setCustomWarning('');
    }
  };
  const handleRemoveWarning = (warning) => {
    form.setContentWarnings(form.contentWarnings.filter((w) => w !== warning));
  };
  const handleAddCustomMood = () => {
    const mood = form.customMood && form.customMood.trim();
    if (mood && !form.moods.includes(mood)) {
      form.setMoods([...form.moods, mood]);
      form.setCustomMood('');
    }
  };
  const handleRemoveMood = (mood) => {
    form.setMoods(form.moods.filter((m) => m !== mood));
  };

  // Save handler: collect all state and call onAdd
  const handleSave = () => {
    const book = {
      ...initialValues, // preserve all fields from initialValues (for edit)
      title: form.title,
      author: form.author,
      genre: form.genre,
      subGenre: form.subGenre,
      description: form.description,
      spice: form.spice,
      rating: form.rating,
      formatsOwned: form.formatsOwned,
      contentWarnings: form.contentWarnings,
      cover: form.cover,
      readingProgress: form.readingProgress,
      lastRead: form.lastRead,
      moods: form.moods,
      series: form.series,
      seriesOrder: form.seriesOrder,
      notes: form.notes,
      review: form.review,
      // Always save lists as array of strings (IDs)
      lists: Array.isArray(form.selectedLists)
        ? form.selectedLists.map((l) =>
            typeof l === 'object' && l !== null && l.id
              ? String(l.id)
              : String(l),
          )
        : [],
      createdAt: initialValues?.createdAt || Date.now(),
      updatedAt: Date.now(),
      releaseDate: form.releaseDate,
    };
    if (onAdd) {
      onAdd(book);
    }
    // If book has a future release date, show RemindMeAfterAddModal
    if (book.releaseDate && new Date(book.releaseDate) > new Date()) {
      setLastAddedBook(book);
      setRemindMeModalOpen(true);
    } else {
      onClose();
    }
  };

  const footer = (
    <>
      <Button onClick={onClose} mr={3} variant="ghost">
        {t('cancel', 'Cancel')}
      </Button>
      <Button colorScheme="red" onClick={handleSave}>
        {t('save', 'Save')}
      </Button>
    </>
  );

  let content;
  try {
    content = (
      <>
        <QuickAddSection
          isEdit={!!isEdit}
          t={t}
          setTitle={form.setTitle}
          setAuthor={form.setAuthor}
          setDescription={form.setDescription}
          setCover={form.setCover}
          setGenre={form.setGenre}
          setSubGenre={form.setSubGenre}
          setNotes={form.setNotes}
          setSeries={form.setSeries}
          setSeriesOrder={form.setSeriesOrder}
          notes={form.notes}
        />
        <BookTitleField
          t={t}
          title={form.title}
          setTitle={form.setTitle}
          dictationError={form.dictationError}
          dictatingField={form.dictatingField}
          setDictationError={form.setDictationError}
          setDictatingField={form.setDictatingField}
          startDictation={startDictation}
          idPrefix={idPrefix}
        />
        <BarcodeScanModal
          isOpen={form.barcodeModalOpen}
          onClose={() => {
            form.setBarcodeModalOpen(false);
            stopBarcodeScan();
          }}
          videoRef={form.videoRef}
          t={t}
        />
        <BookAuthorField
          t={t}
          author={form.author}
          setAuthor={form.setAuthor}
          dictationError={form.dictationError}
          dictatingField={form.dicticatingField}
          setDictationError={form.setDictationError}
          setDictatingField={form.setDictatingField}
          startDictation={startDictation}
          idPrefix={idPrefix}
        />
        <ReleaseDateField
          t={t}
          releaseDate={form.releaseDate}
          setReleaseDate={form.setReleaseDate}
        />
        <GenreField
          t={t}
          genre={form.genre}
          setGenre={form.setGenre}
          subGenre={form.subGenre}
          setSubGenre={form.setSubGenre}
          genres={GENRES} // This will now reference the local mock constant
        />
        <SeriesFields
          t={t}
          series={form.series}
          setSeries={form.setSeries}
          seriesNumber={form.seriesOrder}
          setSeriesNumber={form.setSeriesOrder}
          idPrefix={idPrefix}
        />
        <DescriptionField
          t={t}
          description={form.description}
          setDescription={form.setDescription}
        />
        <SpiceMeterField
          t={t}
          spice={form.spice}
          setSpice={form.setSpice}
          idPrefix={idPrefix}
        />
        <StarRatingField
          t={t}
          rating={form.rating}
          setRating={form.setRating}
          idPrefix={idPrefix}
        />
        <FormatsOwnedField
          t={t}
          formatsOwned={form.formatsOwned}
          setFormatsOwned={form.setFormatsOwned}
        />
        <ContentWarningsField
          t={t}
          COMMON_WARNINGS={COMMON_WARNINGS}
          contentWarnings={
            Array.isArray(form.contentWarnings) ? form.contentWarnings : []
          }
          setContentWarnings={form.setContentWarnings}
          customWarning={form.customWarning}
          setCustomWarning={form.setCustomWarning}
          handleAddCustomWarning={handleAddCustomWarning}
          handleRemoveWarning={handleRemoveWarning}
          idPrefix={idPrefix}
        />
        <AssignListsField
          t={t}
          allLists={form.allLists}
          selectedLists={form.selectedLists}
          setSelectedLists={form.setSelectedLists}
        />
        <ReadingProgressField
          t={t}
          readingProgress={form.readingProgress}
          setReadingProgress={form.setReadingProgress}
        />
        <LastReadField
          t={t}
          lastRead={form.lastRead}
          setLastRead={form.setLastRead}
        />
        <MoodsField
          t={t}
          COMMON_MOODS={COMMON_MOODS}
          moods={Array.isArray(form.moods) ? form.moods : []}
          setMoods={form.setMoods}
          customMood={form.customMood}
          setCustomMood={form.setCustomMood}
          handleAddCustomMood={handleAddCustomMood}
          handleRemoveMood={handleRemoveMood}
          idPrefix={idPrefix}
        />
        <ReviewField t={t} review={form.review} setReview={form.setReview} />
        <NotesField t={t} notes={form.notes} setNotes={form.setNotes} />
        <BookCoverField
          t={t}
          cover={form.cover}
          handleCoverChange={form.setCover}
          title={form.title}
        />
      </>
    );
  } catch (e) {
    setError(e);
    content = (
      <div style={{ color: '#E53E3E', fontWeight: 'bold', padding: 16 }}>
        Error rendering AddBookModal: {String(e)}
      </div>
    );
  }
  return (
    <>
      <FormModal isOpen={opened} onClose={onClose} footer={footer}>
        {content}
      </FormModal>
      {lastAddedBook && (
        <RemindMeAfterAddModal
          isOpen={remindMeModalOpen}
          onClose={() => {
            setRemindMeModalOpen(false);
            onClose();
          }}
          book={lastAddedBook}
        />
      )}
    </>
  );
}
