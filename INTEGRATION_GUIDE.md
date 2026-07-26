# Cloud Studio Integration Guide

This document provides technical integration guidelines, architectural overview, API specifications, and deployment steps for the Cloud Studio collaborative development platform.

---

## 1. System Architecture

Cloud Studio is built with a decoupled React single-page frontend powered by Vite and a high-performance Express Node.js backend with native WebSocket communications for real-time collaboration.

```
┌─────────────────────────────────────────────────────────┐
│                      Client Browser                     │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────────┐  │
│  │ Monaco/Code │   │ Real-time   │   │ Interactive   │  │
│  │   Editor    │   │ Collab Sync │   │ Preview Frame │  │
│  └──────┬──────┘   └──────┬──────┘   └───────▲───────┘  │
└─────────┼─────────────────┼──────────────────┼──────────┘
          │ REST API        │ WebSocket        │ PostMessage/HTTP
          ▼                 ▼                  │
┌──────────────────────────────────────────────┴──────────┐
│                   Express Express Server                │
│  ┌─────────────┐   ┌─────────────┐   ┌───────────────┐  │
│  │ File System │   │ Collaboration│  │ Terminal &    │  │
│  │ Service     │   │ Engine (WS) │   │ Code Runner   │  │
│  └─────────────┘   └─────────────┘   └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Environment Prerequisites

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **Port Allocation**: Default service port `3000` (Bound to `0.0.0.0`)

---

## 3. Installation & Setup

### Clone and Install Dependencies

```bash
# Install required npm packages
npm install
```

### Development Server Launch

```bash
# Start backend server with tsx and Vite dev middleware
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 4. Real-time Collaboration Protocol

The backend provisions a WebSocket connection (`ws://<host>:<port>`) for real-time multi-user cursor tracking, document sync, and presence status.

### Event Schema

#### User Join (`USER_JOINED`)
```json
{
  "type": "USER_JOINED",
  "payload": {
    "userId": "usr_94a2b1",
    "name": "Sarah Chen",
    "color": "#10b981",
    "activeFile": "/src/App.tsx"
  }
}
```

#### Code Edit Broadcast (`CODE_CHANGE`)
```json
{
  "type": "CODE_CHANGE",
  "payload": {
    "filePath": "/src/App.tsx",
    "content": "export default function App() { ... }",
    "updatedBy": "usr_94a2b1",
    "timestamp": 1785002000000
  }
}
```

#### Cursor Position (`CURSOR_MOVE`)
```json
{
  "type": "CURSOR_MOVE",
  "payload": {
    "userId": "usr_94a2b1",
    "filePath": "/src/App.tsx",
    "position": { "line": 24, "column": 12 }
  }
}
```

---

## 5. REST API Specifications

### File Management

#### List Files (`GET /api/files`)
Returns the complete hierarchical file tree.

**Response:**
```json
[
  {
    "id": "1",
    "name": "src",
    "type": "folder",
    "children": [
      {
        "id": "2",
        "name": "App.tsx",
        "type": "file",
        "path": "/src/App.tsx",
        "language": "typescript"
      }
    ]
  }
]
```

#### Read File Content (`GET /api/files/content?path={filePath}`)
Retrieves raw file contents for the specified path.

#### Update File (`POST /api/files/save`)
Saves code edits to persistent backend storage.

**Payload:**
```json
{
  "path": "/src/App.tsx",
  "content": "// Updated source code..."
}
```

---

## 6. Production Build & Deployment

### Build Command

```bash
npm run build
```

This executes:
1. `vite build` — Compiles optimized web assets into `dist/`
2. `esbuild server.ts` — Bundles the Node server into `dist/server.cjs`

### Running in Production Mode

```bash
NODE_ENV=production npm start
```

---

## 7. Customization & Extension Points

- **Theme Engine**: Accessible in `src/index.css` with customizable CSS variables.
- **Language Parsers**: Syntax highlighting configuration mapped in `src/components/Editor.tsx`.
- **Custom Tooling Extensions**: Additional tabs and tools can be hooked into `src/components/ActivityBar.tsx` by extending `SidebarTab` in `src/types.ts`.
