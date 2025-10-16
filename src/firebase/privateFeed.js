// Firestore helpers for private (friends-only) feed
import { db } from './db';
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Fetch all posts from a user's private feed
export async function fetchPrivateFeedPosts(userId) {
  const q = query(
    collection(db, `privateFeed/${userId}/posts`),
    orderBy('timestamp', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Add a post to the user's private feed (for friends feed sharing)
export async function addPrivateFeedPost(userId, post) {
  return addDoc(collection(db, `privateFeed/${userId}/posts`), {
    ...post,
    timestamp: serverTimestamp(),
  });
}
