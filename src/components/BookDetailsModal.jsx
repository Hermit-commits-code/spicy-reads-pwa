import React from 'react';
import { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Heading,
  Text,
  HStack,
  Tag,
  Box,
  useClipboard,
  useToast,
  Tooltip,
  Divider,
  VStack,
  Icon,
} from '@chakra-ui/react';
import { FaUserFriends, FaPaperPlane } from 'react-icons/fa';

function BookShareSection({
  user,
  book,
  feedLoading,
  feedSuccess,
  feedError,
  setFeedLoading,
  setFeedSuccess,
  setFeedError,
  setShareModalOpen,
  handleShare,
  t,
  addPrivateFeedPost,
  toast,
}) {
  return (
    <Box px={4} pt={2} pb={1} mb={2} bg="gray.50" borderRadius="md">
      <Text fontSize="sm" color="gray.600" mb={2} fontWeight="medium">
        Share this book:
      </Text>
      <VStack
        spacing={2}
        align="stretch"
        direction={{ base: 'column', sm: 'row' }}
        width="100%"
        mb={feedError || feedSuccess ? 1 : 3}
      >
        <Tooltip label="Share to Friends Feed" hasArrow>
          <Button
            colorScheme="purple"
            size="md"
            leftIcon={<Icon as={FaUserFriends} />}
            isLoading={feedLoading}
            onClick={async () => {
              setFeedLoading(true);
              setFeedSuccess(false);
              setFeedError('');
              try {
                if (!user)
                  throw new Error(
                    'You must be signed in to share with friends.',
                  );
                await addPrivateFeedPost(user.uid, {
                  userId: user.uid,
                  userName: user.displayName || user.email || 'Anonymous',
                  userPhotoUrl: user.photoURL || '',
                  bookId: book.id,
                  bookTitle: book.title,
                  bookAuthor:
                    (book.authors && book.authors.join(', ')) ||
                    book.author ||
                    '',
                  bookCoverUrl: book.coverUrl || '',
                });
                setFeedSuccess(true);
                toast({
                  title: 'Shared to friends feed!',
                  status: 'success',
                  duration: 2000,
                });
              } catch (err) {
                setFeedError(err.message || 'Failed to share to friends feed.');
                toast({
                  title: 'Error sharing to friends feed',
                  description: err.message,
                  status: 'error',
                  duration: 3000,
                });
              }
              setFeedLoading(false);
            }}
            width="100%"
          >
            {feedSuccess ? 'Shared!' : 'Share to Friends Feed'}
          </Button>
        </Tooltip>
        <Tooltip label="Direct Share (send to a friend)" hasArrow>
          <Button
            colorScheme="teal"
            size="md"
            leftIcon={<Icon as={FaPaperPlane} />}
            onClick={() => setShareModalOpen(true)}
            width="100%"
          >
            Direct Share
          </Button>
        </Tooltip>
        <Tooltip label="Copy/Share Link" hasArrow>
          <Button
            variant="ghost"
            colorScheme="blue"
            size="md"
            aria-label={t('share', 'Share')}
            onClick={handleShare}
            width="100%"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 8.33333C16.3807 8.33333 17.5 7.21405 17.5 5.83333C17.5 4.45262 16.3807 3.33333 15 3.33333C13.6193 3.33333 12.5 4.45262 12.5 5.83333C12.5 6.01014 12.5172 6.18241 12.5492 6.34813L7.45081 9.15187C7.18241 8.98278 6.86813 8.88889 6.53333 8.88889C5.15362 8.88889 4.03433 10.0082 4.03433 11.3889C4.03433 12.7696 5.15362 13.8889 6.53333 13.8889C6.86813 13.8889 7.18241 13.795 7.45081 13.6259L12.5492 16.4297C12.5172 16.5954 12.5 16.7677 12.5 16.9444C12.5 18.3251 13.6193 19.4444 15 19.4444C16.3807 19.4444 17.5 18.3251 17.5 16.9444C17.5 15.5637 16.3807 14.4444 15 14.4444C14.6652 14.4444 14.3509 14.5383 14.0825 14.7074L8.98413 11.9036C9.01613 11.7379 9.03333 11.5656 9.03333 11.3889C9.03333 11.2121 9.01613 11.0398 8.98413 10.8741L14.0825 8.07037C14.3509 8.23946 14.6652 8.33333 15 8.33333Z"
                fill="currentColor"
              />
            </svg>
          </Button>
        </Tooltip>
      </VStack>
      {/* Inline feedback for sharing actions */}
      {(feedError || feedSuccess) && (
        <Text
          fontSize="xs"
          color={feedError ? 'red.500' : 'green.600'}
          mt={2}
          mb={1}
        >
          {feedError || (feedSuccess && 'Shared to friends feed!')}
        </Text>
      )}
      <Divider mt={3} mb={1} />
    </Box>
  );
}
import { useTranslation } from 'react-i18next';
import FormatTag from './FormatTag';
import SpiceMeter from './SpiceMeter';
import StarRating from './StarRating';
import SetReminderButton from './SetReminderButton';
import BookDetailsShareModal from './BookDetailsShareModal';
import { formatDate } from '../utils/dateUtils';
import { useBookRecommendations } from '../hooks/useBookRecommendations';
import { useBookShare } from '../hooks/useBookShare';
import { addPrivateFeedPost } from '../firebase/privateFeed';
import { useAuth } from '../context/AuthContext';

export default function BookDetailsModal({ book, opened, onClose }) {
  const { user } = useAuth();
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedSuccess, setFeedSuccess] = useState(false);
  const [feedError, setFeedError] = useState('');
  const { t } = useTranslation();
  const {
    shareStatus,
    handleShare,
    shareModalOpen,
    setShareModalOpen,
    shareData,
    shareUrl,
  } = useBookShare(book);
  const similarBooks = useBookRecommendations(book);
  const { onCopy, setValue: setClipboardValue } = useClipboard('');
  const toast = useToast();

  if (!book) return null;

  return (
    <Modal isOpen={opened} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader pb={2}>
          <Heading size="md">{book.title}</Heading>
        </ModalHeader>
        <Divider />
        <ModalBody>
          <VStack spacing={4} align="stretch" w="100%">
            {/* Book Cover and Main Info Card */}
            <Box
              bg="gray.50"
              borderRadius="lg"
              boxShadow="md"
              p={{ base: 3, md: 5 }}
              display="flex"
              flexDirection={{ base: 'column', md: 'row' }}
              alignItems={{ base: 'center', md: 'flex-start' }}
              gap={{ base: 3, md: 6 }}
            >
              {book.coverUrl && (
                <img
                  src={book.coverUrl}
                  alt={book.title}
                  style={{
                    width: '120px',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                  }}
                />
              )}
              <VStack align="start" spacing={2} w="100%">
                {/* Author */}
                {book.authors && book.authors.length > 0 && (
                  <Text fontSize="md" color="gray.700" fontWeight="semibold">
                    {book.authors.join(', ')}
                  </Text>
                )}
                {/* Genre & Subgenre */}
                {book.genre && (
                  <HStack spacing={1} mb={1}>
                    <Tag size="sm" colorScheme="red" borderRadius="full">
                      {book.genre}
                    </Tag>
                    {book.subGenre && (
                      <Tag size="sm" colorScheme="orange" borderRadius="full">
                        {book.subGenre}
                      </Tag>
                    )}
                  </HStack>
                )}
                {/* Series */}
                {book.series && (
                  <Text fontSize="sm" color="purple.700">
                    {t('series', 'Series')}: {book.series}
                    {book.seriesOrder ? ` #${book.seriesOrder}` : ''}
                  </Text>
                )}
                {/* Description */}
                {book.description && (
                  <Text fontSize="sm" color="gray.700">
                    {book.description}
                  </Text>
                )}
                {/* Spice Meter & Star Rating */}
                <HStack spacing={3} align="center">
                  <SpiceMeter
                    value={book.spiceRating || book.spice || 0}
                    size="sm"
                  />
                  <StarRating
                    value={book.starRating || book.rating || 0}
                    size="sm"
                  />
                </HStack>
                {/* Formats Owned */}
                {book.formatsOwned && book.formatsOwned.length > 0 && (
                  <HStack spacing={1} mb={2}>
                    {book.formatsOwned.map((format) => (
                      <FormatTag key={format} format={format} />
                    ))}
                  </HStack>
                )}
                {/* Lists */}
                {book.listAssignments && book.listAssignments.length > 0 && (
                  <HStack spacing={1} mb={2}>
                    {book.listAssignments.map((list) => (
                      <Tag key={list} size="sm" colorScheme="blue">
                        {list}
                      </Tag>
                    ))}
                  </HStack>
                )}
                {/* Moods */}
                {book.moods && book.moods.length > 0 && (
                  <HStack spacing={1} mb={2}>
                    {book.moods.map((mood) => (
                      <Tag key={mood} size="sm" colorScheme="pink">
                        {mood}
                      </Tag>
                    ))}
                  </HStack>
                )}
                {/* Reading Progress */}
                {typeof book.readingProgress === 'number' && (
                  <Text fontSize="xs" color="gray.500">
                    {t('progress', 'Progress')}: {book.readingProgress}%
                  </Text>
                )}
                {/* Last Read */}
                {book.lastRead && (
                  <Text fontSize="xs" color="gray.500">
                    {t('last_read', 'Last read')}: {formatDate(book.lastRead)}
                  </Text>
                )}
                {/* Reminder */}
                <SetReminderButton book={book} size="sm" mt={2} />
              </VStack>
            </Box>
            {/* Share Section */}
            <BookShareSection
              user={user}
              book={book}
              feedLoading={feedLoading}
              feedSuccess={feedSuccess}
              feedError={feedError}
              setFeedLoading={setFeedLoading}
              setFeedSuccess={setFeedSuccess}
              setFeedError={setFeedError}
              setShareModalOpen={setShareModalOpen}
              handleShare={handleShare}
              t={t}
              addPrivateFeedPost={addPrivateFeedPost}
              toast={toast}
            />
            {/* Content Warnings */}
            {book.contentWarnings && book.contentWarnings.length > 0 && (
              <Box mb={2}>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  {t('content_warnings', 'Content Warnings')}
                </Text>
                <HStack spacing={2} flexWrap="wrap">
                  {book.contentWarnings.map((warning) => (
                    <Tag
                      key={warning}
                      size="sm"
                      colorScheme="red"
                      borderRadius="full"
                      aria-label={
                        t('content_warning', 'Content warning') + ': ' + warning
                      }
                    >
                      {t(warning.toLowerCase(), warning)}
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}
            {/* Review */}
            {book.review && (
              <Box mb={2}>
                <Text fontSize="sm" color="gray.700" mb={1} fontWeight="bold">
                  {t('review', 'Review')}
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {book.review}
                </Text>
              </Box>
            )}
            {/* Notes */}
            {book.notes && (
              <Box mb={2}>
                <Text fontSize="sm" color="gray.700" mb={1} fontWeight="bold">
                  {t('notes', 'Notes')}
                </Text>
                <Text fontSize="sm" color="gray.700">
                  {book.notes}
                </Text>
              </Box>
            )}
            {/* Contextual Recommendations */}
            {similarBooks && similarBooks.length > 0 && (
              <Box mt={4} mb={2}>
                <Text fontWeight="bold" fontSize="sm" mb={2} color="purple.700">
                  {t('you_might_also_like', 'You might also like...')}
                </Text>
                <HStack spacing={2} overflowX="auto">
                  {similarBooks.map((rec) => (
                    <Box
                      key={rec.id}
                      minW="100px"
                      maxW="120px"
                      p={2}
                      borderWidth={1}
                      borderRadius="md"
                      bg="gray.50"
                      boxShadow="sm"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      cursor="pointer"
                      position="relative"
                      onClick={() => {
                        onClose();
                        setTimeout(() => {
                          window.dispatchEvent(
                            new CustomEvent('openBookDetails', {
                              detail: rec.id,
                            }),
                          );
                        }, 250);
                      }}
                    >
                      {/* Series order badge */}
                      {rec.series &&
                        rec.seriesOrder &&
                        !isNaN(Number(rec.seriesOrder)) && (
                          <Box
                            position="absolute"
                            top={1}
                            left={1}
                            bg="purple.500"
                            color="white"
                            fontSize="xs"
                            fontWeight="bold"
                            px={2}
                            py={0.5}
                            borderRadius="md"
                            zIndex={2}
                            boxShadow="sm"
                            aria-label={`Book ${rec.seriesOrder} in series`}
                          >
                            {rec.seriesOrder}
                          </Box>
                        )}
                      {rec.cover ? (
                        <img
                          src={rec.cover}
                          alt={rec.title}
                          style={{
                            width: '100%',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: 6,
                          }}
                        />
                      ) : (
                        <Text
                          fontSize="xs"
                          color="gray.400"
                          textAlign="center"
                          px={2}
                        >
                          {t('no_cover', 'No Cover')}
                        </Text>
                      )}
                      <Text
                        fontSize="xs"
                        color="gray.700"
                        fontWeight="medium"
                        mt={1}
                        noOfLines={2}
                        textAlign="center"
                      >
                        {rec.title}
                      </Text>
                      <Text
                        fontSize="xs"
                        color="gray.500"
                        noOfLines={1}
                        textAlign="center"
                      >
                        {rec.author}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              </Box>
            )}
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} aria-label={t('close', 'Close')}>
            {t('close', 'Close')}
          </Button>
        </ModalFooter>
        {/* BookDetailsShareModal: desktop or fallback for mobile */}
        <BookDetailsShareModal
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          shareData={shareData}
          shareUrl={shareUrl}
        />
      </ModalContent>
    </Modal>
  );
}
