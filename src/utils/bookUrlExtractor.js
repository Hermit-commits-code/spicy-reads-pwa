// Smart URL book data extraction utility
// src/utils/bookUrlExtractor.js

/**
 * Extract book information from various book website URLs
 */

const BOOK_URL_PATTERNS = {
  amazon: {
    pattern:
      /amazon\.(com|co\.uk|ca|de|fr|it|es|co\.jp)\/.*\/dp\/([A-Z0-9]{10})/i,
    extract: async (url, asin) => {
      // Extract title and author from URL structure instead of scraping
      try {
        const urlPath = new URL(url).pathname;
        // Pattern: /Title-Author/dp/ASIN or /Title-Author-dp-ASIN
        const titleAuthorMatch = urlPath.match(/\/([^/]+)\/dp\/[A-Z0-9]+/i);

        let title = "";
        let author = "";

        if (titleAuthorMatch) {
          const titleAuthorPart = titleAuthorMatch[1];
          // Split on last hyphen to separate title from author
          const parts = titleAuthorPart.split("-");
          if (parts.length >= 2) {
            // Last part is usually author, everything else is title
            author = parts.pop().replace(/[-_]/g, " ");
            title = parts.join(" ").replace(/[-_]/g, " ");
          } else {
            title = titleAuthorPart.replace(/[-_]/g, " ");
          }
        }

        return {
          title: title || "Unknown Title",
          author: author || "Unknown Author",
          asin,
          source: "Amazon",
          isbn: asin, // ASIN can be used as ISBN for Amazon lookup
          url: url,
        };
      } catch (error) {
        console.error("Amazon URL parsing failed:", error);
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
        const doc = parser.parseFromString(html, "text/html");

        const title = doc
          .querySelector('h1[data-testid="bookTitle"]')
          ?.textContent?.trim();
        const author = doc
          .querySelector('[data-testid="name"]')
          ?.textContent?.trim();
        const genre = doc
          .querySelector(".BookPageMetadataSection__genre")
          ?.textContent?.trim();

        return {
          title,
          author,
          genre,
          goodreadsId: bookId,
          source: "Goodreads",
        };
      } catch (error) {
        console.error("Goodreads extraction failed:", error);
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
          source: "Open Library",
        };
      } catch (error) {
        console.error("Open Library extraction failed:", error);
        return null;
      }
    },
  },
};

export async function extractBookFromUrl(url) {
  if (!url || typeof url !== "string") return null;

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
        potentialTitle: part1.replace(/[-_]/g, " "),
        potentialAuthor: part2.replace(/[-_]/g, " "),
        confidence: "low",
      };
    }
  }

  return null;
}
