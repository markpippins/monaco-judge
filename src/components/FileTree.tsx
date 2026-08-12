import React, { useCallback, useEffect, useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileText,
  FileJson,
  File,
  Plus,
  FolderPlus,
  Trash2,
  Edit2,
  ChevronRight,
  ChevronDown,
  RefreshCw,
} from 'lucide-react';
import { fileSystem, FsEntry, toParts, joinPath } from '../services/fileSystem';

interface FileTreeProps {
  activePath: string | null;
  onOpenFile: (path: string) => void;
  onRename?: (oldPath: string, newPath: string) => void;
  onDelete?: (path: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({ activePath, onOpenFile, onRename, onDelete }) => {
  const [rootEntries, setRootEntries] = useState<FsEntry[]>([]);
  const [children, setChildren] = useState<Record<string, FsEntry[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loadingRoot, setLoadingRoot] = useState(false);
  const [loadingDirs, setLoadingDirs] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const [creating, setCreating] = useState<{ parentPath: string; isFolder: boolean } | null>(null);
  const [newName, setNewName] = useState('');
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const loadRoot = useCallback(async () => {
    setLoadingRoot(true);
    setError(null);
    try {
      setRootEntries(await fileSystem.list(''));
    } catch (e: any) {
      setError(e.message || 'Failed to load file system');
    } finally {
      setLoadingRoot(false);
    }
  }, []);

  const loadChildren = useCallback(async (path: string) => {
    setLoadingDirs((prev) => ({ ...prev, [path]: true }));
    try {
      const entries = await fileSystem.list(path);
      setChildren((prev) => ({ ...prev, [path]: entries }));
    } catch (e: any) {
      setError(e.message || 'Failed to load directory');
    } finally {
      setLoadingDirs((prev) => ({ ...prev, [path]: false }));
    }
  }, []);

  const reloadDir = useCallback(
    async (parentPath: string) => {
      if (parentPath === '') {
        await loadRoot();
      } else {
        await loadChildren(parentPath);
      }
    },
    [loadRoot, loadChildren]
  );

  useEffect(() => {
    loadRoot();
  }, [loadRoot]);

  const toggleDir = async (entry: FsEntry) => {
    if (entry.type !== 'directory') return;
    if (expanded[entry.path]) {
      setExpanded((prev) => ({ ...prev, [entry.path]: false }));
    } else {
      if (!children[entry.path]) await loadChildren(entry.path);
      setExpanded((prev) => ({ ...prev, [entry.path]: true }));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name || !creating) return;
    const parentPath = creating.parentPath;
    const fullPath = joinPath(parentPath, name);
    try {
      if (creating.isFolder) {
        await fileSystem.mkdir(toParts(fullPath));
      } else {
        await fileSystem.write(fullPath, '');
      }
      setError(null);
      await reloadDir(parentPath);
      if (parentPath) setExpanded((prev) => ({ ...prev, [parentPath]: true }));
    } catch (err: any) {
      setError(err.message || 'Create failed');
    }
    setCreating(null);
    setNewName('');
  };

  const handleRenameSubmit = async (path: string, e: React.FormEvent) => {
    e.preventDefault();
    const newName = renameValue.trim();
    if (!newName) {
      setRenamingPath(null);
      return;
    }
    const parts = toParts(path);
    const parentPath = parts.slice(0, -1).join('/');
    const newPath = joinPath(parentPath, newName);
    try {
      await fileSystem.rename(parts, newName);
      onRename?.(path, newPath);
      setError(null);
      await reloadDir(parentPath);
    } catch (err: any) {
      setError(err.message || 'Rename failed');
    }
    setRenamingPath(null);
  };

  const handleDelete = async (entry: FsEntry) => {
    const parts = toParts(entry.path);
    const parentPath = parts.slice(0, -1).join('/');
    const name = parts[parts.length - 1];
    if (!name) return;
    try {
      if (entry.type === 'directory') {
        await fileSystem.rmdir(parts);
      } else {
        await fileSystem.deletefile(parts.slice(0, -1), name);
      }
      onDelete?.(entry.path);
      setError(null);
      await reloadDir(parentPath);
      setChildren((prev) => {
        const next = { ...prev };
        delete next[entry.path];
        return next;
      });
      setExpanded((prev) => {
        const next = { ...prev };
        delete next[entry.path];
        return next;
      });
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const getFileIcon = (fileName: string, type: FsEntry['type']) => {
    if (type === 'directory') return null;
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'js':
      case 'jsx':
        return <FileCode className="w-4 h-4 text-yellow-400 shrink-0" />;
      case 'py':
        return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'cpp':
      case 'c':
      case 'h':
        return <FileCode className="w-4 h-4 text-purple-400 shrink-0" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-amber-300 shrink-0" />;
      case 'html':
      case 'css':
        return <FileCode className="w-4 h-4 text-orange-400 shrink-0" />;
      case 'md':
        return <FileText className="w-4 h-4 text-sky-300 shrink-0" />;
      default:
        return <File className="w-4 h-4 text-slate-400 shrink-0" />;
    }
  };

  const renderEntryRow = (entry: FsEntry, level: number) => {
    const isFolder = entry.type === 'directory';
    const isExpanded = expanded[entry.path] || false;
    const isActive = entry.path === activePath;
    const isLoading = loadingDirs[entry.path] || false;
    const childEntries = children[entry.path] || [];

    return (
      <div key={entry.path} className="select-none">
        <div
          onClick={() => {
            if (isFolder) toggleDir(entry);
            else onOpenFile(entry.path);
          }}
          style={{ paddingLeft: `${level * 12 + 12}px` }}
          className={`group flex items-center justify-between py-1 pr-2 text-sm cursor-pointer rounded-sm hover:bg-[#2a2d2e] transition-colors ${
            isActive ? 'bg-[#37373d] text-white font-medium' : 'text-[#cccccc]'
          }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
            {isFolder ? (
              <>
                <span className="text-slate-400 hover:text-white">
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </span>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 text-amber-400 shrink-0 animate-spin" />
                ) : isExpanded ? (
                  <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Folder className="w-4 h-4 text-amber-400 shrink-0" />
                )}
              </>
            ) : (
              <>
                <span className="w-3.5" />
                {getFileIcon(entry.name, entry.type)}
              </>
            )}

            {renamingPath === entry.path ? (
              <form
                onSubmit={(e) => handleRenameSubmit(entry.path, e)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1"
              >
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  autoFocus
                  onBlur={() => setRenamingPath(null)}
                  className="w-full bg-[#1e1e1e] border border-[#007acc] text-white text-sm px-1 rounded outline-none"
                />
              </form>
            ) : (
              <span className="truncate">{entry.name}</span>
            )}
          </div>

          {/* Quick action buttons on hover */}
          <div className="hidden group-hover:flex items-center gap-1 opacity-80 hover:opacity-100">
            {isFolder && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreating({ parentPath: entry.path, isFolder: false });
                    setNewName('');
                  }}
                  title="New File in Folder"
                  className="p-0.5 hover:bg-[#383838] rounded text-[#aaaaaa] hover:text-white"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreating({ parentPath: entry.path, isFolder: true });
                    setNewName('');
                  }}
                  title="New Folder in Folder"
                  className="p-0.5 hover:bg-[#383838] rounded text-[#aaaaaa] hover:text-white"
                >
                  <FolderPlus className="w-3 h-3" />
                </button>
              </>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setRenamingPath(entry.path);
                setRenameValue(entry.name);
              }}
              title="Rename"
              className="p-0.5 hover:bg-[#383838] rounded text-[#aaaaaa] hover:text-white"
            >
              <Edit2 className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(entry);
              }}
              title="Delete"
              className="p-0.5 hover:bg-[#383838] rounded text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {isFolder && isExpanded && creating && creating.parentPath === entry.path && (
          <div style={{ paddingLeft: `${(level + 1) * 12 + 20}px` }} className="py-1 pr-2">
            <form onSubmit={handleCreateSubmit} className="flex items-center gap-1">
              {creating.isFolder ? (
                <Folder className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              )}
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={creating.isFolder ? 'folder_name' : 'filename.ts'}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setCreating(null);
                }}
                className="w-full bg-[#1e1e1e] border border-[#007acc] text-white text-sm px-1 py-0.5 rounded outline-none"
              />
            </form>
          </div>
        )}

        {isFolder && isExpanded && childEntries.length > 0 && (
          <div>
            {childEntries.map((child) => renderEntryRow(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] text-[#cccccc] text-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#333333] tracking-wide font-semibold text-[11px] uppercase text-[#bbbbbb]">
        <span>EXPLORER</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setChildren({});
              setExpanded({});
              loadRoot();
            }}
            title="Refresh"
            className="p-1 hover:bg-[#333333] rounded text-[#cccccc] hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingRoot ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setCreating({ parentPath: '', isFolder: false });
              setNewName('');
            }}
            title="New File at Root"
            className="p-1 hover:bg-[#333333] rounded text-[#cccccc] hover:text-white"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              setCreating({ parentPath: '', isFolder: true });
              setNewName('');
            }}
            title="New Folder at Root"
            className="p-1 hover:bg-[#333333] rounded text-[#cccccc] hover:text-white"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Root creation input */}
      {creating && creating.parentPath === '' && (
        <div className="px-3 py-1.5 border-b border-[#333333]">
          <form onSubmit={handleCreateSubmit} className="flex items-center gap-1.5">
            {creating.isFolder ? (
              <Folder className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <File className="w-3.5 h-3.5 text-slate-400" />
            )}
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={creating.isFolder ? 'Folder Name' : 'File Name (e.g. app.js)'}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') setCreating(null);
              }}
              className="w-full bg-[#1e1e1e] border border-[#007acc] text-white text-sm px-1.5 py-0.5 rounded outline-none"
            />
          </form>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="px-3 py-1.5 bg-red-900/30 border-b border-red-900/40 text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* File List */}
      <div className="flex-1 overflow-y-auto py-1 custom-scrollbar">
        {loadingRoot ? (
          <div className="p-4 text-center text-[#858585] italic">Loading file system…</div>
        ) : rootEntries.length === 0 ? (
          <div className="p-4 text-center text-[#858585] italic">
            No files in the workspace. Click + to create a file.
          </div>
        ) : (
          rootEntries.map((entry) => renderEntryRow(entry, 0))
        )}
      </div>
    </div>
  );
};
