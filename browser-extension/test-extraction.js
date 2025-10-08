// Simple test script to run in browser console on Amazon page
// This will help us debug what's happening

console.log("=== Spicy Reads Debug Test ===");
console.log("Current URL:", window.location.href);
console.log("URL includes amazon:", window.location.href.includes("amazon."));

// Test if we're on a book page
const isBookPage =
  window.location.href.includes("/dp/") ||
  window.location.href.includes("/gp/product/");
console.log("Appears to be book page:", isBookPage);

// Test all possible title selectors
const titleSelectors = [
  "#productTitle",
  "[data-a-target='title']",
  ".product-title",
  "h1#title",
  "h1 span#productTitle",
  "h1",
  "[id*='title']",
  ".a-size-large.a-spacing-none.a-color-base",
];

console.log("\n=== Testing Title Selectors ===");
let foundTitle = "";
titleSelectors.forEach((selector) => {
  try {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      const text = element.textContent.trim();
      console.log(`✅ ${selector}: "${text.substring(0, 50)}..."`);
      if (!foundTitle) foundTitle = text;
    } else {
      console.log(`❌ ${selector}: not found or empty`);
    }
  } catch (e) {
    console.log(`❌ ${selector}: error - ${e.message}`);
  }
});

// Test author selectors
const authorSelectors = [
  ".author .a-link-normal",
  '[data-a-target="by-line"] a',
  ".by-author a",
  "#bylineInfo a",
  ".a-row .author a",
  "[id*='author']",
  "a[href*='/author/']",
  ".a-size-base+ .a-size-base .a-link-normal",
];

console.log("\n=== Testing Author Selectors ===");
let foundAuthor = "";
authorSelectors.forEach((selector) => {
  try {
    const element = document.querySelector(selector);
    if (element && element.textContent.trim()) {
      const text = element.textContent.trim();
      console.log(`✅ ${selector}: "${text}"`);
      if (!foundAuthor) foundAuthor = text;
    } else {
      console.log(`❌ ${selector}: not found or empty`);
    }
  } catch (e) {
    console.log(`❌ ${selector}: error - ${e.message}`);
  }
});

console.log("\n=== Results ===");
console.log("Found title:", foundTitle || "NONE");
console.log("Found author:", foundAuthor || "NONE");

// Check if extension content script is loaded
if (window.spicyReadsContentScript) {
  console.log("✅ Spicy Reads content script is loaded");
} else {
  console.log("❌ Spicy Reads content script NOT loaded");
}

// Show what we would extract
if (foundTitle) {
  console.log("\n=== Would Extract ===");
  console.log({
    title: foundTitle,
    author: foundAuthor || "Unknown Author",
    source: "Amazon",
    url: window.location.href,
  });
} else {
  console.log("\n❌ No book data could be extracted");
}
