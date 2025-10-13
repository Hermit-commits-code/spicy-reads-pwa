import React from 'react';
import { FormControl, FormLabel, Input } from '@chakra-ui/react';

export default function DescriptionField({ t, description, setDescription }) {
  return (
    <FormControl>
      <FormLabel htmlFor="book-description-input">
        {t('book_description')}
      </FormLabel>
      <Input
        id="book-description-input"
        name="book-description"
        placeholder="Short description or notes"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        aria-label={t('book_description')}
        size="md"
      />
    </FormControl>
  );
}
