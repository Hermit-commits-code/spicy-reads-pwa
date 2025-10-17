import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Input,
  useClipboard,
  useToast,
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';

export default function BookDetailsShareModal({
  isOpen,
  onClose,
  shareData,
  shareUrl,
}) {
  const { t } = useTranslation();
  const { onCopy, setValue, hasCopied } = useClipboard('');
  const toast = useToast();

  const handleCopyLink = () => {
    setValue(shareUrl);
    onCopy();
    toast({
      title: t('copied_to_clipboard', 'Copied to clipboard!'),
      status: 'success',
      duration: 1500,
      isClosable: true,
    });
  };

  const handleCopyDetails = () => {
    setValue(shareData.text);
    onCopy();
    toast({
      title: t('copied_to_clipboard', 'Copied to clipboard!'),
      status: 'success',
      duration: 1500,
      isClosable: true,
    });
  };

  const handleEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(
        shareData.title,
      )}&body=${encodeURIComponent(shareData.text + '\n' + shareUrl)}`,
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('share_book', 'Share Book')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Text>{t('share_options', 'Choose how to share this book:')}</Text>
            <HStack>
              <Button onClick={handleCopyLink} colorScheme="blue">
                {t('copy_link', 'Copy Link')}
              </Button>
              <Button onClick={handleCopyDetails} colorScheme="teal">
                {t('copy_details', 'Copy Details')}
              </Button>
              <Button onClick={handleEmail} colorScheme="purple">
                {t('share_email', 'Share via Email')}
              </Button>
            </HStack>
            <Input value={shareUrl} isReadOnly size="sm" />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>{t('close', 'Close')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
