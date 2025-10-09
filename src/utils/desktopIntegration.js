/**
 * Spicy Reads Bookmarklet
 * Drag this to your bookmarks bar to add books from any website
 */

// Create the bookmarklet code (minified for bookmark bar)
const bookmarkletCode = `
javascript:(function(){
  const currentUrl = window.location.href;
  const pageTitle = document.title;
  const selectedText = window.getSelection().toString();
  
  // Try to detect book information from the current page
  let bookInfo = {
    url: currentUrl,
    title: pageTitle,
    text: selectedText
  };
  
  // Amazon-specific extraction
  if (currentUrl.includes('amazon.')) {
    const title = document.querySelector('#productTitle')?.textContent?.trim();
    const author = document.querySelector('.author .a-link-normal')?.textContent?.trim();
    if (title) {
      bookInfo.detectedTitle = title;
      bookInfo.detectedAuthor = author;
    }
  }
  
  // Goodreads-specific extraction  
  if (currentUrl.includes('goodreads.com')) {
    const title = document.querySelector('h1[data-testid="bookTitle"]')?.textContent?.trim();
    const author = document.querySelector('[data-testid="name"]')?.textContent?.trim();
    if (title) {
      bookInfo.detectedTitle = title;
      bookInfo.detectedAuthor = author;
    }
  }
  
  // Open Spicy Reads with the book information
  const spicyReadsUrl = 'http://localhost:5173/spicy-reads-pwa/add-book?' + 
    new URLSearchParams(bookInfo).toString();
  
  window.open(spicyReadsUrl, 'spicyreads', 'width=500,height=700,scrollbars=yes');
})();
`;

console.log("Bookmarklet code (drag to bookmarks bar):");
console.log(bookmarkletCode);

// Also create a user-friendly browser extension concept
// Extension concept removed
export { bookmarkletCode };
