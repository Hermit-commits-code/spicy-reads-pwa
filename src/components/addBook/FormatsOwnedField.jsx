import React from 'react';
import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  Stack,
  Checkbox,
  Text,
  HStack,
  Box,
} from '@chakra-ui/react';
import { FORMAT_COLORS } from '../FormatTag';

const FORMAT_OPTIONS = [
  { value: 'physical', label: 'Physical' },
  { value: 'digital', label: 'Digital/eBook' },
  { value: 'audiobook', label: 'Audiobook' },
];

export default function FormatsOwnedField({ formatsOwned, setFormatsOwned }) {
  return (
    <FormControl>
      <FormLabel>Formats Owned</FormLabel>
      <CheckboxGroup value={formatsOwned} onChange={setFormatsOwned}>
        <Stack direction="column" spacing={1}>
          {FORMAT_OPTIONS.map((opt) => (
            <Checkbox
              key={opt.value}
              value={opt.value}
              pr={2}
              py={2}
              alignItems="center"
            >
              <HStack spacing={2} align="center">
                <Box
                  as="span"
                  boxSize="16px"
                  borderRadius="full"
                  bg={FORMAT_COLORS[opt.value] || 'gray.300'}
                  border="2px solid #e2e8f0"
                  display="inline-block"
                  flexShrink={0}
                />
                <Text
                  as="span"
                  color={FORMAT_COLORS[opt.value] || 'gray.700'}
                  fontWeight="bold"
                  fontSize="md"
                  lineHeight={1}
                >
                  {opt.label}
                </Text>
              </HStack>
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
    </FormControl>
  );
}
