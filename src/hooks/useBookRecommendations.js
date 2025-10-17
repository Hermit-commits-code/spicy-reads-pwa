import { useEffect, useState } from 'react';
// import db from '../db/booksDB';
import { getRecommendedBooks } from '../utils/recommendations';

export function useBookRecommendations(book) {
  const [similarBooks, setSimilarBooks] = useState([]);
  useEffect(() => {
    if (!book) return;
    db.books.toArray().then((allBooks) => {
      const recs = getRecommendedBooks(allBooks, {
        max: 4,
        excludeIds: [book.id],
      }).filter((b) => b.id !== book.id);
      setSimilarBooks(recs);
    });
  }, [book]);
  return similarBooks;
}
