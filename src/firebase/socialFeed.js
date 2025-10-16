// Firestore helpers for the social feed
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './db';

const FEED_COLLECTION = 'feed';

export async function addFeedPost({
  userId,
  userName,
  userPhotoUrl,
  bookId,
  bookTitle,
  bookAuthor,
  bookCoverUrl,
}) {
  return addDoc(collection(db, FEED_COLLECTION), {
    userId,
    userName,
    userPhotoUrl,
    bookId,
    bookTitle,
    bookAuthor,
    bookCoverUrl,
    timestamp: serverTimestamp(),
  });
}

export async function fetchFeedPosts(limit = 30) {
  const q = query(
    collection(db, FEED_COLLECTION),
    orderBy('timestamp', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
