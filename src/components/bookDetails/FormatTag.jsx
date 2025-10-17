import React from 'react';
import { Tag, TagLabel } from '@chakra-ui/react';

export const FORMAT_LABELS = {
  physical: 'Physical',
  digital: 'Digital/eBook',
  audiobook: 'Audiobook',
};

export const FORMAT_COLORS = {
  physical: 'red.400', // or any color you prefer
  digital: 'blue.400',
  audiobook: 'orange.400',
};

export default function FormatTag({ format }) {
  if (!format || !FORMAT_LABELS[format]) return null;
  return (
    <Tag size="sm" colorScheme="blue" borderRadius="full" mx={0.5}>
      <TagLabel>{FORMAT_LABELS[format]}</TagLabel>
    </Tag>
  );
}
