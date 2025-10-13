import React from 'react';
import { FormControl, FormLabel, Input, HStack } from '@chakra-ui/react';

export default function SeriesFields({
  t,
  series,
  setSeries,
  seriesNumber,
  setSeriesNumber,
  idPrefix = '',
}) {
  const seriesId = `${idPrefix}-series-input`;
  const seriesNumberId = `${idPrefix}-series-number-input`;
  return (
    <HStack spacing={4} align="flex-end">
      <FormControl>
        <FormLabel htmlFor={seriesId}>{t('series')}</FormLabel>
        <Input
          id={seriesId}
          name={seriesId}
          value={series}
          onChange={(e) => setSeries(e.target.value)}
          aria-label={t('series')}
          autoComplete="off"
        />
      </FormControl>
      <FormControl width="120px">
        <FormLabel htmlFor={seriesNumberId}>{t('series_number')}</FormLabel>
        <Input
          id={seriesNumberId}
          name={seriesNumberId}
          value={seriesNumber}
          onChange={(e) => setSeriesNumber(e.target.value)}
          aria-label={t('series_number')}
          autoComplete="off"
          type="number"
          min="1"
        />
      </FormControl>
    </HStack>
  );
}
