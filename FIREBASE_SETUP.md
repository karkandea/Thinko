# 🔐 Firebase Setup Guide for Muscle Brain

## 1. Enable Google Authentication

1. Go to [Firebase Console](https://console.firebase.google.com/project/couple-app-9a656/authentication/providers)
2. Click on **Authentication** → **Sign-in method**
3. Click **Google** → Enable it
4. Add your email as support email
5. Click **Save**

## 2. Firestore Database Setup

1. Go to [Firestore Database](https://console.firebase.google.com/project/couple-app-9a656/firestore)
2. Click **Create database**
3. Choose **Production mode** (we'll add rules below)
4. Select a location closest to your users (e.g., `asia-southeast1` for Indonesia)

## 3. Firestore Security Rules

Go to **Firestore** → **Rules** and paste this:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - users can only read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Game scores - users can read all scores (for leaderboard) but only write their own
    match /game_scores/{scoreId} {
      allow read: if true; // Public leaderboard
      allow create: if request.auth != null 
        && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null 
        && resource.data.userId == request.auth.uid;
    }
  }
}
```

Click **Publish** to save.

## 4. Firestore Indexes (for leaderboard queries)

Go to **Firestore** → **Indexes** → **Composite** and add:

| Collection ID | Fields indexed | Query scope |
|---------------|----------------|-------------|
| `game_scores` | `gameSlug` (Asc), `score` (Desc) | Collection |
| `game_scores` | `userId` (Asc), `gameSlug` (Asc), `createdAt` (Desc) | Collection |
| `game_scores` | `userId` (Asc), `gameSlug` (Asc), `score` (Desc) | Collection |

## 5. Add localhost to Authorized Domains

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Make sure `localhost` is in the list (usually added by default)

## 6. Test Login

1. Restart your dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Click the **Login** button
4. Sign in with Google
5. Your avatar should appear in the header!

---

## Environment Variables (Optional but Recommended)

For production, create `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCuF7kTG0UcG9XaB_aWbpn1dzowU1GtGKk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=couple-app-9a656.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=couple-app-9a656
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=couple-app-9a656.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=576374443403
NEXT_PUBLIC_FIREBASE_APP_ID=1:576374443403:web:99c9cf303b10fd6df6738e
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-K4PKKQRR53
```

Then update `lib/firebase.ts` to use `process.env.NEXT_PUBLIC_*` values.

---

## Troubleshooting

### "auth/unauthorized-domain" error
- Add your domain to Firebase Console → Authentication → Settings → Authorized domains

### "Missing or insufficient permissions" error
- Check Firestore Rules are published correctly

### Google Sign-in popup blocked
- Make sure you're not using incognito mode with strict popup blocking
