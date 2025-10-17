import { HStack, IconButton } from "@chakra-ui/react";
import { FaStar } from "react-icons/fa";

export default function StarRating({
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
            <FaStar color={i < value ? "#ecc94b" : "#cbd5e1"} size={size * 4} />
          }
          aria-label={`Rating ${i + 1}`}
          variant="ghost"
          size="sm"
          isRound
          onClick={() => !readOnly && onChange && onChange(i + 1)}
          tabIndex={readOnly ? -1 : 0}
          _focus={{ boxShadow: "none" }}
          _hover={readOnly ? {} : { bg: "yellow.50" }}
          isDisabled={readOnly}
        />
      ))}
    </HStack>
  );
}
