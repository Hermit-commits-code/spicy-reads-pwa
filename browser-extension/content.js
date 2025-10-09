// Content script - minimal extraction for legal safety
(function () {
  window.spicyReadsContentScript = true;

  function extractMinimalBookData() {
    const url = window.location.href;
    let bookData = { url, source: "" };
    if (url.includes("amazon.")) {
      // Only extract ASIN from URL
      const match = url.match(/\/dp\/([A-Z0-9]{10})/i);
      bookData.source = "Amazon";
      if (match) bookData.asin = match[1];
    } else if (url.includes("goodreads.com")) {
      // Only extract Goodreads book ID from URL
      const match = url.match(/goodreads\.com\/book\/show\/(\d+)/i);
      bookData.source = "Goodreads";
      if (match) bookData.goodreadsId = match[1];
    }
    // Add more sources as needed
    return bookData;
  }

  if (typeof chrome !== "undefined" && chrome.runtime) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "getBookData") {
        const bookData = extractMinimalBookData();
        sendResponse({ bookData, url: window.location.href });
        return true;
      }
    });
  }
})();
