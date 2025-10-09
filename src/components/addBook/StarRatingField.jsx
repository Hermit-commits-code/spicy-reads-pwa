import React from "react";
import { FormControl, FormLabel, Text } from "@chakra-ui/react";
import StarRating from "../StarRating";

export default function StarRatingField({ t, rating, setRating }) {
  return (
    <FormControl>
      <FormLabel>{t("rating")}</FormLabel>
      <StarRating
        value={rating}
        onChange={setRating}
        aria-label="Star rating"
      />
      <Text fontSize="xs" color="gray.500" mt={1}>
        {t("rating_hint", "Your personal rating")}
      </Text>
    </FormControl>
  );
}
