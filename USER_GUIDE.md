# Cloud Studio User Guide

Welcome to **Cloud Studio** — a real-time collaborative development environment designed for modern web applications.

---

## 1. Quick Start & Interface Overview

Cloud Studio brings full IDE capabilities directly to your browser with an intuitive, distraction-free layout.

```
┌────┬─────────────────┬─────────────────────────┬─────────────────────────┐
│ Act│ Sidebar Panel   │ Code Editor             │ Live Application        │
│ Bar│ (Explorer /     │ (Multi-tab syntax       │ Preview                 │
│    │ Search / Git)   │  highlighted workspace) │                         │
│    │                 ├─────────────────────────┴─────────────────────────┤
│    │                 │ Integrated Terminal / Output Logs                │
└────┴─────────────────┴───────────────────────────────────────────────────┘
```

### Main Interface Regions

1. **Activity Bar (Far Left)**: Toggle active navigation panels (Files, Search, Git Source Control, Execution, Active Collaborators, Terminal, and Settings).
2. **Sidebar Panel**: Contextual tool pane displaying file trees, global search parameters, active branches, or collaborator rosters.
3. **Editor Canvas**: Multi-tab code editor with line numbering, active cursor visualization, syntax highlighting, and auto-indentation.
4. **Live App Preview**: Real-time rendering iframe displaying your application running live.
5. **Integrated Terminal**: Execution panel for shell commands, package installations, and live build diagnostics.

---

## 2. Core Features & Key Workflows

### 📁 1. File Explorer & Editing
- **Opening Files**: Click any file in the File Explorer sidebar to open it in a tab.
- **Creating & Deleting Files**: Use the `+ New File` or `+ New Folder` buttons in the Explorer toolbar.
- **Saving Progress**: Changes auto-save periodically, or press `Ctrl+S` / `Cmd+S` to save instantly.

### 👥 2. Real-Time Collaboration
- **Live User Presence**: See active collaborators in real-time in the **Collaborators** tab on the Activity Bar.
- **Collaborator Cursors**: Every team member is assigned a unique color avatar. You can view their active editing positions and highlighted line selections live on screen.
- **Connection Status**: Check the connection indicator in the Activity Bar footer (`Online / Syncing`).

### 🚀 3. Live Execution & App Preview
- **Interactive Preview**: Click the **Play / Preview** tab on the Activity Bar or top bar to open the live preview pane.
- **Refresh & Navigation**: Use the preview address bar to test route transitions or perform hard reloads.
- **Responsive Modes**: Test your application in Desktop, Tablet, and Mobile viewport modes.

### 🌿 4. Git Source Control
- **Branch Management**: View active working branch and switch branches seamlessly.
- **Staging & Commits**: Review modified files, stage changes with commit messages, and push or pull remote updates.

### 🔍 5. Global Search
- **Search Across Files**: Find code fragments, class definitions, or variable names instantly across all workspace files.
- **Match Filtering**: Case-sensitive and exact phrase match toggles available.

### 🖥️ 6. Integrated Terminal
- **Interactive Shell**: Run standard build commands, install packages (`npm install <package>`), or trigger custom scripts.
- **Clear & Toggle**: Minimize or clear terminal logs using the action buttons in the terminal header.

---

## 3. Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Cmd + S` / `Ctrl + S` | Save current file |
| `Cmd + P` / `Ctrl + P` | Quick open file |
| `Cmd + F` / `Ctrl + F` | Search inside active editor |
| `Cmd + \` / `Ctrl + \` | Toggle sidebar panel |
| `Cmd + J` / `Ctrl + J` | Toggle integrated terminal |

---

## 4. Customization & Settings

- **Theme Selection**: Switch between Dark High-Contrast and Crisp Light mode in the **Settings** panel.
- **Editor Preferences**: Adjust font size, line height, tab spacing, and auto-formatting options.
