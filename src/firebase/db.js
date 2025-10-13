// Export all user data (books, lists, listBooks) as JSON
export async function exportUserData(userId) {
  const booksSnap = await getDocs(collection(db, 'users', userId, 'books'));
  const listsSnap = await getDocs(collection(db, 'users', userId, 'lists'));
  const listBooksSnap = await getDocs(
    collection(db, 'users', userId, 'listBooks'),
  );
  return {
    books: booksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    lists: listsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    listBooks: listBooksSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
  };
}

// Restore all user data from JSON backup
export async function importUserData(userId, data) {
  // Clear existing collections (dangerous: only use for full restore)
  // Delete all docs in books, lists, listBooks
  const batchDeletes = async (colName) => {
    const snap = await getDocs(collection(db, 'users', userId, colName));
    const batch = [];
    snap.forEach((docu) =>
      batch.push(deleteDoc(doc(db, 'users', userId, colName, docu.id))),
    );
    await Promise.all(batch);
  };
  await batchDeletes('books');
  await batchDeletes('lists');
  await batchDeletes('listBooks');
  // Add new docs
  const addAll = async (colName, arr) => {
    const colRef = collection(db, 'users', userId, colName);
    await Promise.all(
      arr.map((item) => setDoc(doc(colRef, item.id || undefined), item)),
    );
  };
  await addAll('books', data.books || []);
  await addAll('lists', data.lists || []);
  await addAll('listBooks', data.listBooks || []);
}
// Firestore database helpers
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import firebaseApp from './config';

const db = getFirestore(firebaseApp);
export default db;

// Example: Get all books for a user
export function getUserBooks(userId) {
  const booksRef = collection(db, 'users', userId, 'books');
  return getDocs(booksRef);
}

// Example: Add a book for a user
export function addUserBook(userId, bookData) {
  const booksRef = collection(db, 'users', userId, 'books');
  return addDoc(booksRef, bookData);
}

// Example: Update a book
export function updateUserBook(userId, bookId, bookData) {
  const bookRef = doc(db, 'users', userId, 'books', bookId);
  return updateDoc(bookRef, bookData);
}

// Example: Delete a book
export function deleteUserBook(userId, bookId) {
  const bookRef = doc(db, 'users', userId, 'books', bookId);
  return deleteDoc(bookRef);
}

// Listen to real-time updates
export function listenToUserBooks(userId, callback) {
  const booksRef = collection(db, 'users', userId, 'books');
  return onSnapshot(booksRef, callback);
}

export { db };
