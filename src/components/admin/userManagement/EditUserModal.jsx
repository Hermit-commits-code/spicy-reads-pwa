import React from 'react';
import {
  updateUserDisplayName,
  setUserRole,
} from '../../../firebase/userProfile';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Switch,
  useToast,
} from '@chakra-ui/react';

export default function EditUserModal({ isOpen, onClose, user, onSave }) {
  const [displayName, setDisplayName] = React.useState(user?.displayName || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [admin, setAdmin] = React.useState(!!user?.admin);
  const [premium, setPremium] = React.useState(!!user?.premium);
  const toast = useToast();

  React.useEffect(() => {
    setDisplayName(user?.displayName || '');
    setEmail(user?.email || '');
    setAdmin(!!user?.admin);
    setPremium(!!user?.premium);
  }, [user, isOpen]);

  const handleSave = async () => {
    let error = null;
    try {
      if (user.displayName !== displayName) {
        await updateUserDisplayName(user.id, displayName);
      }
      await setUserRole(user.id, { premium, admin });
      toast({ title: 'User updated!', status: 'success', duration: 3000 });
      onSave({ ...user, displayName, admin, premium });
      onClose();
    } catch (e) {
      error = e;
      toast({
        title: 'Error updating user',
        description: e.message,
        status: 'error',
        duration: 4000,
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit User</ModalHeader>
        <ModalBody>
          <FormControl mb={3}>
            <FormLabel>Display Name</FormLabel>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Email</FormLabel>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormControl>
          <FormControl display="flex" alignItems="center" mb={3}>
            <FormLabel mb={0}>Admin</FormLabel>
            <Switch
              isChecked={admin}
              onChange={(e) => setAdmin(e.target.checked)}
            />
          </FormControl>
          <FormControl display="flex" alignItems="center">
            <FormLabel mb={0}>Premium</FormLabel>
            <Switch
              isChecked={premium}
              onChange={(e) => setPremium(e.target.checked)}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} variant="ghost">
            Cancel
          </Button>
          <Button colorScheme="blue" onClick={handleSave}>
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
