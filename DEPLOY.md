# Deploying to Vercel

This project has a Vite frontend and an Express API. Deploy them as two Vercel
projects from the same Git repository.

## 1. Deploy the API

Create a Vercel project and set its **Root Directory** to `server`. Vercel
detects the Express app in `app.js`; no custom build command is needed. Add
these environment variables in the project settings:

- `CLIENT_ORIGIN`: the frontend's production URL, for example
  `https://dictionary-app.vercel.app`
- `DICTIONARY_PROVIDER`: `free` (optional; this is the default)
- `DICTIONARY_API_URL`: `https://api.dictionaryapi.dev/api/v2/entries/en`
  (optional; this is the default)
- `DICTIONARY_TIMEOUT_MS`: `8000` (optional; this is the default)

Deploy the project and check that `https://<api-domain>/api/health` returns
JSON with `"status":"ok"`.

## 2. Deploy the frontend

Create another Vercel project from the same repository and set its **Root
Directory** to `client`. Keep the framework preset as **Vite**. The client
`vercel.json` installs the client dependencies (including Vite) and builds the
`dist` output. Do not set this project's Root Directory to the repository root
or use the client build command in the API project. Add the environment
variable `VITE_API_URL` with the API project's origin, for example
`https://dictionary-api.vercel.app` (no trailing slash), then deploy.

If the frontend project is intentionally rooted at the repository root, the
root `vercel.json` installs the client dependencies and builds `client/dist`.

The frontend project includes `vercel.json` so client-side routes resolve to
the React app when opened directly or refreshed.

## 3. Update the API CORS origin

Set the API project's `CLIENT_ORIGIN` to the frontend's exact production URL
and redeploy the API. The API permits all origins when `CLIENT_ORIGIN` is
unset, which is suitable for local development but should not be used for the
production deployment.

For local development, keep using `npm run dev` from the repository root.
