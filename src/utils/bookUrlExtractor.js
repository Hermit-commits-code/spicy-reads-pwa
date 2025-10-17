// Smart URL book data extraction utility
// src/utils/bookUrlExtractor.js

/**
 * Extract book information from various book website URLs
 */

const BOOK_URL_PATTERNS = {
  amazon: {
    // Support /dp/ASIN, /gp/product/ASIN, /gp/aw/d/ASIN, /gp/slredirect/picassoRedirect.html?...ASIN=, etc.
    pattern:
      /amazon\.(com|co\.uk|ca|de|fr|it|es|co\.jp)\/(?:.*\/)?(?:dp|gp\/product|gp\/aw\/d)\/([A-Z0-9]{10})|amazon\.(?:com|co\.uk|ca|de|fr|it|es|co\.jp)[^?]*[?&]ASIN=([A-Z0-9]{10})/i,
    extract: async (url, asin1, asin2) => {
      try {
        // Try to extract ASIN from any supported pattern
        let asin = asin1 || asin2;
        if (!asin) {
          // Fallback: search for any 10-char ASIN in URL
          const asinMatch = url.match(/([A-Z0-9]{10})/i);
          asin = asinMatch ? asinMatch[1] : null;
        }
        if (!asin) return null;

        // Try to extract title/author from URL path (best effort)
        const urlPath = new URL(url).pathname;
        let title = '';
        let author = '';
        const titleAuthorMatch = urlPath.match(
          /\/([^/]+)\/(?:dp|gp\/product|gp\/aw\/d)\/[A-Z0-9]+/i,
        );
        if (titleAuthorMatch) {
          const titleAuthorPart = titleAuthorMatch[1];
          const parts = titleAuthorPart.split('-');
          if (parts.length >= 2) {
            author = parts.pop().replace(/[-_]/g, ' ');
            title = parts.join(' ').replace(/[-_]/g, ' ');
          } else {
            title = titleAuthorPart.replace(/[-_]/g, ' ');
          }
        }

        // Gold-standard: Try Open Library API for metadata by ASIN
        let openLibData = null;
        try {
          const resp = await fetch(
            `https://openlibrary.org/api/books?bibkeys=ASIN:${asin}&format=json&jscmd=data`,
          );
          const data = await resp.json();
          const bookData = data[`ASIN:${asin}`];
          if (bookData) {
            title = bookData.title || title;
            author = (bookData.authors && bookData.authors[0]?.name) || author;
            openLibData = bookData;
          }
        } catch (e) {
          // Ignore Open Library errors, fallback to URL parsing
          console.warn('Open Library fetch failed:', e);
        }

        return {
          title: title || 'Unknown Title',
          author: author || 'Unknown Author',
          asin,
          source: 'Amazon',
          isbn: asin,
          url: url,
          openLibData,
        };
      } catch (error) {
        console.error('Amazon URL parsing failed:', error);
        return null;
      }
    },
  },

  goodreads: {
    pattern: /goodreads\.com\/book\/show\/(\d+)/i,
    extract: async (url, bookId) => {
      // Goodreads scraping (note: respect robots.txt and rate limits)
      try {
        const response = await fetch(url);
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const title = doc
          .querySelector('h1[data-testid="bookTitle"]')
          ?.textContent?.trim();
        const author = doc
          .querySelector('[data-testid="name"]')
          ?.textContent?.trim();
        const genre = doc
          .querySelector('.BookPageMetadataSection__genre')
          ?.textContent?.trim();

        return {
          title,
          author,
          genre,
          goodreadsId: bookId,
          source: 'Goodreads',
        };
      } catch (error) {
        console.error('Goodreads extraction failed:', error);
        return null;
      }
    },
  },

  openlibrary: {
    pattern: /openlibrary\.org\/books\/(OL\w+)/i,
    extract: async (url, bookId) => {
      try {
        const apiUrl = `https://openlibrary.org/books/${bookId}.json`;
        const response = await fetch(apiUrl);
        const data = await response.json();

        return {
          title: data.title,
          author: data.authors?.[0]?.name,
          isbn: data.isbn_13?.[0] || data.isbn_10?.[0],
          publishYear: data.publish_date,
          source: 'Open Library',
        };
      } catch (error) {
        console.error('Open Library extraction failed:', error);
        return null;
      }
    },
  },
};

export async function extractBookFromUrl(url) {
  if (!url || typeof url !== 'string') return null;

  for (const [siteName, siteConfig] of Object.entries(BOOK_URL_PATTERNS)) {
    const match = url.match(siteConfig.pattern);
    if (match) {
      const bookId = match[1] || match[2];
      try {
        const bookData = await siteConfig.extract(url, bookId);
        if (bookData) {
          return {
            ...bookData,
            sourceUrl: url,
            extractedAt: new Date().toISOString(),
          };
        }
      } catch (error) {
        console.error(`Failed to extract from ${siteName}:`, error);
      }
    }
  }

  return null;
}

// Simpler approach: Parse common patterns from URL text
export function parseBookFromUrlText(url) {
  // Extract potential title and author from URL structure
  const patterns = [
    // Amazon: /Title-Author-dp-ASIN/
    /\/([^/]+)-([^/]+)-dp-[A-Z0-9]+/i,
    // Generic: /author/title or /title-author
    /\/([^/]+)[-_]([^/]+)$/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const [, part1, part2] = match;
      return {
        potentialTitle: part1.replace(/[-_]/g, ' '),
        potentialAuthor: part2.replace(/[-_]/g, ' '),
        confidence: 'low',
      };
    }
  }

  return null;
}
