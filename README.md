# kankan

A simple offline kanban board app for personal note-taking and task management.

## Features

- **Create/Open Boards**: File > New Board or File > Open Board to work with JSON-based boards
- **Manage Columns**: Add, rename, delete, and reorder columns
- **Manage Cards**: Add, edit, delete cards with titles and body text
- **Card Colors**: Assign background colors to cards from preset swatches or a color picker
- **Drag & Drop**: Drag cards between columns or reorder them within a column
- **Autosave**: Changes are automatically saved to the board JSON file every ~800ms
- **Dark Theme**: Comfortable dark mode for evening work
- **Recent Boards**: Quickly access recently opened boards from the File menu

## Getting Started

### Prerequisites

- Node.js 24.11.0 or later
- npm 11.6.1 or later

### Development

```bash
npm install
npm start
```

This launches the Electron dev server with hot-module reloading on the renderer.

### Building

```bash
npm run package    # Create a packaged app
npm run make       # Create installers (Linux: .deb, .zip)
```

### Linting

```bash
npm run lint       # Run TypeScript + ESLint checks
```

## How to Use

1. **Create a new board**: File > New Board, choose a location (e.g., your project folder), and a default board with "Todo", "In Progress", "Done" columns is created.
2. **Edit the board**: Click the board name to rename it.
3. **Add columns**: Scroll right, fill in the column name, and click "Add Column".
4. **Rename columns**: Click the dropdown menu on a column header and select "Rename".
5. **Add cards**: Type a title in the input at the bottom of a column and click "Add".
6. **Edit cards**: Click a card to open the editor modal where you can edit the title, body text, and background color.
7. **Move cards**: Drag a card to another column (requires ~8px movement before drag activates to avoid interfering with scrolling on touch devices).
8. **Delete cards**: Click the delete icon on a card or in the card editor modal.

## Architecture

- **Electron + Vite + TypeScript**: Modern, fast build pipeline with HMR
- **React**: Component-based UI
- **Ant Design**: Dark-mode UI component library
- **dnd-kit**: Accessible drag-and-drop
- **Tiptap**: (Prepared for rich-text editor integration; currently using plain text)

### Directory Structure

```
src/
├── main/
│   ├── main.ts              # Electron app entry point
│   ├── menu.ts              # File/Edit/View menu definitions
│   ├── ipcHandlers.ts       # IPC message handlers for board CRUD
│   ├── boardFile.ts         # Board JSON file I/O
│   ├── recentFiles.ts       # Recent boards list management
│   └── atomicWrite.ts       # Atomic file writing (crash-safe)
├── preload/
│   └── preload.ts           # Bridge between main and renderer via contextBridge
├── renderer/
│   ├── App.tsx              # Root React component
│   ├── main.tsx             # React entry point
│   ├── components/
│   │   ├── EmptyState.tsx
│   │   ├── BoardView.tsx
│   │   ├── BoardHeader.tsx
│   │   ├── ColumnComponent.tsx
│   │   ├── CardComponent.tsx
│   │   └── CardEditorModal.tsx
│   ├── context/
│   │   └── BoardContext.tsx # Shared board state
│   ├── hooks/
│   │   ├── useBoardMutations.ts
│   │   └── useDebouncedAutosave.ts
│   └── styles/
│       └── global.css
└── shared/
    ├── types.ts             # TypeScript interfaces for Board/Column/Card
    └── ipc-contract.ts      # IPC channel names and message types
```

## Data Format

Boards are stored as plain JSON files, making them git-friendly and easy to back up:

```json
{
  "id": "uuid",
  "name": "My Board",
  "createdAt": "2026-07-02T...",
  "updatedAt": "2026-07-02T...",
  "columnOrder": ["col-id-1", "col-id-2"],
  "columns": {
    "col-id-1": {
      "id": "col-id-1",
      "title": "Todo",
      "cardOrder": ["card-id-1"],
      "createdAt": "2026-07-02T..."
    }
  },
  "cards": {
    "card-id-1": {
      "id": "card-id-1",
      "columnId": "col-id-1",
      "title": "Example task",
      "body": {
        "type": "doc",
        "content": []
      },
      "color": "#fff7e6",
      "createdAt": "2026-07-02T...",
      "updatedAt": "2026-07-02T..."
    }
  },
  "schemaVersion": 1
}
```

## Keyboard Shortcuts

- **Ctrl+N** (Windows/Linux) / **Cmd+N** (macOS): New Board
- **Ctrl+O** / **Cmd+O**: Open Board
- **Ctrl+Q** / **Cmd+Q**: Quit

## Future Enhancements

- **Rich-text editing**: Tiptap integration for bold, italic, strikethrough, text color, bullet lists (infrastructure in place)
- **Undo/Redo**: Command history
- **Search**: Find cards by title or content
- **Filters**: Filter cards by color or status
- **Export**: Export boards to CSV, Markdown, or PDF
- **Sync**: Optional cloud sync (keeping local-first design)

## License

MIT
