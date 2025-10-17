import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Stack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Avatar,
  HStack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../utils/db';

export default function ProfileSection() {
  const { user, signOut } = useAuth();
  const toast = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(null);

  useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user]);

  useEffect(() => {
    let mounted = true;
    async function loadAvatar() {
      if (!user) return;
      try {
        const u = await db.users.get(user.uid);
        if (mounted) setAvatarSrc(u?.avatar || null);
      } catch (e) {
        // ignore
      }
    }
    loadAvatar();
    return () => (mounted = false);
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await db.users.put({ uid: user.uid, displayName, email: user.email });
      toast({ title: 'Profile saved', status: 'success' });
    } catch (e) {
      toast({ title: 'Save failed', status: 'error', description: e.message });
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        // store as data URL in users table
        await db.users.put({
          uid: user.uid,
          displayName,
          email: user.email,
          avatar: reader.result,
        });
        setAvatarSrc(reader.result);
        toast({ title: 'Avatar updated', status: 'success' });
      } catch (err) {
        toast({ title: 'Avatar save failed', status: 'error' });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    if (!user) return;
    try {
      const u = await db.users.get(user.uid);
      await db.users.put({ ...u, avatar: null });
      setAvatarSrc(null);
      toast({ title: 'Avatar removed', status: 'success' });
    } catch (e) {
      toast({ title: 'Remove failed', status: 'error' });
    }
  };

  return (
    <Box
      p={6}
      borderWidth={1}
      borderRadius="lg"
      bg="white"
      boxShadow="sm"
      maxW="600px"
      mx="auto"
      w="100%"
    >
      <Heading as="h2" size="md" mb={5} color="red.600">
        Profile & Account
      </Heading>
      {!user ? (
        <Text>Please sign in to manage your profile.</Text>
      ) : (
        <Stack spacing={4}>
          <HStack spacing={4} align="center">
            <Avatar name={displayName || user.email} src={avatarSrc || null} />
            <Box>
              <Text fontWeight="semibold">{displayName || user.email}</Text>
              <Text fontSize="sm" color="gray.500">
                {user.email}
              </Text>
            </Box>
          </HStack>
          <FormControl>
            <FormLabel>Display name</FormLabel>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Avatar</FormLabel>
            <Input type="file" accept="image/*" onChange={handleAvatarUpload} />
          </FormControl>
          <HStack>
            <Button colorScheme="red" onClick={handleSave} isLoading={saving}>
              Save
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
            <Button variant="ghost" onClick={handleRemoveAvatar}>
              Remove Avatar
            </Button>
          </HStack>
        </Stack>
      )}
    </Box>
  );
}
