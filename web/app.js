// Load runtime config from config.js
const CFG = window.CONFIG || {};
const API_BASE   = (CFG.API_BASE || "http://localhost:8080").trim();
const PUBLIC_KEY = (CFG.PUBLIC_API_KEY || "").trim();
const ADMIN_KEY  = (CFG.ADMIN_API_KEY  || "").trim();

// Show what the page will use
const statusDiv = document.getElementById("status");
statusDiv.innerHTML = `
  API: <code>${API_BASE}</code> · PUBLIC key: <strong>${PUBLIC_KEY ? "present" : "missing"}</strong> ·
  ADMIN key: <strong>${ADMIN_KEY ? "present" : "missing"}</strong>
`;
console.info("[UptimeChecker Web] CONFIG:", {
  API_BASE,
  PUBLIC_KEY_present: PUBLIC_KEY.length > 0,
  ADMIN_KEY_present: ADMIN_KEY.length > 0,
});

const json = (r) => r.json();
const headersWith = (key) => ({
  "Content-Type": "application/json",
  "X-API-Key": key,
});

function td(text) { const e = document.createElement("td"); e.textContent = text; return e; }
function tdLink(href, text) {
  const a = document.createElement("a"); a.href = href; a.target = "_blank"; a.rel = "noreferrer"; a.textContent = text || href;
  const e = document.createElement("td"); e.appendChild(a); return e;
}

async function loadLatest() {
  try {
    const res = await fetch(`${API_BASE}/api/results/latest`, { headers: headersWith(PUBLIC_KEY) });
    if (!res.ok) throw new Error(`latest ${res.status}`);
    const rows = await json(res);
    const tbody = document.querySelector("#latest-table tbody");
    tbody.innerHTML = "";
    rows.forEach(r => {
      const tr = document.createElement("tr");
      tr.appendChild(tdLink(r.URL));
      tr.appendChild(td(r.Up ? "✅" : "❌"));
      tr.appendChild(td(r.HTTPStatus ?? ""));
      tr.appendChild(td(Math.round(r.LatencyMS ?? 0)));
      tr.appendChild(td(r.Reason ?? ""));
      tr.appendChild(td(new Date(r.CheckedAt).toLocaleString()));
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("loadLatest failed:", e);
  }
}

async function loadTargets() {
  try {
    const res = await fetch(`${API_BASE}/api/targets`, { headers: headersWith(PUBLIC_KEY) });
    if (!res.ok) throw new Error(`targets ${res.status}`);
    const rows = await json(res);
    const tbody = document.querySelector("#targets-table tbody");
    tbody.innerHTML = "";
    rows.forEach(t => {
      const tr = document.createElement("tr");
      tr.appendChild(td(t.id));
      tr.appendChild(tdLink(t.url));
      tr.appendChild(td(new Date(t.created_at).toLocaleString()));
      tbody.appendChild(tr);
    });
  } catch (e) {
    console.error("loadTargets failed:", e);
  }
}

async function addTarget(url) {
  const keyToUse = ADMIN_KEY || PUBLIC_KEY; // your API requires ADMIN for POST
  console.info("[UptimeChecker Web] POST /api/targets using key:",
               keyToUse === ADMIN_KEY ? "ADMIN_KEY" : "PUBLIC_KEY");

  try {
    const res = await fetch(`${API_BASE}/api/targets`, {
      method: "POST",
      headers: headersWith(keyToUse),
      body: JSON.stringify({ url }),
    });

    if (res.status === 409) { alert("Already exists."); return; }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`${res.status} ${body}`);
    }
    await Promise.all([loadLatest(), loadTargets()]);
  } catch (e) {
    console.error("addTarget failed:", e);
    alert("Add failed: forbidden");
  }
}

document.getElementById("add-form").addEventListener("submit", (ev) => {
  ev.preventDefault();
  const url = document.getElementById("url-input").value.trim();
  if (!url) return;
  addTarget(url);
  ev.target.reset();
});

loadLatest();
loadTargets();
setInterval(loadLatest, 15000);
