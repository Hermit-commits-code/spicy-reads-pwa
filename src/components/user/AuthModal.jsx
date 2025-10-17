import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  VStack,
  Divider,
  Text,
  useToast,
  IconButton,
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const { signIn, signUp, signInWithGoogle, user, loading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const toast = useToast();

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await signUp(email, password);
        toast({ title: 'Account created!', status: 'success', duration: 2000 });
      } else {
        await signIn(email, password);
        toast({ title: 'Signed in!', status: 'success', duration: 2000 });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleGoogle = async () => {
    setError('');
    try {
      await signInWithGoogle();
      toast({
        title: 'Signed in with Google!',
        status: 'success',
        duration: 2000,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isSignUp ? 'Create Account' : 'Sign In'}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleAuth}>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired isInvalid={!!error}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  placeholder="you@email.com"
                />
              </FormControl>
              <FormControl isRequired isInvalid={!!error}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder="Password"
                />
                {error && <FormErrorMessage>{error}</FormErrorMessage>}
              </FormControl>
              <Button
                colorScheme="red"
                type="submit"
                isLoading={loading}
                w="100%"
                mb={2}
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
              <Divider />
              <Button
                leftIcon={<FcGoogle />}
                onClick={handleGoogle}
                variant="outline"
                w="100%"
                isLoading={loading}
              >
                Continue with Google
              </Button>
              <Text fontSize="sm" textAlign="center" mt={2}>
                {isSignUp
                  ? 'Already have an account?'
                  : "Don't have an account?"}{' '}
                <Button
                  variant="link"
                  colorScheme="red"
                  size="sm"
                  onClick={() => setIsSignUp((v) => !v)}
                >
                  {isSignUp ? 'Sign In' : 'Create Account'}
                </Button>
              </Text>
            </VStack>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
