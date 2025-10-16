// ...existing code...
export default function SocialFeed({
  posts,
  loading,
  error,
  emptyMessage,
  illustration,
}) {
  if (loading) return <Spinner size="lg" mt={8} />;
  if (error) return <Text color="red.500">{error}</Text>;
  if (!posts || posts.length === 0)
    return (
      <VStack align="center" spacing={2} mt={12} color="gray.400">
        {illustration && <Text fontSize="5xl">{illustration}</Text>}
        <Text fontSize="md">{emptyMessage || 'No posts yet.'}</Text>
      </VStack>
    );

  return (
    <VStack align="stretch" spacing={0} mt={4}>
      {posts.map((post) => (
        <SocialFeedItem key={post.id} post={post} />
      ))}
    </VStack>
  );
}
import React, { useState } from 'react';
import AddToMyListsModal from './AddToMyListsModal';
import { useAuth } from '../context/AuthContext';
import {
  VStack,
  Box,
  Spinner,
  Text,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Button,
  Image,
} from '@chakra-ui/react';

// SocialFeedItem will be modularized for each post
function SocialFeedItem({ post }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const { user } = useAuth();
  const isOwnPost = user && post.userId === user.uid;
  return (
    <>
      <Box
        borderWidth={0}
        borderRadius="xl"
        p={{ base: 3, md: 5 }}
        mb={4}
        bg="white"
        boxShadow="lg"
        cursor="pointer"
        transition="box-shadow 0.2s, background 0.2s"
        _hover={{ boxShadow: '2xl', bg: 'gray.50' }}
        onClick={() => setModalOpen(true)}
        display="flex"
        flexDirection={{ base: 'column', md: 'row' }}
        alignItems={{ base: 'flex-start', md: 'center' }}
        gap={{ base: 3, md: 6 }}
        role="button"
        aria-label={`View details for ${post.bookTitle}`}
      >
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.bookTitle}
            boxSize={{ base: '72px', md: '96px' }}
            objectFit="cover"
            borderRadius="lg"
            mr={0}
            flexShrink={0}
            shadow="md"
          />
        ) : (
          <Box
            boxSize={{ base: '72px', md: '96px' }}
            bg="gray.100"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="3xl"
            color="gray.400"
            mr={0}
            flexShrink={0}
            shadow="md"
          >
            📚
          </Box>
        )}
        <VStack align="start" spacing={2} flex={1} minW={0} w="100%">
          <Text
            fontWeight="bold"
            fontSize={{ base: 'lg', md: 'xl' }}
            noOfLines={1}
            color="gray.800"
          >
            {post.bookTitle}
          </Text>
          <Text fontSize="md" color="gray.600" noOfLines={1}>
            by {post.bookAuthor}
          </Text>
          <HStack spacing={2} mt={1} align="center">
            {post.userPhotoUrl ? (
              <img
                src={post.userPhotoUrl}
                alt={post.userName}
                style={{ width: 32, height: 32, borderRadius: '50%' }}
              />
            ) : (
              <Box
                w="32px"
                h="32px"
                borderRadius="full"
                bg="gray.200"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="lg"
                color="gray.500"
                aria-label={
                  post.userName ? post.userName[0].toUpperCase() : '?'
                }
              >
                {post.userName ? post.userName[0].toUpperCase() : '?'}
              </Box>
            )}
            <Text fontSize="xs" color="gray.400">
              {(() => {
                if (!post.timestamp) return '';
                if (post.timestamp.toDate) {
                  return post.timestamp.toDate().toLocaleString();
                }
                const d = new Date(post.timestamp);
                return isNaN(d) ? '' : d.toLocaleString();
              })()}
            </Text>
          </HStack>
          <HStack spacing={3} mt={1}>
            {post.rating && (
              <Text
                fontSize="sm"
                color="yellow.700"
                bg="yellow.50"
                px={2}
                py={0.5}
                borderRadius="md"
                fontWeight="semibold"
                aria-label={`Rating: ${post.rating}/5`}
              >
                ⭐ {post.rating}/5
              </Text>
            )}
            {post.spice && (
              <Text
                fontSize="sm"
                color="pink.600"
                bg="pink.50"
                px={2}
                py={0.5}
                borderRadius="md"
                fontWeight="semibold"
                aria-label={`Spice: ${post.spice}/5`}
              >
                🌶️ {post.spice}/5
              </Text>
            )}
          </HStack>
        </VStack>
      </Box>
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isCentered
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{post.bookTitle}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={4} w="100%">
              {post.coverUrl && (
                <Image
                  src={post.coverUrl}
                  alt={post.bookTitle}
                  maxH="180px"
                  borderRadius="lg"
                  shadow="md"
                />
              )}
              <Text fontWeight="bold" fontSize="xl" color="gray.800">
                {post.bookTitle}
              </Text>
              <Text fontSize="md" color="gray.600">
                by {post.bookAuthor}
              </Text>
              <HStack spacing={3} mt={1}>
                {post.rating && (
                  <Text
                    fontSize="sm"
                    color="yellow.700"
                    bg="yellow.50"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    fontWeight="semibold"
                    aria-label={`Rating: ${post.rating}/5`}
                  >
                    ⭐ {post.rating}/5
                  </Text>
                )}
                {post.spice && (
                  <Text
                    fontSize="sm"
                    color="pink.600"
                    bg="pink.50"
                    px={2}
                    py={0.5}
                    borderRadius="md"
                    fontWeight="semibold"
                    aria-label={`Spice: ${post.spice}/5`}
                  >
                    🌶️ {post.spice}/5
                  </Text>
                )}
              </HStack>
              {/* DO NOT SHOW notes or review for friend posts */}
              {!isOwnPost && (
                <Button
                  colorScheme="teal"
                  variant="solid"
                  size="md"
                  alignSelf="start"
                  onClick={() => setAddModalOpen(true)}
                  aria-label={`Add ${post.bookTitle} to my lists`}
                >
                  Add to My Lists
                </Button>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
      <AddToMyListsModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        book={post}
        userId={user ? user.uid : null}
        onAdded={() => setAddModalOpen(false)}
      />
    </>
  );
}