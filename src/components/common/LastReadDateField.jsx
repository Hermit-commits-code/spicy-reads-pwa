import { FormControl, FormLabel, Input, Text } from "@chakra-ui/react";

/**
 * LastReadDateField - Modular field for last read date input.
 * Props:
 *   lastRead: string (date)
 *   setLastRead: function
 *   t: translation function
 */
export default function LastReadDateField({ lastRead, setLastRead, t }) {
  return (
    <FormControl>
      <FormLabel>{t("last_read_date")}</FormLabel>
      <Input
        type="date"
        value={lastRead}
        onChange={(e) => setLastRead(e.target.value)}
        aria-label={t("last_read_date")}
        size="md"
        max={new Date().toISOString().slice(0, 10)}
      />
      <Text fontSize="xs" color="gray.500" mt={1}>
        {t("last_read_hint", "When did you last read this book?")}
      </Text>
    </FormControl>
  );
}
