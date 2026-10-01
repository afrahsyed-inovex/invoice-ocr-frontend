# Invoice OCR Studio — Frontend

A React frontend for comparing two invoice-extraction backends (Munhim's and Usman's).
Upload an invoice image or PDF, and the page shows the invoice next to the data the backend extracted.

- `/munhim` sends uploads to Munhim's backend (default `http://localhost:8000`)
- `/usman` sends uploads to Usman's backend (default `http://localhost:8001`)
- `/` redirects to `/munhim`

Both pages use the same `InvoiceWorkspace` component. Each page only passes in a different API module.

## Tech stack

React 19 + Vite · React Router · Tailwind CSS v4 · Axios · react-dropzone · lucide-react

## Setup

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
npm run dev              # http://localhost:5173
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## Environment variables

| Variable                  | Default                 | Purpose                                                  |
| ------------------------- | ----------------------- | -------------------------------------------------------- |
| `VITE_USE_MOCK`           | `true`                  | `true` = use bundled mock data, `false` = call backends  |
| `VITE_MUNHIM_API_URL`     | `http://localhost:8000` | Munhim's backend base URL (no trailing slash)            |
| `VITE_USMAN_API_URL`      | `http://localhost:8001` | Usman's backend base URL                                 |
| `VITE_REQUEST_TIMEOUT_MS` | `60000`                 | Axios request timeout in milliseconds                    |

Vite reads `.env` only when it starts, so **restart `npm run dev` after editing it**. For Docker, see
[Running with Docker](#running-with-docker).

## How mock mode works

When `VITE_USE_MOCK=true` (or the variable is missing):

- Uploading any valid file returns a mock invoice after a short fake delay (`MOCK_DELAY_MS` in `src/api/config.js`).
  Each upload returns the next invoice in the list.
- Mock data lives in `src/mock/`, with a separate set per backend. Each set has 5 invoices: complete ones,
  partial ones, different numbers of line items, extra fields, and one where nothing could be extracted.
- The mocks are written in each backend's **raw** response format and pass through the real mappers, so the
  mapping code is tested in mock mode too.
- To test error handling, upload a file whose name contains `timeout` (simulated timeout) or `error`
  (simulated HTTP 500).

**"Try a sample invoice"** works in both modes. It picks a mock invoice, draws it as an SVG image for the
preview, and shows its extracted data. Use it to demo the UI without a real invoice or backend.

## Connecting a real backend

1. **Turn off mock mode** in `.env`:
   ```env
   VITE_USE_MOCK=false
   VITE_MUNHIM_API_URL=http://localhost:8000
   VITE_USMAN_API_URL=http://localhost:8001
   ```
2. **Check the request contract** in `src/api/config.js`:
   - `EXTRACT_ENDPOINT` (default `/extract`): the path added to each base URL
   - `FILE_FIELD_NAME` (default `file`): the multipart/form-data field that holds the upload

   The frontend sends `POST {baseUrl}/extract` with `multipart/form-data` and expects a JSON response.
3. **Update the mapper** for that backend so it reads the real response fields:
   - `src/mappers/munhimMapper.js` → `normalizeMunhimInvoice`
   - `src/mappers/usmanMapper.js` → `normalizeUsmanInvoice`

   Each mapper has a comment at the top describing the response format it currently expects. Any response
   field the mapper doesn't recognise is shown in the **Other fields** card, so you can see what still needs mapping.
4. **Optionally update the mocks** in `src/mock/` to match the real format, so mock mode stays realistic.
5. **Enable CORS on the backend.** The browser blocks the request unless the backend allows the frontend's
   origin: `http://localhost:5173` for `npm run dev`, and `http://localhost:8080` for Docker. With FastAPI, for example:
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["http://localhost:5173", "http://localhost:8080"],
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

UI components never read backend field names. They only use the internal shape described below.

### Internal invoice shape

Every mapper must return this object:

```js
{
  invoiceNumber, invoiceDate, dueDate, currency,
  vendor: { name, address, email, phone },
  customer: { name, address },
  lineItems: [{ description, quantity, unitPrice, amount }],
  subtotal, tax, total,                 // numbers
  confidence: { 'invoiceNumber': 0.98, 'vendor.name': 0.91, ... },   // 0–1, optional
  extra: { anyOtherField: value },
  status: 'success' | 'partial' | 'failed'
}
```

- Missing values are `null` and display as "—".
- `status` is worked out in `src/mappers/invoiceShape.js` (`resolveStatus`). It combines the status the
  backend reports with a check for missing key fields, and keeps the worse of the two.
- Confidence badges are green (≥ 90%), yellow (≥ 70%) or red (below 70%), and appear only when a score exists.

### Error handling

`src/api/apiError.js` turns failures into user-friendly messages: network/CORS errors, timeouts, 404 (wrong
endpoint), 413, 400/415/422 (using `detail`/`message` from the response body when there is one), 5xx, and
responses that are not valid JSON. A mapper that throws is reported as "unexpected format", and the full
details are logged.

## Running with Docker

The image builds the app with Node and serves the static files with nginx (about 50 MB). It needs Docker
Desktop, or any Docker engine with Compose v2.

```bash
docker compose up -d --build     # http://localhost:8080
docker compose logs -f           # view logs
docker compose down              # stop
```

### Configuration

The container reads the same variables as `.env`. Compose picks up `.env` automatically, and
`docker-compose.yml` has defaults for every variable. `FRONTEND_PORT` changes the host port (default `8080`).

**Settings are applied when the container starts, not when the image is built.** At startup,
`docker/40-write-runtime-config.sh` writes the environment variables into `/config.js`, and the app reads that
file before it boots. To switch backends or turn off mock mode, change `.env` and run `docker compose up -d`.
No rebuild is needed.

Without Compose:

```bash
docker build -t invoice-ocr-frontend .
docker run -d -p 8080:80 -e VITE_USE_MOCK=false -e VITE_MUNHIM_API_URL=http://localhost:8000 invoice-ocr-frontend
```

In `npm run dev`, `public/config.js` is an empty placeholder, so the values from `.env` are used as before.

### Reaching the backends from Docker

The API requests are sent by **your browser**, not by the container. `http://localhost:8000` therefore means
port 8000 on your machine, and the backends running locally work as they are. Two things to remember:

- Add `http://localhost:8080` to each backend's CORS allowed origins (see "Connecting a real backend").
- If the backends are put in containers later, publish their ports to the host (for example `8000:8000`).
  Docker service names such as `http://munhim-backend:8000` won't work, because the browser can't resolve them.

### What's in the image

| File                                  | Purpose                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| `Dockerfile`                          | Multi-stage: `node:22-alpine` builds, `nginx:1.27-alpine` serves   |
| `docker-compose.yml`                  | One `frontend` service with port and environment settings          |
| `docker/nginx.conf`                   | Routing for `/munhim` and `/usman`, gzip, caching, `/healthz`      |
| `docker/security-headers.conf`        | Security headers included in every nginx location                  |
| `docker/40-write-runtime-config.sh`   | Writes `/config.js` from environment variables at startup          |
| `.dockerignore`                       | Keeps `node_modules`, `dist` and `.env` out of the build context   |

Hashed files in `/assets/` are cached for a year. `index.html` and `config.js` are never cached, so a new
deployment or a settings change shows up on the next page load. The container reports itself healthy through
Docker's `HEALTHCHECK`, which calls `/healthz`.

## Project structure

```
docker/         nginx.conf, security-headers.conf, 40-write-runtime-config.sh
public/         config.js (runtime settings placeholder), favicon.svg
src/
  api/          config.js (env, endpoint, field name), apiError.js, httpClient.js,
                createExtractionApi.js (shared mock/real logic), munhimApi.js, usmanApi.js
  mappers/      invoiceShape.js (shape + status), mapperUtils.js, munhimMapper.js, usmanMapper.js
  mock/         munhimMockResponses.js, usmanMockResponses.js
  hooks/        useInvoiceExtraction, useFilePreview, useCopyToClipboard, useTheme
  components/   InvoiceWorkspace, UploadZone, InvoiceViewer, ExtractedDataPanel, FieldCard,
                LineItemsTable, TotalsCard, ConfidenceBadge, StatusBanner, SkeletonLoader,
                EmptyState, ResultActions, Navbar, ThemeToggle, Layout, ErrorBoundary, ui/
  pages/        MunhimPage.jsx, UsmanPage.jsx
  utils/        logger.js, format.js, fileValidation.js, invoiceFields.js, json.js,
                sampleInvoiceImage.js, delay.js, cn.js
```

## Logging

Use `createLogger('scope')` from `src/utils/logger.js`. Don't call `console.*` directly; ESLint's
`no-console` rule enforces this. In development, all levels (`debug`, `info`, `warn`, `error`) are printed.
Production builds print only `warn` and `error`. In dev you can see each upload, the request URL, the raw
response and the mapped result in the browser console.

## File limits

Accepted file types are PNG, JPG/JPEG, WEBP and PDF, up to 10 MB, one file at a time. To change these, edit
`src/utils/fileValidation.js`.
