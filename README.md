# Train Search (Fullstack)

## What this is
A full-stack train search app (Node/Express + MongoDB backend, React/Vite frontend).
Features:
- Select source & destination from dropdowns
- Direct + single-connection routes
- Prices = Rs 1.25 / km (calculated from cumulative distances)
- Seed script to generate 1000 trains
- Futuristic hologram UI (colorful, easy to navigate)

## Requirements
- Node.js (v18+ recommended)
- npm
- MongoDB (local) or MongoDB Atlas (provide MONGO_URI)

## Setup (local)
1. Clone / copy this project into a folder 'train-search/'
2. Backend:
   - cd train-search/backend`
   - copy '.env.example' to '.env' and set 'MONGO_URI'
   - npm install
   - npm run seed  (creates 1000 trains; takes ~1-2 minutes)
   - npm start
3. Frontend:
   - Open new terminal
   - cd train-search/frontend
   - npm install
   - npm run dev
   - Open the printed Vite URL (usually http://localhost:5173)

Enjoy — UI is colorful and intentionally simple to use.
