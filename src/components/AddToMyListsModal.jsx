import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  VStack,
  Text,
  Image,
  Checkbox,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { getUserLists } from '../firebase/lists';
import { addBookToMyLists } from '../utils/addBookToMyLists';

export default function AddToMyListsModal({
  isOpen,
  onClose,
  book,
  userId,
  onAdded,
}) {
  const [lists, setLists] = useState([]);
  const [selectedLists, setSelectedLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // Refetch lists when modal opens or after a new list is created
  const fetchLists = async () => {
    if (userId) {
      setLoading(true);
      const userLists = await getUserLists(userId);
      setLists(userLists);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLists();
    }
  }, [isOpen, userId]);

  // Optionally, expose fetchLists to parent via onAdded callback
  useEffect(() => {
    if (onAdded) {
      onAdded(fetchLists);
    }
  }, [onAdded]);

  const handleListToggle = (listId) => {
    setSelectedLists((prev) =>
      prev.includes(listId)
        ? prev.filter((id) => id !== listId)
        : [...prev, listId],
    );
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      await addBookToMyLists(userId, book, selectedLists);
      toast({
        title: 'Book added!',
        description: 'Added to your lists.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onAdded && onAdded();
      onClose();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.message || 'Could not add book.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add to My Lists</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="start">
            {book.coverUrl && (
              <Image
                src={book.coverUrl}
                alt={book.bookTitle}
                maxH="120px"
                borderRadius="md"
              />
            )}
            <Text fontWeight="bold" fontSize="lg">
              {book.bookTitle || book.title}
            </Text>
            <Text fontSize="md" color="gray.600">
              by {book.bookAuthor || book.author}
            </Text>
            <Text fontSize="sm" color="gray.500">
              Select lists to add this book:
            </Text>
            {loading ? (
              <Spinner />
            ) : lists.length === 0 ? (
              <Text>No lists found. Create a list first!</Text>
            ) : (
              <VStack align="start" spacing={2}>
                {lists.map((list) => (
                  <Checkbox
                    key={list.id}
                    isChecked={selectedLists.includes(list.id)}
                    onChange={() => handleListToggle(list.id)}
                  >
                    {list.name}
                  </Checkbox>
                ))}
              </VStack>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="teal"
            onClick={handleAdd}
            isLoading={loading}
            isDisabled={selectedLists.length === 0}
            aria-label="Add book to selected lists"
          >
            Add Book to My Lists
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
