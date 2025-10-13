import React from 'react';
import { FormControl, FormLabel, Input } from '@chakra-ui/react';

export default function LastReadDateField({
  t,
  lastReadDate,
  setLastReadDate,
  idPrefix = '',
}) {
  const inputId = `${idPrefix}-last-read-date-input`;
  return (
    <FormControl>
      <FormLabel htmlFor={inputId}>{t('last_read_date')}</FormLabel>
      <Input
        id={inputId}
        name={inputId}
        type="date"
        value={lastReadDate || ''}
        onChange={(e) => setLastReadDate(e.target.value)}
        aria-label={t('last_read_date')}
      />
    </FormControl>
  );
}
