import React from 'react';
import { FormControl, FormLabel, Input } from '@chakra-ui/react';

export default function ReleaseDateField({
  t,
  releaseDate,
  setReleaseDate,
  idPrefix = '',
}) {
  const inputId = `${idPrefix}-release-date-input`;
  // Ensure value is always in 'yyyy-MM-ddThh:mm' format for datetime-local
  let formattedValue = releaseDate || '';
  if (formattedValue && /^\d{4}-\d{2}-\d{2}$/.test(formattedValue)) {
    formattedValue += 'T00:00';
  }
  return (
    <FormControl>
      <FormLabel htmlFor={inputId}>
        {t('release_date', 'Release Date')}
      </FormLabel>
      <Input
        id={inputId}
        name={inputId}
        type="datetime-local"
        value={formattedValue}
        onChange={(e) => setReleaseDate(e.target.value)}
        aria-label={t('release_date', 'Release Date')}
        size="md"
      />
    </FormControl>
  );
}
