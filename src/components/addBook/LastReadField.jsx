import React from "react";
import { FormControl, FormLabel, Input, Text } from "@chakra-ui/react";

export default function LastReadField({ t, lastRead, setLastRead }) {
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
