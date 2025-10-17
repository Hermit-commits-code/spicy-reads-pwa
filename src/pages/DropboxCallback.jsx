import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, Box, Text } from '@chakra-ui/react';

export default function DropboxCallback() {
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    toast({ title: 'Dropbox integration is disabled', status: 'info' });
    navigate('/settings');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box p={8} textAlign="center">
      <Text mt={4}>Dropbox integration has been removed.</Text>
    </Box>
  );
}
