import { db } from './db';

export async function clearUserData({ clearOnboarding = false } = {}) {
  // Clear IndexedDB
  await db.books.clear();
  await db.lists.clear();
  await db.listBooks.clear();
  // Clear localStorage (optionally keep onboarding flag)
  if (clearOnboarding) {
    localStorage.clear();
  } else {
    const onboarding = localStorage.getItem('onboardingComplete');
    localStorage.clear();
    if (onboarding) localStorage.setItem('onboardingComplete', onboarding);
  }
}
