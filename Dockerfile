# ---- Build stage: install dependencies and compile the static site ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first so this layer is cached until package files change.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- Runtime stage: serve the static files with nginx ----
FROM nginx:1.27-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY docker/40-write-runtime-config.sh /docker-entrypoint.d/40-write-runtime-config.sh
# Strip Windows line endings in case the script was checked out with CRLF.
RUN sed -i 's/\r$//' /docker-entrypoint.d/40-write-runtime-config.sh \
    && chmod +x /docker-entrypoint.d/40-write-runtime-config.sh

COPY --from=build /app/dist /usr/share/nginx/html

# Defaults; override with -e or docker-compose.yml.
ENV VITE_MUNHIM_API_URL=http://localhost:8000 \
    VITE_USMAN_API_URL=http://localhost:8001 \
    VITE_USMAN_API_KEY= \
    VITE_USMAN_LLM_MODE= \
    VITE_REQUEST_TIMEOUT_MS=120000

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
