// ─────────────────────────────────────────────────────────────────────────────
// Firestore Database Helpers
// ─────────────────────────────────────────────────────────────────────────────
import {
    collection, addDoc, getDocs, deleteDoc, doc,
    query, orderBy, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { db, FIREBASE_CONFIGURED } from '../firebase.js';
import { storage, userKey } from './storage.js';

// ── Read entries (one-time) ───────────────────────────────────────────────────
export async function getEntries(uid) {
    if (!FIREBASE_CONFIGURED) {
        return storage.get(userKey(uid, 'journal'), []);
    }
    const q = query(
        collection(db, 'users', uid, 'entries'),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data(), date: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString() }));
}

// ── Real-time listener ────────────────────────────────────────────────────────
export function listenEntries(uid, callback) {
    if (!FIREBASE_CONFIGURED) {
        // Fallback to localStorage, call callback once
        callback(storage.get(userKey(uid, 'journal'), []));
        return () => { }; // no-op unsubscribe
    }
    const q = query(
        collection(db, 'users', uid, 'entries'),
        orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, snap => {
        const entries = snap.docs.map(d => ({
            id: d.id,
            ...d.data(),
            date: d.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        }));
        callback(entries);
    });
}

// ── Save entry ────────────────────────────────────────────────────────────────
export async function saveEntry(uid, entry) {
    if (!FIREBASE_CONFIGURED) {
        const key = userKey(uid, 'journal');
        const existing = storage.get(key, []);
        const newEntry = { ...entry, id: Date.now() };
        storage.set(key, [newEntry, ...existing]);
        return newEntry;
    }
    const ref = await addDoc(collection(db, 'users', uid, 'entries'), {
        ...entry,
        createdAt: serverTimestamp(),
    });
    return { id: ref.id, ...entry };
}

// ── Delete entry ──────────────────────────────────────────────────────────────
export async function deleteEntry(uid, entryId) {
    if (!FIREBASE_CONFIGURED) {
        const key = userKey(uid, 'journal');
        const existing = storage.get(key, []);
        storage.set(key, existing.filter(e => e.id !== entryId));
        return;
    }
    await deleteDoc(doc(db, 'users', uid, 'entries', String(entryId)));
}
