import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
} from '@chakra-ui/react';
import SetReminderButton from '../SetReminderButton';

export default function RemindMeAfterAddModal({ isOpen, onClose, book }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Book Added!</ModalHeader>
        <ModalBody>
          <Text mb={3}>
            {book.title} by {book.author} is scheduled to release on{' '}
            {book.releaseDate
              ? new Date(book.releaseDate).toLocaleDateString()
              : 'a future date'}
            .
          </Text>
          <SetReminderButton book={book} />
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} colorScheme="blue">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
