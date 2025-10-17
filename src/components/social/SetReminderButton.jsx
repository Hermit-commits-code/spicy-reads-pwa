import React from 'react';
import { Button, Icon, useToast } from '@chakra-ui/react';
import { FaBell } from 'react-icons/fa';

// Minimal SetReminderButton component to provide a default export.
// Matches usages like: <SetReminderButton book={book} size="sm" mt={2} />
export default function SetReminderButton({ book, size = 'md', mt = 0 }) {
  const toast = useToast();

  const handleClick = () => {
    // No-op reminder handler for now. Replace with actual reminder logic.
    toast({
      title: 'Reminder set (stub)',
      description: book?.title || 'Reminder scheduled',
      status: 'info',
      duration: 2000,
    });
  };

  return (
    <Button
      size={size}
      mt={mt}
      onClick={handleClick}
      leftIcon={<Icon as={FaBell} />}
      variant="ghost"
    >
      Remind me
    </Button>
  );
}
