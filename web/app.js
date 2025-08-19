(() => {
  const CFG = (window.CONFIG || {});
  const API_BASE = CFG.API_BASE || "";           // e.g. "http://localhost:8080"
  const API_KEY  = CFG.PUBLIC_API_KEY || "";     // your public key

  async function api(path, opts = {}) {
    const res = await fetch(API_BASE + path, {
      headers: {
        "Content-Type": "application/json",
        ...(API_KEY ? { "X-API-Key": API_KEY } : {}),
      },
      credentials: "omit",
      ...opts,
    });

    const text = await res.text();
    let data;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    return { ok: res.ok, status: res.status, data };
  }

  const $ = (sel) => document.querySelector(sel);

  function b(v)   { return v ? "✅" : "❌"; }
  function dt(s)  { try { return new Date(s).toLocaleString(); } catch { return s || ""; } }
  function ms(n)  { return Math.round(n || 0); }

  async function loadLatest() {
    const { ok, data } = await api("/api/results/latest");
    const body = $("#resultsBody");
    body.innerHTML = "";
    if (!ok || !Array.isArray(data)) return;

    for (const r of data) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><a href="${r.URL}" target="_blank" rel="noreferrer">${r.URL}</a></td>
        <td>${b(r.Up)}</td>
        <td>${r.HTTPStatus ?? ""}</td>
        <td>${ms(r.LatencyMS)}</td>
        <td>${r.Reason ?? ""}</td>
        <td>${dt(r.CheckedAt)}</td>
      `;
      body.appendChild(tr);
    }
  }

  async function loadTargets() {
    const { ok, data } = await api("/api/targets");
    const body = $("#targetsBody");
    body.innerHTML = "";
    if (!ok || !Array.isArray(data)) return;

    for (const t of data) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.id}</td>
        <td><a href="${t.url}" target="_blank" rel="noreferrer">${t.url}</a></td>
        <td>${dt(t.created_at)}</td>
      `;
      body.appendChild(tr);
    }
  }

  async function addTarget(url) {
    const { ok, status, data } = await api("/api/targets", {
      method: "POST",
      body: JSON.stringify({ url }),
    });
    if (!ok) {
      alert(`Add failed: ${(data && data.error) || `HTTP ${status}`}`);
      return;
    }
    await Promise.all([loadLatest(), loadTargets()]);
  }

  document.addEventListener("DOMContentLoaded", () => {
    const form  = $("#addForm");
    const input = $("#urlInput");

    // IMPORTANT: prevent the full page reload
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const url = input.value.trim();
      if (!url) return;
      addTarget(url);
      input.value = "";
    });

    // Optional: prefill from ?url= (but do NOT auto-submit)
    const qs = new URLSearchParams(location.search);
    if (qs.get("url")) input.value = qs.get("url");

    loadLatest();
    loadTargets();
    setInterval(loadLatest, 15000);
  });
})();
