import {
  Box,
  Input,
  Select,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import db from "../db/booksDB";

export default function Search({ books }) {
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [spiceFilter, setSpiceFilter] = useState(0);
  const [ratingFilter, setRatingFilter] = useState(0);
  const [lists, setLists] = useState([]);
  const [listFilter, setListFilter] = useState("");

  useEffect(() => {
    db.lists.toArray().then(setLists);
  }, []);

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      !search ||
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.author.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = !genreFilter || book.genre === genreFilter;
    const matchesSpice = !spiceFilter || (book.spice || 0) >= spiceFilter;
    const matchesRating = !ratingFilter || (book.rating || 0) >= ratingFilter;
    const matchesList =
      !listFilter || (book.lists && book.lists.includes(listFilter));
    return (
      matchesSearch &&
      matchesGenre &&
      matchesSpice &&
      matchesRating &&
      matchesList
    );
  });

  return (
    <Box py={6} px={4}>
      <VStack spacing={4} align="stretch" mb={4}>
        <Input
          placeholder="Search by title or author"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          maxW="300px"
          aria-label="Search by title or author"
          size="md"
        />
        <Select
          placeholder="All genres"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          maxW="180px"
          aria-label="Filter by genre"
          size="md"
        >
          {Array.from(new Set(books.map((b) => b.genre).filter(Boolean))).map(
            (g) => (
              <option key={g} value={g}>
                {g}
              </option>
            )
          )}
        </Select>
        <Select
          placeholder="All lists"
          value={listFilter}
          onChange={(e) => setListFilter(e.target.value)}
          maxW="180px"
          aria-label="Filter by list"
          size="md"
        >
          {lists.map((list) => (
            <option key={list.id} value={list.id}>
              {list.name}
            </option>
          ))}
        </Select>
        <Box maxW="180px">
          <Text fontSize="xs" color="gray.500" mb={1} id="spice-slider-label">
            Min Spice
          </Text>
          <Slider
            min={0}
            max={5}
            step={1}
            value={spiceFilter}
            onChange={setSpiceFilter}
            aria-labelledby="spice-slider-label"
            aria-valuetext={`Minimum spice level ${spiceFilter}`}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
        <Box maxW="180px">
          <Text fontSize="xs" color="gray.500" mb={1} id="rating-slider-label">
            Min Rating
          </Text>
          <Slider
            min={0}
            max={5}
            step={1}
            value={ratingFilter}
            onChange={setRatingFilter}
            aria-labelledby="rating-slider-label"
            aria-valuetext={`Minimum rating ${ratingFilter}`}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>
      </VStack>
      {filteredBooks.length === 0 ? (
        <Text color="gray.400">
          No books found. Try adjusting your search or filters.
        </Text>
      ) : (
        <VStack align="stretch" spacing={8}>
          {filteredBooks.map((book) => (
            <Box
              key={book.id}
              p={2}
              borderWidth={1}
              borderRadius="lg"
              bg="white"
              boxShadow="sm"
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="space-between"
              transition="box-shadow 0.2s"
              _hover={{ boxShadow: "lg" }}
            >
              <Text fontWeight="bold">{book.title}</Text>
              <Text fontSize="sm" color="gray.700">
                {book.author}
              </Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}
