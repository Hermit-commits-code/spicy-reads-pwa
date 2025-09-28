import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Text,
} from "@chakra-ui/react";

/**
 * BarcodeScanModal - Modular modal for barcode scanning.
 * Props:
 *   isOpen: boolean
 *   onClose: function
 *   videoRef: ref
 *   barcodeScanError: string
 *   t: translation function
 *   stopBarcodeScan: function
 */
export default function BarcodeScanModal({
  isOpen,
  onClose,
  videoRef,
  barcodeScanError,
  t,
  stopBarcodeScan,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="sm">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{t("scan_barcode", "Scan Book Barcode")}</ModalHeader>
        <ModalCloseButton onClick={onClose} />
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
          <Button onClick={onClose}>{t("cancel")}</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
