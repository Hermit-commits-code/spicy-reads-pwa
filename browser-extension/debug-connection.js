// Debug tool to test extension communication
console.log("=== Spicy Reads Debug Tool ===");

// Test if content script is loaded
if (window.spicyReadsContentScript) {
  console.log("✅ Content script is loaded");
} else {
  console.log("❌ Content script not loaded");
}

// Test if Chrome extension APIs are available
if (typeof chrome !== "undefined" && chrome.runtime) {
  console.log("✅ Chrome runtime available");
  console.log("Extension ID:", chrome.runtime.id);
} else {
  console.log("❌ Chrome runtime not available");
}

// Test book data extraction
setTimeout(() => {
  if (window.spicyReadsContentScript) {
    console.log("Testing book extraction...");
    // This would normally be done by popup.js
    console.log("Current URL:", window.location.href);
    console.log("Page title:", document.title);

    // Test some basic selectors
    const amazonTitle = document.querySelector("#productTitle");
    const goodreadsTitle = document.querySelector(
      'h1[data-testid="bookTitle"]'
    );

    if (amazonTitle) {
      console.log("✅ Found Amazon title:", amazonTitle.textContent.trim());
    }
    if (goodreadsTitle) {
      console.log(
        "✅ Found Goodreads title:",
        goodreadsTitle.textContent.trim()
      );
    }

    if (!amazonTitle && !goodreadsTitle) {
      console.log("❌ No book title selectors found on this page");
    }
  }
}, 1000);

// Instructions
console.log("\n=== Debug Instructions ===");
console.log("1. Open this page: Amazon or Goodreads book page");
console.log("2. Open DevTools Console");
console.log("3. Paste this script and run it");
console.log("4. Check the output above");
console.log("5. If content script not loaded, refresh the page");
