import { useEffect, useRef, useState } from 'react';
// Gold Standard: Remove db import, use local state only
import { useBookFields } from './useBookFields';
import { db } from '../../utils/db';

export function useAddBookForm(initialValues = {}) {
  // Book fields (modularized)
  const fields = useBookFields(initialValues);
  // Lists
  const [allLists, setAllLists] = useState([]);
  // Always store selectedLists as array of strings for consistency
  const [selectedLists, setSelectedListsRaw] = fields.lists;
  const setSelectedLists = (val) => {
    if (Array.isArray(val)) {
      setSelectedListsRaw(val.map(String));
    } else {
      setSelectedListsRaw([]);
    }
  };
  // Dictation/modal state
  const [dictationError, setDictationError] = useState('');
  const [dictatingField, setDictatingField] = useState(null);
  const [barcodeModalOpen, setBarcodeModalOpen] = useState(false);
  const videoRef = useRef(null);
  // Barcode scan error state
  const [barcodeScanError, setBarcodeScanError] = useState('');

  // Load all lists from the database, and reload when modal is opened (by watching initialValues)
  useEffect(() => {
    let mounted = true;
    const loadLists = () => {
      db.lists.toArray().then((lists) => {
        if (mounted) setAllLists(lists);
      });
    };
    loadLists();
    // Listen for booksChanged event to reload lists when a new list is created
    window.addEventListener('booksChanged', loadLists);
    return () => {
      mounted = false;
      window.removeEventListener('booksChanged', loadLists);
    };
  }, [initialValues]);

  // Sync fields with initialValues on change
  useEffect(() => {
    let changed = false;
    Object.entries(fields).forEach(([key, [value, setter]]) => {
      if (initialValues[key] !== undefined && initialValues[key] !== value) {
        changed = true;
        if (key === 'spice' || key === 'rating' || key === 'readingProgress') {
          setter(
            typeof initialValues[key] === 'number' ? initialValues[key] : 0,
          );
        } else if (key === 'lastRead') {
          setter(
            initialValues.lastRead ? initialValues.lastRead.slice(0, 10) : '',
          );
        } else {
          setter(initialValues[key]);
        }
      }
    });
    // Only reset dictation state if changed
    if (dictationError) setDictationError('');
    if (dictatingField) setDictatingField(null);
  }, [JSON.stringify(initialValues)]);

  // Return all fields and setters, plus lists and modal state
  return {
    ...Object.fromEntries(
      Object.entries(fields)
        .map(([k, v]) => [k, v[0]])
        .concat(
          Object.entries(fields).map(([k, v]) => [
            `set${k.charAt(0).toUpperCase() + k.slice(1)}`,
            v[1],
          ]),
        ),
    ),
    allLists,
    selectedLists,
    setSelectedLists,
    dictationError,
    setDictationError,
    dictatingField,
    setDictatingField,
    barcodeModalOpen,
    setBarcodeModalOpen,
    videoRef,
    barcodeScanError,
    setBarcodeScanError,
  };
}
