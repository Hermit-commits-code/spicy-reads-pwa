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
} from "@chakra-ui/react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FiMenu } from "react-icons/fi";
import {
  EditIcon,
  DeleteIcon,
  CheckIcon,
  CloseIcon,
  LinkIcon,
} from "@chakra-ui/icons";
import { useEffect, useState } from "react";

import db from "../db/booksDB";
import { useTranslation } from "react-i18next";

export default function Lists({ books = [] }) {
  const { t } = useTranslation();
  const bg = "white";
  const border = "gray.200";
  const text = "gray.700";
  const muted = "gray.400";
  const {
    onCopy,
    setValue: setClipboardValue,
    hasCopied,
    value: clipboardValue,
  } = useClipboard("");
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const toast = useToast();
  const [shareOpen, setShareOpen] = useState(false);
  // const [shareList, setShareList] = useState(null); // shareList is not used directly
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignList, setAssignList] = useState(null);
  const [selectedBookIds, setSelectedBookIds] = useState([]);

  // Load lists from IndexedDB
  useEffect(() => {
    db.lists
      .orderBy("order")
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
      .where("listId")
      .equals(list.id)
      .toArray();
    setSelectedBookIds(listBooks.map((lb) => lb.bookId));
    setAssignOpen(true);
  };

  // Save assigned books to list
  const handleSaveAssign = async () => {
    if (!assignList) return;
    // Remove all current assignments for this list
    await db.listBooks.where("listId").equals(assignList.id).delete();
    // Add new assignments
    await Promise.all(
      selectedBookIds.map((bookId) =>
        db.listBooks.add({ listId: assignList.id, bookId })
      )
    );
    setAssignOpen(false);
    setAssignList(null);
    setSelectedBookIds([]);
    toast({
      title: t("list_updated", "List updated"),
      status: "success",
      duration: 1500,
    });
  };

  const refreshLists = () =>
    db.lists
      .orderBy("order")
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
    setNewList("");
    refreshLists();
    toast({
      title: t("list_created", "List created"),
      status: "success",
      duration: 1500,
    });
  };

  const handleDeleteList = async (id) => {
    await db.lists.delete(id);
    refreshLists();
    toast({
      title: t("list_deleted", "List deleted"),
      status: "info",
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
      updated.map((l) => db.lists.update(l.id, { order: l.order }))
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
    setEditingName("");
    refreshLists();
    toast({
      title: t("list_renamed", "List renamed"),
      status: "success",
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
        2
      )
    );
    setShareOpen(true);
  };

  return (
    <Box py={6} px={4} maxW="480px" mx="auto">
      <Heading as="h1" size="lg" mb={4} color={text}>
        My Lists
      </Heading>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Stack spacing={4}>
          <HStack>
            <Input
              placeholder="New list name"
              value={newList}
              onChange={(e) => setNewList(e.target.value)}
              maxW="240px"
              aria-label="New list name"
              size="md"
            />
            <Button
              colorScheme="red"
              onClick={handleAddList}
              aria-label="Add list"
              size="md"
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
                  spacing={2}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {lists.map((list, idx) => (
                    <Draggable
                      key={list.id}
                      draggableId={String(list.id)}
                      index={idx}
                    >
                      {(provided, snapshot) => (
                        <HStack
                          spacing={2}
                          bg={snapshot.isDragging ? "red.50" : bg}
                          borderRadius="md"
                          borderWidth={1}
                          borderColor={border}
                          p={{ base: 2, md: 3 }}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          boxShadow={snapshot.isDragging ? "lg" : undefined}
                          opacity={snapshot.isDragging ? 0.92 : 1}
                          transition="box-shadow 0.2s, opacity 0.2s, background 0.2s, transform 0.1s"
                          style={{
                            ...provided.draggableProps.style,
                            cursor: snapshot.isDragging ? "grabbing" : "grab",
                            transform: snapshot.isDragging
                              ? `${
                                  provided.draggableProps.style?.transform || ""
                                } scale(1.03)`
                              : provided.draggableProps.style?.transform,
                          }}
                          role="listitem"
                          aria-roledescription="Draggable list item"
                        >
                          {/* Drag handle for better mobile UX */}
                          <Box
                            {...provided.dragHandleProps}
                            aria-label="Drag to reorder"
                            tabIndex={0}
                            pr={1}
                            pl={0}
                            py={1}
                            cursor={snapshot.isDragging ? "grabbing" : "grab"}
                            _focus={{ outline: "2px solid #E53E3E" }}
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            minW={{ base: "32px", md: "36px" }}
                            minH={{ base: "32px", md: "36px" }}
                            borderRadius="md"
                            bg={snapshot.isDragging ? "red.100" : "transparent"}
                          >
                            <FiMenu
                              size={22}
                              color="#E53E3E"
                              aria-hidden="true"
                            />
                          </Box>
                          {editingId === list.id ? (
                            <>
                              <Input
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                maxW="180px"
                                size="md"
                                aria-label="Edit list name"
                              />
                              <IconButton
                                icon={<CheckIcon />}
                                aria-label="Save list name"
                                size="lg"
                                colorScheme="green"
                                onClick={() => handleSaveEdit(list.id)}
                                isRound
                                tabIndex={0}
                              />
                              <IconButton
                                icon={<CloseIcon />}
                                aria-label="Cancel edit"
                                size="lg"
                                onClick={() => setEditingId(null)}
                                isRound
                                tabIndex={0}
                              />
                            </>
                          ) : (
                            <>
                              <Text fontWeight="medium" color={text}>
                                {list.name}
                              </Text>
                              <Button
                                size="md"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleOpenAssign(list)}
                                aria-label={`Manage books in list ${list.name}`}
                              >
                                Manage Books
                              </Button>
                              <IconButton
                                icon={<EditIcon />}
                                aria-label={`Rename list ${list.name}`}
                                size="lg"
                                onClick={() =>
                                  handleEditList(list.id, list.name)
                                }
                                isRound
                                tabIndex={0}
                              />
                              <IconButton
                                icon={<LinkIcon />}
                                aria-label={`Share list ${list.name}`}
                                size="lg"
                                colorScheme="blue"
                                onClick={() => handleOpenShare(list)}
                                isRound
                                tabIndex={0}
                              />
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
                                        ? "Copied!"
                                        : "Copy to Clipboard"}
                                    </Button>
                                    <Text fontSize="xs" color="gray.500">
                                      (In a real app, this would generate a
                                      public link or export file.)
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
                              <IconButton
                                icon={<DeleteIcon />}
                                aria-label={`Delete list ${list.name}`}
                                size="lg"
                                colorScheme="red"
                                onClick={() => handleDeleteList(list.id)}
                                isRound
                                tabIndex={0}
                              />
                            </>
                          )}
                        </HStack>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </Stack>
              )}
            </Droppable>
          )}

          {/* Assign Books Modal */}
          <Modal
            isOpen={assignOpen}
            onClose={() => setAssignOpen(false)}
            isCentered
          >
            <ModalOverlay />
            <ModalContent bg={bg} color={text}>
              <ModalHeader>Assign Books to List</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <CheckboxGroup
                  value={selectedBookIds}
                  onChange={setSelectedBookIds}
                  aria-label="Assign books to list"
                >
                  <Stack maxH="240px" overflowY="auto">
                    {books.length === 0 ? (
                      <Text color={muted}>No books available.</Text>
                    ) : (
                      books.map((book) => (
                        <Checkbox key={book.id} value={book.id}>
                          {book.title}{" "}
                          <Text as="span" color="gray.500" fontSize="xs">
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
                  size="md"
                >
                  Cancel
                </Button>
                <Button
                  colorScheme="red"
                  onClick={handleSaveAssign}
                  aria-label="Save assigned books"
                  size="md"
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
