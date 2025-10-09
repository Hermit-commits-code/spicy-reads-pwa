import React from "react";
import {
  FormControl,
  FormLabel,
  Input,
  HStack,
  Button,
  Text,
} from "@chakra-ui/react";

export default function BookTitleField({
  t,
  title,
  setTitle,
  dictationError,
  dictatingField,
  setDictationError,
  setDictatingField,
  startDictation,
  setBarcodeScanError,
  setBarcodeModalOpen,
  loadQuagga,
  videoRef,
  scanBarcode,
  stopBarcodeScan,
}) {
  return (
    <FormControl isRequired>
      <FormLabel htmlFor="book-title-input">{t("book_title")}</FormLabel>
      <HStack>
        <Input
          id="book-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label={t("book_title")}
          autoComplete="off"
          size="md"
        />
        <Button
          size="sm"
          onClick={async () => {
            setDictationError("");
            setDictatingField("title");
            try {
              const transcript = await startDictation();
              setTitle(transcript);
            } catch (err) {
              setDictationError("Voice input failed: " + (err?.message || err));
            }
            setDictatingField(null);
          }}
          aria-label={t("voice_input_title", "Voice input for title")}
          isLoading={dictatingField === "title"}
        >
          🎤
        </Button>
      </HStack>
      <Button
        mt={2}
        size="sm"
        onClick={async () => {
          setBarcodeScanError("");
          setBarcodeModalOpen(true);
          await loadQuagga();
          setTimeout(() => {
            if (videoRef.current) {
              scanBarcode(videoRef.current, async (code) => {
                setBarcodeModalOpen(false);
                stopBarcodeScan();
                // Try to fetch book info from Open Library API
                try {
                  const resp = await fetch(
                    `https://openlibrary.org/api/books?bibkeys=ISBN:${code}&format=json&jscmd=data`
                  );
                  const data = await resp.json();
                  const book = data[`ISBN:${code}`];
                  if (book) {
                    setTitle(book.title || "");
                  } else {
                    setBarcodeScanError("Book not found for scanned barcode.");
                  }
                } catch {
                  setBarcodeScanError("Failed to fetch book info.");
                }
              });
            }
          }, 300);
        }}
        leftIcon={
          <span role="img" aria-label="Scan barcode">
            📷
          </span>
        }
        aria-label={t("scan_barcode_info", "Scan barcode for book info")}
        variant="outline"
      >
        Scan Barcode
      </Button>
      {dictationError && <Text color="red.500">{dictationError}</Text>}
    </FormControl>
  );
}
