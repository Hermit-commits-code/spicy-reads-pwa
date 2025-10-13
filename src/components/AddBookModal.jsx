import { Button } from '@chakra-ui/react';

import { useTranslation } from 'react-i18next';
import { useAddBookForm } from './addBook/useAddBookForm';
import BarcodeScanModal from './addBook/BarcodeScanModal';
import QuickAddSection from './addBook/QuickAddSection';
import BookCoverField from './addBook/BookCoverField';
import BookTitleField from './addBook/BookTitleField';
import BookAuthorField from './addBook/BookAuthorField';
import GenreField from './addBook/GenreField';
import DescriptionField from './addBook/DescriptionField';
import SpiceMeterField from './addBook/SpiceMeterField';
import StarRatingField from './addBook/StarRatingField';
import FormatsOwnedField from './addBook/FormatsOwnedField';
import ContentWarningsField from './addBook/ContentWarningsField';
import AssignListsField from './addBook/AssignListsField';
import ReadingProgressField from './addBook/ReadingProgressField';
import LastReadField from './addBook/LastReadField';
import MoodsField from './addBook/MoodsField';
import ReviewField from './addBook/ReviewField';
import NotesField from './addBook/NotesField';
import SeriesFields from './SeriesFields';
import FormModal from './FormModal';

import { stopBarcodeScan } from '../utils/barcodeScanner';
import { startDictation } from '../utils/voiceDictation';
import { COMMON_WARNINGS, COMMON_MOODS, GENRES } from './addBook/constants';

import React, { useState } from 'react';

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
      lists: form.selectedLists,
      createdAt: initialValues?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };
    console.log('[DEBUG] AddBookModal.handleSave called', book);
    if (onAdd) {
      console.log('[DEBUG] AddBookModal calling onAdd');
      onAdd(book);
    }
    onClose();
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
          setBarcodeScanError={form.setBarcodeScanError}
          setBarcodeModalOpen={form.setBarcodeModalOpen}
          loadQuagga={form.loadQuagga}
          videoRef={form.videoRef}
          scanBarcode={form.scanBarcode}
          stopBarcodeScan={stopBarcodeScan}
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
          idPrefix="main"
        />
        <GenreField
          t={t}
          genre={form.genre}
          setGenre={form.setGenre}
          subGenre={form.subGenre}
          setSubGenre={form.setSubGenre}
          genres={GENRES}
          idPrefix="main"
        />
        <SeriesFields
          series={form.series}
          setSeries={form.setSeries}
          seriesOrder={form.seriesOrder}
          setSeriesOrder={form.setSeriesOrder}
          idPrefix="main"
        />
        <DescriptionField
          t={t}
          description={form.description}
          setDescription={form.setDescription}
          idPrefix="main"
        />
        <SpiceMeterField
          t={t}
          spice={form.spice}
          setSpice={form.setSpice}
          idPrefix="main"
        />
        <StarRatingField
          t={t}
          rating={form.rating}
          setRating={form.setRating}
          idPrefix="main"
        />
        <FormatsOwnedField
          idPrefix="main"
          formatsOwned={form.formatsOwned}
          setFormatsOwned={form.setFormatsOwned}
        />
        <ContentWarningsField
          t={t}
          idPrefix="main"
          COMMON_WARNINGS={COMMON_WARNINGS}
          contentWarnings={form.contentWarnings}
          setContentWarnings={form.setContentWarnings}
          customWarning={form.customWarning}
          setCustomWarning={form.setCustomWarning}
          handleAddCustomWarning={handleAddCustomWarning}
          handleRemoveWarning={handleRemoveWarning}
        />
        <AssignListsField
          t={t}
          allLists={form.allLists}
          selectedLists={form.selectedLists}
          setSelectedLists={form.setSelectedLists}
          idPrefix="main"
        />
        <ReadingProgressField
          t={t}
          readingProgress={form.readingProgress}
          setReadingProgress={form.setReadingProgress}
          idPrefix="main"
        />
        <LastReadField
          t={t}
          lastRead={form.lastRead}
          setLastRead={form.setLastRead}
          idPrefix="main"
        />
        <MoodsField
          t={t}
          COMMON_MOODS={COMMON_MOODS}
          moods={form.moods}
          setMoods={form.setMoods}
          customMood={form.customMood}
          setCustomMood={form.setCustomMood}
          handleAddCustomMood={handleAddCustomMood}
          handleRemoveMood={handleRemoveMood}
          idPrefix="main"
        />
        <ReviewField
          t={t}
          review={form.review}
          setReview={form.setReview}
          idPrefix="main"
        />
        <NotesField
          t={t}
          notes={form.notes}
          setNotes={form.setNotes}
          idPrefix="main"
        />
        <BookCoverField
          t={t}
          cover={form.cover}
          handleCoverChange={form.setCover}
          title={form.title}
          idPrefix="main"
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
    <FormModal isOpen={opened} onClose={onClose} footer={footer}>
      {content}
    </FormModal>
  );
}
