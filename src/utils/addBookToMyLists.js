import { addUserBook } from '../firebase/db';
import { addBookToList } from '../firebase/lists';

/**
 * Adds a book to the user's collection and assigns it to selected lists.
 * Only public-safe fields are copied. No notes/review.
 * @param {string} userId - Current user ID
 * @param {object} book - Book object from friend post
 * @param {Array<string>} listIds - List IDs to assign
 * @returns {Promise<string>} - New book ID
 */
export async function addBookToMyLists(userId, book, listIds) {
  const bookData = {
    title: book.bookTitle || book.title,
    author: book.bookAuthor || book.author,
    cover: book.coverUrl || book.cover,
    genre: book.genre,
    spice: book.spice,
    contentWarnings: book.contentWarnings,
    moods: book.moods,
    series: book.series,
    seriesOrder: book.seriesOrder,
    // Do NOT copy notes/review
  };
  const bookRef = await addUserBook(userId, bookData);
  for (const listId of listIds) {
    await addBookToList(userId, listId, bookRef.id);
  }
  return bookRef.id;
}
