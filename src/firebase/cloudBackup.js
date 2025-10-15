import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db as firestoreDb } from './db';

// Save a backup to Firestore under users/{uid}/backups
export async function saveCloudBackup(uid, data) {
  if (!uid) throw new Error('No user ID');
  const backupsCol = collection(firestoreDb, 'users', uid, 'backups');
  const backupDoc = {
    createdAt: Timestamp.now(),
    data,
  };
  const ref = await addDoc(backupsCol, backupDoc);
  return ref.id;
}

// List all backups for a user
export async function listCloudBackups(uid) {
  if (!uid) throw new Error('No user ID');
  const backupsCol = collection(firestoreDb, 'users', uid, 'backups');
  const snap = await getDocs(backupsCol);
  return snap.docs.map((docSnap) => ({
    id: docSnap.id,
    ...docSnap.data(),
  }));
}

// Delete a backup by ID
export async function deleteCloudBackup(uid, backupId) {
  if (!uid || !backupId) throw new Error('Missing uid or backupId');
  const backupRef = doc(firestoreDb, 'users', uid, 'backups', backupId);
  await deleteDoc(backupRef);
}
