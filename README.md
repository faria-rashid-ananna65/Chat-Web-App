# ChitChat - Real-Time Chat Application

A full-stack MERN application with real-time messaging using Socket.IO.

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Socket.IO Client
- **Backend:** Node.js, Express.js, MongoDB, Socket.IO
- **Auth:** JWT with HTTP-only cookies
- **Storage:** ImageKit for images/videos

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- ImageKit account (for file uploads)

## Setup

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chitchat
JWT_SECRET=your_secret_key_here_make_it_long
CLIENT_URL=http://localhost:5173
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
```

### 3. Start Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 4. Open Browser

Visit `http://localhost:5173`

## Features

- Real-time one-to-one messaging
- Group chat (up to 50 members)
- Friend system with requests
- Online/offline status
- Typing indicators
- Image/video sharing via ImageKit
- Emoji picker
- Dark/Light theme
- Responsive design
- JWT authentication with cookies

## Project Structure

```
Chitchat/
├── backend/
│   ├── config/          # DB & ImageKit config
│   ├── controllers/     # Route handlers
│   ├── middleware/       # Auth middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── socket/          # Socket.IO setup
│   ├── utils/           # Helper functions
│   └── server.js        # Entry point
│
└── frontend/
    └── src/
        ├── components/  # Reusable components
        ├── context/     # React contexts
        ├── hooks/       # Custom hooks
        ├── pages/       # Page components
        ├── services/    # API services
        └── App.jsx      # Main app
```
