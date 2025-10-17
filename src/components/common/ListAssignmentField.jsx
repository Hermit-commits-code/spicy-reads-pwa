import {
  FormControl,
  FormLabel,
  CheckboxGroup,
  Stack,
  Checkbox,
  Text,
} from "@chakra-ui/react";

/**
 * ListAssignmentField - Modular field for assigning book to lists.
 * Props:
 *   allLists: array of list objects
 *   selectedLists: array of selected list ids
 *   setSelectedLists: function
 *   t: translation function
 */
export default function ListAssignmentField({
  allLists,
  selectedLists,
  setSelectedLists,
  t,
}) {
  return (
    <FormControl>
      <FormLabel>{t("assign_to_lists")}</FormLabel>
      <CheckboxGroup
        value={selectedLists}
        onChange={setSelectedLists}
        aria-label={t("assign_to_lists")}
      >
        <Stack direction="row" flexWrap="wrap">
          {allLists.map((list) => (
            <Checkbox key={list.id} value={list.id}>
              {list.name}
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
      <Text fontSize="xs" color="gray.500" mt={1}>
        {t("assign_lists_hint", "You can assign this book to multiple lists.")}
      </Text>
    </FormControl>
  );
}
