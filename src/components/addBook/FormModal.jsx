import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react';

export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel,
  idPrefix = '',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <ModalBody>
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return child;
              // Only add idPrefix to non-fragment elements
              if (child.type === React.Fragment) return child;
              return React.cloneElement(child, { idPrefix });
            })}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} type="submit">
              {submitLabel}
            </Button>
            <Button onClick={onClose}>{'Cancel'}</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
