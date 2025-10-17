import {
  Box,
  Heading,
  Stack,
  HStack,
  Input,
  Button,
  IconButton,
  Text,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Checkbox,
  CheckboxGroup,
  useClipboard,
  Textarea,
} from '@chakra-ui/react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiMenu } from 'react-icons/fi';
import {
  EditIcon,
  DeleteIcon,
  CheckIcon,
  CloseIcon,
  LinkIcon,
} from '@chakra-ui/icons';
import { useEffect, useState } from 'react';

import { db } from '../utils/db';

// Gold Standard: Remove db import, use books prop only
import { useTranslation } from 'react-i18next';

export default function Lists({ books = [] }) {
  const { t } = useTranslation();
  const bg = 'white';
  const border = 'gray.200';
  const text = 'gray.700';
  const muted = 'gray.400';
  const {
    onCopy,
    setValue: setClipboardValue,
    hasCopied,
    value: clipboardValue,
  } = useClipboard('');
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const toast = useToast();
  const [shareOpen, setShareOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignList, setAssignList] = useState(null);
  const [selectedBookIds, setSelectedBookIds] = useState([]);
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 900;

  // Load lists from IndexedDB
  useEffect(() => {
    db.lists
      .orderBy('order')
      .toArray()
      .then((fetched) => {
        // fallback for lists without 'order' property
        setLists(fetched.map((l, i) => ({ ...l, order: l.order ?? i })));
      });
  }, []);
  // Open assign modal and load current books for list
  const handleOpenAssign = async (list) => {
    setAssignList(list);
    // Get bookIds for this list
    const listBooks = await db.listBooks
      .where('listId')
      .equals(list.id)
      .toArray();
    setSelectedBookIds(listBooks.map((lb) => lb.bookId));
    setAssignOpen(true);
  };

  // Save assigned books to list
  const handleSaveAssign = async () => {
    if (!assignList) return;
    // Remove all current assignments for this list
    await db.listBooks.where('listId').equals(assignList.id).delete();
    // Add new assignments
    await Promise.all(
      selectedBookIds.map((bookId) =>
        db.listBooks.add({ listId: assignList.id, bookId }),
      ),
    );
    // Update the lists property on all books
    const allBooks = await db.books.toArray();
    await Promise.all(
      allBooks.map(async (book) => {
        let lists = Array.isArray(book.lists) ? [...book.lists] : [];
        // Remove this list from all books
        lists = lists.filter((id) => String(id) !== String(assignList.id));
        // Add this list to selected books
        if (selectedBookIds.includes(book.id)) {
          lists.push(String(assignList.id));
        }
        // Only update if changed
        await db.books.update(book.id, { lists });
      }),
    );
    setAssignOpen(false);
    setAssignList(null);
    setSelectedBookIds([]);
    // Notify App to refresh books from IndexedDB
    window.dispatchEvent(new Event('booksChanged'));
    toast({
      title: t('list_updated', 'List updated'),
      status: 'success',
      duration: 1500,
    });
  };

  const refreshLists = () =>
    db.lists
      .orderBy('order')
      .toArray()
      .then((fetched) => {
        setLists(fetched.map((l, i) => ({ ...l, order: l.order ?? i })));
      });

  const handleAddList = async () => {
    if (!newList.trim()) return;
    // Find max order
    const maxOrder =
      lists.length > 0 ? Math.max(...lists.map((l) => l.order ?? 0)) : 0;
    await db.lists.add({
      name: newList.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: maxOrder + 1,
    });
    setNewList('');
    refreshLists();
    toast({
      title: t('list_created', 'List created'),
      status: 'success',
      duration: 1500,
    });
  };

  const handleDeleteList = async (id) => {
    await db.lists.delete(id);
    refreshLists();
    toast({
      title: t('list_deleted', 'List deleted'),
      status: 'info',
      duration: 1500,
    });
  };

  // Drag-and-drop handler
  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(lists);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    // Update order property
    const updated = reordered.map((l, idx) => ({ ...l, order: idx }));
    setLists(updated);
    // Persist order in DB
    await Promise.all(
      updated.map((l) => db.lists.update(l.id, { order: l.order })),
    );
  };

  const handleEditList = (id, name) => {
    setEditingId(id);
    setEditingName(name);
  };

  const handleSaveEdit = async (id) => {
    if (!editingName.trim()) return;
    await db.lists.update(id, {
      name: editingName.trim(),
      updatedAt: Date.now(),
    });
    setEditingId(null);
    setEditingName('');
    refreshLists();
    toast({
      title: t('list_renamed', 'List renamed'),
      status: 'success',
      duration: 1500,
    });
  };

  // Generate a simple shareable JSON for now
  const handleOpenShare = (list) => {
    setClipboardValue(
      JSON.stringify(
        {
          name: list.name,
          books: books, // For now, just include all books; real sharing would filter by list
        },
        null,
        2,
      ),
    );
    setShareOpen(true);
  };

  return (
    <Box py={6} px={4} maxW={isDesktop ? '900px' : '480px'} mx="auto">
      <Heading as="h1" size="lg" mb={4} color={text}>
        My Lists
      </Heading>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Stack
          spacing={4}
          direction={isDesktop ? 'row' : 'column'}
          align={isDesktop ? 'flex-start' : 'stretch'}
        >
          <Box flex={isDesktop ? 2 : undefined} w="100%">
            <HStack mb={4} spacing={2} align="flex-end">
              <Input
                placeholder="New list name"
                value={newList}
                onChange={(e) => setNewList(e.target.value)}
                maxW={isDesktop ? '320px' : '240px'}
                aria-label="New list name"
                size={isDesktop ? 'lg' : 'md'}
              />
              <Button
                colorScheme="red"
                onClick={handleAddList}
                aria-label="Add list"
                size={isDesktop ? 'lg' : 'md'}
              >
                Add
              </Button>
            </HStack>
            {lists.length === 0 ? (
              <Text color={muted}>No lists yet. Create your first list!</Text>
            ) : (
              <Droppable droppableId="lists-droppable">
                {(provided) => (
                  <Stack
                    spacing={isDesktop ? 4 : 2}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    direction={isDesktop ? 'row' : 'column'}
                    wrap={isDesktop ? 'wrap' : undefined}
                  >
                    {lists.map((list, idx) => (
                      <Draggable
                        key={list.id}
                        draggableId={String(list.id)}
                        index={idx}
                      >
                        {(provided, snapshot) => (
                          <Box
                            minW={isDesktop ? '260px' : undefined}
                            maxW={isDesktop ? '320px' : undefined}
                            w={isDesktop ? '100%' : undefined}
                            bg={snapshot.isDragging ? 'red.50' : bg}
                            borderRadius="md"
                            borderWidth={1}
                            borderColor={border}
                            p={isDesktop ? 4 : 3}
                            mb={isDesktop ? 0 : 2}
                            mr={isDesktop ? 2 : 0}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            boxShadow={snapshot.isDragging ? 'lg' : undefined}
                            opacity={snapshot.isDragging ? 0.92 : 1}
                            transition="box-shadow 0.2s, opacity 0.2s, background 0.2s, transform 0.1s"
                            style={{
                              ...provided.draggableProps.style,
                              cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                              transform: snapshot.isDragging
                                ? `${
                                    provided.draggableProps.style?.transform ||
                                    ''
                                  } scale(1.03)`
                                : provided.draggableProps.style?.transform,
                              display: 'flex',
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                            role="listitem"
                            aria-roledescription="Draggable list item"
                          >
                            <Box
                              {...provided.dragHandleProps}
                              aria-label="Drag to reorder"
                              tabIndex={0}
                              pr={2}
                              pl={0}
                              py={1}
                              cursor={snapshot.isDragging ? 'grabbing' : 'grab'}
                              _focus={{ outline: '2px solid #E53E3E' }}
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              minW="36px"
                              minH="36px"
                              borderRadius="md"
                              bg={
                                snapshot.isDragging ? 'red.100' : 'transparent'
                              }
                            >
                              <FiMenu
                                size={24}
                                color="#E53E3E"
                                aria-hidden="true"
                              />
                            </Box>
                            <Box flex={1} minW={0} pr={2}>
                              {editingId === list.id ? (
                                <HStack spacing={2} align="center">
                                  <Input
                                    value={editingName}
                                    onChange={(e) =>
                                      setEditingName(e.target.value)
                                    }
                                    maxW="180px"
                                    size={isDesktop ? 'md' : 'sm'}
                                    aria-label="Edit list name"
                                  />
                                  <IconButton
                                    icon={<CheckIcon />}
                                    aria-label="Save list name"
                                    size={isDesktop ? 'md' : 'sm'}
                                    colorScheme="green"
                                    onClick={() => handleSaveEdit(list.id)}
                                    isRound
                                    tabIndex={0}
                                  />
                                  <IconButton
                                    icon={<CloseIcon />}
                                    aria-label="Cancel edit"
                                    size={isDesktop ? 'md' : 'sm'}
                                    onClick={() => setEditingId(null)}
                                    isRound
                                    tabIndex={0}
                                  />
                                </HStack>
                              ) : (
                                <Text
                                  fontWeight="medium"
                                  color={text}
                                  wordBreak="break-word"
                                  fontSize={isDesktop ? 'lg' : 'md'}
                                  maxW="220px"
                                  whiteSpace="normal"
                                  noOfLines={2}
                                >
                                  {list.name}
                                </Text>
                              )}
                            </Box>
                            <HStack spacing={1} align="center">
                              <Button
                                size={isDesktop ? 'sm' : 'md'}
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleOpenAssign(list)}
                                aria-label={`Manage books in list ${list.name}`}
                              >
                                Manage
                              </Button>
                              <IconButton
                                icon={<EditIcon />}
                                aria-label={`Rename list ${list.name}`}
                                size={isDesktop ? 'sm' : 'md'}
                                onClick={() =>
                                  handleEditList(list.id, list.name)
                                }
                                isRound
                                tabIndex={0}
                              />
                              <IconButton
                                icon={<LinkIcon />}
                                aria-label={`Share list ${list.name}`}
                                size={isDesktop ? 'sm' : 'md'}
                                colorScheme="blue"
                                onClick={() => handleOpenShare(list)}
                                isRound
                                tabIndex={0}
                              />
                              <IconButton
                                icon={<DeleteIcon />}
                                aria-label={`Delete list ${list.name}`}
                                size={isDesktop ? 'sm' : 'md'}
                                colorScheme="red"
                                onClick={() => handleDeleteList(list.id)}
                                isRound
                                tabIndex={0}
                              />
                            </HStack>
                            {/* Share List Modal */}
                            <Modal
                              isOpen={shareOpen}
                              onClose={() => setShareOpen(false)}
                              isCentered
                            >
                              <ModalOverlay />
                              <ModalContent>
                                <ModalHeader>Share List</ModalHeader>
                                <ModalCloseButton />
                                <ModalBody>
                                  <Text mb={2}>
                                    Copy and share this list with others:
                                  </Text>
                                  <Textarea
                                    value={clipboardValue}
                                    isReadOnly
                                    rows={8}
                                    mb={2}
                                  />
                                  <Button
                                    colorScheme="blue"
                                    onClick={onCopy}
                                    mb={2}
                                  >
                                    {hasCopied
                                      ? 'Copied!'
                                      : 'Copy to Clipboard'}
                                  </Button>
                                  <Text fontSize="xs" color="gray.500">
                                    (In a real app, this would generate a public
                                    link or export file.)
                                  </Text>
                                </ModalBody>
                                <ModalFooter>
                                  <Button
                                    onClick={() => setShareOpen(false)}
                                    size="md"
                                  >
                                    Close
                                  </Button>
                                </ModalFooter>
                              </ModalContent>
                            </Modal>
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            )}
          </Box>
          {/* Assign Books Modal */}
          <Modal
            isOpen={assignOpen}
            onClose={() => setAssignOpen(false)}
            isCentered
          >
            <ModalOverlay />
            <ModalContent
              bg={bg}
              color={text}
              px={{ base: 2, md: 6 }}
              py={{ base: 2, md: 4 }}
            >
              <ModalHeader fontSize={{ base: 'lg', md: 'xl' }}>
                Assign Books to List
              </ModalHeader>
              <ModalCloseButton size="lg" />
              <ModalBody pb={4}>
                <CheckboxGroup
                  value={selectedBookIds}
                  onChange={setSelectedBookIds}
                  aria-label="Assign books to list"
                >
                  <Stack maxH="240px" overflowY="auto" spacing={3}>
                    {books.length === 0 ? (
                      <Text color={muted}>No books available.</Text>
                    ) : (
                      books.map((book) => (
                        <Checkbox
                          key={book.id}
                          value={book.id}
                          size="lg"
                          py={2}
                          display="flex"
                          alignItems="center"
                        >
                          {book.cover && (
                            <img
                              src={book.cover}
                              alt={
                                book.title
                                  ? `${book.title} cover`
                                  : 'Book cover'
                              }
                              style={{
                                width: 32,
                                height: 48,
                                objectFit: 'cover',
                                marginRight: 8,
                                borderRadius: 4,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                              }}
                            />
                          )}
                          <span style={{ fontWeight: 500 }}>
                            {book.title && book.title.trim()
                              ? book.title
                              : 'Untitled'}
                          </span>
                          <Text as="span" color="gray.500" fontSize="xs" ml={2}>
                            by {book.author}
                          </Text>
                        </Checkbox>
                      ))
                    )}
                  </Stack>
                </CheckboxGroup>
              </ModalBody>
              <ModalFooter>
                <Button
                  onClick={() => setAssignOpen(false)}
                  mr={2}
                  aria-label="Cancel assign books"
                  size="lg"
                  minW="44px"
                  minH="44px"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleSaveAssign}
                  aria-label="Save assigned books"
                  size="lg"
                  minW="44px"
                  minH="44px"
                >
                  Save
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </Stack>
      </DragDropContext>
    </Box>
  );
}
