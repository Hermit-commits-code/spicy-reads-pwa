import React, { useEffect, useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import db from '../db/booksDB';
import { useTranslation } from 'react-i18next';
import StatsPanel from './analytics/StatsPanel';
import GoalPanel from './analytics/GoalPanel';
import BooksFinishedPanel from './analytics/BooksFinishedPanel';

function getStreak(dates) {
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
  const bg = 'white';
  const text = 'gray.700';
  const muted = 'gray.400';

  const [books, setBooks] = useState([]);
  const [goal, setGoal] = useState(() => {
    const stored = localStorage.getItem('readingGoal');
    return stored ? parseInt(stored, 10) : 100;
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState(goal);

  useEffect(() => {
    const loadBooks = () => db.books.toArray().then(setBooks);
    loadBooks();
    window.addEventListener('booksChanged', loadBooks);
    return () => window.removeEventListener('booksChanged', loadBooks);
  }, []);

  useEffect(() => {
    localStorage.setItem('readingGoal', String(goal));
  }, [goal]);

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
      <VStack align="stretch" spacing={4}>
        <Box>
          <h2
            style={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
              color: '#C53030',
              marginBottom: '1.5rem',
            }}
          >
            {t('analytics', 'Analytics & Reading Stats')}
          </h2>
          <StatsPanel
            t={t}
            totalBooks={totalBooks}
            finishedBooks={finishedBooks}
            readingStreak={readingStreak}
            avgSpice={avgSpice}
            avgRating={avgRating}
          />
        </Box>
        <GoalPanel
          t={t}
          text={text}
          muted={muted}
          totalBooks={totalBooks}
          goal={goal}
          editingGoal={editingGoal}
          goalInput={goalInput}
          setGoalInput={setGoalInput}
          setGoal={setGoal}
          setEditingGoal={setEditingGoal}
        />
        <BooksFinishedPanel
          t={t}
          text={text}
          muted={muted}
          totalBooks={totalBooks}
          finishedBooks={finishedBooks}
        />
      </VStack>
    </Box>
  );
}
