// Quick test for Fourth Wing series extraction
console.log("=== Fourth Wing Series Extraction Test ===");

// Simulate the page title and product title from Amazon
const testData = [
  {
    name: "Amazon Page Title",
    text: "Fourth Wing (Standard Edition) (The Empyrean, 1) Hardcover – May 2, 2023",
  },
  {
    name: "Product Title",
    text: "Fourth Wing (Standard Edition) (The Empyrean, 1)",
  },
  {
    name: "Another Series Format",
    text: "Harry Potter and the Philosopher's Stone (Harry Potter, 1)",
  },
  {
    name: "Simple Book Number",
    text: "The Hunger Games (Book 1)",
  },
];

function extractSeriesInfo(text) {
  let seriesName = "";
  let seriesNumber = "";

  console.log(`Testing: "${text}"`);

  // Look for patterns like "Fourth Wing (The Empyrean, 1)"
  const titleMatch = text.match(/\(([^)]+),\s*(\d+)\)/);
  if (titleMatch) {
    seriesName = titleMatch[1].trim();
    seriesNumber = titleMatch[2];
    console.log(
      "✅ Method 1 - Found series:",
      seriesName,
      "Number:",
      seriesNumber
    );
    return { seriesName, seriesNumber };
  }

  // Try alternative patterns like "(Book 1)"
  const bookMatch = text.match(/\((?:Book|Vol|Volume)\s*(\d+)\)/i);
  if (bookMatch) {
    seriesNumber = bookMatch[1];
    console.log("✅ Method 2 - Found book number:", seriesNumber);

    // Try to extract series name from before the book number
    const beforeBook = text.split(/\((?:Book|Vol|Volume)/i)[0];
    const seriesPart = beforeBook.match(/\(([^)]+)\)/);
    if (seriesPart) {
      seriesName = seriesPart[1].trim();
      console.log("✅ Method 2 - Found series name:", seriesName);
    } else {
      // Use the main title as series name
      const mainTitle = beforeBook.split(/\s*\(/)[0].trim();
      if (mainTitle) {
        seriesName = mainTitle;
        console.log("✅ Method 2 - Using main title as series:", seriesName);
      }
    }
    return { seriesName, seriesNumber };
  }

  console.log("❌ No series info found");
  return { seriesName: "", seriesNumber: "" };
}

// Test all formats
testData.forEach((data) => {
  console.log(`\n--- ${data.name} ---`);
  const result = extractSeriesInfo(data.text);
  console.log(
    `Result: Series="${result.seriesName}", Number="${result.seriesNumber}"`
  );
});

console.log("\n🎯 Key test: Fourth Wing should show 'The Empyrean' and '1'");
