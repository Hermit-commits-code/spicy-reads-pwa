import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
} from "@chakra-ui/react";

export default function BarcodeScanModal({
  isOpen,
  onClose,
  videoRef,
  barcodeScanError,
  stopBarcodeScan,
  t = (s) => s,
}) {
  // Wrap onClose to also call stopBarcodeScan
  const handleClose = () => {
    if (stopBarcodeScan) stopBarcodeScan();
    onClose();
  };
  return (
    <Modal isOpen={isOpen} onClose={handleClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("scan_barcode", "Scan Book Barcode")}</ModalHeader>
        <ModalCloseButton onClick={handleClose} />
        <ModalBody>
          <Box mb={2}>
            <video
              ref={videoRef}
              style={{ width: "100%", borderRadius: 8 }}
              autoPlay
              muted
              playsInline
            />
          </Box>
          {barcodeScanError && <Text color="red.500">{barcodeScanError}</Text>}
          <Text fontSize="sm" color="gray.500">
            {t(
              "scan_barcode_hint",
              "Point your camera at the barcode (ISBN) on the back of the book."
            )}
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button onClick={handleClose}>{t("cancel")}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
