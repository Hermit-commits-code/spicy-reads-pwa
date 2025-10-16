import { collection, addDoc, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from './db';

export async function getUserLists(userId) {
  const listsRef = collection(db, 'users', userId, 'lists');
  const snap = await getDocs(listsRef);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function addBookToList(userId, listId, bookId) {
  const listBooksRef = collection(db, 'users', userId, 'listBooks');
  // Use setDoc to avoid duplicates
  const docRef = doc(listBooksRef, `${listId}_${bookId}`);
  await setDoc(docRef, { listId, bookId });
}
