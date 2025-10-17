import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  Stack,
  Checkbox,
  HStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Input,
  Button,
  Text,
} from "@chakra-ui/react";

/**
 * ContentWarningsField - Modular field for content warnings selection and custom input.
 * Props:
 *   value: array of selected warnings
 *   onChange: function to update selected warnings
 *   customWarning: string (for custom input)
 *   setCustomWarning: function
 *   COMMON_WARNINGS: array of warning strings
 *   t: translation function
 *   handleAddCustomWarning: function
 *   handleRemoveWarning: function
 */
export default function ContentWarningsField({
  value,
  onChange,
  customWarning,
  setCustomWarning,
  COMMON_WARNINGS,
  t,
  handleAddCustomWarning,
  handleRemoveWarning,
}) {
  return (
    <FormControl>
      <FormLabel>{t("content_warnings")}</FormLabel>
      <CheckboxGroup
        value={value}
        onChange={onChange}
        aria-label={t("content_warnings")}
      >
        <Stack direction="row" flexWrap="wrap">
          {COMMON_WARNINGS.map((warning) => (
            <Checkbox key={warning} value={warning}>
              {warning}
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
      <HStack mt={2} spacing={2} flexWrap="wrap">
        {value.map((warning) => (
          <Tag key={warning} size="sm" colorScheme="red" borderRadius="full">
            <TagLabel>{warning}</TagLabel>
            <TagCloseButton
              onClick={() => handleRemoveWarning(warning)}
              aria-label={t("remove_warning", { warning })}
            />
          </Tag>
        ))}
      </HStack>
      <HStack mt={2}>
        <Input
          size="sm"
          placeholder={t("add_custom_warning", "Add custom warning")}
          value={customWarning}
          onChange={(e) => setCustomWarning(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddCustomWarning();
          }}
          aria-label={t("add_custom_warning", "Add custom warning")}
        />
        <Button
          size="sm"
          onClick={handleAddCustomWarning}
          aria-label={t("add_custom_warning", "Add custom warning")}
        >
          Add
        </Button>
      </HStack>
      <Text fontSize="xs" color="gray.500" mt={1}>
        {t("select_all_apply", "Select all that apply or add your own.")}
      </Text>
    </FormControl>
  );
}
