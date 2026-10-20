import referenceTips from "./preview-tips.json";

export const PREVIEW_MODE = import.meta.env.VITE_PREVIEW_MODE === "true";
export const PREVIEW_MESSAGE =
  "Bản xem thử chưa kết nối máy chủ. Đăng nhập, tải tệp và gửi thẩm định sẽ được bật khi backend sẵn sàng.";

export function previewApi(path, method) {
  const route = path.split("?")[0];
  const tips = referenceTips.map((t) => ({
    ...t,
    verification: "REFERENCE_GUIDE",
    published_at: "2026-10-19T00:00:00Z",
    media_id: null,
    reviewer_name: null,
  }));
  if (method === "GET" && route === "/tips")
    return { items: tips, total: tips.length };
  if (method === "GET" && route.startsWith("/tips/")) {
    const tip = tips.find((t) => t.id === route.slice("/tips/".length));
    if (tip) return tip;
  }
  const error = new Error(
    route === "/auth/me" ? "Chưa đăng nhập." : PREVIEW_MESSAGE,
  );
  error.status =
    route === "/auth/me"
      ? 401
      : route.startsWith("/tips/") && method === "GET"
        ? 404
        : 503;
  throw error;
}
