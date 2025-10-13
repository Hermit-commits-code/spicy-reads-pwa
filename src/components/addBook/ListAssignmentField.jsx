import React from 'react';
import { FormControl, FormLabel, Select } from '@chakra-ui/react';

export default function ListAssignmentField({
  t,
  list,
  setList,
  lists,
  idPrefix = '',
}) {
  const selectId = `${idPrefix}-list-assignment-select`;
  return (
    <FormControl>
      <FormLabel htmlFor={selectId}>{t('assign_to_list')}</FormLabel>
      <Select
        id={selectId}
        name={selectId}
        value={list}
        onChange={(e) => setList(e.target.value)}
        aria-label={t('assign_to_list')}
      >
        <option value="">{t('none')}</option>
        {lists.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </Select>
    </FormControl>
  );
}
