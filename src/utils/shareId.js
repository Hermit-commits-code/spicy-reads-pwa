// Utility to generate a unique, privacy-respecting share ID for a book
// Uses a hash of book fields that are safe to share (not user-specific)

// Simple hash function (FNV-1a, 32-bit)
function fnv1aHash(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  // Convert to unsigned and base36 for shortness
  return (hash >>> 0).toString(36);
}

// Only use non-sensitive fields for the hash
export function getBookShareId(book) {
  if (!book) return '';
  const safeString = [
    book.title || '',
    book.author || '',
    book.isbn || '',
    book.series || '',
    book.seriesOrder || '',
    book.genre || '',
    book.format || '',
  ].join('|');
  return fnv1aHash(safeString);
}
