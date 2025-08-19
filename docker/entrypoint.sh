#!/usr/bin/env sh
set -eu

# env -> config.js for the browser
API_BASE="${API_BASE:-http://localhost:8080}"
PUBLIC_API_KEY="${PUBLIC_API_KEY:-}"
ADMIN_API_KEY="${ADMIN_API_KEY:-}"

cat > /usr/share/nginx/html/config.js <<EOF
window.CONFIG = {
  API_BASE: "${API_BASE}",
  PUBLIC_API_KEY: "${PUBLIC_API_KEY}",
  ADMIN_API_KEY: "${ADMIN_API_KEY}"
};
EOF

# hand off to nginx
exec nginx -g "daemon off;"
