import React, { useState } from 'react';
import {
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  Stack,
  Checkbox,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Box,
  Input,
  HStack,
  IconButton,
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon } from '@chakra-ui/icons';

export default function AssignListsField({
  t,
  allLists,
  selectedLists,
  setSelectedLists,
}) {
  const [newListName, setNewListName] = useState('');
  const [creating, setCreating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // Add new list handler (calls Dexie directly for now)
  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setCreating(true);
    const db = (await import('../../db/booksDB')).default;
    const id = await db.lists.add({
      name: newListName.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: allLists.length,
    });
    setNewListName('');
    setCreating(false);
    // Auto-select the new list (avoid duplicates)
    setSelectedLists((prev) => {
      const prevArr = Array.isArray(prev) ? prev : [];
      const newId = String(id);
      return prevArr.includes(newId) ? prevArr : [...prevArr, newId];
    });
    // Optionally, reload allLists (parent should reload, but for instant feedback):
    if (typeof window !== 'undefined')
      window.dispatchEvent(new Event('booksChanged'));
  };
  return (
    <FormControl>
      <FormLabel>{t('assign_to_lists')}</FormLabel>
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          w="100%"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {(() => {
            const validSelected = allLists.filter((l) =>
              selectedLists.includes(String(l.id)),
            );
            if (validSelected.length === 0) {
              return t('select_lists', 'Select lists');
            } else if (validSelected.length === 1) {
              return validSelected[0].name;
            } else {
              return `${validSelected.length} lists selected`;
            }
          })()}
        </MenuButton>
        <MenuList minW="260px" maxH="260px" overflowY="auto" px={2}>
          <CheckboxGroup
            value={selectedLists.map(String)}
            onChange={setSelectedLists}
          >
            <Stack>
              {allLists.map((list) => (
                <Checkbox key={list.id} value={String(list.id)}>
                  {list.name}
                </Checkbox>
              ))}
            </Stack>
          </CheckboxGroup>
          <Box borderTop="1px solid #eee" mt={2} pt={2}>
            <HStack spacing={2}>
              <Input
                size="sm"
                placeholder={t('new_list_name', 'New list name')}
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateList();
                }}
                disabled={creating}
              />
              <IconButton
                icon={<AddIcon />}
                size="sm"
                colorScheme="red"
                aria-label={t('add', 'Add')}
                onClick={handleCreateList}
                isDisabled={creating || !newListName.trim()}
              />
            </HStack>
          </Box>
        </MenuList>
      </Menu>
      {/* Show selected lists as tags below the combo box */}
      {selectedLists.length > 0 && (
        <Wrap mt={2} spacing={2} maxW="100%">
          {allLists
            .filter((l) => selectedLists.includes(String(l.id)))
            .map((list) => (
              <WrapItem key={list.id}>
                <Tag
                  size="md"
                  borderRadius="full"
                  variant="solid"
                  colorScheme="red"
                >
                  <TagLabel>{list.name}</TagLabel>
                  <TagCloseButton
                    onClick={() => {
                      setSelectedLists(
                        selectedLists.filter((id) => id !== String(list.id)),
                      );
                    }}
                  />
                </Tag>
              </WrapItem>
            ))}
        </Wrap>
      )}
      <Text fontSize="xs" color="gray.500" mt={1}>
        {t('assign_lists_hint', 'You can assign this book to multiple lists.')}
      </Text>
    </FormControl>
  );
}
