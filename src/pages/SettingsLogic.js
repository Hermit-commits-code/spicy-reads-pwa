import { useState, useEffect } from 'react';
import db from '../db/booksDB';
import { exportUserData } from '../firebase/db';
import { getDisplayNameFromFirestore } from '../firebase/getDisplayName';

export function useSettingsLogic({ user, onBooksChanged, toast }) {
  const [lang, setLang] = useState('en');
  const [sort, setSort] = useState('recent');
  const [isAdmin, setIsAdmin] = useState(false);
  const [firestoreDisplayName, setFirestoreDisplayName] = useState('');
  // Fetch displayName from Firestore
  useEffect(() => {
    async function fetchDisplayName() {
      if (user && user.uid) {
        const name = await getDisplayNameFromFirestore(user.uid);
        if (name) setFirestoreDisplayName(name);
      }
    }
    fetchDisplayName();
  }, [user]);

  useEffect(() => {
    const savedLang = localStorage.getItem('settings:lang');
    if (savedLang) setLang(savedLang);
    const savedSort = localStorage.getItem('settings:sort');
    if (savedSort) setSort(savedSort);
  }, []);

  useEffect(() => {
    localStorage.setItem('settings:lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('settings:sort', sort);
  }, [sort]);

  const handleLangChange = (e) => {
    const lng = e.target.value;
    setLang(lng);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await db.books.clear();
      await db.lists.clear();
      await db.listBooks.clear();
      if (data.books && data.books.length) await db.books.bulkAdd(data.books);
      if (data.lists && data.lists.length) await db.lists.bulkAdd(data.lists);
      if (data.listBooks && data.listBooks.length)
        await db.listBooks.bulkAdd(data.listBooks);
      window.dispatchEvent(new Event('booksChanged'));
      if (onBooksChanged) onBooksChanged();
      alert('Library restored!');
    } catch (err) {
      alert('Import failed: ' + err.message);
    }
  };

  const handleExportCloud = async () => {
    if (!user) return;
    try {
      const data = await exportUserData(user.uid);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'spicy-reads-backup.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  };

  return {
    lang,
    setLang,
    sort,
    setSort,
    isAdmin,
    setIsAdmin,
    firestoreDisplayName,
    handleLangChange,
    handleImport,
    handleExportCloud,
  };
}
