"use client";

import {
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
  limit as fsLimit,
} from "firebase/firestore";
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "./firebase";

const PROBLEMS_COLLECTION = "communityProblems";
const NAME_STORAGE_KEY = "aspire_community_name";

// A friendly, persistent (per-browser) display name instead of a raw
// anonymous UID — regenerated once and reused on every visit so the same
// person's posts look consistent without ever asking for a real name.
const ADJECTIVES = ["Mehnati", "Honhaar", "Chatur", "Vishwasi", "Safal", "Junoon", "Nayi"];
const NOUNS = ["Vyapari", "Dukandar", "Kisan", "Udyami", "Karigar", "Vyavasayi"];

function generateDisplayName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${adj} ${noun} #${num}`;
}

export function getDisplayName(): string {
  if (typeof window === "undefined") return "Vyapari";
  let name = window.localStorage.getItem(NAME_STORAGE_KEY);
  if (!name) {
    name = generateDisplayName();
    window.localStorage.setItem(NAME_STORAGE_KEY, name);
  }
  return name;
}

let authReadyPromise: Promise<User> | null = null;

/** Silently signs the visitor in anonymously (once) and resolves with the
 * Firebase user. Safe to call repeatedly — subsequent calls reuse the same
 * in-flight/resolved promise rather than signing in again. */
export function ensureAnonymousUser(): Promise<User> {
  if (authReadyPromise) return authReadyPromise;
  authReadyPromise = new Promise<User>((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (user) {
          unsubscribe();
          resolve(user);
        }
      },
      (err) => {
        unsubscribe();
        reject(err);
      }
    );
    signInAnonymously(auth).catch((err) => {
      unsubscribe();
      reject(err);
    });
  });
  return authReadyPromise;
}

export function getCurrentUid(): string | null {
  return auth.currentUser?.uid ?? null;
}

export interface CommunityProblem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  authorName: string;
  authorUid: string;
  createdAt: Timestamp | null;
  solutionCount: number;
  status: "open" | "solved";
}

export interface CommunitySolution {
  id: string;
  text: string;
  authorName: string;
  authorUid: string;
  createdAt: Timestamp | null;
  upvotedBy: string[];
}

export function subscribeToProblems(
  category: string,
  onData: (problems: CommunityProblem[]) => void,
  onError: (err: Error) => void
) {
  const base = collection(db, PROBLEMS_COLLECTION);
  const q =
    category === "All"
      ? query(base, orderBy("createdAt", "desc"), fsLimit(100))
      : query(base, where("category", "==", category), orderBy("createdAt", "desc"), fsLimit(100));

  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CommunityProblem, "id">) }))),
    (err) => onError(err as Error)
  );
}

export function subscribeToProblem(problemId: string, onData: (problem: CommunityProblem | null) => void) {
  return onSnapshot(doc(db, PROBLEMS_COLLECTION, problemId), (snap) =>
    onData(snap.exists() ? { id: snap.id, ...(snap.data() as Omit<CommunityProblem, "id">) } : null)
  );
}

export function subscribeToSolutions(problemId: string, onData: (solutions: CommunitySolution[]) => void) {
  const q = query(collection(db, PROBLEMS_COLLECTION, problemId, "solutions"), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) =>
    onData(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CommunitySolution, "id">) })))
  );
}

export async function createProblem(input: {
  title: string;
  description: string;
  category: string;
  location: string;
}): Promise<void> {
  const user = await ensureAnonymousUser();
  await addDoc(collection(db, PROBLEMS_COLLECTION), {
    title: input.title.trim().slice(0, 150),
    description: input.description.trim().slice(0, 2000),
    category: input.category,
    location: input.location.trim().slice(0, 100),
    authorName: getDisplayName(),
    authorUid: user.uid,
    createdAt: serverTimestamp(),
    solutionCount: 0,
    status: "open",
  });
}

export async function addSolution(problemId: string, text: string): Promise<void> {
  const user = await ensureAnonymousUser();
  await addDoc(collection(db, PROBLEMS_COLLECTION, problemId, "solutions"), {
    text: text.trim().slice(0, 2000),
    authorName: getDisplayName(),
    authorUid: user.uid,
    createdAt: serverTimestamp(),
    upvotedBy: [],
  });
  await updateDoc(doc(db, PROBLEMS_COLLECTION, problemId), { solutionCount: increment(1) });
}

export async function toggleUpvote(problemId: string, solutionId: string, alreadyUpvoted: boolean): Promise<void> {
  const user = await ensureAnonymousUser();
  const ref = doc(db, PROBLEMS_COLLECTION, problemId, "solutions", solutionId);
  await updateDoc(ref, { upvotedBy: alreadyUpvoted ? arrayRemove(user.uid) : arrayUnion(user.uid) });
}

export async function markSolved(problemId: string): Promise<void> {
  await updateDoc(doc(db, PROBLEMS_COLLECTION, problemId), { status: "solved" });
}

/** "3 hours ago" / "2 days ago" style formatting, no date-fns dependency. */
export function relativeTime(ts: Timestamp | null): string {
  if (!ts) return "just now";
  const seconds = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
