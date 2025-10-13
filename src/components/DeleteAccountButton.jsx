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
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import db from '../firebase/db';

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
      // Delete all subcollections (books, lists, listBooks)
      const subcollections = ['books', 'lists', 'listBooks'];
      for (const sub of subcollections) {
        const snap = await getDocs(collection(db, 'users', user.uid, sub));
        for (const docu of snap.docs) {
          await deleteDoc(doc(db, 'users', user.uid, sub, docu.id));
        }
      }
      // Delete user document
      await deleteDoc(doc(db, 'users', user.uid));
      // Delete Firebase Auth user
      await deleteUser(user);
      toast({ title: 'Account deleted', status: 'success' });
      // Optionally, redirect or reload
      window.location.reload();
    } catch (e) {
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
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Account
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This will permanently delete your account and all
              your data. This action cannot be undone.
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
