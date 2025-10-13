import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { extractBookFromUrl } from '../utils/bookUrlExtractor';

/**
 * ShareHandler hook - Handles incoming shared links from other apps
 * This makes VelvetVolumes appear in the share menu of Amazon, Goodreads, etc.
 */
export function useShareHandler() {
  const [sharedData, setSharedData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we received shared data via URL parameters
    const urlParams = new URLSearchParams(location.search);
    const sharedUrl = urlParams.get('url');
    const sharedText = urlParams.get('text');
    const sharedTitle = urlParams.get('title');
    const sharedAuthor = urlParams.get('author');
    const sharedImage = urlParams.get('image');
    const sharedSeriesName = urlParams.get('seriesName');
    const sharedSeriesNumber = urlParams.get('seriesNumber');
    const sharedDescription = urlParams.get('description');

    if (sharedUrl || sharedText || sharedTitle) {
      handleSharedContent({
        url: sharedUrl,
        text: sharedText,
        title: sharedTitle,
        author: sharedAuthor,
        image: sharedImage,
        seriesName: sharedSeriesName,
        seriesNumber: sharedSeriesNumber,
        description: sharedDescription,
      });
    }
  }, [location]);

  const handleSharedContent = async (data) => {
    console.log('Received shared data:', data);

    // If we have direct title/author from URL params, use those
    if (data.title || data.author) {
      // bookData assignment removed (was unused)

      // Store in window for AddBookModal to pick up
      // window.extensionBookData = bookData; // removed extensionBookData

      // Trigger the add book modal to open
      setTimeout(() => {
        const event = new CustomEvent('openAddBook');
        window.dispatchEvent(event);
      }, 100);

      return;
    }

    // Fallback: try to extract book data from shared URL
    let bookData = null;
    if (data.url) {
      bookData = await extractBookFromUrl(data.url);
    }

    // If URL extraction failed, try parsing the text
    if (!bookData && (data.text || data.title)) {
      const textToParse = data.text || data.title;

      // Check if the text contains a URL
      const urlMatch = textToParse.match(/(https?:\/\/[^\s]+)/);
      if (urlMatch) {
        bookData = await extractBookFromUrl(urlMatch[1]);
      }
    }

    if (bookData) {
      // window.extensionBookData = bookData; // removed extensionBookData
      setTimeout(() => {
        const event = new CustomEvent('openAddBook');
        window.dispatchEvent(event);
      }, 100);
    }
  };

  const clearSharedData = () => {
    setSharedData(null);
    // Clean up URL parameters
    navigate(location.pathname, { replace: true });
  };

  return { sharedData, clearSharedData };
}
