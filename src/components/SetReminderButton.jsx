import React, { useState } from 'react';
import {
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';

// Utility to generate an ICS file string
function generateICS({ title, description, date, url }) {
  const dt = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  const dtStr = `${dt.getUTCFullYear()}${pad(dt.getUTCMonth() + 1)}${pad(
    dt.getUTCDate(),
  )}T${pad(dt.getUTCHours())}${pad(dt.getUTCMinutes())}00Z`;
  return `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${description}\nDTSTART:${dtStr}\nDTEND:${dtStr}\n${
    url ? `URL:${url}\n` : ''
  }END:VEVENT\nEND:VCALENDAR`;
}

export default function SetReminderButton({ book }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [reminderDate, setReminderDate] = useState(
    book.releaseDate ? book.releaseDate.slice(0, 16) : '',
  );
  const toast = useToast();

  if (!book.releaseDate || new Date(book.releaseDate) <= new Date())
    return null;

  const handleDownloadICS = () => {
    const ics = generateICS({
      title: `Book Release: ${book.title}`,
      description: `Don't forget: ${book.title} by ${book.author} releases soon!`,
      date: reminderDate,
      url: window.location.href,
    });
    const blob = new Blob([ics.replace(/\\n/g, '\r\n')], {
      type: 'text/calendar',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${book.title.replace(/[^a-z0-9]/gi, '_')}_reminder.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: 'Calendar event downloaded!', status: 'success' });
    setModalOpen(false);
  };

  return (
    <>
      <Button
        colorScheme="blue"
        size="sm"
        mt={2}
        onClick={() => setModalOpen(true)}
        aria-label="Set release reminder"
      >
        Set Reminder
      </Button>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set Release Reminder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel htmlFor="reminder-date">
                Reminder Date & Time
              </FormLabel>
              <Input
                id="reminder-date"
                type="datetime-local"
                value={reminderDate}
                min={book.releaseDate.slice(0, 16)}
                onChange={(e) => setReminderDate(e.target.value)}
                aria-label="Reminder date and time"
              />
            </FormControl>
            <p style={{ fontSize: '0.9em', color: '#666', marginTop: 8 }}>
              This will download a calendar event (.ics) you can add to Google,
              Apple, or Outlook Calendar.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setModalOpen(false)} mr={3} variant="ghost">
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleDownloadICS}
              isDisabled={!reminderDate}
            >
              Download Event
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
