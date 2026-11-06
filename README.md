# Campus Events

Starter project for **Advanced Development** (Thomas More – International Experience Design, year 3).

A small but complete web app: students browse campus events and register for them.

- **api/** : REST API: Node.js, Express 5, Sequelize + SQLite, Zod
- **web/** : frontend: Vue 3, Vue Router, Vite

It works out of the box, and it has tests. It is also the kind of code you will meet in your first job:
the whole API is one long file. Your job is to **clean it up, ship it to production, fix it and add the hard
parts**

## Quick start

You need **Node.js 22.12 or newer** (`node -v`) and Git.

```bash
git clone <your-fork-url>
cd campus-events
npm install        # installs api + web in one go
npm run dev        # starts both
```

Open **http://localhost:5173**. The API runs on http://localhost:3000/api.
The first start fills the database with demo events. `npm run seed` resets it.

Later parts need a few services. You never need them to run the tests.

| Service | Local | Setting in `api/.env` |
|---|---|---|
| RabbitMQ | `docker compose up -d rabbitmq` | `AMQP_URL` |
| Redis | `docker compose up -d redis` | `REDIS_URL` |
| Identity provider | a free Auth0 tenant | `AUTH_ISSUER`, `AUTH_AUDIENCE`, `AUTH_CLIENT_ID` |

## Scripts (run from the root folder)

| Script | What it does |
|---|---|
| `npm run dev` | API + frontend with auto-reload |
| `npm test` | All tests: API (node:test + supertest) and frontend (Vitest) |
| `npm run lint` | ESLint for the whole project |
| `npm run check` | Lint + tests. **The pipeline runs exactly this. It must be green before you hand in.** |
| `npm run seed` | Reset the database to the demo data |
| `npm run build` | Production build of the frontend |

## How it fits together

```
browser ──► web (Vite, :5173) ──/api/*──► api (Express, :3000) ──► SQLite (api/data/events.sqlite)
```

In development Vite forwards every `/api/...` request to the API (see `web/vite.config.js`),
so the browser only talks to one address and you don't need CORS.

### api/

**Today** the whole API lives in one file:

```
api/src/app.mjs      settings, database + models, validation, routes, business rules, error handling
api/src/server.mjs   starts the app (and adds demo data to an empty database)
api/src/seed.mjs     npm run seed: reset the database
```

Prefered:

```
routes/        URL + validation → controller        (no logic)
controllers/   HTTP in/out, picks the status code    (thin)
services/      business rules, throws AppErrors      (no Express, no SQL)
repositories/  data access via Sequelize             (no rules)
models/ db/    tables, connection, demo data
config/        the only place that reads process.env
```

The integration tests in `api/tests/integration` only talk HTTP. They pass before your refactoring,
and they must still pass after it, without changing them.

| Method | URL | |
|---|---|---|
| GET | `/api/health` | Health check |
| GET / POST | `/api/events` | List / create |
| GET / PATCH / DELETE | `/api/events/:id` | One event (incl. `registered`, `spotsLeft`) |
| GET / POST | `/api/events/:id/registrations` | List / register `{ name, email }` |
| GET | `/api/stats` | Occupancy per event |

Errors always have this shape: `{ "error": { "code", "message", "details?" } }`.

### web/

```
api/          client.js (fetch + ApiError) and events.js (one function per endpoint)
views/        one component per page, registered in router.js
components/   reusable pieces: EventCard, SeatMeter, RegistrationForm, ErrorMessage
styles.css    design tokens at the top, change those first
```

## Assignment implementation

Live application: [https://campus-events-cctm.onrender.com](https://campus-events-cctm.onrender.com)

- The API is split into routes, controllers, services, repositories, models, configuration and middleware.
- GET results are cached in memory for 30 seconds. Every successful create, update, delete or registration clears the cache so later reads cannot return stale data.
- Nodemailer sends a confirmation after the registration is stored. SMTP errors are logged and never roll back or hide the successful registration.
- `render.yaml` and production static-file serving allow the Vue app and API to run as one Render service.

### Stack Overflow references used

- [ExpressJS: How to cache on demand](https://stackoverflow.com/questions/69964270/expressjs-how-to-cache-on-demand) — used for the cache-aside pattern: read cached GET data, populate on a miss, and explicitly clear cached data after mutations.
- [Handle and pass errors from Nodemailer sendMail](https://stackoverflow.com/questions/66912464/handle-and-pass-errors-from-nodemailer-sendmail) — used to confirm that `sendMail()` returns a promise and that `await` plus `try/catch` reliably handles SMTP failures.

### Deployment note

The default Render free configuration stores SQLite in `/tmp`, so demo data can reset when the service restarts. For persistent production data, attach a Render disk or use a hosted SQL database and update `DB_STORAGE`.

Render free web services block the standard SMTP ports 25, 465 and 587. Configure Resend SMTP on port 2587 so Nodemailer can send registration confirmations from the deployed application. Store the full connection string only in Render's private `SMTP_URL` environment variable; never commit SMTP credentials.
