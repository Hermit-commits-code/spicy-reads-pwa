import {
  Box,
  Heading,
  Text,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Progress,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import db from "../db/booksDB";
import { useTranslation } from "react-i18next";

function getStreak(dates) {
  // dates: array of ISO strings
  if (!dates.length) return 0;
  const days = dates.map((d) => new Date(d).setHours(0, 0, 0, 0));
  days.sort((a, b) => b - a);
  let streak = 1;
  let prev = days[0];
  for (let i = 1; i < days.length; i++) {
    if (prev - days[i] === 86400000) {
      streak++;
      prev = days[i];
    } else if (prev !== days[i]) {
      break;
    }
  }
  return streak;
}

export default function Analytics() {
  const { t } = useTranslation();
  const bg = "white";
  const text = "gray.700";
  const muted = "gray.400";
  const [books, setBooks] = useState([]);
  useEffect(() => {
    db.books.toArray().then(setBooks);
  }, []);

  const totalBooks = books.length;
  const finishedBooks = books.filter((b) => b.readingProgress === 100).length;
  const lastReadDates = books.filter((b) => b.lastRead).map((b) => b.lastRead);
  const readingStreak = getStreak(lastReadDates);
  const avgSpice = books.length
    ? (
        books.reduce((sum, b) => sum + (b.spice || 0), 0) / books.length
      ).toFixed(1)
    : 0;
  const avgRating = books.length
    ? (
        books.reduce((sum, b) => sum + (b.rating || 0), 0) / books.length
      ).toFixed(1)
    : 0;

  return (
    <Box py={8} px={4} maxW="600px" mx="auto" bg={bg} borderRadius="lg">
      <Heading
        as="h2"
        size="lg"
        mb={6}
        color="red.600"
        aria-label={t("analytics", "Analytics & Reading Stats")}
      >
        {t("analytics", "Analytics & Reading Stats")}
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={6} mb={8}>
        <Stat>
          <StatLabel>{t("total_books", "Total Books")}</StatLabel>
          <StatNumber>{totalBooks}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>{t("books_finished", "Books Finished")}</StatLabel>
          <StatNumber>{finishedBooks}</StatNumber>
          <StatHelpText>
            {totalBooks > 0
              ? `${Math.round((finishedBooks / totalBooks) * 100)}% ${t(
                  "finished",
                  "finished"
                )}`
              : ""}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>{t("reading_streak", "Reading Streak")}</StatLabel>
          <StatNumber>
            {readingStreak} {t("days", "days")}
          </StatNumber>
          <StatHelpText>
            {t("consecutive_days", "Consecutive days with reading activity")}
          </StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>{t("avg_spice", "Avg. Spice")}</StatLabel>
          <StatNumber>{avgSpice}</StatNumber>
        </Stat>
        <Stat>
          <StatLabel>{t("avg_rating", "Avg. Rating")}</StatLabel>
          <StatNumber>{avgRating}</StatNumber>
        </Stat>
      </SimpleGrid>
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontWeight="bold" mb={2} color={text}>
            {t("progress_to_100", "Progress to 100 Books")}
          </Text>
          <Progress
            value={Math.min(100, (totalBooks / 100) * 100)}
            colorScheme="red"
            borderRadius="md"
            aria-label={t("progress_to_100", "Progress to 100 Books")}
          />
          <Text fontSize="sm" color={muted} mt={1}>
            {totalBooks}/100 {t("books", "books")}
          </Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={2} color={text}>
            {t("books_finished_label", "Books Finished")}
          </Text>
          <Progress
            value={totalBooks ? (finishedBooks / totalBooks) * 100 : 0}
            colorScheme="green"
            borderRadius="md"
            aria-label={t("books_finished_label", "Books Finished")}
          />
          <Text fontSize="sm" color={muted} mt={1}>
            {finishedBooks} {t("finished", "finished")}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
}
