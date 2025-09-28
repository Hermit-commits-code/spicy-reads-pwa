import React from "react";
import BaseModal from "./BaseModal";
import { Stack } from "@chakra-ui/react";

/**
 * FormModal - A modal for forms with a stacked body and custom footer.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - title: string or ReactNode
 * - children: ReactNode (form fields)
 * - footer: ReactNode (modal footer, e.g. buttons)
 * - size: Chakra size (optional)
 * - isCentered: boolean (optional)
 * - ...rest: any other Modal props
 */
export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  isCentered = true,
  ...rest
}) {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      isCentered={isCentered}
      footer={footer}
      {...rest}
    >
      <Stack spacing={4}>{children}</Stack>
    </BaseModal>
  );
}
