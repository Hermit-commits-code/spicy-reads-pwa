// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const colors = {
  brand: {
    50: "#fff7f3",
    100: "#ffe3e0",
    200: "#ffcfc2",
    300: "#ffb3a2",
    400: "#ff8c7a",
    500: "#ef4444", // Cozy red
    600: "#c72c2c",
    700: "#a11c1c",
    800: "#7a0c0c",
    900: "#540000",
  },
  purple: {
    500: "#a78bfa", // Cozy purple
  },
  yellow: {
    500: "#facc15", // Warm yellow
  },
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  green: {
    500: "#34d399", // Soft green
  },
};

const fonts = {
  heading: "'Quicksand', 'Segoe UI', sans-serif",
  body: "'Quicksand', 'Segoe UI', sans-serif",
};

const theme = extendTheme({
  colors,
  fonts,
  components: {
    Button: {
      baseStyle: {
        borderRadius: "md",
      },
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: { bg: "brand.600" },
        },
      },
    },
    Tag: {
      baseStyle: {
        borderRadius: "full",
        fontWeight: "semibold",
      },
    },
    Box: {
      baseStyle: {
        borderRadius: "lg",
      },
    },
  },
});

export default theme;
