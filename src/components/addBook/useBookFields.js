import { useState } from 'react';

export function useBookFields(initialValues = {}) {
  return {
    title: useState(initialValues.title || ''),
    author: useState(initialValues.author || ''),
    genre: useState(initialValues.genre || ''),
    subGenre: useState(initialValues.subGenre || ''),
    description: useState(initialValues.description || ''),
    spice: useState(
      typeof initialValues.spice === 'number' ? initialValues.spice : 0,
    ),
    rating: useState(
      typeof initialValues.rating === 'number' ? initialValues.rating : 0,
    ),
    contentWarnings: useState(initialValues.contentWarnings || []),
    customWarning: useState(''),
    cover: useState(initialValues.cover || ''),
    readingProgress: useState(
      typeof initialValues.readingProgress === 'number'
        ? initialValues.readingProgress
        : 0,
    ),
    lastRead: useState(
      initialValues.lastRead ? initialValues.lastRead.slice(0, 10) : '',
    ),
    moods: useState(initialValues.moods || []),
    customMood: useState(''),
    series: useState(initialValues.series || ''),
    seriesOrder: useState(initialValues.seriesOrder || ''),
    notes: useState(initialValues.notes || ''),
    review: useState(initialValues.review || ''),
    formatsOwned: useState(initialValues.formatsOwned || []),
    lists: useState(initialValues.lists || []),
    releaseDate: useState(initialValues.releaseDate || ''),
  };
}
