import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";

/**
 * BaseModal - A reusable modal wrapper for forms and dialogs.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - title: string or ReactNode
 * - children: ReactNode (modal body)
 * - footer: ReactNode (modal footer, optional)
 * - size: Chakra size (optional)
 * - isCentered: boolean (optional)
 * - ...rest: any other Modal props
 */
export default function BaseModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  isCentered = true,
  ...rest
}) {
  // Use 'full' modal size for mobile devices
  const modalSize =
    typeof window !== "undefined" && window.innerWidth < 600 ? "full" : size;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={modalSize}
      isCentered={isCentered}
      {...rest}
    >
      <ModalOverlay />
      <ModalContent
        sx={{
          borderRadius: [0, "md"],
          m: [0, "auto"],
        }}
      >
        <ModalHeader>{title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody
          sx={{
            maxHeight: ["100vh", "calc(100vh - 64px)"],
            minHeight: ["60vh", "60vh"],
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
            paddingBottom: 2,
          }}
        >
          {children}
        </ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
}
