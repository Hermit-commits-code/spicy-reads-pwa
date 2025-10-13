import React from 'react';
import { FormControl, FormLabel, Select } from '@chakra-ui/react';

export default function GenreField({
  t,
  genre,
  setGenre,
  subGenre,
  setSubGenre,
  genres,
}) {
  return (
    <>
      <FormControl isRequired>
        <FormLabel htmlFor="book-genre-input">{t('book_genre')}</FormLabel>
        <Select
          id="book-genre-input"
          name="book-genre"
          placeholder="Select genre"
          value={genre}
          onChange={(e) => {
            setGenre(e.target.value);
            setSubGenre('');
          }}
          aria-label={t('book_genre')}
          size="md"
        >
          {genres.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </Select>
      </FormControl>
      <FormControl isRequired>
        <FormLabel htmlFor="book-subgenre-input">
          {t('book_subgenre')}
        </FormLabel>
        <Select
          id="book-subgenre-input"
          name="book-subgenre"
          placeholder="Select sub-genre"
          value={subGenre}
          onChange={(e) => setSubGenre(e.target.value)}
          isDisabled={!genre}
          aria-label={t('book_subgenre')}
          size="md"
        >
          {genre &&
            genres
              .find((g) => g.value === genre)
              ?.subGenres.map((sg) => (
                <option key={sg} value={sg}>
                  {sg}
                </option>
              ))}
        </Select>
      </FormControl>
    </>
  );
}
