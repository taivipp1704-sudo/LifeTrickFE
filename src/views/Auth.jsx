import React, { useState } from "react";
import { api } from "../models/api";
import { PREVIEW_MODE, PREVIEW_MESSAGE } from "../models/preview";
import { Button, Field, ErrorBox } from "./shared";
import { ShieldCheck, ArrowRight } from "lucide-react";
export default function Auth({ app, register = false }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const d = Object.fromEntries(new FormData(e.currentTarget));
    try {
      if (register) {
        await api("/auth/register", { method: "POST", body: d });
        app.notify("Đã tạo tài khoản. Hãy đăng nhập.");
        location.hash = "/login";
      } else {
        await app.signIn(d);
        location.hash = "/manage";
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-grid">
      <div className="auth-story">
        <ShieldCheck size={34} />
        <h1>
          Một tài khoản.
          <br />
          Cả túi kỹ năng.
        </h1>
        <p>
          Lưu mẹo trên máy chủ, tiếp tục học từ thiết bị khác và chia sẻ những
          kinh nghiệm đã được thẩm định.
        </p>
        <img src="/assets/forest.jpg" alt="Ánh nắng trong rừng" />
      </div>
      <form className="panel" onSubmit={submit}>
        <div className="tabs">
          <a className={!register ? "active" : ""} href="#/login">
            Đăng nhập
          </a>
          <a className={register ? "active" : ""} href="#/register">
            Tạo tài khoản
          </a>
        </div>
        <h2>
          {register
            ? "Bắt đầu hành trình của bạn."
            : "Mở lại túi kỹ năng của bạn."}
        </h2>
        <p className="muted mt-2">
          {register
            ? "Tài khoản mới có quyền thành viên."
            : "Dùng email và mật khẩu đã đăng ký."}
        </p>
        <ErrorBox message={error} />
        {PREVIEW_MODE && (
          <p className="notice">
            {PREVIEW_MESSAGE} Biểu mẫu này chỉ dùng để xem giao diện.
          </p>
        )}
        {register && (
          <Field label="Tên hiển thị">
            <input
              name="name"
              disabled={PREVIEW_MODE}
              required
              maxLength={80}
              autoComplete="name"
            />
          </Field>
        )}
        <Field label="Email">
          <input
            name="email"
            disabled={PREVIEW_MODE}
            type="email"
            required
            maxLength={254}
            autoComplete="email"
          />
        </Field>
        <Field
          label="Mật khẩu"
          hint={register ? "Từ 12 ký tự, tối đa 72 byte UTF-8." : ""}
        >
          <input
            name="password"
            disabled={PREVIEW_MODE}
            type="password"
            required
            minLength={register ? 12 : 1}
            maxLength={72}
            autoComplete={register ? "new-password" : "current-password"}
          />
        </Field>
        <Button busy={busy} disabled={PREVIEW_MODE} type="submit">
          {register ? "Tạo tài khoản" : "Đăng nhập"}
          <ArrowRight size={17} />
        </Button>
        <p className="small muted mt-5">
          Dùng máy tính chung? Hãy đăng xuất sau khi sử dụng.
        </p>
      </form>
    </section>
  );
}
