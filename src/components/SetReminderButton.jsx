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
  VStack,
  HStack,
  Divider,
  useBreakpointValue,
  Icon,
  Box,
} from '@chakra-ui/react';
import { FaCalendarPlus, FaDownload } from 'react-icons/fa';

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

  // Google Calendar event URL builder
  const getGoogleCalendarUrl = () => {
    if (!reminderDate) return '#';
    const dt = new Date(reminderDate);
    const pad = (n) => String(n).padStart(2, '0');
    const y = dt.getUTCFullYear();
    const m = pad(dt.getUTCMonth() + 1);
    const d = pad(dt.getUTCDate());
    const h = pad(dt.getUTCHours());
    const min = pad(dt.getUTCMinutes());
    // Google Calendar expects UTC in format: YYYYMMDDTHHMMSSZ
    const start = `${y}${m}${d}T${h}${min}00Z`;
    // 1 hour event by default
    const endDt = new Date(dt.getTime() + 60 * 60 * 1000);
    const end = `${endDt.getUTCFullYear()}${pad(endDt.getUTCMonth() + 1)}${pad(
      endDt.getUTCDate(),
    )}T${pad(endDt.getUTCHours())}${pad(endDt.getUTCMinutes())}00Z`;
    const text = encodeURIComponent(`Book Release: ${book.title}`);
    const details = encodeURIComponent(
      `Don't forget: ${book.title} by ${book.author} releases soon!`,
    );
    const location = '';
    const url = encodeURIComponent(window.location.href);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}&sprop=&sprop=name:&add=${url}`;
  };

  // Responsive: stack vertically on mobile, horizontally on desktop
  const buttonStack = useBreakpointValue({ base: 'column', md: 'row' });

  return (
    <>
      <Button
        colorScheme="blue"
        size="sm"
        mt={2}
        onClick={() => setModalOpen(true)}
        aria-label="Set release reminder"
        leftIcon={<Icon as={FaCalendarPlus} />}
      >
        Set Reminder
      </Button>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set Release Reminder</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
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
            <Divider my={2} />
            <Box mb={2} color="gray.600" fontSize="sm">
              Add this release to your calendar:
            </Box>
            <VStack spacing={3} align="stretch">
              <Button
                colorScheme="blue"
                leftIcon={<Icon as={FaDownload} />}
                onClick={handleDownloadICS}
                isDisabled={!reminderDate}
                variant="outline"
              >
                Download .ics (All Calendars)
              </Button>
              <a
                href={getGoogleCalendarUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button
                  colorScheme="green"
                  leftIcon={<Icon as={FaCalendarPlus} />}
                  isDisabled={!reminderDate}
                  variant="solid"
                  width="100%"
                >
                  Add to Google Calendar
                </Button>
              </a>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setModalOpen(false)} variant="ghost">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
