# Users API

A REST API built with Express 5 and SQLite, with JWT authentication, schema validation and an automated test suite. I built it to practice backend fundamentals end to end: validation, auth, persistence, CORS and testing.

## Tech stack

- **Runtime:** Node.js (ES modules), Express 5
- **Database:** SQLite via `better-sqlite3`
- **Validation:** Zod 4
- **Auth:** JSON Web Tokens (`jsonwebtoken`), password hashing with `bcryptjs`
- **Testing:** Vitest and Supertest

## Getting started

Requires Node.js 20.6 or later.

```bash
git clone https://github.com/JoseCarlosAispuro/users-api.git
cd users-api
npm install
cp .env.example .env   # then fill in the values
npm run dev
```

The server runs on `http://localhost:3000`. Use `npm start` to run it without file watching.

### Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `JWT_SECRET` | Yes | Secret used to sign tokens. The server exits on startup if it is missing. |
| `CORS_ORIGIN` | Yes | Comma-separated list of allowed origins, e.g. `http://localhost:5173`. No trailing slash. |
| `JWT_EXPIRES_IN` | No | Token lifetime. Defaults to `15min`. |

## Running the tests

```bash
npm test
```

32 tests cover the routes, validation, auth flows and CORS. Tests run against an in-memory SQLite database that is reset between tests.

Tests use their own environment values (defined in `vitest.config.js`), so no `.env` file is needed to run them.

## API

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | No | Create an account |
| POST | `/auth/login` | No | Log in and receive a JWT |
| GET | `/auth/me` | Yes | Return the id of the authenticated user |
| GET | `/users` | No | List users. Optional `?name=` filter |
| GET | `/users/:id` | No | Get one user |
| POST | `/users` | Yes | Create a user |
| PUT | `/users/:id` | Yes | Update a user |
| DELETE | `/users/:id` | Yes | Delete a user |

Protected routes expect the header `Authorization: Bearer <token>`.

### Example

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "jose", "password": "123456789"}'
```

## Design decisions

- **Validation at the edge.** Zod schemas validate body, params and query before the controllers run. Unknown keys are stripped, and numeric ids are checked as text first, because `z.coerce.number()` would accept values like `1e1`.
- **No user enumeration on login.** An unknown username and a wrong password return the same `401` message. When the user does not exist, the server still runs a bcrypt comparison against a dummy hash so response times stay similar.
- **Passwords are limited to 72 bytes, not characters.** bcrypt silently ignores anything past 72 bytes, and a multi-byte character such as an emoji counts for more than one. The schema validates with `Buffer.byteLength`.
- **Unique constraint instead of check-then-insert.** Duplicate registrations are caught from the database error and return `409`, which avoids race conditions.
- **Fail closed.** The server will not start without `JWT_SECRET` or `CORS_ORIGIN`. Tokens are verified with the algorithm pinned to HS256 and always expire.
- **Explicit CORS allow-list.** The allowed origins come from an environment variable. I tested the allowed origin, the preflight response and a disallowed origin.
- **Tests that can fail.** I checked key tests by temporarily breaking the code (for example, changing the token lifetime or the `req.user` assignment) to confirm the suite catches it.

## Possible improvements

- Refresh tokens and logout
- Rate limiting on the auth routes
- Migrate to PostgreSQL
- TypeScript

## Author

José Carlos Aispuro Beltrán · [jocaibe.com](https://jocaibe.com) · [LinkedIn](https://www.linkedin.com/in/jc-aispuro-beltran/)