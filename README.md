# BlinkCart

A full-stack Next.js ecommerce app with admin, user, and delivery workflows, real-time updates, and a separate socket server.

## Features
- Role-based dashboards: Admin, User, Delivery
- Grocery catalog management (add, view, edit, delete)
- Orders lifecycle with live status updates
- Delivery assignment, tracking, OTP delivery confirmation
- Real-time events via Socket.io
- Modern UI with responsive layouts

## Tech Stack
- Next.js (App Router)
- React, TypeScript
- MongoDB + Mongoose
- NextAuth (auth)
- Socket.io
- Tailwind CSS

## Project Structure
- `blinkcart/` – Next.js frontend + API routes
- `socketserver/` – Socket.io server

## Getting Started
1. Install dependencies

```bash
cd blinkcart
npm install
```

```bash
cd ../socketserver
npm install
```

2. Start dev servers

```bash
cd blinkcart
npm run dev
```

```bash
cd ../socketserver
node index.js
```

## Environment
Create `.env` in `blinkcart/` with your secrets (DB, auth, cloudinary, etc.).

## Deployment
Deploy the Next.js app and run the socket server separately. Update client socket URL if needed.

---
Developer~Krishant Pandey
