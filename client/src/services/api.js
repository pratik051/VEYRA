const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('sajilomarts_session');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && token !== 'undefined' && token !== 'null' ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(url, config);
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || data.error || `HTTP error ${response.status}`);
    error.response = { data, status: response.status };
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
