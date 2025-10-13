import React from 'react';
import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  Stack,
  Checkbox,
} from '@chakra-ui/react';

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
        <Stack direction="row">
          {FORMAT_OPTIONS.map((opt) => (
            <Checkbox key={opt.value} value={opt.value}>
              {opt.label}
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
    </FormControl>
  );
}
