// Utility for autotagging books based on metadata (description, title, etc.)
// Exports: suggestMoods, suggestContentWarnings, suggestSpice, suggestGenre

const MOOD_KEYWORDS = {
  Cozy: ["cozy", "comfort", "warm", "heartwarming", "gentle"],
  Dark: ["dark", "gritty", "bleak", "disturbing", "grim"],
  Funny: ["funny", "humor", "hilarious", "comedy", "witty"],
  Adventurous: ["adventure", "quest", "journey", "explore", "danger"],
  Emotional: ["emotional", "tear", "cry", "moving", "heartbreaking"],
  Inspiring: ["inspiring", "uplifting", "motivating", "hopeful"],
  Steamy: ["steamy", "spicy", "explicit", "erotic", "hot"],
  Chilling: ["chilling", "creepy", "spooky", "haunting", "eerie"],
  "Feel-Good": ["feel-good", "uplifting", "positive", "happy end"],
  Heartbreaking: ["heartbreak", "tragic", "loss", "sad"],
};

const WARNING_KEYWORDS = {
  "Sexual Content": ["sex", "sexual", "explicit", "erotic", "spicy"],
  Abuse: ["abuse", "assault", "violence", "trauma"],
  Death: ["death", "murder", "die", "kill", "suicide"],
  "Substance Use": ["drug", "alcohol", "substance", "addict"],
  Language: ["language", "swearing", "profanity", "curse"],
};

const SPICE_KEYWORDS = [
  { level: 5, words: ["explicit", "erotic", "hardcore", "XXX"] },
  { level: 4, words: ["steamy", "spicy", "graphic", "hot scenes"] },
  { level: 3, words: ["open door", "on-page", "detailed"] },
  { level: 2, words: ["fade to black", "mild", "suggestive"] },
  { level: 1, words: ["sweet", "clean", "no spice"] },
];

function suggestMoods(text) {
  const found = new Set();
  const lower = text.toLowerCase();
  for (const [mood, keywords] of Object.entries(MOOD_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) found.add(mood);
  }
  return Array.from(found);
}

function suggestContentWarnings(text) {
  const found = new Set();
  const lower = text.toLowerCase();
  for (const [warning, keywords] of Object.entries(WARNING_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) found.add(warning);
  }
  return Array.from(found);
}

function suggestSpice(text) {
  const lower = text.toLowerCase();
  for (const { level, words } of SPICE_KEYWORDS) {
    if (words.some((kw) => lower.includes(kw))) return level;
  }
  return 0;
}

// Example: genre detection by keywords (expand as needed)
const GENRE_KEYWORDS = {
  Romance: ["romance", "love", "relationship", "affair"],
  Fantasy: ["magic", "dragon", "fantasy", "sorcerer", "elf"],
  Mystery: ["mystery", "detective", "murder", "crime", "investigate"],
  "Sci-Fi": ["space", "alien", "future", "sci-fi", "robot"],
  Nonfiction: ["memoir", "biography", "history", "true story", "essay"],
};

function suggestGenre(text) {
  const lower = text.toLowerCase();
  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return genre;
  }
  return null;
}

export { suggestMoods, suggestContentWarnings, suggestSpice, suggestGenre };
