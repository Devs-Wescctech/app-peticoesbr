// src/api/base44Client.js
// -----------------------------------------------------------------------------
// TEMP: Base44 removido. Stub de API + "auth" local para evitar erros de build.
// Use VITE_API_URL (quando sua API própria estiver rodando). Se vazio, chama
// caminhos relativos (vai falhar em runtime se você chamar endpoints inexistentes).
// -----------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(method, url, { params, body, headers } = {}) {
  const qs = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(BASE_URL + url + qs, {
    method,
    headers: { 'Content-Type': 'application/json', ...(headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} on ${url}: ${text}`);
  }

  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// API “estilo axios”
export const api = {
  get: (url, opts) => request('GET', url, opts),
  post: (url, opts) => request('POST', url, opts),
  put: (url, opts) => request('PUT', url, opts),
  patch: (url, opts) => request('PATCH', url, opts),
  delete: (url, opts) => request('DELETE', url, opts),
};

// “Auth” local fake (sem Base44)
export const auth = {
  isAuthenticated: () => true,
  getUser: () => ({ name: 'dev', email: 'dev@local' }),
  login: async () => true,
  logout: async () => true,
};

export default api; // para quem usava import default
