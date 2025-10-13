import React from 'react';
import { Box, Text, Progress } from '@chakra-ui/react';

export default function BooksFinishedPanel({
  t,
  text,
  muted,
  totalBooks,
  finishedBooks,
}) {
  return (
    <Box>
      <Text fontWeight="bold" mb={2} color={text}>
        {t('books_finished_label', 'Books Finished')}
      </Text>
      <Progress
        value={totalBooks ? (finishedBooks / totalBooks) * 100 : 0}
        colorScheme="green"
        borderRadius="md"
        aria-label={t('books_finished_label', 'Books Finished')}
      />
      <Text fontSize="sm" color={muted} mt={1}>
        {finishedBooks} {t('finished', 'finished')}
      </Text>
    </Box>
  );
}
