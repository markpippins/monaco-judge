// file-system-server REST client (port 4042).
// Mirrors the contract edit-ui used so monaco-judge's file explorer can browse the
// same sandbox root (FS_ROOT_DIR) over `/api/fs`, `/api/fs/content`, and `/fs`.

export type FsEntryType = 'directory' | 'file' | 'symlink';

export interface FsEntry {
  name: string;
  path: string;
  type: FsEntryType;
  size?: number;
}

// The file-system-server exposes its sandbox root on port 4042 (the same consumer
// edit-ui targeted). It sets `Access-Control-Allow-Origin: *`, so cross-origin
// fetches from the monaco-judge origin (4016) are permitted.
const FS_API_BASE = 'http://localhost:4042';

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`;
    try {
      const body = await res.json();
      if (body && typeof body.detail === 'string') detail = body.detail;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(`file-system-server ${detail}`);
  }
  return (await res.json()) as T;
}

function encodePath(path: string): string {
  return encodeURIComponent(path);
}

export const fileSystem = {
  /** List a directory (flat, non-recursive). Empty string = sandbox root. */
  async list(path = ''): Promise<FsEntry[]> {
    const q = path ? `?path=${encodePath(path)}` : '';
    const data = await request<{ entries: FsEntry[] }>(`${FS_API_BASE}/api/fs${q}`);
    return data.entries || [];
  },

  /** Read file content as UTF-8. */
  async read(path: string): Promise<string> {
    const data = await request<{ content: string }>(
      `${FS_API_BASE}/api/fs/content?path=${encodePath(path)}`
    );
    return data.content ?? '';
  },

  /** Write file content (creates parent directories). */
  async write(path: string, content: string): Promise<void> {
    await request<{ saved: string }>(
      `${FS_API_BASE}/api/fs/content?path=${encodePath(path)}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      }
    );
  },

  /** Create a directory (recursive). */
  async mkdir(pathParts: string[]): Promise<void> {
    await request(`${FS_API_BASE}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'mkdir', path: pathParts }),
    });
  },

  /** Remove a directory (recursive). */
  async rmdir(pathParts: string[]): Promise<void> {
    await request(`${FS_API_BASE}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'rmdir', path: pathParts }),
    });
  },

  /** Rename a file or directory. pathParts = full path incl. current name. */
  async rename(pathParts: string[], newName: string): Promise<void> {
    await request(`${FS_API_BASE}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'rename', path: pathParts, newName }),
    });
  },

  /** Delete a file. parentParts = path segments of the containing directory. */
  async deletefile(parentParts: string[], filename: string): Promise<void> {
    await request(`${FS_API_BASE}/fs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operation: 'deletefile', path: parentParts, filename }),
    });
  },
};

const LANGUAGE_BY_EXT: Record<string, string> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
  py: 'python',
  cpp: 'cpp',
  cc: 'cpp',
  cxx: 'cpp',
  c: 'cpp',
  h: 'cpp',
  hpp: 'cpp',
  html: 'html',
  css: 'css',
  scss: 'css',
  json: 'json',
  md: 'markdown',
  yml: 'yaml',
  yaml: 'yaml',
  sh: 'shell',
  sql: 'sql',
  xml: 'xml',
};

export function deriveLanguage(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return LANGUAGE_BY_EXT[ext] || 'plaintext';
}

export function baseName(path: string): string {
  return path.split('/').pop() || path;
}

export function toParts(path: string): string[] {
  return path.split('/').filter(Boolean);
}

export function joinPath(parent: string, name: string): string {
  return parent ? `${parent}/${name}` : name;
}
