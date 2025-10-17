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
 * MoodsField - Modular field for moods/vibes selection and custom input.
 * Props:
 *   value: array of selected moods
 *   onChange: function to update selected moods
 *   customMood: string (for custom input)
 *   setCustomMood: function
 *   COMMON_MOODS: array of mood strings
 *   t: translation function
 *   handleAddCustomMood: function
 *   handleRemoveMood: function
 */
export default function MoodsField({
  value,
  onChange,
  customMood,
  setCustomMood,
  COMMON_MOODS,
  t,
  handleAddCustomMood,
  handleRemoveMood,
}) {
  return (
    <FormControl>
      <FormLabel>{t("moods_vibes")}</FormLabel>
      <CheckboxGroup
        value={value}
        onChange={onChange}
        aria-label={t("moods_vibes")}
      >
        <Stack direction="row" flexWrap="wrap">
          {COMMON_MOODS.map((mood) => (
            <Checkbox key={mood} value={mood}>
              {mood}
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
      <HStack mt={2} spacing={2} flexWrap="wrap">
        {value.map((mood) => (
          <Tag key={mood} size="sm" colorScheme="purple" borderRadius="full">
            <TagLabel>{mood}</TagLabel>
            <TagCloseButton
              onClick={() => handleRemoveMood(mood)}
              aria-label={t("remove_mood", { mood })}
            />
          </Tag>
        ))}
      </HStack>
      <HStack mt={2}>
        <Input
          size="sm"
          placeholder={t("add_custom_mood", "Add custom mood/vibe")}
          value={customMood}
          onChange={(e) => setCustomMood(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddCustomMood();
          }}
          aria-label={t("add_custom_mood", "Add custom mood")}
        />
        <Button
          size="sm"
          onClick={handleAddCustomMood}
          aria-label={t("add_custom_mood", "Add custom mood")}
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
