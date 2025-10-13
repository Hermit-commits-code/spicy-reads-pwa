import React from 'react';
import {
  Box,
  HStack,
  Text,
  Input,
  IconButton,
  Progress,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon } from '@chakra-ui/icons';

export default function GoalPanel({
  t,
  text,
  muted,
  totalBooks,
  goal,
  editingGoal,
  goalInput,
  setGoalInput,
  setGoal,
  setEditingGoal,
}) {
  return (
    <Box>
      <HStack mb={2} align="center">
        <Text fontWeight="bold" color={text}>
          {t('progress_to_goal', 'Progress to Goal')}
        </Text>
        {editingGoal ? (
          <>
            <Input
              size="xs"
              type="number"
              min={1}
              max={9999}
              value={goalInput}
              onChange={(e) =>
                setGoalInput(e.target.value.replace(/[^0-9]/g, ''))
              }
              width="60px"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setGoal(Number(goalInput) || 1);
                  setEditingGoal(false);
                }
              }}
              autoFocus
            />
            <IconButton
              icon={<CheckIcon />}
              size="xs"
              aria-label="Save goal"
              onClick={() => {
                setGoal(Number(goalInput) || 1);
                setEditingGoal(false);
              }}
            />
          </>
        ) : (
          <IconButton
            icon={<EditIcon />}
            size="xs"
            aria-label="Edit goal"
            onClick={() => {
              setGoalInput(goal);
              setEditingGoal(true);
            }}
          />
        )}
      </HStack>
      <Progress
        value={goal > 0 ? Math.min(100, (totalBooks / goal) * 100) : 0}
        colorScheme="red"
        borderRadius="md"
        aria-label={t('progress_to_goal', 'Progress to Goal')}
      />
      <Text fontSize="sm" color={muted} mt={1}>
        {totalBooks}/{goal} {t('books', 'books')}
      </Text>
    </Box>
  );
}
