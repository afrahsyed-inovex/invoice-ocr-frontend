#!/bin/sh
# Runs automatically on container start (nginx image executes /docker-entrypoint.d/*.sh).
# Writes the container's environment variables into config.js, which the app reads
# before it boots, so settings can change without rebuilding the image.
set -eu

CONFIG_FILE=/usr/share/nginx/html/config.js
SETTINGS="VITE_MUNHIM_API_URL VITE_USMAN_API_URL VITE_USMAN_API_KEY VITE_USMAN_LLM_MODE VITE_REQUEST_TIMEOUT_MS"

# Escape backslashes and double quotes so each value is a valid JS string.
escape() {
  printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g'
}

{
  echo "window.__APP_CONFIG__ = {"
  for name in $SETTINGS; do
    value=$(printenv "$name" || true)
    if [ -n "$value" ]; then
      echo "  \"$name\": \"$(escape "$value")\","
    fi
  done
  echo "};"
} > "$CONFIG_FILE"

echo "runtime-config: wrote $CONFIG_FILE"
cat "$CONFIG_FILE"
