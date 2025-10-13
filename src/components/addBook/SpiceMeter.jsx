import React from 'react';
import {
  HStack,
  IconButton,
  FormControl,
  FormLabel,
  Tooltip,
} from '@chakra-ui/react';
import { FaPepperHot } from 'react-icons/fa';

const spiceLabels = ['None', 'Mild', 'Medium', 'Hot', 'Inferno'];

export default function SpiceMeter({
  t,
  spice,
  setSpice,
  max = 5,
  idPrefix = '',
}) {
  const groupName = `${idPrefix}-spice-meter`;
  return (
    <FormControl>
      <FormLabel htmlFor={`${groupName}-1`}>{t('spice_meter')}</FormLabel>
      <HStack spacing={1}>
        {[...Array(max)].map((_, i) => {
          const value = i + 1;
          const inputId = `${groupName}-${value}`;
          return (
            <span key={value}>
              <input
                type="radio"
                id={inputId}
                name={groupName}
                value={value}
                checked={spice === value}
                onChange={() => setSpice(value)}
                style={{ display: 'none' }}
              />
              <Tooltip
                label={t('spice_level', { value, label: spiceLabels[i] })}
              >
                <IconButton
                  as="label"
                  htmlFor={inputId}
                  aria-label={t('spice_level', {
                    value,
                    label: spiceLabels[i],
                  })}
                  icon={
                    <FaPepperHot color={value <= spice ? '#FF5733' : '#ccc'} />
                  }
                  variant="ghost"
                  size="sm"
                  isRound
                  tabIndex={0}
                  onClick={() => setSpice(value)}
                />
              </Tooltip>
            </span>
          );
        })}
      </HStack>
    </FormControl>
  );
}
