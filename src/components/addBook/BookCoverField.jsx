import React from "react";
import { FormControl, FormLabel, Input, Box } from "@chakra-ui/react";

export default function BookCoverField({ t, cover, handleCoverChange, title }) {
  return (
    <FormControl>
      <FormLabel htmlFor="book-cover-input">
        {t("book_cover", "Book Cover")}
      </FormLabel>
      <Input
        id="book-cover-input"
        type="file"
        accept="image/*"
        onChange={handleCoverChange}
        aria-label="Upload book cover"
        size="md"
        p={2}
      />
      {cover && (
        <Box mt={2} textAlign="center">
          <img
            src={cover}
            alt={title ? `${title} cover preview` : "Book cover preview"}
            style={{
              maxWidth: "100px",
              maxHeight: "140px",
              margin: "0 auto",
              borderRadius: "8px",
            }}
          />
        </Box>
      )}
    </FormControl>
  );
}
