import { PREVIEW_MODE, previewApi } from "./preview";
let csrf = null;
let expiredHandler = () => {};
export function onExpired(handler) {
  expiredHandler = handler;
}
export async function refreshCsrf() {
  if (PREVIEW_MODE) return null;
  const r = await fetch("/api/auth/csrf", {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!r.ok) throw new Error("Không kết nối được máy chủ.");
  csrf = await r.json();
  return csrf;
}
export async function api(path, options = {}) {
  const method = options.method || "GET",
    headers = new Headers(options.headers);
  if (PREVIEW_MODE) return previewApi(path, method);
  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    if (!csrf) await refreshCsrf();
    headers.set(csrf.headerName, csrf.token);
  }
  let body = options.body;
  if (body && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(body);
  }
  const r = await fetch("/api" + path, {
    ...options,
    method,
    headers,
    body,
    credentials: "same-origin",
    cache: "no-store",
  });
  let value;
  try {
    value = await r.json();
  } catch {
    value = { message: "Máy chủ trả về dữ liệu không hợp lệ." };
  }
  if (!r.ok) {
    if (r.status === 401) expiredHandler();
    const e = new Error(value.message || "Yêu cầu chưa hoàn tất.");
    e.status = r.status;
    throw e;
  }
  return value;
}
export const login = async (body) => {
  const r = await api("/auth/login", { method: "POST", body });
  await refreshCsrf();
  return r;
};
export const logout = async () => {
  await api("/auth/logout", { method: "POST" });
  await refreshCsrf();
};
