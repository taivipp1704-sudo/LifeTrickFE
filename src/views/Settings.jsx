import React, { useState } from "react";
import { api } from "../models/api";
import { Field, Button, ErrorBox } from "./shared";
export default function Settings({ app }) {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Tài khoản của bạn</h1>
          <p>Thay đổi tên hiển thị hoặc cập nhật mật khẩu.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              app.setUser(
                await api("/auth/profile", {
                  method: "PATCH",
                  body: { name: new FormData(e.currentTarget).get("name") },
                }),
              );
              app.notify("Đã cập nhật hồ sơ.");
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>Tên hiển thị</h2>
          <Field label="Tên của bạn">
            <input
              name="name"
              defaultValue={app.user.display_name}
              maxLength={80}
              required
            />
          </Field>
          <Button busy={busy}>Lưu thay đổi</Button>
        </form>
        <form
          className="panel"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const f = new FormData(e.currentTarget);
            try {
              await api("/auth/password", {
                method: "POST",
                body: { oldPassword: f.get("old"), newPassword: f.get("new") },
              });
              app.setUser(null);
              app.notify(
                "Đã đổi mật khẩu và thu hồi các phiên. Hãy đăng nhập lại.",
              );
              location.hash = "/login";
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>Đổi mật khẩu</h2>
          <Field label="Mật khẩu hiện tại">
            <input
              name="old"
              type="password"
              autoComplete="current-password"
              required
            />
          </Field>
          <Field label="Mật khẩu mới, từ 12 ký tự">
            <input
              name="new"
              type="password"
              minLength={12}
              maxLength={72}
              autoComplete="new-password"
              required
            />
          </Field>
          <Button busy={busy}>Đổi mật khẩu</Button>
        </form>
      </div>
      <ErrorBox message={error} />
    </>
  );
}
