# Bumpd 💘

> **"Meet people you might have already bumped into."**

Bumpd is a modern dating web application that connects people based on shared interests, personality compatibility, and — uniquely — favorite places they both love to visit. Whether it's your go-to coffee spot or a hidden park, Bumpd uses those common hangouts as conversation starters, powered by AI.

---

## Table of Contents

- [About Bumpd](#about-bumpd)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Third-Party Integrations](#third-party-integrations)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Running the App](#running-the-app)
- [Testing](#testing)
- [Key Design Decisions](#key-design-decisions)

---

## About Bumpd

Bumpd is built on a simple but powerful idea: the best way to break the ice with someone new is to discover you've already been to the same places. Unlike traditional dating apps that only match on looks or swipes, Bumpd enriches every mutual match with an **AI-generated icebreaker message** crafted from shared favorite places — making that first conversation feel natural, not awkward.

### How It Works

1. **Build your profile** — fill in your personality type (MBTI), relationship goals, bio, and upload a photo.
2. **Save your favorite places** — coffee shops, parks, restaurants, co-working spaces — any place you love, with a personal note about why you like it.
3. **Discover people** — browse other users filtered by gender preference, relationship goals, age range, or city.
4. **Like someone** — send a like to people you're interested in.
5. **Mutual match** — when they like you back, it's a match! Bumpd instantly generates a personalized AI icebreaker based on places you both love.
6. **Someone liked you?** — get notified when someone likes your profile and choose to like them back from the "Liked You" section.

---

## Features

### Authentication
- **Email & Password Registration/Login** — secure bcrypt-hashed passwords, JWT-based sessions
- **Google OAuth Login** — one-click sign-in with a Google account
- **Auto-logout on token expiry** — global Axios 401 interceptor clears session and redirects to landing page automatically

### Onboarding Flow
- Step-by-step modal after first login:
  1. **Boost** — welcome screen explaining the app concept
  2. **Gender** — user selects their gender (saved to profile in DB)
  3. **Preference** — user selects which gender they want to see
- Existing users with a gender already set in their profile skip straight to the preference step
- Gender preference persisted in `localStorage` for instant client-side filtering without extra API calls

### Profile
- Editable fields: **Name, Gender, Age, City, Bio, Personality (MBTI), Interests, Relationship Goals**
- **Photo upload** via Cloudinary — stored securely, served via CDN
- Interests displayed as emoji-tagged chips (e.g. 🏋️ gym, ✈️ traveling, ☕ cafe-hopping)
- City auto-detected from GPS coordinates via OpenStreetMap/Nominatim reverse geocoding
- Loading overlay with animated heart during save operations

### Discover — Home Page
- Browse profile cards showing: photo, name, age, city, personality type, relationship goals, distance
- **Gender filtering** — only shows users matching your preferred gender (set during onboarding)
- **Already-liked users hidden** automatically so the list stays fresh
- **Quick Search** — filter results by:
  - Relationship goals: Marriage, Serious Relationship, Something Casual, Not Sure Yet
  - Age range (min / max)
  - City / location keyword
- **Reset Filter** button — appears only after a search is applied; one click clears all active filters
- **Haversine distance** — shows approximate km distance between you and each user (when both have GPS coordinates)

### Likes
- Like any user from their profile card
- Duplicate like prevention — can't like the same person twice
- Self-like prevention — can't like your own profile
- When a mutual like occurs, a **Match is created** along with an AI-generated icebreaker

### Notifications
- **Match notifications** — bell icon with an unread badge for new mutual matches; click to view; auto-marked as read
- **Liked You badge** — separate counter showing how many new people liked your profile since your last visit
- Notification count uses `localStorage` delta tracking — only shows likes newer than the last time you checked

### Matches Page
- **Mutual matches list** — all people you've matched with, showing their profile info and the AI icebreaker
- **Liked You section** — people who liked you but haven't been liked back yet, shown as cards
- **Profile detail modal** — click any "Liked You" card to view their full profile: photo, bio, personality type, interests, relationship goals, city
- **Like Back button** — like them back directly from the card or the modal; refreshes the list instantly

### Favorite Places
- Add favorite places by name, optional GPS coordinates, and a personal note about why you love it
- GPS coordinates auto-reverse-geocoded to a city name via OpenStreetMap Nominatim
- Delete your own places (server-side ownership enforced via authorization middleware)
- Saved places feed directly into the AI icebreaker generator when a match occurs

### AI Icebreaker — Google Gemini
- Triggered automatically the moment a mutual match is created
- Compares both users' saved places by name (case-insensitive) to find shared spots
- Generates a casual, genuine opening message in the style of a real person texting for the first time
- If shared places exist, the message is grounded in the notes each person wrote about those places
- Falls back gracefully to `null` if the Gemini API is unavailable — the match still saves normally
- Example output: *"eh kamu suka ke kopi nako daur baur kemang juga? kirain cuma aku yang hampir setiap saat kalo mau ngopi ke sana haha, btw biasanya duduk di pojok mana?"*

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | Runtime |
| **Express** | 5.x | Web framework |
| **Sequelize** | 6.x | ORM |
| **PostgreSQL** | 14+ | Database |
| **jsonwebtoken** | 9.x | JWT auth tokens |
| **bcryptjs** | 3.x | Password hashing |
| **Multer** | 2.x | Multipart file upload |
| **Cloudinary SDK** | 2.x | Photo storage & delivery |
| **@google/genai** | 2.x | Gemini AI SDK |
| **Axios** | 1.x | Google OAuth token verification |
| **CORS** | 2.x | Cross-origin request handling |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| **React** | 19.x | UI library |
| **Vite** | 8.x | Build tool & dev server |
| **Redux Toolkit** | 2.x | Global state management |
| **React Router** | 7.x | Client-side routing |
| **Axios** | 1.x | API requests with interceptors |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **DaisyUI** | 5.x | Tailwind component library |
| **@react-oauth/google** | 0.13.x | Google OAuth client |

### Dev & Testing
| Technology | Purpose |
|---|---|
| **Jest** | Test runner |
| **Supertest** | HTTP integration testing |
| **cross-env** | Cross-platform env variable handling |
| **Nodemon** | Dev server auto-reload |
| **Sequelize CLI** | Migration & seeder management |

---

## Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      CLIENT (React + Vite)                 │
│                                                            │
│  Pages: LandingPage · Home · Matches · Profile ·          │
│         FavoritePlaces · Login · Register                  │
│                                                            │
│  State Management: Redux Toolkit                           │
│  Slices: auth · user · match · profile · place             │
│                                                            │
│  HTTP: Axios + global 401 interceptor (axiosAuth.js)       │
└────────────────────────┬───────────────────────────────────┘
                         │  REST API  (JSON over HTTP)
┌────────────────────────▼───────────────────────────────────┐
│                     SERVER (Express 5)                     │
│                                                            │
│  POST /auth/register                                       │
│  POST /auth/login          ──► AuthController              │
│  POST /auth/google-login                                   │
│                                                            │
│  ─────── authentication middleware (JWT verify) ────────  │
│                                                            │
│  GET  /users               ──► UserController              │
│  GET  /users/:id                (haversine distance)       │
│                                                            │
│  GET  /profile/me          ──► ProfileController           │
│  PUT  /profile/me                                          │
│                                                            │
│  POST /likes/:userId       ──► LikeController              │
│  GET  /likes/received            (mutual match detection   │
│  GET  /likes/received-count       + Gemini icebreaker)     │
│                                                            │
│  GET   /matches            ──► MatchController             │
│  GET   /matches/notifications                              │
│  PATCH /matches/notifications/read                         │
│                                                            │
│  GET    /places            ──► PlaceController             │
│  POST   /places                  (Nominatim geocoding)     │
│  DELETE /places/:id        ── authorization middleware      │
│                               (ownership check)            │
│  PATCH /upload/photo       ──► UploadController            │
│                                  (Multer → Cloudinary)     │
│                                                            │
│  ─────── errorHandler middleware (centralized) ─────────  │
└────────────────────────┬───────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │  PostgreSQL Database │
              │  (Sequelize ORM)    │
              └──────────┬──────────┘
                         │
         ┌───────────────┼────────────────┐
         ▼               ▼                ▼
    Cloudinary       Gemini AI        Nominatim
  (photo storage)  (icebreakers)   (reverse geocode)
```

---

## Database Schema

### Users
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK) | Auto-increment |
| `email` | STRING | Unique, required |
| `password` | STRING | bcrypt hashed |
| `createdAt` | DATE | |
| `updatedAt` | DATE | |

### Profiles
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK) | |
| `userId` | INTEGER (FK → Users) | |
| `name` | STRING | Display name |
| `gender` | STRING | `"male"` or `"female"` |
| `age` | INTEGER | |
| `bio` | TEXT | Personal description |
| `photoUrl` | STRING | Cloudinary CDN URL |
| `city` | STRING | Manual or auto-geocoded |
| `lat` | FLOAT | GPS latitude |
| `long` | FLOAT | GPS longitude |
| `personality` | STRING | MBTI type e.g. `"INFP"` |
| `interests` | ARRAY(STRING) | e.g. `["gym", "traveling"]` |
| `relationshipGoals` | STRING | `"marriage"` · `"a serious relationship"` · `"something casual"` · `"not sure yet"` |

### Likes
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK) | |
| `fromUserId` | INTEGER (FK → Users) | User who liked |
| `toUserId` | INTEGER (FK → Users) | User who was liked |
| `createdAt` | DATE | |

### Matches
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK) | |
| `user1Id` | INTEGER (FK → Users) | |
| `user2Id` | INTEGER (FK → Users) | |
| `icebreaker` | TEXT | AI-generated opener, nullable |
| `isRead` | BOOLEAN | Notification read status |
| `createdAt` | DATE | |

### FavoritePlaces
| Column | Type | Notes |
|---|---|---|
| `id` | INTEGER (PK) | |
| `userId` | INTEGER (FK → Users) | Owner |
| `placeName` | STRING | Required |
| `lat` | FLOAT | Optional GPS |
| `long` | FLOAT | Optional GPS |
| `note` | TEXT | Personal note about the place |
| `createdAt` | DATE | |
| `updatedAt` | DATE | |

---

## API Endpoints

All endpoints except `/auth/*` require:
```
Authorization: Bearer <your_jwt_token>
```

### Auth — `POST /auth/*`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/auth/register` | `{ email, password }` | `{ access_token, email }` |
| POST | `/auth/login` | `{ email, password }` | `{ access_token, email }` |
| POST | `/auth/google-login` | Header: `access_token_google` | `{ access_token, email }` |

### Users — `GET /users/*`

| Method | Endpoint | Query Params | Response |
|---|---|---|---|
| GET | `/users` | `?relationshipGoals=marriage` | Array of users (excl. self & already-liked) with distance |
| GET | `/users/:id` | — | Single user with Profile, FavoritePlaces, distance |

### Profile — `/profile/me`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/profile/me` | — | Full user + profile data |
| PUT | `/profile/me` | Any profile fields | Updated profile |

### Likes — `/likes/*`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/likes/:userId` | — | `{ message, matched: boolean }` |
| GET | `/likes/received` | — | Array of likes with Liker's profile |
| GET | `/likes/received-count` | — | `{ count: number }` |

### Matches — `/matches/*`

| Method | Endpoint | Response |
|---|---|---|
| GET | `/matches` | Array of matches with both users' profiles |
| GET | `/matches/notifications` | Array of unread matches |
| PATCH | `/matches/notifications/read` | `{ message }` |

### Places — `/places/*`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/places` | — | Array of current user's places |
| POST | `/places` | `{ placeName, lat?, long?, note? }` | Created place + city |
| DELETE | `/places/:id` | — | `{ message }` |

### Upload — `PATCH /upload/photo`

| Method | Endpoint | Body | Response |
|---|---|---|---|
| PATCH | `/upload/photo` | `multipart/form-data` field: `photo` | `{ photoUrl }` |

---

## Third-Party Integrations

### 1. Google Gemini AI — Icebreaker Generator
- **Package:** `@google/genai`
- **Model:** `gemini-3-flash-preview`
- **When it runs:** Automatically on every new mutual match
- **Logic:** Finds shared favorite places between both users (case-insensitive name match). Uses each user's personal notes about those places as the creative seed for the message prompt.
- **Style:** Casual Indonesian texting — 2–3 short sentences, spontaneous, no corporate language, no emoji overload
- **Failure handling:** Wrapped in try-catch. If Gemini fails, `icebreaker` is `null` and the match still saves successfully.

### 2. Cloudinary — Photo Upload & Storage
- **Package:** `cloudinary` v2
- **Flow:** Client sends `multipart/form-data` → Multer buffers file in memory → server uploads buffer to Cloudinary → secure CDN URL saved to `Profile.photoUrl`
- **Endpoint:** `PATCH /upload/photo`

### 3. OpenStreetMap Nominatim — Reverse Geocoding
- **Type:** Free public REST API — no API key required
- **Flow:** When adding a favorite place with coordinates → server calls Nominatim → extracts city from address using fallback chain: `city` → `town` → `county` → `state`
- **Endpoint:** `POST /places`

### 4. Google OAuth — Social Login
- **Client package:** `@react-oauth/google`
- **Server verification:** `GET https://www.googleapis.com/oauth2/v1/userinfo` with the Google access token
- **Flow:** Client obtains Google access token → sends to `POST /auth/google-login` → server verifies email & `email_verified` → creates or finds user → returns Bumpd JWT

---

## Project Structure

```
ip-ramaatha/
├── server/
│   ├── app.js                    # Express app: middleware, routes
│   ├── bin/
│   │   └── www                   # HTTP server entry point
│   ├── controllers/
│   │   ├── AuthController.js     # register, login, googleLogin
│   │   ├── LikeController.js     # likeUser, getReceived, getReceivedCount
│   │   ├── MatchController.js    # getMatches, getNotifications, markRead
│   │   ├── PlaceController.js    # getPlaces, addPlace, deletePlace
│   │   ├── ProfileController.js  # getMyProfile, updateProfile
│   │   ├── UploadController.js   # uploadPhoto
│   │   └── UserController.js     # getAllUsers, getUserById
│   ├── helpers/
│   │   ├── bcrypt.js             # hashPassword, comparePassword
│   │   ├── gemini.js             # genIcebreaker (Gemini AI)
│   │   ├── haversine.js          # Distance calculation (km)
│   │   ├── jwt.js                # signToken, verifyToken
│   │   └── multer.js             # Multer memoryStorage config
│   ├── middlewares/
│   │   ├── authentication.js     # JWT verify → req.user
│   │   ├── authorization.js      # Place ownership check
│   │   └── errorHandler.js       # Centralized error responses
│   ├── migrations/               # Sequelize migration files
│   ├── models/
│   │   ├── index.js
│   │   ├── user.js
│   │   ├── profile.js
│   │   ├── like.js
│   │   ├── match.js
│   │   └── favoritePlace.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── like.js
│   │   ├── match.js
│   │   ├── place.js
│   │   ├── profile.js
│   │   ├── upload.js
│   │   └── user.js
│   ├── seeders/                  # Database seed files
│   ├── __tests__/
│   │   └── app.test.js           # 70 integration test cases
│   └── package.json
│
└── client/
    ├── public/
    └── src/
        ├── app/
        │   └── store.js              # Redux store (configureStore)
        ├── components/
        │   └── Loading.jsx           # Animated heart loading overlay
        ├── features/
        │   ├── auth/authSlice.js     # login, logout, register thunks
        │   ├── match/matchSlice.js   # matches, receivedLikes, likedYouCount
        │   ├── place/placeSlice.js   # places CRUD
        │   ├── profile/profileSlice.js # profile fetch & update
        │   └── user/userSlice.js     # user list with filters
        ├── pages/
        │   ├── LandingPage.jsx       # App intro + login/register links
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Home.jsx              # Discover users + onboarding modal
        │   ├── Matches.jsx           # Matches + Liked You section
        │   ├── Profile.jsx           # Edit profile + photo upload
        │   └── FavoritePlaces.jsx    # Manage favorite places
        ├── utils/
        │   └── axiosAuth.js          # Global 401 interceptor
        ├── App.jsx                   # Route definitions
        ├── main.jsx                  # Entry point + providers
        └── index.css                 # Global styles + animation
```

---

## Environment Variables

### `server/.env`

```env
# PostgreSQL
DB_USERNAME=your_pg_username
DB_PASSWORD=your_pg_password
DB_NAME=ip_bumpd
DB_HOST=localhost
DB_PORT=5432

# JWT
JWT_SECRET=your_jwt_secret_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=3000
```

### `server/.env.test` — used during `npm test`

```env
DB_USERNAME=your_pg_username
DB_PASSWORD=your_pg_password
DB_NAME=ip_bumpd_test
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

> Both `ip_bumpd` (development) and `ip_bumpd_test` (testing) databases must exist in PostgreSQL before running migrations or tests.

---

## Installation & Setup

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- Cloudinary account ([free tier](https://cloudinary.com/))
- Google Gemini API key ([get one](https://aistudio.google.com/))
- Google OAuth Client ID ([console](https://console.cloud.google.com/))

### 1. Clone the repository

```bash
git clone <repository-url>
cd ip-ramaatha
```

### 2. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 3. Set up environment variables

Create `server/.env` and `server/.env.test` based on the [Environment Variables](#environment-variables) section above.

### 4. Create databases

```bash
cd server

# Development DB
npx sequelize-cli db:create

# Test DB
NODE_ENV=test npx sequelize-cli db:create
```

### 5. Run migrations

```bash
npx sequelize-cli db:migrate
```

### 6. Seed sample data (optional)

```bash
npx sequelize-cli db:seed:all
```

### 7. Update Google OAuth Client ID

In `client/src/main.jsx`, replace the `clientId` with your own:

```jsx
<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
```

---

## Running the App

Open two terminal windows:

**Terminal 1 — Backend**
```bash
cd server
npm run dev
# Running at http://localhost:3000
```

**Terminal 2 — Frontend**
```bash
cd client
npm run dev
# Running at http://localhost:5173
```

Open your browser and go to `http://localhost:5173`.

---

## Testing

Backend tests use **Jest** + **Supertest** and run against a dedicated `ip_bumpd_test` database. The DB is fully reset (`sync({ force: true })`) on every test run, so tests are always isolated and reproducible.

### Run all tests with coverage

```bash
cd server
npm test
```

### Coverage Summary

```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   96.91 |    87.87 |     100 |   96.86 |
 controllers/          |   95.62 |    90.76 |     100 |   95.48 |
  AuthController.js    |    100  |    94.44 |     100 |    100  |
  LikeController.js    |   94.87 |    83.33 |     100 |   94.73 |
  MatchController.js   |    100  |     100  |     100 |    100  |
  PlaceController.js   |   91.30 |     100  |     100 |   91.30 |
  ProfileController.js |   92.85 |     100  |     100 |   92.30 |
  UploadController.js  |   93.75 |      75  |     100 |   93.75 |
  UserController.js    |   93.75 |    88.88 |     100 |   93.33 |
 helpers/              |    100  |     100  |     100 |    100  |
 middlewares/          |   93.87 |      90  |     100 |   93.87 |
-----------------------|---------|----------|---------|---------|
```

### Test Suites — 70 test cases total

| Describe | # Tests |
|---|---|
| `POST /auth/register` | 5 |
| `POST /auth/login` | 5 |
| `POST /auth/google-login` | 3 |
| `GET /users` | 4 |
| `GET /users/:id` | 3 |
| `GET /profile/me` | 2 |
| `PUT /profile/me` | 2 |
| `POST /places` | 4 |
| `GET /places` | 2 |
| `DELETE /places/:id` | 3 |
| `POST /likes/:userId` | 6 |
| `GET /likes/received-count` | 3 |
| `GET /likes/received` | 4 |
| `GET /matches` | 2 |
| `GET /matches/notifications` | 2 |
| `PATCH /matches/notifications/read` | 2 |
| `PATCH /upload/photo` | 3 |
| Haversine, auth edge cases, error branches, Gemini failure | 14 |
| **Total** | **70** |

---

## Key Design Decisions

### Favorite Places as a Core Feature
Most dating apps rely on photos and bios alone. Bumpd adds a layer of shared context — the places you both love. This gives the AI icebreaker generator a meaningful, specific hook to craft a genuine opener, making the first message feel effortless and personal rather than generic.

### Haversine Distance Calculation
Distance between users is computed server-side using the [Haversine formula](https://en.wikipedia.org/wiki/Haversine_formula), which accounts for the Earth's curvature. This gives accurate km distances without needing a paid geocoding API.

### Gender Preference in localStorage
Gender preference is stored in `localStorage` for instant client-side filtering without extra API calls on every page load. On first login, users go through the onboarding modal (gender → preference). For returning users who already have a gender set in their profile, the app auto-infers the opposite gender as preference, so they skip the question entirely.

### Global 401 Interceptor
Rather than handling auth errors in every component, a single Axios response interceptor (`axiosAuth.js`) catches any 401, clears all auth keys from `localStorage`, and redirects to the landing page. This ensures no stale sessions persist regardless of which API call expires first.

### Authorization Middleware for Place Deletion
Ownership checks for deleting a favorite place are handled in a dedicated server-side `authorization.js` middleware — keeping controllers lean and making the security layer reusable and testable independently.

### Gemini Prompt Engineering
The icebreaker prompt is carefully engineered to produce casual, Indonesian-sounding text that feels like a real person typed it, not an AI. It explicitly bans long dashes, bullet points, formal language, and emoji overload. It also instructs the model to avoid starting with "Hey" or "Hi" — encouraging more creative, specific openers grounded in the shared place context.

---

*Built with ❤️ as a Hacktiv8 Phase 2 Individual Project.*
