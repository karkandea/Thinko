import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Types
export interface GameScore {
  id?: string;
  userId: string;
  gameSlug: string;
  score: number;
  level?: number;
  accuracy?: number;
  extraStats?: Record<string, string | number>;
  createdAt: Timestamp;
}

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  totalGamesPlayed: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Save a game score
export async function saveGameScore(
  userId: string,
  gameSlug: string,
  score: number,
  level?: number,
  accuracy?: number,
  extraStats?: Record<string, string | number>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'game_scores'), {
    userId,
    gameSlug,
    score,
    level: level || null,
    accuracy: accuracy || null,
    extraStats: extraStats || null,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// Get user's scores for a specific game
export async function getUserGameScores(
  userId: string, 
  gameSlug: string, 
  limitCount: number = 10
): Promise<GameScore[]> {
  const q = query(
    collection(db, 'game_scores'),
    where('userId', '==', userId),
    where('gameSlug', '==', gameSlug),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameScore));
}

// Get user's best score for a game
export async function getUserBestScore(
  userId: string,
  gameSlug: string
): Promise<GameScore | null> {
  const q = query(
    collection(db, 'game_scores'),
    where('userId', '==', userId),
    where('gameSlug', '==', gameSlug),
    orderBy('score', 'desc'),
    limit(1)
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as GameScore;
}

// Get or create user profile
export async function getOrCreateUserProfile(
  userId: string,
  displayName: string,
  email: string,
  photoURL: string
): Promise<UserProfile> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    // Update last seen
    await setDoc(userRef, { updatedAt: serverTimestamp() }, { merge: true });
    return userSnap.data() as UserProfile;
  }
  
  // Create new profile
  const newProfile: Omit<UserProfile, 'createdAt' | 'updatedAt'> & { createdAt: ReturnType<typeof serverTimestamp>, updatedAt: ReturnType<typeof serverTimestamp> } = {
    displayName,
    email,
    photoURL,
    totalGamesPlayed: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  
  await setDoc(userRef, newProfile);
  return newProfile as unknown as UserProfile;
}

// Increment games played counter
export async function incrementGamesPlayed(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    const current = userSnap.data().totalGamesPlayed || 0;
    await setDoc(userRef, { 
      totalGamesPlayed: current + 1,
      updatedAt: serverTimestamp() 
    }, { merge: true });
  }
}

// Get global leaderboard for a game
export async function getGameLeaderboard(
  gameSlug: string,
  limitCount: number = 10,
  lowerIsBetter: boolean = false
): Promise<GameScore[]> {
  const q = query(
    collection(db, 'game_scores'),
    where('gameSlug', '==', gameSlug),
    orderBy('score', lowerIsBetter ? 'asc' : 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GameScore));
}
