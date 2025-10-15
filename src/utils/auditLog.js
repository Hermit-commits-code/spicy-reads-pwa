// This file logs anonymized account deletion events for audit/compliance.
// In production, use a secure server endpoint or a Firestore collection with strict security rules.
// Here, we log to Firestore in a 'deletionLogs' collection with no user-identifiable data.

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db as firestoreDb } from '../firebase/db';

export async function logAccountDeletion({ reason = 'user_request' } = {}) {
  try {
    await addDoc(collection(firestoreDb, 'deletionLogs'), {
      event: 'account_deleted',
      reason,
      timestamp: serverTimestamp(),
      // No user ID or email for privacy
    });
  } catch (e) {
    // Optionally handle/log error
  }
}
