import React from 'react';
import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  Stack,
  Checkbox,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  Button,
  Text,
} from '@chakra-ui/react';

export default function MoodsField({
  t,
  COMMON_MOODS,
  moods,
  setMoods,
  customMood,
  setCustomMood,
  handleAddCustomMood,
  handleRemoveMood,
  idPrefix = '',
}) {
  const groupName = `${idPrefix}-moods-checkbox-group`;
  const customInputId = `${idPrefix}-custom-mood-input`;
  return (
    <FormControl>
      <FormLabel id={`${groupName}-label`}>{t('moods_vibes')}</FormLabel>
      <CheckboxGroup
        colorScheme="purple"
        value={moods}
        onChange={setMoods}
        name={groupName}
        aria-labelledby={`${groupName}-label`}
      >
        <Stack direction="column" spacing={1}>
          {COMMON_MOODS.map((option) => (
            <Checkbox
              key={option}
              value={option}
              id={`${groupName}-${option}`}
              name={`${groupName}-${option}`}
            >
              {option}
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
      <HStack mt={2} spacing={2} flexWrap="wrap">
        {moods.map((mood) => (
          <Tag key={mood} size="sm" colorScheme="purple" borderRadius="full">
            <TagLabel>{mood}</TagLabel>
            <TagCloseButton
              onClick={() => handleRemoveMood(mood)}
              aria-label={t('remove_mood', { mood })}
            />
          </Tag>
        ))}
      </HStack>
      <HStack mt={2}>
        <FormLabel htmlFor={customInputId} fontSize="sm" mb={0}>
          {t('add_custom_mood', 'Add custom mood/vibe')}
        </FormLabel>
        <Input
          id={customInputId}
          name={customInputId}
          size="sm"
          placeholder={t('add_custom_mood', 'Add custom mood/vibe')}
          value={customMood}
          onChange={(e) => setCustomMood(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddCustomMood();
          }}
          aria-label={t('add_custom_mood', 'Add custom mood')}
        />
        <Button
          size="sm"
          onClick={handleAddCustomMood}
          aria-label={t('add_custom_mood', 'Add custom mood')}
        >
          Add
        </Button>
      </HStack>
      <Text fontSize="xs" color="gray.500" mt={1}>
        {t('select_all_apply', 'Select all that apply or add your own.')}
      </Text>
    </FormControl>
  );
}
