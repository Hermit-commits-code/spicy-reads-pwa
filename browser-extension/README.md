# Spicy Reads Browser Extension

This browser extension helps you quickly add books from Amazon, Goodreads, and Barnes & Noble to your Spicy Reads collection.

## Installation

### Firefox

1. Open Firefox
2. Type `about:debugging` in the address bar
3. Click "This Firefox" on the left
4. Click "Load Temporary Add-on"
5. Navigate to this folder and select `manifest.json`

### Chrome/Edge

1. Open Chrome/Edge
2. Go to Extensions page (chrome://extensions/ or edge://extensions/)
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select this folder

## Usage

1. Go to a book page on Amazon, Goodreads, or Barnes & Noble
2. Click the Spicy Reads extension icon in your browser toolbar
3. If a book is detected, click "Add to Spicy Reads"
4. If no book is detected, click "Add Manually" to open Spicy Reads with the URL

## Features

- Automatically detects book information on supported sites
- Extracts title, author, and cover image
- Opens Spicy Reads with pre-filled book data
- Fallback to manual URL processing if auto-detection fails

## Supported Sites

- Amazon (any domain: .com, .co.uk, .ca, etc.)
- Goodreads.com
- Barnes & Noble (barnesandnoble.com)

## Development

The extension consists of:

- `manifest.json` - Extension configuration
- `popup.html` + `popup.js` - Extension popup interface
- `content.js` - Book data extraction from web pages
- `icon.svg` - Extension icon
