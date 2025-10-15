# VelvetVolumes 📚🔥

[![PWA Ready](https://img.shields.io/badge/PWA-ready-green?logo=pwa)](https://web.dev/progressive-web-apps/)
[![Build](https://img.shields.io/github/actions/workflow/status/Hermit-commits-code/spicy-reads-pwa/main.yml?branch=main&label=build)](https://github.com/Hermit-commits-code/spicy-reads-pwa/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.x-blue?logo=react)](https://react.dev/)
[![Chakra UI](https://img.shields.io/badge/Chakra--UI-2.x-blueviolet?logo=chakraui)](https://chakra-ui.com/)

> **VelvetVolumes** is a modern, mobile-first book tracking PWA for passionate readers. Track your books, spice ratings, moods, and more—anywhere, anytime, with full offline support and cloud backup.

---

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Cloud Backup & Restore](#cloud-backup--restore)
- [Tech Stack](#tech-stack)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- ✅ **Mobile-First PWA**: Installable, offline-first, and lightning-fast
- ✅ **Spice Meter**: Rate and filter books by spice/steaminess level
- ✅ **Content Warnings**: Add and filter by content warnings for transparency
- ✅ **Visual Genre Shelves**: Auto-organize books into beautiful genre shelves
- ✅ **Mood & Vibe Discovery**: Find books by mood, vibe, and spice
- ✅ **Reading Stats**: Visualize your reading patterns and preferences
- ✅ **Lists & Custom Shelves**: Organize books into custom lists
- ✅ **Cloud Backup & Restore**: Sync your library across devices
- ✅ **Barcode & Camera Book Logging**: Add books via barcode scan (camera-powered). _Voice input not included._
- ✅ **Multi-language**: English, Español (more coming)
- ⬜ **Haptic Feedback**: For important actions (not yet implemented)
- ⬜ **Background Sync**: _Not implemented._ Reading progress and all book data are included in both local and cloud backups, but automatic background sync (service worker–driven) is not present. All sync is user-initiated.
- ⬜ **App Store Launch/Marketing**: (not yet launched)

---

## Demo

> _Demo link coming soon!_

---

## Installation

1. **Clone the repo:**
   ```bash
   git clone https://github.com/Hermit-commits-code/spicy-reads-pwa.git
   cd spicy-reads-pwa
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Build for production:**
   ```bash
   npm run build
   ```

---

## Usage

- Open the app in your browser or install it as a PWA on your device.
- Add, edit, and organize books with spice ratings, moods, and lists.
- Use the **Backup & Restore** section in Settings to export/import your data locally or via the cloud.
- Sign in to enable cloud sync and backup features.

---

## Cloud Backup & Restore

- **Export Cloud Backup:** Download all your book data (except actual cover images; only their URLs/paths are saved) from the cloud as a JSON file.
- **Import Cloud Backup:** Upload a previously exported JSON file to restore your library to the cloud. Book covers will display if the image URLs/paths are still valid.
- **Local Backup:** Export/import your data to/from your device for offline use.
- **Reading Progress:** Your current reading progress is always included in both local and cloud backups.

---

## Tech Stack

- [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Chakra UI](https://chakra-ui.com/) for design
- [Dexie.js](https://dexie.org/) for IndexedDB (offline/local DB)
- [Firebase](https://firebase.google.com/) for cloud sync & auth
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR
- [i18next](https://www.i18next.com/) for localization

---

## Roadmap

See [ROADMAP.md](./ROADMAP.md) for a detailed feature plan and progress.

---

## Contributing

Contributions are welcome! Please open issues or pull requests for features, bug fixes, or suggestions.

---

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
