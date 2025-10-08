// Debug script to test Amazon selectors
// Run this in console on Amazon book page

console.log("=== Amazon Book Page Selector Test ===");

// Test title selectors
const titleSelectors = [
  "#productTitle",
  "[data-a-target='title']",
  ".product-title",
  "h1#title",
  "h1 span#productTitle",
  "h1",
  "[id*='title']",
  "[class*='title']",
];

console.log("Testing title selectors:");
titleSelectors.forEach((selector) => {
  const element = document.querySelector(selector);
  if (element) {
    console.log(
      `✅ ${selector}: "${element.textContent.trim().substring(0, 50)}..."`
    );
  } else {
    console.log(`❌ ${selector}: not found`);
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
  "[class*='author']",
  "a[href*='/author/']",
];

console.log("\nTesting author selectors:");
authorSelectors.forEach((selector) => {
  const element = document.querySelector(selector);
  if (element) {
    console.log(`✅ ${selector}: "${element.textContent.trim()}"`);
  } else {
    console.log(`❌ ${selector}: not found`);
  }
});

// Show all headings for reference
console.log("\nAll H1 elements:");
document.querySelectorAll("h1").forEach((h1, i) => {
  console.log(`H1 ${i}: "${h1.textContent.trim().substring(0, 50)}..."`);
});

console.log("\nElements with 'author' in class or id:");
document
  .querySelectorAll('[class*="author"], [id*="author"]')
  .forEach((el, i) => {
    console.log(
      `Author ${i}: ${el.tagName} - "${el.textContent
        .trim()
        .substring(0, 30)}..."`
    );
  });
