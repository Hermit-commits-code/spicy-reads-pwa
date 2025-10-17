import React, { useRef, useEffect } from 'react';
import { stopBarcodeScan } from '../../utils/barcodeScanner';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  FormControl,
  FormLabel,
  Text,
} from '@chakra-ui/react';

export default function BarcodeScanModal({
  isOpen,
  onClose,
  onScan,
  t,
  error,
  idPrefix = '',
}) {
  const inputRef = useRef();
  const inputId = `${idPrefix}-barcode-input`;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Wrap onClose to also call stopBarcodeScan
  const handleClose = () => {
    try {
      if (typeof stopBarcodeScan === 'function') stopBarcodeScan();
    } catch (err) {
      console.warn('stopBarcodeScan failed', err);
    }
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t('scan_barcode', 'Scan Book Barcode')}</ModalHeader>
        <ModalCloseButton onClick={handleClose} />
        <ModalBody>
          <FormControl>
            <FormLabel htmlFor={inputId}>{t('barcode')}</FormLabel>
            <Input
              id={inputId}
              name={inputId}
              ref={inputRef}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onScan(e.target.value);
                }
              }}
              aria-label={t('barcode')}
              autoComplete="off"
            />
          </FormControl>
          {error && <Text color="red.500">{error}</Text>}
          <Text fontSize="sm" color="gray.500">
            {t(
              'scan_barcode_hint',
              'Point your camera at the barcode (ISBN) on the back of the book.',
            )}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleClose}>{t('cancel')}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
