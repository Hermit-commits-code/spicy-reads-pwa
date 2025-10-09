import React from "react";
import {
  FormControl,
  FormLabel,
  Input,
  HStack,
  Button,
  Text,
} from "@chakra-ui/react";

export default function BookAuthorField({
  t,
  author,
  setAuthor,
  dictationError,
  dictatingField,
  setDictationError,
  setDictatingField,
  startDictation,
}) {
  return (
    <FormControl isRequired>
      <FormLabel htmlFor="book-author-input">{t("book_author")}</FormLabel>
      <HStack>
        <Input
          id="book-author-input"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          aria-label={t("book_author")}
          autoComplete="off"
          size="md"
        />
        <Button
          size="sm"
          onClick={async () => {
            setDictationError("");
            setDictatingField("author");
            try {
              const transcript = await startDictation();
              setAuthor(transcript);
            } catch (err) {
              setDictationError("Voice input failed: " + (err?.message || err));
            }
            setDictatingField(null);
          }}
          aria-label={t("voice_input_author", "Voice input for author")}
          isLoading={dictatingField === "author"}
        >
          🎤
        </Button>
      </HStack>
      {dictationError && <Text color="red.500">{dictationError}</Text>}
    </FormControl>
  );
}
