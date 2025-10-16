// Firestore helpers for notifications
import { db } from './db';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';

export async function sendNotification(userId, type, message, data = {}) {
  return addDoc(collection(db, `users/${userId}/notifications`), {
    type,
    message,
    data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export async function fetchNotifications(userId) {
  const q = query(
    collection(db, `users/${userId}/notifications`),
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function dismissNotification(userId, notificationId) {
  return deleteDoc(doc(db, `users/${userId}/notifications/${notificationId}`));
}
