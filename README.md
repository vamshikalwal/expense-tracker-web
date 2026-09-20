# Expense Tracker

A premium React/Vite expense tracker frontend for the Expense Tracker backend API.

## Run locally

```bash
npm install
copy .env.example .env
npm run dev
```

The Vite app runs at `http://localhost:5173` by default. The API base URL is configured with `VITE_API_BASE_URL` and defaults to `http://localhost:8080`.

## Available scripts

- `npm run dev` starts the development server.
- `npm run build` creates a production build.
- `npm run preview` serves the production build locally.
- `npm run lint` runs Oxlint.

## API expectations

The backend should expose the `/auth`, `/transactions`, `/banks`, `/cards`, `/budgets`, and `/reports` routes described in the project brief. After login, the returned JWT is stored in `localStorage` and attached to every API request as `Authorization: Bearer <token>`. A 401 response clears the local session and returns the user to the login screen.

## Structure

- `src/api` contains the Axios client and endpoint modules.
- `src/context` contains auth state and session handling.
- `src/routes` contains protected and public route definitions.
- `src/components/common` contains the shell, controls, cards, modals, and state views.
- `src/pages` contains auth, dashboard, transactions, management, budget, report, and settings screens.
- `src/utils` contains date, currency, response, and error helpers.
