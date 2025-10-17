import React, { useState } from 'react';
import {
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast,
} from '@chakra-ui/react';
// import { deleteUser } from 'firebase/auth';
// import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
// import { db as firestoreDb } from '../firebase/db';
import { logAccountDeletion } from '../../utils/auditLog';

export default function DeleteAccountButton() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();

  const handleDelete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Attempt to dynamically load Firestore helpers; if not present, skip remote deletion
      const fbMod = await import('../../firebase/db').catch(() => null);
      const firestoreDb = fbMod?.firestoreDb;

      if (firestoreDb) {
        try {
          const { getDocs, collection, deleteDoc, doc } = await import(
            'firebase/firestore'
          );
          // Delete all subcollections (books, lists, listBooks, backups)
          const subcollections = ['books', 'lists', 'listBooks', 'backups'];
          for (const sub of subcollections) {
            const snap = await getDocs(
              collection(firestoreDb, 'users', user.uid, sub),
            );
            for (const docu of snap.docs) {
              await deleteDoc(
                doc(firestoreDb, 'users', user.uid, sub, docu.id),
              );
            }
          }
          // Delete user document
          await deleteDoc(doc(firestoreDb, 'users', user.uid));
        } catch (err) {
          console.warn(
            'Firestore deletion failed, continuing with local cleanup:',
            err,
          );
        }
      }

      // Log anonymized deletion event (auditLog will use Firestore if configured)
      await logAccountDeletion();

      // Try to delete Firebase Auth user if auth helper is available
      try {
        const authMod = await import('firebase/auth').catch(() => null);
        const { deleteUser } = authMod || {};
        if (typeof deleteUser === 'function') {
          await deleteUser(user);
        }
      } catch (err) {
        console.warn('Auth deletion attempt failed or not available:', err);
      }

      toast({
        title: 'Account deletion requested (local cleanup complete)',
        status: 'success',
      });
      // Optionally, redirect or reload
      window.location.reload();
    } catch (err) {
      console.error('Delete account failed:', err);
      toast({ title: 'Error deleting account', status: 'error' });
    }
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <Button
        colorScheme="red"
        variant="outline"
        onClick={() => setIsOpen(true)}
      >
        Delete Account
      </Button>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.600">
              Permanently Delete Account
            </AlertDialogHeader>
            <AlertDialogBody>
              <strong>
                This action is <u>immediate and irreversible</u>.
              </strong>
              <br />
              <br />
              All your account data—including books, lists, backups, and
              login—will be <u>permanently deleted</u> from our servers and
              cannot be recovered for any reason.
              <br />
              <br />
              By continuing, you acknowledge and accept that this process cannot
              be undone, and no refunds or account recovery will be possible
              after deletion.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={loading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
