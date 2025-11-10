# iKanban - Progressive Web App Kanban Board

A lightweight, feature-rich Kanban board Progressive Web App (PWA) designed to run seamlessly on Chromebooks and modern browsers. Built with vanilla JavaScript, HTML, and CSS - no frameworks required.

![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)
![PWA](https://img.shields.io/badge/PWA-enabled-green.svg)
![No Dependencies](https://img.shields.io/badge/dependencies-none-brightgreen.svg)

## ✨ Features

### 📋 Board Management
- **Multiple Boards** - Create and manage unlimited boards for different projects
- **Customizable Backgrounds** - Set board backgrounds using:
  - Solid colors via color picker
  - Image URLs from the web
  - Local image files (automatically compressed)
- **Local Storage** - All data persists locally in your browser (no server needed)

### 📊 Columns & Organization
- **Flexible Columns** - Add unlimited columns to each board
- **Drag & Drop Reordering** - Easily reorder columns by dragging the column header
- **Column Menu** - Three-dot menu (⋮) for each column with delete option
- **Smart Delete** - Warning displays number of cards that will be deleted

### 🎴 Cards & Tasks
- **Rich Cards** with multiple features:
  - **Title** - Clear card identification
  - **Rich Text Description** - Format text with bold, italic, lists, and more
  - **Due Dates** - Visual indicators with color coding:
    - 🔵 Blue - Normal due date
    - 🟠 Orange - Due within 2 days
    - 🔴 Red - Overdue
  - **Checklists** - Add multiple checklist items with completion tracking
- **Drag & Drop** - Move cards between columns and reorder within columns with visual feedback
- **Visual Badges** - Cards display due date and checklist progress at a glance
- **Quick Actions** - Right-click any card to delete it

### 🎨 User Experience
- **Dark Mode** - Toggle between light and dark themes with settings
- **Settings Panel** - Centralized ⚙ settings button for:
  - Dark mode toggle
  - Background customization
  - Board deletion
- **Keyboard Shortcuts**:
  - `Esc` - Close any open modal or menu
  - `Ctrl+Enter` - Save current form
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Intuitive UI** - Clean, modern interface with smooth animations

## 🚀 Getting Started

### Quick Start (Easiest)

1. Download or clone the repository
2. Open `index.html` in your web browser
3. Start creating boards!

That's it! The app works fully and all features are available.

## 🎯 How to Use

### Creating Your First Board

1. Click **"+ New Board"** in the header
2. Enter a board name and click **"Create"**
3. Your board is now active and selected

### Adding Columns

1. Click **"+ Add Column"**
2. Enter a column name (e.g., "To Do", "In Progress", "Done")
3. Add as many columns as you need

### Creating Cards

1. Click **"+ Add Card"** at the bottom of any column
2. Fill in the card details:
   - **Title** (required)
   - **Description** - Rich text supported
   - **Due Date** - Optional deadline
   - **Checklist** - Click "+ Add item" to add tasks
3. Click **"Save"**

### Managing Cards

- **Edit** - Click on any card to edit its details
- **Move** - Drag cards between columns
- **Reorder** - Drag cards up/down within a column (blue line shows insert position)
- **Delete** - Right-click a card and confirm deletion

### Customizing Your Board

1. Click **"⚙ Settings"** in the board header
2. Toggle **Dark Mode** for easier viewing
3. Click **"🎨 Change Background"** to customize:
   - Pick a solid color
   - Enter an image URL
   - Upload a local image file

### Organizing Columns

- **Reorder** - Drag columns left/right by their header
- **Delete** - Click the three-dot menu (⋮) on any column header

## 🛠️ Tech Stack

- **HTML5** - Semantic markup and modern web standards
- **CSS3** - Flexbox, Grid, CSS Variables, smooth animations
- **Vanilla JavaScript (ES6+)** - No frameworks or build tools
- **LocalStorage API** - Client-side data persistence
- **Drag and Drop API** - Native browser drag and drop
- **FileReader API** - Local image file handling
- **Canvas API** - Image compression for local files
- **Service Worker** - Offline functionality and caching
- **Progressive Web App** - Installable app with manifest

## 📂 Project Structure

```
ikanban/
├── index.html          # Main HTML structure and modals
├── styles.css          # All styles including dark mode
├── app.js              # Application logic and state management
├── manifest.json       # PWA manifest configuration
├── service-worker.js   # Service worker for offline support
└── README.md           # This file
```

## 🎨 Features in Detail

### Drag & Drop System

**Cards:**
- Drag cards to other columns to move them
- Drag cards up/down to reorder within a column
- Blue line indicator shows where card will be inserted
- Works across all columns

**Columns:**
- Drag columns by their header area
- Reorder entire columns with their cards
- Visual feedback during drag (opacity change, blue border on drop target)

### Rich Text Editing

- Browser-native `contenteditable` implementation
- Supports formatting via browser's built-in tools
- Paste formatted text from other applications
- No external editor library required

### Smart Due Dates

The app automatically calculates and color-codes due dates:
- **Today or future** - Blue badge with calendar icon
- **1-2 days away** - Orange badge (warning)
- **Past due** - Red badge (urgent)

### Checklist Progress

- Add unlimited checklist items to any card
- Check/uncheck items as you complete them
- Visual progress badge: ✓ 3/5 (completed/total)
- Edit or delete checklist items anytime

### Settings & Customization

**Dark Mode:**
- Full dark theme for all UI components
- Smooth transitions between themes
- Preference persists across sessions
- Easy on the eyes for extended use

**Background Options:**
- **Color** - Choose any color with the color picker
- **Image URL** - Use images from Unsplash, Pexels, or any URL
- **Local File** - Upload your own images:
  - Automatically compressed to fit localStorage
  - Resized to max 1920x1080
  - Converted to JPEG at 70% quality

## 🔒 Privacy & Data

- **100% Local** - All data stored in browser localStorage
- **No Server** - No backend, no database, no API calls
- **No Tracking** - No analytics, no cookies, no external scripts
- **Your Data** - Stays on your device, never leaves your browser
- **No Account Required** - Start using immediately

## 💾 Data Storage

- All boards, columns, and cards stored in `localStorage`
- Dark mode preference stored separately
- Typical storage: 5-10MB limit (browser dependent)
- Large images automatically compressed to fit
- Data persists until you clear browser data

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Esc` | Close open modal or menu |
| `Ctrl+Enter` | Save/submit current form |
| Right-click card | Quick delete card |

## 📱 Browser Compatibility

**Fully Supported:**
- ✅ Chrome/Chromium 80+
- ✅ Edge 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Opera 67+

## 🐛 Known Limitations

- Data is stored per browser/device (no cloud sync between devices)
- LocalStorage has size limits (~5-10MB depending on browser)
- Very large background images are compressed to fit storage
- No collaborative/multi-user features
- No undo/redo functionality

## 🔮 Future Enhancement Ideas

- [ ] Export/import boards as JSON files
- [ ] Card labels/tags with color coding
- [ ] Filter and search functionality
- [ ] Card archiving (hide completed)
- [ ] Card templates for common tasks
- [ ] Markdown support in descriptions
- [ ] Board templates (Scrum, GTD, etc.)
- [ ] Card attachments
- [ ] Keyboard-only navigation
- [ ] Print/PDF export
- [ ] Card comments/notes
- [ ] Time tracking per card
- [ ] Board sharing (view-only links)

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the Apache License 2.0 - see below for details.

```
Copyright 2025

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

## 🙏 Acknowledgments

- Built for anyone who has data privacy concerns or lacks access to commercial Kanban systems
- Perfect when IT won't approve a Trello license but you NEED a Kanban board
- Works great on Chromebooks, desktops, tablets, and any modern browser
- Inspired by Trello, but without the complexity, cost, or cloud dependency
- No frameworks = fast, lightweight, and educational

## 📧 Support

Found a bug? Have a suggestion?

- Open an issue on GitHub
- Keep it simple - this is intentionally a lightweight project!

---

**Made with ❤️ for productivity enthusiasts**

*iKanban - Simple. Fast. Yours.*
