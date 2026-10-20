import React, { useState } from "react";
import { api } from "../models/api";
import { useRemote, Loading, ErrorBox, Button, Empty, Field } from "./shared";
export default function Admin({ app }) {
  const [tab, setTab] = useState("users");
  const r = useRemote(() => api("/admin/" + tab), [tab]);
  async function role(u, patch) {
    try {
      await api("/admin/users/" + u.id, {
        method: "PATCH",
        body: { role: u.role, active: u.active, ...patch },
      });
      await r.refresh();
      app.notify("Đã cập nhật quyền và thu hồi các phiên đăng nhập cũ.");
    } catch (e) {
      app.notify(e.message);
    }
  }
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Quản trị cộng đồng</h1>
          <p>Phân quyền, xem lịch sử thao tác và tiếp nhận góp ý.</p>
        </div>
        <Button variant="secondary" onClick={r.refresh}>
          Làm mới
        </Button>
      </div>
      <div className="tabs">
        {[
          ["users", "Tài khoản"],
          ["audit", "Nhật ký bảo mật"],
          ["feedback", "Góp ý nội dung"],
          ["tips", "Đã xuất bản"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "active" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <ErrorBox message={r.error} />
      {r.loading ? (
        <Loading />
      ) : (
        <section className="panel overflow-auto">
          {tab === "users" ? (
            <table>
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {r.data?.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <strong>{u.display_name}</strong>
                      <p className="small muted">{u.email}</p>
                    </td>
                    <td>
                      <select
                        aria-label={"Vai trò của " + u.email}
                        value={u.role}
                        disabled={u.id === app.user.id}
                        onChange={(e) => role(u, { role: e.target.value })}
                      >
                        {[
                          ["MEMBER", "Thành viên"],
                          ["REVIEWER", "Người thẩm định"],
                          ["ADMIN", "Quản trị viên"],
                        ].map(([v, label]) => (
                          <option key={v} value={v}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        disabled={u.id === app.user.id}
                        onClick={() => role(u, { active: !u.active })}
                      >
                        {u.active ? "Đang hoạt động" : "Đã khóa"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === "audit" ? (
            <table>
              <thead>
                <tr>
                  <th>Thời điểm</th>
                  <th>Hành động</th>
                  <th>Người thực hiện</th>
                  <th>Đối tượng</th>
                </tr>
              </thead>
              <tbody>
                {r.data?.map((e) => (
                  <tr key={e.id}>
                    <td>{new Date(e.created_at).toLocaleString("vi-VN")}</td>
                    <td>{e.action}</td>
                    <td>{e.actor_name || "Ẩn danh"}</td>
                    <td className="small">{e.target_id || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : tab === "tips" ? (
            r.data?.map((t) => (
              <Withdraw key={t.id} tip={t} app={app} refresh={r.refresh} />
            ))
          ) : r.data?.length ? (
            r.data.map((f) => (
              <div key={f.id} className="review-step">
                <h3>
                  {f.author_name} · {f.tip_id}
                </h3>
                <p>{f.body}</p>
                <p className="small muted">
                  {new Date(f.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
            ))
          ) : (
            <Empty title="Chưa có góp ý." />
          )}
        </section>
      )}
    </>
  );
}

function Withdraw({ tip, app, refresh }) {
  const [reason, setReason] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="review-step"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await api("/admin/tips/" + tip.id + "/unpublish", {
            method: "POST",
            body: { text: reason },
          });
          await refresh();
          await app.load();
          app.notify(
            "Đã gỡ bài khỏi thư viện công khai, giữ lại hồ sơ thẩm định.",
          );
        } catch (e) {
          app.notify(e.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <h3>{tip.content.title}</h3>
      <p className="small muted">
        {tip.visible ? "Đang hiển thị" : "Đã gỡ khỏi thư viện"}
      </p>
      {tip.visible && (
        <>
          <Field label="Lý do gỡ bài">
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              minLength={10}
              maxLength={1500}
            />
          </Field>
          <Button variant="secondary" busy={busy}>
            Gỡ khỏi thư viện công khai
          </Button>
        </>
      )}
    </form>
  );
}
