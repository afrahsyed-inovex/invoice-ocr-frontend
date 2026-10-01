# Invoice OCR Studio — Frontend

A React frontend for the two invoice-extraction backends in this folder:

| Page      | Backend                            | How it works                                                                 |
| --------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| `/munhim` | `munhims-backend/poc-munhim`       | **Upload.** The adapter in `scripts/munhim-upload-api` runs his pipeline on the file |
| `/usman`  | `usmans-backend/invoice--usman`    | **Upload.** His API returns the extraction in the response                    |

`/` redirects to `/munhim`. The backend code is used as-is; nothing in either backend folder was changed.
Both pages work the same way: upload an invoice, then see it beside the extracted data. Everything shown
comes from the backend's response.

## Tech stack

React 19 + Vite · React Router · Tailwind CSS v4 · Axios · react-dropzone · lucide-react

## 1. Start the backends

Munhim runs on **port 8000**, and Usman on **8001**.

### Quick start on Windows

```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-backends.ps1
```

This opens one window per backend. It needs the one-time setup below.

### One-time setup

1. Install Tesseract 5: `winget install --id UB-Mannheim.TesseractOCR -e`
2. In **each** backend folder (`munhims-backend/poc-munhim` and `usmans-backend/invoice--usman`):
   ```powershell
   py -3.12 -m venv .venv
   .venv\Scripts\python -m pip install -r requirements.txt
   ```
3. In Munhim's folder only, for uploads: `.venv\Scripts\python -m pip install python-multipart`

### What the script runs

**Munhim (port 8000).** His own API (`invoice_pipeline/api/app.py`) is read-only: it serves results that his CLI
processed beforehand from `data/`. To allow uploads without changing his code, `scripts/munhim-upload-api/app.py`
adds one endpoint, `POST /extract`. It calls his pipeline (`invoice_pipeline.cli.process_one`) on the uploaded
file and returns his `InvoiceRecord` unchanged. The file is processed from a temporary folder that is deleted
afterwards.

```powershell
cd munhims-backend/poc-munhim
$env:CORS_ORIGINS = "http://localhost:5173,http://localhost:8080"
.venv\Scripts\python -m uvicorn app:app --app-dir ..\..\scripts\munhim-upload-api --port 8000
```

His pipeline only reads his fixed invoice template. Other layouts come back as his `failed` record, for
example `TemplateMatchError: Anchor 'Invoice no:' not found`.

**Usman (port 8001).** His API is run as-is. Settings are passed as environment variables, and no `.env` is needed:

```powershell
cd usmans-backend/invoice--usman
$env:PATH = "C:\Program Files\Tesseract-OCR;" + $env:PATH     # his code expects tesseract on PATH
$env:PYTHONPATH = "..\..\scripts\windows-shims"               # Windows stand-in for Linux's fcntl
$env:ENV = "development"; $env:API_KEYS = "dev-key"; $env:LOG_FORMAT = "text"
$env:CORS_ORIGINS = "http://localhost:5173,http://localhost:8080"
.venv\Scripts\python -m uvicorn app.main:app --port 8001
```

His code imports `fcntl`, which exists only on Linux, for his LLM quota file lock. `scripts/windows-shims/fcntl.py`
provides `flock()` with Windows file locks, so his code runs unchanged. DOCX uploads also need LibreOffice,
which is not installed by this setup. On Linux or in his Docker image, none of this is needed (see his README).

## 2. Start the frontend

Requires Node.js 20.19+ or 22.12+.

```bash
npm install
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
npm run dev              # http://localhost:5173
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

### Environment variables

| Variable                  | Default                 | Purpose                                                              |
| ------------------------- | ----------------------- | -------------------------------------------------------------------- |
| `VITE_MUNHIM_API_URL`     | `http://localhost:8000` | Munhim's backend                                                     |
| `VITE_USMAN_API_URL`      | `http://localhost:8001` | Usman's backend                                                      |
| `VITE_USMAN_API_KEY`      | *(empty)*               | Sent as `X-API-Key`; must be one of Usman's `API_KEYS`. Empty if his auth is off |
| `VITE_USMAN_LLM_MODE`     | *(empty)*               | Optional `?llm=auto\|always\|off` for each upload. Empty uses his `LLM_MODE` |
| `VITE_REQUEST_TIMEOUT_MS` | `120000`                | Request timeout (Usman's gunicorn timeout is 120 s)                   |

Vite reads `.env` when it starts and restarts the dev server when the file changes.

## How each page uses its backend

### Munhim — `/munhim`

`POST /extract` (adapter) with `multipart/form-data` field `file`. It returns his `InvoiceRecord`. The cards show
the invoice fields, line items, VAT summary (`summary_rows`), totals and processing info. His `issues`,
`empty_fields` and `repairs` are not shown in the cards; they remain in the **Raw JSON** tab. A `failed` record
shows his `error`.

### Usman — `/usman`

`POST /v1/extract` with `multipart/form-data` field `file` and header `X-API-Key`. It returns `InvoiceData`. The
result shows `meta.status`, `meta.confidence` and his `meta.warnings` codes exactly as returned, and marks
values listed in `meta.llm_fields` with an **AI** badge. Browsers can't preview TIFF or DOCX files.

The frontend does not check file type or size; each backend validates uploads and its error is shown as
`HTTP <status>: <detail>`.

### Shared result view

Both pages show the same result layout: status banner, summary, then **Extracted data** or **Raw JSON**.
**Copy JSON** and **Download JSON** export the backend's raw response, unchanged.

## Code structure

```
src/
  api/          config.js       URLs, paths, upload field, API key — everything backend-specific
                apiError.js     FastAPI {"detail"} errors and network failures -> friendly messages
                httpClient.js   one Axios instance with the timeout
                munhimApi.js    extractInvoice(file) -> adapter POST /extract
                usmanApi.js     extractInvoice(file) -> POST /v1/extract
  mappers/      invoiceShape.js the internal shape both backends are mapped to
                munhimMapper.js Munhim's InvoiceRecord -> internal shape
                usmanMapper.js  Usman's InvoiceData -> internal shape
  hooks/        useInvoiceExtraction, useFilePreview, useCopyToClipboard, useTheme
  components/   UploadExtractPage (shared page), InvoiceResult, ExtractedDataPanel, FieldCard,
                LineItemsTable, TotalsCard, VatBreakdownTable, ReviewCard, InvoiceViewer, UploadZone, ...
  pages/        MunhimPage, UsmanPage (each passes its backend config + extract function)
  utils/        logger, format, fileValidation (preview type only), invoiceFields, json, ...
scripts/
  start-backends.ps1         starts both backends on Windows
  munhim-upload-api/app.py   upload endpoint around Munhim's pipeline
  windows-shims/fcntl.py     lets Usman's Linux code run on Windows
```

UI components never read backend field names. Each mapper converts its backend's JSON into the shape in
`src/mappers/invoiceShape.js`. A field a backend doesn't provide is left out of the shape and hidden in the
UI. For example, Munhim has no due date, and only Usman has payment details. If a backend's contract changes,
update `src/api/config.js` and its mapper.

## Running the frontend with Docker

```bash
docker compose up -d --build     # http://localhost:8080
docker compose down
```

The image builds the app with Node and serves it with nginx (about 50 MB). The backend folders are not part
of it (see `.dockerignore`).

**Settings are applied when the container starts.** `docker/40-write-runtime-config.sh` writes the variables
above into `/config.js`, which the app reads before it boots. After changing `.env`, run `docker compose up -d`;
no rebuild is needed.

**The backends are called by your browser, not by the container.** So `http://localhost:8000` means your
machine, and locally running backends work as they are. Each backend must allow `http://localhost:8080` in
its `CORS_ORIGINS`.

| File                                | Purpose                                                        |
| ----------------------------------- | -------------------------------------------------------------- |
| `Dockerfile`                        | `node:22-alpine` builds, `nginx:1.27-alpine` serves            |
| `docker-compose.yml`                | The `frontend` service, port and settings                      |
| `docker/nginx.conf`                 | Client-side routes, gzip, caching, `/healthz`                  |
| `docker/security-headers.conf`      | Security headers for every location                            |
| `docker/40-write-runtime-config.sh` | Writes `/config.js` from the environment at startup            |

## Troubleshooting

| Message                                     | Fix                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------- |
| "Could not reach …'s backend"               | Backend not running, wrong URL/port, or this origin missing from its `CORS_ORIGINS` |
| `HTTP 401: Invalid or missing API key` (Usman) | Set `VITE_USMAN_API_KEY` to one of Usman's `API_KEYS`            |
| `HTTP 415` / `HTTP 422` (Usman)             | His backend rejected the file type, or found no readable text       |
| `status: failed` + `TemplateMatchError` (Munhim) | The invoice isn't on his fixed template                       |

## Logging

Use `createLogger('scope')` from `src/utils/logger.js`; don't call `console.*` directly (ESLint's
`no-console` enforces this). In development, all levels are printed, including each request and the raw
response; production builds print only warnings and errors.
