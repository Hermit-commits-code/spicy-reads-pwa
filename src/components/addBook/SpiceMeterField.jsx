import React from 'react';
import { FormControl, FormLabel, Text } from '@chakra-ui/react';
import SpiceMeter from './SpiceMeter';

export default function SpiceMeterField({ t, spice, setSpice, idPrefix }) {
  return (
    <FormControl>
      <FormLabel>{t('spice_meter')}</FormLabel>
      <SpiceMeter t={t} spice={spice} setSpice={setSpice} idPrefix={idPrefix} />
      <Text fontSize="xs" color="gray.500" mt={1}>
        {t('spice_meter_hint', 'How spicy is this book?')}
      </Text>
    </FormControl>
  );
}
