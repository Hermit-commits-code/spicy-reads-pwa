import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Stack,
  Text,
  HStack,
  RadioGroup,
  Radio,
  Switch,
  Button,
  useToast,
} from '@chakra-ui/react';
import { db } from '../../utils/db';
import { useColorMode } from '@chakra-ui/react';

export default function AppearanceSection() {
  const toast = useToast();
  const [theme, setTheme] = useState('system');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [fontScale, setFontScale] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const { colorMode, setColorMode } = useColorMode();

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const s = await db.settings.where('key').equals('appearance').first();
        if (s && mounted) {
          const v = JSON.parse(s.value);
          setTheme(v.theme || 'system');
          setReducedMotion(!!v.reducedMotion);
          if (v.fontScale) setFontScale(v.fontScale);
          if (v.highContrast) setHighContrast(!!v.highContrast);
        }
      } catch (e) {
        // ignore
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const save = async () => {
    try {
      await db.settings.put({
        key: 'appearance',
        value: JSON.stringify({
          theme,
          reducedMotion,
          fontScale,
          highContrast,
        }),
      });
      // Apply theme
      if (theme === 'light') setColorMode('light');
      else if (theme === 'dark') setColorMode('dark');
      // system -> do nothing (default behaviour)
      // Apply font scale and high contrast immediately
      try {
        document.documentElement.style.setProperty(
          '--app-font-scale',
          `${fontScale}%`,
        );
        if (highContrast) document.body.classList.add('sr-high-contrast');
        else document.body.classList.remove('sr-high-contrast');
      } catch (e) {
        // ignore
      }
      toast({ title: 'Appearance saved', status: 'success' });
    } catch (e) {
      toast({ title: 'Save failed', status: 'error' });
    }
  };

  return (
    <Box
      p={6}
      borderWidth={1}
      borderRadius="lg"
      bg="white"
      boxShadow="sm"
      maxW="600px"
      mx="auto"
      w="100%"
    >
      <Heading as="h2" size="md" mb={5} color="red.600">
        Appearance & Accessibility
      </Heading>
      <Stack spacing={4}>
        <Box>
          <Text fontSize="sm">Theme</Text>
          <RadioGroup onChange={setTheme} value={theme} mt={2}>
            <HStack spacing={4}>
              <Radio value="light">Light</Radio>
              <Radio value="dark">Dark</Radio>
              <Radio value="system">System</Radio>
            </HStack>
          </RadioGroup>
        </Box>
        <HStack justify="space-between">
          <Text>Reduce motion</Text>
          <Switch
            isChecked={reducedMotion}
            onChange={(e) => setReducedMotion(e.target.checked)}
          />
        </HStack>
        <HStack justify="space-between">
          <Text>Font size</Text>
          <HStack>
            <input
              type="range"
              min={80}
              max={140}
              value={fontScale}
              onChange={(e) => setFontScale(Number(e.target.value))}
            />
            <Text fontSize="sm">{fontScale}%</Text>
          </HStack>
        </HStack>
        <HStack justify="space-between">
          <Text>High contrast</Text>
          <Switch
            isChecked={highContrast}
            onChange={(e) => setHighContrast(e.target.checked)}
          />
        </HStack>
        <Button colorScheme="red" onClick={save}>
          Save Appearance
        </Button>
      </Stack>
    </Box>
  );
}
