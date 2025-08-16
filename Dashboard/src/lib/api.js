const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

async function api(path, { method = "GET", headers, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    // send cookies if your API uses auth sessions:
    // credentials: "include",
    cache: "no-store",
  });

  // handle non-2xx
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const err = await res.json();
      message = err.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  // parse JSON or return empty on 204
  if (res.status === 204) return null;
  return res.json();
}

// --------- exposed functions ----------
export const getUsers = async () => {
  const data = await api("/users");
  // normalize common shapes
  return data.users || data.data || data; 
};

export const getUserById = async (id) => {
  const data = await api(`/users/${id}`);
  return data.user || data.data || data;
};

export const deleteUser = async (id) => {
  return api(`/users/${id}`, { method: "DELETE" });
};
