# DevFocus

A productivity-focused task manager built for developers. Manage your projects with a powerful Kanban board or priorities list view, track, subtasks, and deadlines — all with a sleek dark-mode interface.

## Features

- **Dual Views** — Switch between Kanban board and list view
- **Keyboard Shortcuts** — Press `n` to quickly create a new task
- **Drag & Drop** — Easily reorder tasks within and between columns
- **Subtasks** — Break down tasks into smaller actionable items
- **Tags & Priorities** — Organize work with custom tags and priority levels
- **Due Dates** — Set deadlines and track upcoming work
- **Markdown Support** — Write rich task descriptions with markdown
- **Dark Mode** — Eye-friendly dark theme (enabled by default)
- **PWA Ready** — Install as a native app on desktop or mobile
- **Local-First** — Works offline with IndexedDB, syncs via Firebase when online

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Firebase** for authentication and cloud sync
- **dnd-kit** for drag and drop
- **IndexedDB (idb)** for local persistence
- **Framer Motion** for animations
- **Vitest** for testing

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project (free tier works)

### 1. Clone and install

```bash
npm install
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Authentication**: Add Google sign-in provider
4. Create a **Web App** and copy the config values
5. Copy `.env.example` to `.env` and fill in your Firebase credentials:

```bash
cp .env.example .env.local
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

## Project Structure

```
dev-focus/
├── components/       # React components
├── context/         # React context (state management)
├── hooks/           # Custom React hooks
├── services/        # Firebase and other services
├── utils/           # Helper functions
├── plans/           # Planning docs
├── App.tsx          # Main app component
├── types.ts         # TypeScript type definitions
└── vite.config.ts   # Vite configuration
```

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
