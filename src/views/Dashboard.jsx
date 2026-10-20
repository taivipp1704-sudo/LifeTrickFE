import React from "react";
import { api } from "../models/api";
import { statuses, categories } from "../models/content";
import { useRemote, Loading, ErrorBox, Empty, Status } from "./shared";
import { Plus, FileText, ArrowRight } from "lucide-react";
export default function Dashboard({ app }) {
  const r = useRemote(() => api("/contributions"), []);
  if (r.loading) return <Loading />;
  if (r.error) return <ErrorBox message={r.error} retry={r.refresh} />;
  const list = r.data;
  return (
    <>
      <section className="panel profile">
        <div className="row-between">
          <div className="flex items-center gap-4">
            <span className="avatar large">{app.user.display_name[0]}</span>
            <div>
              <h1>{app.user.display_name}</h1>
              <p>{app.user.email}</p>
              <span className="small muted">
                {app.user.role === "ADMIN"
                  ? "Quản trị viên"
                  : app.user.role === "REVIEWER"
                    ? "Người thẩm định"
                    : "Thành viên"}
              </span>
            </div>
          </div>
          <a className="btn" href="#/contribute">
            <Plus size={17} />
            Đóng góp mẹo mới
          </a>
        </div>
        <div className="stats">
          {[
            ["Đóng góp", list.length],
            [
              "Chờ thẩm định",
              list.filter((c) => ["SUBMITTED", "IN_REVIEW"].includes(c.status))
                .length,
            ],
            [
              "Cần bổ sung",
              list.filter((c) => c.status === "CHANGES_REQUESTED").length,
            ],
            ["Đã xuất bản", list.filter((c) => c.status === "APPROVED").length],
          ].map(([label, n]) => (
            <div key={label}>
              <p>{label}</p>
              <strong>{n.toString().padStart(2, "0")}</strong>
            </div>
          ))}
        </div>
      </section>
      <section className="section panel">
        <div className="section-head">
          <h2>Đóng góp của bạn</h2>
          <span className="small muted">Dữ liệu đồng bộ theo tài khoản</span>
        </div>
        {list.length ? (
          list.map((c) => (
            <article className="contribution-row" key={c.id}>
              <div>
                <Status status={c.status} />
                <h3>{c.content.title || "Mẹo chưa đặt tên"}</h3>
                <p>
                  {categories[c.content.category]} ·{" "}
                  {new Date(c.updated_at).toLocaleString("vi-VN")} · Phiên bản{" "}
                  {c.version}
                </p>
              </div>
              <a
                className="btn secondary"
                href={
                  ["DRAFT", "CHANGES_REQUESTED"].includes(c.status)
                    ? "#/contribute/" + c.id
                    : "#/contribution/" + c.id
                }
              >
                {["DRAFT", "CHANGES_REQUESTED"].includes(c.status)
                  ? "Tiếp tục viết"
                  : "Xem bài"}
                <ArrowRight size={15} />
              </a>
            </article>
          ))
        ) : (
          <Empty
            title="Kinh nghiệm đầu tiên của bạn?"
            description="Một mẹo hữu ích có thể bắt đầu từ việc bạn làm mỗi ngày."
            action={
              <a className="btn" href="#/contribute">
                Viết mẹo đầu tiên
              </a>
            }
          />
        )}
      </section>
    </>
  );
}
