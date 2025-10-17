import { HStack, IconButton } from "@chakra-ui/react";
import { FaPepperHot } from "react-icons/fa";

export default function SpiceMeter({
  value = 0,
  onChange,
  max = 5,
  size = 6,
  readOnly = false,
}) {
  return (
    <HStack spacing={1}>
      {Array.from({ length: max }).map((_, i) => (
        <IconButton
          key={i}
          icon={
            <FaPepperHot
              color={i < value ? "#e53e3e" : "#cbd5e1"}
              size={size * 4}
            />
          }
          aria-label={`Spice level ${i + 1}`}
          variant="ghost"
          size="sm"
          isRound
          onClick={() => !readOnly && onChange && onChange(i + 1)}
          tabIndex={readOnly ? -1 : 0}
          _focus={{ boxShadow: "none" }}
          _hover={readOnly ? {} : { bg: "red.50" }}
          isDisabled={readOnly}
        />
      ))}
    </HStack>
  );
}
