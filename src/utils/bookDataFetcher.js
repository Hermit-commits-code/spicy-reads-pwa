// Enhanced book data fetcher using multiple APIs
// src/utils/bookDataFetcher.js

/**
 * Smart book data fetching from multiple sources
 * Priority: ISBN > Open Library > Google Books > Manual
 */

export async function fetchBookByISBN(isbn) {
  if (!isbn) return null;

  // Clean ISBN
  const cleanISBN = isbn.replace(/[-\s]/g, "");

  // Try multiple APIs in order of reliability
  const sources = [
    () => fetchFromOpenLibrary(cleanISBN),
    () => fetchFromGoogleBooks(cleanISBN),
    () => fetchFromLibraryOfCongress(cleanISBN),
  ];

  for (const fetchFunction of sources) {
    try {
      const result = await fetchFunction();
      if (result && result.title) {
        return result;
      }
    } catch (error) {
      console.warn("Book fetch attempt failed:", error);
    }
  }

  return null;
}

async function fetchFromOpenLibrary(isbn) {
  const response = await fetch(
    `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
  );
  const data = await response.json();

  const bookData = data[`ISBN:${isbn}`];
  if (!bookData) return null;

  return {
    title: bookData.title,
    author: bookData.authors?.[0]?.name,
    publishDate: bookData.publish_date,
    publisher: bookData.publishers?.[0]?.name,
    pageCount: bookData.number_of_pages,
    description: bookData.description || bookData.subtitle, // Add description support
    cover: bookData.cover?.large || bookData.cover?.medium,
    isbn: isbn,
    source: "Open Library",
  };
}

async function fetchFromGoogleBooks(isbn) {
  const response = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
  );
  const data = await response.json();

  if (!data.items || data.items.length === 0) return null;

  const book = data.items[0].volumeInfo;

  return {
    title: book.title,
    author: book.authors?.[0],
    publishDate: book.publishedDate,
    publisher: book.publisher,
    pageCount: book.pageCount,
    description: book.description,
    genre: book.categories?.[0],
    cover: book.imageLinks?.thumbnail || book.imageLinks?.smallThumbnail,
    isbn: isbn,
    source: "Google Books",
  };
}

async function fetchFromLibraryOfCongress(isbn) {
  // Library of Congress API
  const response = await fetch(`https://www.loc.gov/books/?q=${isbn}&fo=json`);
  const data = await response.json();

  if (!data.results || data.results.length === 0) return null;

  const book = data.results[0];

  return {
    title: book.title,
    author: book.contributors?.[0]?.name,
    publishDate: book.date,
    isbn: isbn,
    source: "Library of Congress",
  };
}

// Smart search when no ISBN available
export async function searchBooks(query) {
  if (!query || query.length < 3) return [];

  try {
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        query
      )}&maxResults=10`
    );
    const data = await response.json();

    if (!data.items) return [];

    return data.items.map((item) => {
      const book = item.volumeInfo;
      return {
        title: book.title,
        author: book.authors?.[0],
        publishDate: book.publishedDate,
        publisher: book.publisher,
        genre: book.categories?.[0],
        cover: book.imageLinks?.thumbnail,
        isbn: book.industryIdentifiers?.[0]?.identifier,
        googleBooksId: item.id,
        source: "Google Books Search",
      };
    });
  } catch (error) {
    console.error("Book search failed:", error);
    return [];
  }
}

// Extract book info from text (manual input helper)
export function parseBookText(text) {
  if (!text) return {};

  // Common patterns for book information
  const patterns = {
    // "Title by Author"
    titleByAuthor: /^(.+?)\s+by\s+(.+)$/i,
    // "Author - Title"
    authorDashTitle: /^(.+?)\s*[-–]\s*(.+)$/,
    // "Title (Author)"
    titleParenAuthor: /^(.+?)\s*\((.+?)\)$/,
  };

  for (const [patternName, regex] of Object.entries(patterns)) {
    const match = text.match(regex);
    if (match) {
      const [, part1, part2] = match;

      if (patternName === "titleByAuthor") {
        return { title: part1.trim(), author: part2.trim() };
      } else if (patternName === "authorDashTitle") {
        return { author: part1.trim(), title: part2.trim() };
      } else if (patternName === "titleParenAuthor") {
        return { title: part1.trim(), author: part2.trim() };
      }
    }
  }

  // If no pattern matches, assume it's a title for search
  return { searchQuery: text.trim() };
}
