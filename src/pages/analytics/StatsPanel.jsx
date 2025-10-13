import React from 'react';
import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';

export default function StatsPanel({
  t,
  totalBooks,
  finishedBooks,
  readingStreak,
  avgSpice,
  avgRating,
}) {
  return (
    <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={6} mb={8}>
      <Stat>
        <StatLabel>{t('total_books', 'Total Books')}</StatLabel>
        <StatNumber>{totalBooks}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>{t('books_finished', 'Books Finished')}</StatLabel>
        <StatNumber>{finishedBooks}</StatNumber>
        <StatHelpText>
          {totalBooks > 0
            ? `${Math.round((finishedBooks / totalBooks) * 100)}% ${t(
                'finished',
                'finished',
              )}`
            : ''}
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>{t('reading_streak', 'Reading Streak')}</StatLabel>
        <StatNumber>
          {readingStreak} {t('days', 'days')}
        </StatNumber>
        <StatHelpText>
          {t('consecutive_days', 'Consecutive days with reading activity')}
        </StatHelpText>
      </Stat>
      <Stat>
        <StatLabel>{t('avg_spice', 'Avg. Spice')}</StatLabel>
        <StatNumber>{avgSpice}</StatNumber>
      </Stat>
      <Stat>
        <StatLabel>{t('avg_rating', 'Avg. Rating')}</StatLabel>
        <StatNumber>{avgRating}</StatNumber>
      </Stat>
    </SimpleGrid>
  );
}
