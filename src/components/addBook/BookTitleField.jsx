import React from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  HStack,
  Button,
  Text,
} from '@chakra-ui/react';

export default function BookTitleField({
  t,
  title,
  setTitle,
  dictationError,
  dictatingField,
  setDictationError,
  setDictatingField,
  startDictation,
  idPrefix = '',
}) {
  const inputId = `${idPrefix}-book-title-input`;
  return (
    <FormControl isRequired>
      <FormLabel htmlFor={inputId}>{t('book_title')}</FormLabel>
      <HStack>
        <Input
          id={inputId}
          name={inputId}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label={t('book_title')}
          autoComplete="off"
          size="md"
        />
        <Button
          size="sm"
          onClick={async () => {
            setDictationError('');
            setDictatingField('title');
            try {
              const transcript = await startDictation();
              setTitle(transcript);
            } catch (err) {
              setDictationError('Voice input failed: ' + (err?.message || err));
            }
            setDictatingField(null);
          }}
          aria-label={t('voice_input_title', 'Voice input for title')}
          isLoading={dictatingField === 'title'}
        >
          🎤
        </Button>
      </HStack>
      {dictationError && <Text color="red.500">{dictationError}</Text>}
    </FormControl>
  );
}
