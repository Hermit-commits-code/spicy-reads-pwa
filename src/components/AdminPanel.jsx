import React, { useState } from 'react';
import {
  Box,
  Heading,
  Input,
  Button,
  Stack,
  Text,
  Switch,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from 'firebase/firestore';
import db from '../firebase/db';

export default function AdminPanel() {
  const [searchEmail, setSearchEmail] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSearch = async () => {
    setLoading(true);
    setUser(null);
    try {
      const q = query(
        collection(db, 'users'),
        where('email', '==', searchEmail),
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        setUser({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        toast({ title: 'User not found', status: 'warning' });
      }
    } catch (e) {
      toast({ title: 'Error searching user', status: 'error' });
    }
    setLoading(false);
  };

  const handleToggle = async (field) => {
    if (!user) return;
    const newValue = !user[field];
    try {
      await setDoc(
        doc(db, 'users', user.id),
        { [field]: newValue },
        { merge: true },
      );
      setUser({ ...user, [field]: newValue });
      toast({
        title: `${field.charAt(0).toUpperCase() + field.slice(1)} updated`,
        status: 'success',
      });
    } catch (e) {
      toast({ title: 'Error updating user', status: 'error' });
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="md"
      p={6}
      bg="yellow.50"
      mt={8}
      maxW="480px"
      mx="auto"
    >
      <Heading size="md" mb={4} color="yellow.700">
        Admin Panel
      </Heading>
      <Stack direction={{ base: 'column', md: 'row' }} spacing={2} mb={4}>
        <Input
          placeholder="Search user by email"
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          size="md"
        />
        <Button onClick={handleSearch} colorScheme="yellow" isLoading={loading}>
          Search
        </Button>
      </Stack>
      {loading && <Spinner />}
      {user && (
        <Box mt={4} p={4} borderWidth="1px" borderRadius="md" bg="white">
          <Text>
            <b>Email:</b> {user.email}
          </Text>
          <Stack direction="row" align="center" mt={2}>
            <Text>Premium:</Text>
            <Switch isChecked={true} isDisabled />
          </Stack>
          <Stack direction="row" align="center" mt={2}>
            <Text>Admin:</Text>
            <Switch
              isChecked={user.admin}
              onChange={() => handleToggle('admin')}
            />
          </Stack>
          <Button
            mt={4}
            colorScheme="gray"
            size="sm"
            onClick={() => setUser(null)}
          >
            Clear
          </Button>
        </Box>
      )}
    </Box>
  );
}
