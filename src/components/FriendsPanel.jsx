import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Button,
  Input,
  VStack,
  HStack,
  Text,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import {
  sendFriendRequest,
  getFriends,
  getFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
} from '../firebase/friends';
import { useAuth } from '../context/AuthContext';
import { getUserIdByEmail, getUserProfile } from '../firebase/userProfile';

export default function FriendsPanel() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [friendProfiles, setFriendProfiles] = useState({});
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [requestProfiles, setRequestProfiles] = useState({});
  const toast = useToast();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([getFriends(user.uid), getFriendRequests(user.uid)]).then(
      async ([friends, requests]) => {
        setFriends(friends);
        setRequests(requests);
        // Fetch friend profiles
        const profiles = {};
        for (const friend of friends) {
          const profile = await getUserProfile(friend.id);
          profiles[friend.id] = profile;
        }
        setFriendProfiles(profiles);
        setLoading(false);
      },
    );
  }, [user]);

  useEffect(() => {
    async function fetchProfiles() {
      const profiles = {};
      for (const req of requests) {
        if (!profiles[req.from]) {
          const profile = await getUserProfile(req.from);
          profiles[req.from] = profile;
        }
      }
      setRequestProfiles(profiles);
    }
    if (requests.length > 0) fetchProfiles();
  }, [requests]);

  const handleSendRequest = async () => {
    setSending(true);
    setError('');
    try {
      if (!email) throw new Error('Please enter a user email.');
      if (!user) throw new Error('You must be signed in.');
      if (email === user.email)
        throw new Error('You cannot send a friend request to yourself.');
      const toUserId = await getUserIdByEmail(email);
      if (!toUserId) throw new Error('No user found with that email.');
      await sendFriendRequest(user.uid, toUserId);
      setEmail('');
      toast({
        title: 'Friend request sent!',
        status: 'success',
        duration: 3000,
      });
      setSending(false);
    } catch (e) {
      setError(e.message);
      toast({
        title: 'Error',
        description: e.message,
        status: 'error',
        duration: 4000,
      });
      setSending(false);
    }
  };

  const handleAccept = async (requestId) => {
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;
    await acceptFriendRequest(user.uid, requestId, req.from);
    setRequests(requests.filter((r) => r.id !== requestId));
    setFriends(await getFriends(user.uid));
  };

  const handleReject = async (requestId) => {
    await rejectFriendRequest(user.uid, requestId);
    setRequests(requests.filter((r) => r.id !== requestId));
  };

  const handleRemove = async (friendId) => {
    await removeFriend(user.uid, friendId);
    setFriends(await getFriends(user.uid));
  };

  if (!user) return <Text>Please sign in to manage friends.</Text>;
  if (loading) return <Spinner />;

  return (
    <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
      <Heading size="md" mb={4}>
        Friends
      </Heading>
      <VStack align="stretch" spacing={2} mb={4}>
        <HStack>
          <Input
            placeholder="Enter user ID or email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            size="sm"
          />
          <Button size="sm" onClick={handleSendRequest} isLoading={sending}>
            Send Request
          </Button>
        </HStack>
        {error && <Text color="red.500">{error}</Text>}
      </VStack>
      <Heading size="sm" mt={4} mb={2}>
        Pending Requests
      </Heading>
      <VStack align="stretch" spacing={1}>
        {requests.length === 0 && (
          <Text color="gray.500">No pending requests.</Text>
        )}
        {requests.map((req) => {
          const profile = requestProfiles[req.from];
          return (
            <HStack key={req.id}>
              <Text flex={1}>
                {profile
                  ? profile.displayName || profile.email || profile.id
                  : req.from}
              </Text>
              <Button
                size="xs"
                colorScheme="green"
                onClick={() => handleAccept(req.id)}
              >
                Accept
              </Button>
              <Button
                size="xs"
                colorScheme="red"
                onClick={() => handleReject(req.id)}
              >
                Reject
              </Button>
            </HStack>
          );
        })}
      </VStack>
      <Heading size="sm" mt={4} mb={2}>
        Your Friends
      </Heading>
      <VStack align="stretch" spacing={1}>
        {friends.length === 0 && <Text color="gray.500">No friends yet.</Text>}
        {friends.map((friend) => {
          const profile = friendProfiles[friend.id];
          return (
            <HStack key={friend.id}>
              <Text flex={1}>
                {profile
                  ? profile.displayName || profile.email || profile.id
                  : friend.id}
              </Text>
              <Button
                size="xs"
                colorScheme="red"
                onClick={() => handleRemove(friend.id)}
              >
                Remove
              </Button>
            </HStack>
          );
        })}
      </VStack>
    </Box>
  );
}
