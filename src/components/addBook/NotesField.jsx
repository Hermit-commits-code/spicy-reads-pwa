import React from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";

export default function NotesField({ t, notes, setNotes }) {
  return (
    <FormControl>
      <FormLabel>{t("notes", "Notes")}</FormLabel>
      <Input
        placeholder={t("notes_placeholder", "Personal notes (optional)")}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        aria-label={t("notes", "Notes")}
        size="md"
      />
    </FormControl>
  );
}
