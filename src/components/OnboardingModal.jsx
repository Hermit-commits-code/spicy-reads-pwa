import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Input,
  useDisclosure,
  Box,
  Stack,
  Flex,
  IconButton,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

const steps = [
  {
    title: 'Welcome to Spicy Reads!',
    content: (
      <Text fontSize="lg">
        Your private, powerful book tracker. Let’s get you set up in under a
        minute!
      </Text>
    ),
  },
  {
    title: 'Set Your Display Name',
    content: ({ displayName, setDisplayName }) => (
      <Box>
        <Text mb={2}>How should we greet you?</Text>
        <Input
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={32}
        />
      </Box>
    ),
  },
  {
    title: 'Quick Tour',
    content: (
      <Stack spacing={3}>
        <Text>• Add books with barcode, camera, or smart paste</Text>
        <Text>• Cloud backup & restore for peace of mind</Text>
        <Text>• Organize with lists, tags, and spice meter</Text>
        <Text>• All features work offline!</Text>
      </Stack>
    ),
  },
];

export default function OnboardingModal({
  isOpen,
  onClose,
  onSetDisplayName,
  initialDisplayName,
}) {
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(initialDisplayName || '');

  const handleNext = () => {
    if (step === 1 && displayName.trim()) {
      onSetDisplayName(displayName.trim());
    }
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const StepContent = steps[step].content;

  return (
    <Modal isOpen={isOpen} onClose={handleSkip} isCentered size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{steps[step].title}</ModalHeader>
        <IconButton
          icon={<CloseIcon />}
          aria-label="Skip onboarding"
          position="absolute"
          top={2}
          right={2}
          size="sm"
          variant="ghost"
          onClick={handleSkip}
        />
        <ModalBody>
          {typeof StepContent === 'function' ? (
            <StepContent
              displayName={displayName}
              setDisplayName={setDisplayName}
            />
          ) : (
            StepContent
          )}
        </ModalBody>
        <ModalFooter>
          <Flex w="100%" justify="space-between">
            <Button variant="ghost" onClick={handleSkip}>
              Skip
            </Button>
            <Button colorScheme="purple" onClick={handleNext}>
              {step === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
