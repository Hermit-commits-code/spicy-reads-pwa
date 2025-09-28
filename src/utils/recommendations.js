// Recommendation engine utility for Spicy Reads
// Suggests books based on user reading history, ratings, and tags
// Exports: getRecommendedBooks

// This is a simple collaborative/content-based hybrid. Refine as needed.

function getRecommendedBooks(books, options = {}) {
  // books: array of all book objects in the library
  // options: { max = 10, excludeIds = [], userLists = [], recentOnly = false }
  const {
    max = 10,
    excludeIds = [],
    userLists = [],
    recentOnly = false,
  } = options;

  // 1. Find books the user has read/rated highly
  const rated = books.filter((b) => b.rating && b.rating >= 4);
  // 2. Aggregate tag/mood/genre preferences
  const tagCounts = {};
  rated.forEach((b) => {
    (b.moods || []).forEach((m) => {
      tagCounts[m] = (tagCounts[m] || 0) + 1;
    });
    (b.genre ? [b.genre] : []).forEach((g) => {
      tagCounts[g] = (tagCounts[g] || 0) + 2;
    });
    (b.contentWarnings || []).forEach((w) => {
      tagCounts[w] = (tagCounts[w] || 0) + 0.5;
    });
    if (typeof b.spice === "number")
      tagCounts["spice:" + b.spice] = (tagCounts["spice:" + b.spice] || 0) + 1;
  });
  // 3. Score all books by tag overlap
  const scored = books.map((b) => {
    let score = 0;
    (b.moods || []).forEach((m) => {
      score += tagCounts[m] || 0;
    });
    (b.genre ? [b.genre] : []).forEach((g) => {
      score += tagCounts[g] || 0;
    });
    (b.contentWarnings || []).forEach((w) => {
      score += tagCounts[w] || 0;
    });
    if (typeof b.spice === "number")
      score += tagCounts["spice:" + b.spice] || 0;
    // Bonus for unrated/unread books
    if (!b.rating || b.rating < 3) score += 1;
    // Penalty for already read
    if (b.readingProgress === 100) score -= 5;
    // Penalty for books in excludeIds or userLists
    if (excludeIds.includes(b.id)) score -= 100;
    if (userLists.some((list) => (b.lists || []).includes(list))) score -= 2;
    return { ...b, _recScore: score };
  });
  // 4. Sort and return top N
  return scored
    .filter((b) => b._recScore > 0)
    .sort((a, b) => b._recScore - a._recScore)
    .slice(0, max);
}

export { getRecommendedBooks };
