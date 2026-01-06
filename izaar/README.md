# Izaar

A modern e-commerce frontend built with Builder.io, React, and TypeScript.

## Tech Stack

- **Frontend**: React 18 + React Router 6 + TypeScript + Vite + TailwindCSS
- **Backend**: Express server integrated with Vite dev server
- **UI Components**: Radix UI + TailwindCSS
- **Package Manager**: PNPM

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PNPM (v10 or higher)

### Installation

```bash
pnpm install
```

### Development

Start the development server:

```bash
pnpm dev
```

The application will be available at http://localhost:8080

### Available Scripts

- `pnpm dev` - Start development server (Vite + Express on port 8080)
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm typecheck` - TypeScript validation

## Project Structure

```
client/          # React SPA frontend
├── pages/       # Route components
├── components/  # UI components
└── lib/         # Utilities

server/          # Express API backend
└── routes/      # API handlers

shared/          # Types used by both client & server
```

## License

Private project

