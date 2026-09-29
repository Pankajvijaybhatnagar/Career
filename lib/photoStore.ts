"use client";
/**
 * Photo storage in the browser's IndexedDB (hundreds of MB available, versus ~5 MB for localStorage).
 * Student records keep only a short reference ("idb:<id>"); the image itself lives here as a Blob.
 * When a backend exists, replace these functions with uploads to private cloud storage.
 */
import { useEffect, useState } from "react";

const DB_NAME = "vj_photos";
const STORE = "photos";
export const PHOTO_REF_PREFIX = "idb:";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => { dbPromise = null; reject(new Error("Could not open photo storage in this browser")); };
  });
  return dbPromise;
}

function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> {
  return openDB().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = run(t.objectStore(STORE));
        t.oncomplete = () => resolve(req ? (req.result as T) : undefined);
        t.onerror = () => reject(t.error ?? new Error("Photo storage error"));
        t.onabort = () => reject(t.error ?? new Error("Photo storage is full"));
      }),
  );
}

const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** Saves a photo and returns its reference, e.g. "idb:k3j2...". */
export async function putPhoto(blob: Blob): Promise<string> {
  const id = newId();
  await tx("readwrite", (s) => s.put(blob, id));
  return PHOTO_REF_PREFIX + id;
}

export async function getPhotoBlob(ref: string): Promise<Blob | null> {
  if (!ref.startsWith(PHOTO_REF_PREFIX)) return null;
  return ((await tx<Blob>("readonly", (s) => s.get(ref.slice(PHOTO_REF_PREFIX.length)))) as Blob | undefined) ?? null;
}

export async function deletePhotos(refs: (string | undefined)[]) {
  const ids = refs.filter((r): r is string => !!r && r.startsWith(PHOTO_REF_PREFIX)).map((r) => r.slice(PHOTO_REF_PREFIX.length));
  if (!ids.length) return;
  await tx("readwrite", (s) => { ids.forEach((id) => s.delete(id)); });
  ids.forEach((id) => { const u = urlCache.get(PHOTO_REF_PREFIX + id); if (u) URL.revokeObjectURL(u); urlCache.delete(PHOTO_REF_PREFIX + id); });
}

export async function clearAllPhotos() {
  await tx("readwrite", (s) => s.clear());
  urlCache.forEach((u) => URL.revokeObjectURL(u));
  urlCache.clear();
}

export async function allPhotoIds(): Promise<string[]> {
  const keys = (await tx<IDBValidKey[]>("readonly", (s) => s.getAllKeys())) ?? [];
  return keys.map((k) => PHOTO_REF_PREFIX + String(k));
}

// ---------- displaying photos ----------
const urlCache = new Map<string, string>();

/** Resolves a photo reference (or a legacy data: URL) to something an <img> can show. */
export function usePhotoUrl(ref?: string) {
  const [url, setUrl] = useState<string | undefined>(() => (ref && !ref.startsWith(PHOTO_REF_PREFIX) ? ref : ref ? urlCache.get(ref) : undefined));
  useEffect(() => {
    let alive = true;
    if (!ref) { setUrl(undefined); return; }
    if (!ref.startsWith(PHOTO_REF_PREFIX)) { setUrl(ref); return; }
    const cached = urlCache.get(ref);
    if (cached) { setUrl(cached); return; }
    getPhotoBlob(ref).then((b) => {
      if (!b || !alive) return;
      const u = URL.createObjectURL(b);
      urlCache.set(ref, u);
      setUrl(u);
    }).catch(() => {});
    return () => { alive = false; };
  }, [ref]);
  return url;
}

/** Converts a blob to a data: URL (used for backups). */
export function blobToDataUrl(b: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(b);
  });
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  return (await fetch(dataUrl)).blob();
}
