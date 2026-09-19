const resolveBaseUrl = () => {
  const envUrl =
    import.meta.env.VITE_API_URL ||
    import.meta.env.NEXT_PUBLIC_API_URL ||
    import.meta.env.RENDER_BACKEND_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  // Fallback to relative URL ('') so requests to /api/* are handled by:
  // 1) Vite dev server proxy in development
  // 2) Vercel edge rewrite proxy to Render in production
  return '';
};

export const BASE_URL = resolveBaseUrl();

async function parseResponseData(response) {
  let text = '';
  try {
    text = await response.text();
  } catch {
    text = '';
  }

  const trimmed = (text || '').trim();
  let data = null;

  if (trimmed.length > 0) {
    try {
      data = JSON.parse(trimmed);
    } catch {
      data = null;
    }
  }

  return { text: trimmed, data };
}

async function request(endpoint, options = {}, retries = 2) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('sajilomarts_session');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && token !== 'undefined' && token !== 'null' ? { Authorization: `Bearer ${token}`, 'X-Session-Token': token } : {}),
    ...(options.headers || {})
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  let response;
  try {
    response = await fetch(url, config);
  } catch (networkErr) {
    // If Render backend is spinning up from cold sleep, retry after a short delay
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1800));
      return request(endpoint, options, retries - 1);
    }
    const error = new Error(
      'Backend server is waking up or temporarily unreachable. Free-tier cloud instances take ~30-50s to wake up from idle. Please try again in a moment.'
    );
    error.isNetworkError = true;
    throw error;
  }

  // Handle transient 502/503/504 during Render instance boot
  if ([502, 503, 504].includes(response.status) && retries > 0) {
    await new Promise((r) => setTimeout(r, 2000));
    return request(endpoint, options, retries - 1);
  }

  const { text, data: parsedJson } = await parseResponseData(response);
  const data = parsedJson !== null ? parsedJson : (text ? { raw: text } : {});

  if (!response.ok) {
    let message = data?.message || data?.error || data?.msg;
    if (!message) {
      if (response.status === 404 || response.status === 405) {
        message = `API endpoint unreachable (${response.status}). Please check backend status or VITE_API_URL configuration.`;
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        message = `Backend server is starting up (${response.status}). Render free-tier cold starts may take ~30-60s. Please retry in a moment.`;
      } else {
        message = `HTTP error ${response.status}`;
      }
    }
    const error = new Error(message);
    error.status = response.status;
    error.response = { data, status: response.status };
    throw error;
  }

  // Handle case where HTTP 200 returned HTML instead of JSON (e.g. Vercel SPA index.html fallback for an unproxied route)
  if (parsedJson === null && text && (text.startsWith('<!') || text.startsWith('<html'))) {
    const error = new Error(
      'API returned HTML instead of JSON. Ensure the backend server is running and VITE_API_URL or Vercel rewrite proxy is configured.'
    );
    error.status = response.status;
    error.response = { data: { error: error.message, raw: text }, status: response.status };
    throw error;
  }

  return { data, status: response.status, headers: response.headers };
}

export const api = {
  get: (url, config) => request(url, { method: 'GET', ...config }),
  post: (url, body, config) => request(url, { method: 'POST', body, ...config }),
  put: (url, body, config) => request(url, { method: 'PUT', body, ...config }),
  patch: (url, body, config) => request(url, { method: 'PATCH', body, ...config }),
  delete: (url, config) => request(url, { method: 'DELETE', ...config })
};

export default api;
