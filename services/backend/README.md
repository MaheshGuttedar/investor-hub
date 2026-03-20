# RealEstate Backend (Express + MongoDB)

Lightweight backend for Real Estate Investments. Implements basic auth, projects and investments with MongoDB (Mongoose).

Quick start

1. Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`.
2. Install dependencies:

```bash
cd services/backend
npm install
```

3. Run dev server:

```bash
npm run dev

Troubleshooting
--

- MongoDB connection refused on Windows: if your local MongoDB is running but the app fails with an error mentioning connection to ::1:27017, your environment may be resolving `localhost` to the IPv6 loopback `::1` while MongoDB is listening on `127.0.0.1`. Two quick fixes:
	- Set MONGODB_URI to use 127.0.0.1 explicitly, e.g. `MONGODB_URI=mongodb://127.0.0.1:27017/RealEstate` in your `.env`.
	- Or let the app normalize `localhost` to `127.0.0.1` (this is already handled by the DB config in recent commits).
```

API overview
- POST /api/auth/register { name, email, password }
- POST /api/auth/login { email, password }
- GET /api/auth/me (requires Bearer token)
- GET /api/projects
- POST /api/projects (auth)
- POST /api/investments { projectId, amount } (auth)

This is a minimal starter. Consider adding validation, rate-limiting, logging, and tests for production use.

API docs
--

Open the Swagger UI at `http://localhost:4000/api-docs` after starting the server to interactively test the endpoints.
