// Firestore helpers for friend/follow system
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { db } from './db';

// Send a friend request
export async function sendFriendRequest(fromUserId, toUserId) {
  const requestRef = doc(collection(db, `users/${toUserId}/friendRequests`));
  await setDoc(requestRef, {
    from: fromUserId,
    to: toUserId,
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  return requestRef.id;
}

// Accept a friend request
import { getFunctions, httpsCallable } from 'firebase/functions';
import firebaseApp from './config';

export async function acceptFriendRequest(userId, requestId, fromUserId) {
  // Call the HTTPS callable Cloud Function
  const functions = getFunctions(firebaseApp);
  const acceptFn = httpsCallable(functions, 'acceptFriendRequest');
  return acceptFn({ fromUserId, toUserId: userId, requestId });
}

// Reject a friend request
export async function rejectFriendRequest(userId, requestId) {
  const requestRef = doc(db, `users/${userId}/friendRequests/${requestId}`);
  await updateDoc(requestRef, {
    status: 'rejected',
    respondedAt: serverTimestamp(),
  });
}

// Remove a friend
export async function removeFriend(userId, friendId) {
  await deleteDoc(doc(db, `users/${userId}/friends/${friendId}`));
  await deleteDoc(doc(db, `users/${friendId}/friends/${userId}`));
}

// Get a user's friends
export async function getFriends(userId) {
  const friendsSnap = await getDocs(collection(db, `users/${userId}/friends`));
  return friendsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

// Get incoming friend requests
export async function getFriendRequests(userId) {
  const reqSnap = await getDocs(
    query(
      collection(db, `users/${userId}/friendRequests`),
      where('status', '==', 'pending'),
    ),
  );
  return reqSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
