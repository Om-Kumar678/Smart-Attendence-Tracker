# Attendly — Smart Attendance Tracker

A responsive React dashboard starter for college attendance administration, teaching, and student self-service.

## Requirements

- Node.js 18 or later
- An Express API at `http://localhost:5000/api` (or a configured API URL)

## Install and run

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, copy the environment template with `Copy-Item .env.example .env`.
The development server prints its local URL. To create and preview a production build:

```bash
npm run build
npm run preview
```

## Backend connection

Set `VITE_API_URL` in `.env` to the API base URL. Endpoint paths, HTTP methods, and response extraction are deliberately kept in `src/services/endpoints.js`; adapt these mappings to the existing Express routes and response envelopes. Defaults include `/auth/login`, `/auth/me`, `/students`, `/teachers`, `/classes`, `/classes/my`, `/classes/:id/students`, `/subjects`, `/attendance`, `/attendance/me`, and `/reports/attendance`. The current mapping expects JSON objects or arrays and accepts common `{ data }`, `{ items }`, and `{ results }` list envelopes. Authentication sends `{ email, password }` and expects a login response containing a JWT-like `token` and a `user` object with a `role`. The bearer token is held in memory only; credentials and tokens are never written to local storage (the optional remember-me setting stores only the identifier).

The client sends an authorization bearer header on authenticated calls, clears the in-memory session on HTTP 401, and reports request failures through the UI. Ensure the Express server allows the frontend origin via CORS and returns appropriate JSON errors/status codes. The class roster endpoint supports `GET` to list and `PUT` with `{ studentIds }` to save enrollments; attendance corrections use `PUT /attendance/:id`. Adapt these mappings/contracts to the backend before connecting a production instance.

## Demo data mode

For a frontend-only walkthrough, set `VITE_USE_MOCK_DATA=true` and restart Vite. Sign in with any non-empty email/username, password of at least 6 characters, and choose a role. All dashboard/list data in this mode is sample data stored in the frontend, and the interface displays a **Demo data** banner. Demo changes are in-memory only and reset on refresh. Switch the flag off to use the API; API failures do not silently fall back to demo records.

## Included routes

- `/login`, `/unauthorized`
- Admin: `/admin/dashboard`, `/admin/students`, `/admin/teachers`, `/admin/classes`, `/admin/subjects`, `/admin/reports`
- Teacher: `/teacher/dashboard`, `/teacher/classes`, `/teacher/attendance/take`, `/teacher/attendance/history`, `/teacher/students`
- Student: `/student/dashboard`, `/student/attendance`, `/student/profile`
- Unknown paths show a not-found page.

Role guards enforce route access in the client. They are a user-experience feature, not a replacement for authorization in the Express API.
