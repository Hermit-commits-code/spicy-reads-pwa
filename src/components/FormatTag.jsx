import React from 'react';
import { Tag, TagLabel } from '@chakra-ui/react';

const FORMAT_LABELS = {
  physical: 'Physical',
  digital: 'Digital/eBook',
  audiobook: 'Audiobook',
};

export default function FormatTag({ format }) {
  if (!format || !FORMAT_LABELS[format]) return null;
  return (
    <Tag size="sm" colorScheme="blue" borderRadius="full" mx={0.5}>
      <TagLabel>{FORMAT_LABELS[format]}</TagLabel>
    </Tag>
  );
}
