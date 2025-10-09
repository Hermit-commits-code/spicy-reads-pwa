import React from "react";
import { FormControl, FormLabel, Input } from "@chakra-ui/react";

export default function ReviewField({ t, review, setReview }) {
  return (
    <FormControl>
      <FormLabel>{t("review", "Review")}</FormLabel>
      <Input
        placeholder={t("review_placeholder", "Write your review (optional)")}
        value={review}
        onChange={(e) => setReview(e.target.value)}
        aria-label={t("review", "Review")}
        size="md"
      />
    </FormControl>
  );
}
