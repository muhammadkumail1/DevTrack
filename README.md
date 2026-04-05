# DevTrack — Software Project Management Information System (SPMIS)

A web-based SPMIS built with the MERN stack for managing projects, tasks, bugs, sprints, and milestones.

## Project Structure

```
DevTrack/
├── backend/        ← Node.js + Express + MongoDB API
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── controllers/
│   └── routes/
└── frontend/       ← React SPA (served by Express)
    └── public/
        └── index.html
```

## How to Run

```bash
cd backend
npm install
npm start
```

Open http://localhost:5000 in your browser.

## Tech Stack
- MongoDB, Express.js, React.js, Node.js (MERN)
- JWT Authentication
- Role-based access: Manager, Developer, Tester
