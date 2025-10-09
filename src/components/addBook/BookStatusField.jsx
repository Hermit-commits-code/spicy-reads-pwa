import React from "react";
import {
  FormControl,
  FormLabel,
  RadioGroup,
  Stack,
  Radio,
} from "@chakra-ui/react";

export default function BookStatusField({ bookStatus, setBookStatus }) {
  return (
    <FormControl>
      <FormLabel>Book Status</FormLabel>
      <RadioGroup value={bookStatus} onChange={setBookStatus}>
        <Stack direction="row">
          <Radio value="checkedOut">Checked Out</Radio>
          <Radio value="ownDigital">Own Digitally</Radio>
          <Radio value="ownPhysical">Own Physically</Radio>
        </Stack>
      </RadioGroup>
    </FormControl>
  );
}
