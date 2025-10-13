import React from 'react';
import {
  FormControl,
  FormLabel,
  Stack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
} from '@chakra-ui/react';

export default function ReadingProgressField({
  t,
  readingProgress,
  setReadingProgress,
  idPrefix = '',
}) {
  const inputId = `${idPrefix}-reading-progress-input`;
  return (
    <FormControl>
      <FormLabel htmlFor={inputId}>{t('reading_progress')}</FormLabel>
      <Stack direction="row" align="center">
        <Slider
          min={0}
          max={100}
          step={1}
          value={readingProgress}
          onChange={setReadingProgress}
          flex={1}
          aria-label={t('reading_progress')}
        >
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
        <Text minW="40px" textAlign="right">
          {readingProgress}%
        </Text>
      </Stack>
      <Text fontSize="xs" color="gray.500" mt={1}>
        {t('reading_progress_hint', 'How much of this book have you read?')}
      </Text>
    </FormControl>
  );
}
