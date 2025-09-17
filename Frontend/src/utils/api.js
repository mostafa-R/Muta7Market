const BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

async function request(path, { method = "GET", headers, body } = {}) {
  const isFormData = body instanceof FormData;

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(headers || {}),
      },
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });

    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const err = await res.json();
        message = err.message || message;
      } catch (_) {}
      throw new Error(message);
    }

    if (res.status === 204) return null;
    return res.json();
  } catch (error) {
    console.error("API call failed:", error);
    throw error;
  }
}

const api = {
  get: (path, options) => request(path, { ...options, method: "GET" }),
  post: (path, body, options) =>
    request(path, { ...options, method: "POST", body }),
  patch: (path, body, options) =>
    request(path, { ...options, method: "PATCH", body }),
  put: (path, body, options) =>
    request(path, { ...options, method: "PUT", body }),
  delete: (path, options) => request(path, { ...options, method: "DELETE" }),
};

export { api };
