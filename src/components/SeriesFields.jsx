import { FormControl, FormLabel, Input } from "@chakra-ui/react";

/**
 * SeriesFields - Modular form fields for book series info.
 * Props:
 *   series: string
 *   setSeries: function
 *   seriesOrder: string|number
 *   setSeriesOrder: function
 */
export default function SeriesFields({
  series,
  setSeries,
  seriesOrder,
  setSeriesOrder,
}) {
  return (
    <>
      <FormControl>
        <FormLabel>Series</FormLabel>
        <Input
          value={series}
          onChange={(e) => setSeries(e.target.value)}
          placeholder="Series name (optional)"
          aria-label="Series name"
          size="md"
        />
      </FormControl>
      <FormControl>
        <FormLabel>Series Order</FormLabel>
        <Input
          type="number"
          value={seriesOrder}
          onChange={(e) => setSeriesOrder(e.target.value)}
          placeholder="Book's number in series (optional)"
          aria-label="Series order"
          size="md"
          min={1}
        />
      </FormControl>
    </>
  );
}
