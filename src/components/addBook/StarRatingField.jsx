import React from 'react';
import { FormControl, FormLabel, Text } from '@chakra-ui/react';
import StarRating from './StarRating';

export default function StarRatingField({ t, rating, setRating, idPrefix }) {
  return (
    <FormControl>
      <FormLabel>{t('rating')}</FormLabel>
      <StarRating
        t={t}
        rating={rating}
        setRating={setRating}
        idPrefix={idPrefix}
      />
      <Text fontSize="xs" color="gray.500" mt={1}>
        {t('rating_hint', 'Your personal rating')}
      </Text>
    </FormControl>
  );
}
