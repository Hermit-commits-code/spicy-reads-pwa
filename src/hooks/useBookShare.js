import { useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import { getBookShareId } from '../utils/shareId';

export function useBookShare(book) {
  const { t } = useTranslation();
  const [shareStatus, setShareStatus] = useState('');
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const toast = useToast();

  // Prepare share data
  const shareData = book
    ? {
        title: book.title,
        text: `${book.title} by ${book.author}${
          book.review ? `\n\nReview: ${book.review}` : ''
        }${book.notes ? `\n\nNotes: ${book.notes}` : ''}`,
      }
    : { title: '', text: '' };
  // Generate privacy-respecting share URL using a hash/short ID
  const shareId = book ? getBookShareId(book) : '';
  const shareUrl =
    typeof window !== 'undefined' && book && shareId
      ? `${window.location.origin}/share/${shareId}`
      : '';
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  const handleShare = async () => {
    setShareStatus('');
    if (navigator.share && isMobile) {
      try {
        await navigator.share({ ...shareData, url: shareUrl });
        setShareStatus('shared');
        toast({
          title: t('shared_success', 'Shared!'),
          status: 'success',
          duration: 1500,
        });
      } catch {
        setShareStatus('error');
        toast({
          title: t('share_error', 'Share failed'),
          status: 'error',
          duration: 1500,
        });
      }
    } else {
      setShareModalOpen(true);
    }
  };

  return {
    shareStatus,
    handleShare,
    shareModalOpen,
    setShareModalOpen,
    shareData,
    shareUrl,
  };
}
