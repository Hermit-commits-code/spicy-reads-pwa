// Content script - runs on book websites to extract information
(function () {
  console.log("Spicy Reads: Content script loaded on", window.location.href);

  // Mark that our content script is loaded
  window.spicyReadsContentScript = true;

  let bookData = null;

  function extractBookInfo() {
    const currentUrl = window.location.href;

    try {
      // Amazon extraction with multiple selector fallbacks
      if (currentUrl.includes("amazon.")) {
        console.log("Spicy Reads: Attempting Amazon extraction on", currentUrl);

        // Try multiple title selectors
        const titleSelectors = [
          "#productTitle",
          "[data-a-target='title']",
          ".product-title",
          "h1#title",
          "h1 span#productTitle",
          ".a-size-large.a-spacing-none.a-color-base",
          "h1.a-size-large",
          "#title",
          ".a-size-extra-large",
        ];

        let title = "";
        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            title = element.textContent.trim();
            console.log(
              "Spicy Reads: Found title with selector",
              selector,
              ":",
              title
            );
            break;
          }
        }

        // Try multiple author selectors
        const authorSelectors = [
          ".author .a-link-normal",
          '[data-a-target="by-line"] a',
          ".by-author a",
          "#bylineInfo a",
          ".a-row .author a",
          'span:contains("by") + a',
          '[data-testid="author-link"]',
        ];

        let author = "";
        for (const selector of authorSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            author = element.textContent.trim();
            console.log(
              "Spicy Reads: Found author with selector",
              selector,
              ":",
              author
            );
            break;
          }
        }

        // Try multiple image selectors
        const imageSelectors = [
          "#landingImage",
          "#imgBlkFront",
          "#ebooksImgBlkFront",
          ".a-dynamic-image",
          "[data-a-target='main-image']",
        ];

        let image = "";
        for (const selector of imageSelectors) {
          const element = document.querySelector(selector);
          if (element && element.src) {
            image = element.src;
            console.log("Spicy Reads: Found image with selector", selector);
            break;
          }
        }

        // Try to extract description from Amazon
        let description = "";

        // Extract description from various possible locations
        const descriptionSelectors = [
          "#feature-bullets ul", // Product features
          "#productDescription p", // Product description
          "#bookDescription_feature_div", // Book description
          "#bookDescription_feature_div .a-expander-content", // Book description expander
          "#a-page div[data-a-target='book-description']", // Book description target
          ".a-expander-content .a-spacing-base", // Expanded content
          ".a-expander-content p", // Expanded paragraphs
          ".book-description-content", // Alternative description
          "#productDescription", // Simple product description
          "[data-feature-name='bookDescription']", // Data feature
          "#editorialReviews_feature_div", // Editorial reviews
          "#editorialReviews_feature_div .a-expander-content", // Editorial reviews expanded
        ];

        for (const selector of descriptionSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            let desc = element.textContent.trim();
            // Clean up the description
            desc = desc.replace(/\s+/g, " ").trim();
            desc = desc.replace(
              /^(About this item|Product Description|Editorial Reviews?|From the Publisher)[\s:]*/,
              ""
            );

            if (desc.length > 50) {
              // Only accept substantial descriptions
              description = desc;
              console.log(
                "Spicy Reads: Found description with selector",
                selector,
                ":",
                description.substring(0, 100) + "..."
              );
              break;
            }
          }
        }

        // If no description found, try to expand "Read more" buttons and extract again
        if (!description) {
          const readMoreSelectors = [
            '[data-action="a-expander-toggle"]',
            ".a-expander-prompt",
            '[data-a-target="toggle-more-details"]',
            'button[aria-label*="more"]',
            'a[aria-label*="more"]',
            '.a-declarative[data-action="a-expander-toggle"]',
          ];

          readMoreSelectors.forEach((selector) => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach((button) => {
              try {
                if (
                  button.offsetParent !== null &&
                  !button.getAttribute("aria-expanded")
                ) {
                  console.log(
                    "Spicy Reads: Attempting to click expand button:",
                    selector
                  );
                  button.click();
                }
              } catch (e) {
                // Ignore click errors
              }
            });
          });

          // Try extracting again after clicking expand buttons
          for (const selector of descriptionSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
              let desc = element.textContent.trim();
              desc = desc.replace(/\s+/g, " ").trim();
              desc = desc.replace(
                /^(About this item|Product Description|Editorial Reviews?|From the Publisher)[\s:]*/,
                ""
              );

              if (desc.length > 50) {
                description = desc;
                console.log(
                  "Spicy Reads: Found description after expansion with selector",
                  selector,
                  ":",
                  description.substring(0, 100) + "..."
                );
                break;
              }
            }
          }
        }

        // Try to extract series information from Amazon
        let seriesName = "";
        let seriesNumber = "";

        // Primary method: Check the main product title for series info
        // This handles formats like "Fourth Wing (Standard Edition) (The Empyrean, 1)"
        if (title) {
          console.log("Spicy Reads: Checking title for series:", title);

          // Look for patterns like "Fourth Wing (The Empyrean, 1)"
          const titleMatch = title.match(/\(([^)]+),\s*(\d+)\)/);
          if (titleMatch) {
            seriesName = titleMatch[1].trim();
            seriesNumber = titleMatch[2];
            console.log(
              "Spicy Reads: Found series in title:",
              seriesName,
              "Number:",
              seriesNumber
            );
          } else {
            // Try alternative patterns like "(Book 1)"
            const bookMatch = title.match(/\((?:Book|Vol|Volume)\s*(\d+)\)/i);
            if (bookMatch) {
              seriesNumber = bookMatch[1];
              // Extract series name from before the book number
              const beforeBook = title.split(/\((?:Book|Vol|Volume)/i)[0];
              const seriesPart = beforeBook.match(/\(([^)]+)\)/);
              if (seriesPart) {
                seriesName = seriesPart[1].trim();
              } else {
                // Use the main part of the title as series name
                seriesName = beforeBook.split(/\s*\(/)[0].trim();
              }
              console.log(
                "Spicy Reads: Found series via book pattern:",
                seriesName,
                "Number:",
                seriesNumber
              );
            }
          }
        }

        // Fallback: Check for dedicated series elements on the page
        if (!seriesName && !seriesNumber) {
          const seriesSelectors = [
            "#series-title a", // Main series link
            ".a-link-normal[href*='/series/']", // Series link
            "#seriesString", // Series string
            ".series a", // Series in product details
            "[data-a-target='series']", // Data attribute for series
          ];

          for (const selector of seriesSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
              const seriesText = element.textContent.trim();
              const bookNumMatch = seriesText.match(
                /\b(?:Book|Vol|Volume)\s*(\d+)/i
              );
              const seriesMatch = seriesText.match(/^([^(]+?)(?:\s*\(|$)/);

              if (seriesMatch) {
                seriesName = seriesMatch[1].trim();
              }
              if (bookNumMatch) {
                seriesNumber = bookNumMatch[1];
              }
              console.log(
                "Spicy Reads: Found series in dedicated element:",
                seriesText
              );
              break;
            }
          }
        }

        console.log(
          "Spicy Reads: Extraction results - Title:",
          title,
          "Author:",
          author,
          "Series:",
          seriesName,
          "Number:",
          seriesNumber,
          "Description:",
          description ? description.substring(0, 100) + "..." : "Not found"
        );

        if (title) {
          bookData = {
            title,
            author: author || "Unknown Author",
            source: "Amazon",
            url: currentUrl,
            image,
            seriesName: seriesName || "",
            seriesNumber: seriesNumber || "",
            description: description || "",
          };
        }
      }

      // Goodreads extraction
      else if (currentUrl.includes("goodreads.com")) {
        const title =
          document
            .querySelector('h1[data-testid="bookTitle"]')
            ?.textContent?.trim() ||
          document.querySelector(".gr-h1--serif")?.textContent?.trim();
        const author =
          document.querySelector('[data-testid="name"]')?.textContent?.trim() ||
          document.querySelector(".authorName span")?.textContent?.trim();
        const image =
          document.querySelector(".ResponsiveImage")?.src ||
          document.querySelector("#coverImage")?.src;

        // Extract series information from Goodreads
        let seriesName = "";
        let seriesNumber = "";

        // Goodreads series selectors
        const seriesSelectors = [
          'h3[data-testid="seriesName"] a', // New Goodreads series link
          ".BookPageMetadataSection__series a", // Series section
          '.infoBoxRowTitle:contains("Series") + .infoBoxRowItem', // Info box series
          'a[href*="/series/"]', // Any series link
          '.gr-h3__title a[href*="series"]', // Title series link
        ];

        for (const selector of seriesSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            const seriesText = element.textContent.trim();
            // Extract series name and number from text like "Harry Potter #1" or "Book 1 in Harry Potter"
            const seriesMatch = seriesText.match(/^([^#]+?)(?:\s*#(\d+)|$)/);
            if (seriesMatch) {
              seriesName = seriesMatch[1].trim();
              if (seriesMatch[2]) seriesNumber = seriesMatch[2];
            }
            console.log(
              "Spicy Reads: Found Goodreads series info:",
              seriesText
            );
            break;
          }
        }

        // Also check if series info is in the title
        if (!seriesName && title) {
          const titleSeriesMatch = title.match(/\(([^)]+\s+#?\d+)\)/);
          if (titleSeriesMatch) {
            const seriesInfo = titleSeriesMatch[1];
            const parts = seriesInfo.split(/[#\s]+/);
            if (parts.length >= 2) {
              seriesName = parts.slice(0, -1).join(" ").trim();
              seriesNumber = parts[parts.length - 1];
            }
          }
        }

        if (title) {
          bookData = {
            title,
            author: author || "Unknown Author",
            source: "Goodreads",
            url: currentUrl,
            image,
            seriesName: seriesName || "",
            seriesNumber: seriesNumber || "",
          };
        }
      }

      // Barnes & Noble extraction
      else if (currentUrl.includes("barnesandnoble.com")) {
        const title = document
          .querySelector("h1.pdp-product-title")
          ?.textContent?.trim();
        const author = document
          .querySelector(".contributors a")
          ?.textContent?.trim();
        const image = document.querySelector(".pdp-product-image img")?.src;

        if (title) {
          bookData = {
            title,
            author: author || "Unknown Author",
            source: "Goodreads",
            url: currentUrl,
            image,
          };
        }
      }

      // Barnes & Noble extraction
      else if (currentUrl.includes("barnesandnoble.com")) {
        const title = document
          .querySelector(".pdp-product-name")
          ?.textContent?.trim();
        const author = document
          .querySelector(".contributors a")
          ?.textContent?.trim();
        const image = document.querySelector(".pdp-product-image img")?.src;

        if (title) {
          bookData = {
            title,
            author: author || "Unknown Author",
            source: "Barnes & Noble",
            url: currentUrl,
            image,
          };
        }
      }
    } catch (error) {
      console.warn("Book extraction failed:", error);
      bookData = null;
    }

    return bookData;
  }

  // Extract book info and store it with retry mechanism
  function initializeExtraction() {
    bookData = extractBookInfo();

    // If no data found, try again after page loads completely
    if (!bookData) {
      console.log(
        "Spicy Reads: No data found initially, waiting for page load..."
      );

      // Wait for DOM to be fully loaded
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
          setTimeout(() => {
            bookData = extractBookInfo();
            console.log("Spicy Reads: Retry extraction result:", bookData);
          }, 1000);
        });
      } else {
        // Page already loaded, try again after a short delay
        setTimeout(() => {
          bookData = extractBookInfo();
          console.log("Spicy Reads: Delayed extraction result:", bookData);
        }, 2000);
      }
    }
  }

  // Initialize extraction
  initializeExtraction();

  // Listen for requests from popup
  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "getBookData") {
        // Try extracting again if no data available
        if (!bookData) {
          console.log(
            "Spicy Reads: No cached data, trying fresh extraction..."
          );
          bookData = extractBookInfo();
        }

        console.log("Spicy Reads: Sending book data to popup:", bookData);
        sendResponse({ bookData, url: window.location.href });
        return true; // Keep the message channel open for async response
      }
    });
  }
})();
