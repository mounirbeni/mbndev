import { upload } from '@vercel/blob/client';
import { projectAPI } from '@/lib/api';

/**
 * Upload one project file, choosing the path the server supports:
 *  - production (Vercel Blob): the browser uploads straight to Blob storage
 *    (multipart for big files, so zipped source code and videos fit), then
 *    registers the finished file with the API;
 *  - local dev: the classic multipart POST through the API (4MB cap).
 *
 * Throws an Error whose message is safe to show to the user.
 */

// Keep in sync with backend/src/lib/uploadPolicy.js.
export const UPLOAD_EXTS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.pdf', '.doc', '.docx', '.txt', '.csv', '.xls', '.xlsx', '.pptx',
  '.zip', '.rar', '.7z', '.tar', '.gz', '.tgz',
  '.mp4', '.mov',
];
export const UPLOAD_ACCEPT = UPLOAD_EXTS.join(',');

const extOf = (name: string) => (/\.[a-z0-9]+$/i.exec(name)?.[0] ?? '').toLowerCase();

let modeCache: Promise<{ direct: boolean; maxBytes: number }> | null = null;
function uploadMode() {
  modeCache ??= projectAPI
    .uploadMode()
    .then((r) => ({ direct: !!r.data.direct, maxBytes: Number(r.data.maxBytes) || 4 * 1024 * 1024 }))
    .catch(() => {
      modeCache = null;
      return { direct: false, maxBytes: 4 * 1024 * 1024 };
    });
  return modeCache;
}

const mb = (bytes: number) => `${Math.round(bytes / (1024 * 1024))}MB`;

function apiMessage(err: unknown): string | null {
  const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
  if (e?.response?.status === 413) return 'File too large for this upload path.';
  return e?.response?.data?.message || null;
}

export async function uploadProjectFile(
  projectId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<void> {
  const ext = extOf(file.name);
  if (!UPLOAD_EXTS.includes(ext)) {
    throw new Error(`“${ext || 'This'}” files can't be uploaded. Allowed: ${UPLOAD_EXTS.join(' ')}`);
  }
  if (file.size === 0) throw new Error('This file is empty.');

  const { direct, maxBytes } = await uploadMode();
  if (file.size > maxBytes) throw new Error(`File too large. Maximum size is ${mb(maxBytes)}.`);

  if (!direct) {
    const fd = new FormData();
    fd.append('file', file);
    try {
      await projectAPI.uploadFile(projectId, fd, onProgress);
    } catch (err) {
      throw new Error(apiMessage(err) || 'Upload failed. Please try again.');
    }
    return;
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('mbndev_token') : null;
  // Path is checked server-side: it must sit under this project's folder.
  const safeName = file.name.replace(/[^\w.\-]+/g, '_').slice(-120);
  let blobUrl: string;
  try {
    const blob = await upload(`project-files/${projectId}/${safeName}`, file, {
      access: 'private', // the Blob store is private; files are served via the API
      handleUploadUrl: `/api/projects/${projectId}/upload-token`,
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      multipart: file.size > 8 * 1024 * 1024,
      onUploadProgress: ({ percentage }) => onProgress?.(Math.min(99, Math.round(percentage))),
    });
    blobUrl = blob.url;
  } catch (err) {
    throw new Error((err as Error)?.message?.replace(/^Vercel Blob:\s*/, '') || 'Upload failed. Please try again.');
  }

  // Only now is the file real for the project: the API checks the bytes and
  // records it. Until this succeeds we never report the upload as done.
  try {
    await projectAPI.registerFile(projectId, { url: blobUrl, name: file.name });
  } catch (err) {
    throw new Error(apiMessage(err) || 'The file was uploaded but could not be saved to the project.');
  }
  onProgress?.(100);
}
