import { useState, useEffect } from 'react';
import { getDisplayNameFromFirestore } from '../firebase/getDisplayName';

export function useFirestoreDisplayName(user) {
  const [firestoreDisplayName, setFirestoreDisplayName] = useState('');
  useEffect(() => {
    async function fetchDisplayName() {
      if (user && user.uid) {
        const name = await getDisplayNameFromFirestore(user.uid);
        if (name) setFirestoreDisplayName(name);
      }
    }
    fetchDisplayName();
  }, [user]);
  return firestoreDisplayName;
}
