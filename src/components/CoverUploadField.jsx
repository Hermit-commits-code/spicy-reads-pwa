import { FormControl, FormLabel, Input, Box } from "@chakra-ui/react";

/**
 * CoverUploadField - Modular field for cover image upload and preview.
 * Props:
 *   cover: string (data URL)
 *   setCover: function
 *   t: translation function
 *   handleCoverChange: function
 *   title: string (for alt text)
 */
export default function CoverUploadField({
  cover,
  setCover,
  t,
  handleCoverChange,
  title,
}) {
  return (
    <FormControl>
      <FormLabel htmlFor="book-cover-input">
        {t("book_cover", "Book Cover")}
      </FormLabel>
      <Input
        id="book-cover-input"
        type="file"
        accept="image/*"
        capture="environment"
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
