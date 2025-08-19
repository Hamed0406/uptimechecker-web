# uptimechecker-web# UptimeChecker Web (SPA)

Minimal, zero-build single-page UI for UptimeChecker.

## How it connects

- This container joins the backend's Docker network and talks to the API at `http://api:8080`.
- At runtime, it writes `window.UC_CONFIG.API_BASE_URL` via `API_BASE_URL` env.

## Prereqs

- Backend stack running first (API + DB) so the `uptime-checker_default` network exists:
  ```bash
  # in your backend repo
  make up
  docker network ls | grep uptime-checker_default
