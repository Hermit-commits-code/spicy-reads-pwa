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

export default function ContentWarningsField({
  t,
  COMMON_WARNINGS,
  contentWarnings,
  setContentWarnings,
  customWarning,
  setCustomWarning,
  handleAddCustomWarning,
  handleRemoveWarning,
  idPrefix = '',
}) {
  const groupName = `${idPrefix}-content-warnings-checkbox-group`;
  const customInputId = `${idPrefix}-custom-warning-input`;
  return (
    <FormControl>
      <FormLabel id={`${groupName}-label`}>{t('content_warnings')}</FormLabel>
      <CheckboxGroup
        colorScheme="red"
        value={contentWarnings}
        onChange={setContentWarnings}
        name={groupName}
        aria-labelledby={`${groupName}-label`}
      >
        <Stack direction="column" spacing={1}>
          {COMMON_WARNINGS.map((option) => (
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
        {contentWarnings.map((warning) => (
          <Tag key={warning} size="sm" colorScheme="red" borderRadius="full">
            <TagLabel>{warning}</TagLabel>
            <TagCloseButton
              onClick={() => handleRemoveWarning(warning)}
              aria-label={t('remove_warning', { warning })}
            />
          </Tag>
        ))}
      </HStack>
      <HStack mt={2}>
        <FormLabel htmlFor={customInputId} fontSize="sm" mb={0}>
          {t('add_custom_warning', 'Add custom warning')}
        </FormLabel>
        <Input
          id={customInputId}
          name={customInputId}
          size="sm"
          placeholder={t('add_custom_warning', 'Add custom warning')}
          value={customWarning}
          onChange={(e) => setCustomWarning(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleAddCustomWarning();
          }}
          aria-label={t('add_custom_warning', 'Add custom warning')}
        />
        <Button
          size="sm"
          onClick={handleAddCustomWarning}
          aria-label={t('add_custom_warning', 'Add custom warning')}
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
