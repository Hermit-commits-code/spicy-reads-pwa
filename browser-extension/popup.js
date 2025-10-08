// Popup script - handles the extension popup interface
document.addEventListener("DOMContentLoaded", async () => {
  const loading = document.getElementById("loading");
  const bookFound = document.getElementById("bookFound");
  const bookNotFound = document.getElementById("bookNotFound");
  const error = document.getElementById("error");
  const currentUrl = document.getElementById("currentUrl");

  try {
    // Get current tab with error handling
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tabs || tabs.length === 0) {
      throw new Error("No active tab found");
    }

    const tab = tabs[0];

    // Display current URL (shortened) with error handling
    try {
      const url = new URL(tab.url);
      currentUrl.textContent = url.hostname;
    } catch (urlError) {
      currentUrl.textContent = "Current page";
      console.warn("URL parsing failed:", urlError);
    }

    // Try to get book data from content script using async/await
    try {
      console.log("Attempting to communicate with content script on:", tab.url);

      const response = await chrome.tabs.sendMessage(tab.id, {
        action: "getBookData",
      });
      loading.style.display = "none";

      console.log("Received response from content script:", response);

      if (response && response.bookData && response.bookData.title) {
        // Book found!
        const bookData = response.bookData;

        const titleElement = document.getElementById("bookTitle");
        const authorElement = document.getElementById("bookAuthor");
        const descriptionElement = document.getElementById("bookDescription");

        if (titleElement) titleElement.textContent = bookData.title;
        if (authorElement)
          authorElement.textContent = `by ${
            bookData.author || "Unknown Author"
          }`;

        // Display description if available
        if (descriptionElement && bookData.description) {
          let desc = bookData.description;
          // Truncate description if too long for popup
          if (desc.length > 200) {
            desc = desc.substring(0, 200) + "...";
          }
          descriptionElement.textContent = desc;
        }

        // Display series information if available
        if (bookData.seriesName) {
          const seriesInfo =
            bookData.seriesName +
            (bookData.seriesNumber ? ` #${bookData.seriesNumber}` : "");

          // Add series info to the popup display
          const authorElement = document.getElementById("bookAuthor");
          if (authorElement) {
            authorElement.innerHTML += `<br><small style="color: #666;">Series: ${seriesInfo}</small>`;
          }
        }

        bookFound.style.display = "block";

        // Handle add book button
        const addBtn = document.getElementById("addBookBtn");
        if (addBtn) {
          addBtn.addEventListener("click", () => {
            addBookToSpicyReads(bookData);
          });
        }
      } else {
        // No book data found
        console.log("No book data found in response");
        showManualAddOption(tab.url);
      }
    } catch (sendMessageError) {
      console.warn("Extension communication error:", sendMessageError);

      // Check if it's a connection error (content script not loaded)
      if (sendMessageError.message.includes("Receiving end does not exist")) {
        console.log("Content script not loaded, trying manual injection...");

        try {
          // Try to inject the content script manually
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });

          // Wait longer for script to initialize and try multiple times
          let retryCount = 0;
          const maxRetries = 3;

          const attemptConnection = async () => {
            try {
              const response = await chrome.tabs.sendMessage(tab.id, {
                action: "getBookData",
              });

              if (response && response.bookData && response.bookData.title) {
                // Success after manual injection
                const bookData = response.bookData;
                const titleElement = document.getElementById("bookTitle");
                const authorElement = document.getElementById("bookAuthor");

                if (titleElement) titleElement.textContent = bookData.title;
                if (authorElement) {
                  authorElement.textContent = `by ${
                    bookData.author || "Unknown Author"
                  }`;

                  // Display series information if available
                  if (bookData.seriesName) {
                    const seriesInfo =
                      bookData.seriesName +
                      (bookData.seriesNumber
                        ? ` #${bookData.seriesNumber}`
                        : "");

                    authorElement.innerHTML += `<br><small style="color: #666;">Series: ${seriesInfo}</small>`;
                  }
                }

                loading.style.display = "none";
                bookFound.style.display = "block";

                const addBtn = document.getElementById("addBookBtn");
                if (addBtn) {
                  addBtn.addEventListener("click", () => {
                    addBookToSpicyReads(bookData);
                  });
                }
              } else {
                throw new Error("No book data received");
              }
            } catch (retryError) {
              retryCount++;
              if (retryCount < maxRetries) {
                console.log(
                  `Retry attempt ${retryCount}/${maxRetries} in 1 second...`
                );
                setTimeout(attemptConnection, 1000);
              } else {
                console.warn("All retry attempts failed:", retryError);
                showManualAddOption(tab.url);
              }
            }
          };

          // Start first retry attempt
          setTimeout(attemptConnection, 1500);
        } catch (injectionError) {
          console.warn("Manual injection failed:", injectionError);
          showManualAddOption(tab.url);
        }
      } else {
        showManualAddOption(tab.url);
      }
    }

    function showManualAddOption(url) {
      loading.style.display = "none";
      bookNotFound.style.display = "block";

      // Handle manual add button as fallback
      const manualBtn = document.getElementById("manualAddBtn");
      if (manualBtn) {
        manualBtn.addEventListener("click", () => {
          addBookManually(url);
        });
      }
    }
  } catch (err) {
    loading.style.display = "none";
    error.style.display = "block";
    error.textContent = "Error: " + err.message;
  }
});

function addBookToSpicyReads(bookData) {
  // Open Spicy Reads with the book data
  const params = {
    title: bookData.title,
    author: bookData.author,
    url: bookData.url,
    source: bookData.source,
    image: bookData.image || "",
  };

  // Add series information if available
  if (bookData.seriesName) {
    params.seriesName = bookData.seriesName;
  }
  if (bookData.seriesNumber) {
    params.seriesNumber = bookData.seriesNumber;
  }

  // Add description if available
  if (bookData.description) {
    params.description = bookData.description;
  }

  const spicyReadsUrl =
    `http://localhost:5173/spicy-reads-pwa/add-book?` +
    new URLSearchParams(params).toString();

  chrome.tabs.create({ url: spicyReadsUrl });
  window.close();
}

function addBookManually(pageUrl) {
  // Open Spicy Reads with just the URL for manual processing
  const spicyReadsUrl = `http://localhost:5173/spicy-reads-pwa/add-book?url=${encodeURIComponent(
    pageUrl
  )}`;

  chrome.tabs.create({ url: spicyReadsUrl });
  window.close();
}
