# MERN Chat App

Mobile-first full stack chat app with React, Node.js, Express, MongoDB, JWT authentication, and Socket.IO realtime messaging.

## Requirements

- Node.js and npm
- MongoDB running locally, or a MongoDB Atlas connection string

## Setup

1. Install dependencies:

   ```bash
   npm run install:all
   npm install
   ```

2. Create server environment file:

   ```bash
   copy server\.env.example server\.env
   ```

3. Edit `server/.env`:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/mern-chat
   JWT_SECRET=replace-with-a-long-random-secret
   CLIENT_URL=http://localhost:5173
   PORT=5000
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

Client: http://localhost:5173

API: http://localhost:5000

## MongoDB Options

Use one of these before starting the backend:

- Install MongoDB Community Server and keep it running locally on port `27017`.
- Use MongoDB Atlas and replace `MONGO_URI` in `server/.env` with your Atlas connection string.

## Features

- Sign up, login, logout
- JWT auth stored in an HTTP-only cookie
- Protected API routes
- User list and direct conversations
- Realtime messages with Socket.IO
- Online user indicators
- Mobile-first responsive chat UI
