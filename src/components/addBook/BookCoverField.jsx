import React from 'react';
import { FormControl, FormLabel, Input, Box } from '@chakra-ui/react';

export default function BookCoverField({ t, cover, handleCoverChange, title }) {
  // Handles file input and converts to base64
  const onFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new window.FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === 'string') {
        handleCoverChange(event.target.result); // base64 string
      }
    };
    reader.readAsDataURL(file);
  };
  return (
    <FormControl>
      <FormLabel htmlFor="book-cover-input">
        {t('book_cover', 'Book Cover')}
      </FormLabel>
      <Input
        id="book-cover-input"
        name="book-cover"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        aria-label="Upload book cover"
        size="md"
        p={2}
      />
      {cover && (
        <Box mt={2} textAlign="center">
          <img
            src={cover}
            alt={title ? `${title} cover preview` : 'Book cover preview'}
            style={{
              maxWidth: '100px',
              maxHeight: '140px',
              margin: '0 auto',
              borderRadius: '8px',
            }}
          />
        </Box>
      )}
    </FormControl>
  );
}
