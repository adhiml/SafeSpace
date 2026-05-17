# SafeSpace

Student mental well-being app — **UI + MongoDB CRUD** with a single demo user (no authentication yet).

## Demo user

All data is stored for:

```js
{ _id: "user_001", user_name: "Demo Student", role: "student" }
```

Counsellor for bookings: `counsellor_001` (auto-seeded on server start).

## Stack

- **Frontend:** React Native, Expo, TypeScript, React Navigation, Axios, React Native Paper
- **Backend:** Node.js, Express, MongoDB, Mongoose (no JWT / bcrypt / login)

## Run

**1. MongoDB** — local or Atlas URI in `server/.env`:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/safespace
```

**2. API**

```bash
cd server
npm install
npm run dev
```

**3. App**

```bash
cd client
npm install
npx expo start
```

Set `EXPO_PUBLIC_API_URL` in `client/.env` for your device (see `client/.env.example`).

## API (no auth headers)

| Method | Path |
|--------|------|
| POST/GET | `/api/moods`, `/api/moods/analytics` |
| CRUD | `/api/journals` |
| GET/POST | `/api/posts`, `/api/comments`, `/api/posts/:id/me-too` |
| GET/POST | `/api/appointments`, `/api/messages`, `/api/counsellors`, `/api/notifications` |

## Adding auth later

- Add login/register + JWT on the server
- Replace `CURRENT_USER_ID` in controllers with `req.user._id`
- Swap `currentUser` constant on the client for a real user context
