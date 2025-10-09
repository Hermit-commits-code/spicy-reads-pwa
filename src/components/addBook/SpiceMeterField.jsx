import React from "react";
import { FormControl, FormLabel, Text } from "@chakra-ui/react";
import SpiceMeter from "../SpiceMeter";

export default function SpiceMeterField({ t, spice, setSpice }) {
  return (
    <FormControl>
      <FormLabel>{t("spice_meter")}</FormLabel>
      <SpiceMeter value={spice} onChange={setSpice} aria-label="Spice meter" />
      <Text fontSize="xs" color="gray.500" mt={1}>
        {t("spice_meter_hint", "How spicy is this book?")}
      </Text>
    </FormControl>
  );
}
