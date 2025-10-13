import React from 'react';
import { HStack, IconButton, FormControl, FormLabel } from '@chakra-ui/react';
import { FaStar } from 'react-icons/fa';

export default function StarRating({
  t,
  rating,
  setRating,
  max = 5,
  idPrefix = '',
}) {
  const groupName = `${idPrefix}-star-rating`;
  return (
    <FormControl>
      <FormLabel htmlFor={`${groupName}-1`}>{t('rating')}</FormLabel>
      <HStack spacing={1}>
        {[...Array(max)].map((_, i) => {
          const value = i + 1;
          const inputId = `${groupName}-${value}`;
          return (
            <span key={value}>
              <input
                type="radio"
                id={inputId}
                name={groupName}
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                style={{ display: 'none' }}
              />
              <IconButton
                as="label"
                htmlFor={inputId}
                aria-label={t('star_rating', { value })}
                icon={<FaStar color={value <= rating ? '#FFD700' : '#ccc'} />}
                variant="ghost"
                size="sm"
                isRound
                tabIndex={0}
                onClick={() => setRating(value)}
              />
            </span>
          );
        })}
      </HStack>
    </FormControl>
  );
}
