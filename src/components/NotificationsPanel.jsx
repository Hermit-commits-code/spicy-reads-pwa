import React, { useEffect, useState } from 'react';
import {
  Box,
  Text,
  IconButton,
  HStack,
  Badge,
  Spinner,
} from '@chakra-ui/react';
import { FaTimes } from 'react-icons/fa';
import {
  fetchNotifications,
  dismissNotification,
} from '../firebase/notifications';
import { useAuth } from '../context/AuthContext';

export default function NotificationsPanel() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetchNotifications(user.uid).then((n) => {
      setNotifications(n);
      setLoading(false);
    });
  }, [user]);

  const handleDismiss = async (id) => {
    await dismissNotification(user.uid, id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!user) return null;
  if (loading) return <Spinner size="sm" />;
  if (notifications.length === 0) return null;

  return (
    <Box mb={4} bg="white" borderRadius="md" boxShadow="sm" p={3}>
      <HStack mb={2}>
        <Text fontWeight="bold">Notifications</Text>
        <Badge colorScheme="blue">{notifications.length}</Badge>
      </HStack>
      {notifications.map((n) => (
        <HStack key={n.id} align="start" spacing={2} mb={1}>
          <Text flex={1} fontSize="sm">
            {n.message}
          </Text>
          <IconButton
            icon={<FaTimes />}
            size="xs"
            aria-label="Dismiss"
            onClick={() => handleDismiss(n.id)}
            variant="ghost"
          />
        </HStack>
      ))}
    </Box>
  );
}
