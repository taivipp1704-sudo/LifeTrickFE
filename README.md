# LifeTrickFE — Túi Khôn

Frontend React/Vite/Tailwind. Bản Vercel dùng chế độ xem thử với 10 bài tham khảo, tìm kiếm/lọc, mô hình 3D, quiz và công cụ SOS. Có thông báo rõ chưa kết nối backend; biểu mẫu đăng nhập/đăng ký bị vô hiệu hóa. Không gửi thông tin tài khoản hoặc giả lập quyết định thẩm định.

## Chạy thử giao diện

```powershell
npm ci
npm run dev -- --mode preview
```

Build xem thử: `npm run build:preview`. Build kết nối backend: `npm run build`.

## Deploy Vercel miễn phí

Import repository này vào Vercel, chọn Hobby, root `.`. Cấu hình vercel.mjs chọn Vite, output build/, và mặc định chạy build xem thử. Không cần secret cho bản xem thử. Không chọn bản dùng thử Pro hoặc thêm dịch vụ trả phí.

## Kết nối backend sau

Backend: https://github.com/taivipp1704-sudo/LifeTrickBE . Backend giữ SQL Server; chưa deploy Render khi chưa có SQL Server cloud.

Sau khi backend đã chạy, xác minh URL của chính bạn. Đặt API_PROXY_TARGET trong Vercel bằng HTTPS origin backend và VITE_PREVIEW_MODE=false, rồi redeploy. Backend cần APP_ORIGINS bằng origin Vercel chính xác. Rewrite /api giữ cookie/CSRF cùng origin; không cần đổi fetch sang cross-site.

Không đặt DB_PASSWORD, GATEWAY_SECRET hoặc mật khẩu admin trong biến VITE_*. Không đưa file .env thật lên Git.

src/models/, src/controllers/, src/views/ chia các phần giao diện. public/legacy/ là cẩm nang ngoại tuyến độc lập; dữ liệu của bản này không đồng bộ lên server. Ảnh bundled dùng minh họa, không phải bằng chứng thực hiện. Các bài mẫu chưa có thẩm định cộng đồng độc lập.
