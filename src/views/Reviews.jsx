import React, { useState } from "react";
import { api } from "../models/api";
import {
  useRemote,
  Loading,
  ErrorBox,
  Empty,
  Status,
  Button,
  Field,
} from "./shared";
import { ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
export function ReviewQueue({ app }) {
  const r = useRemote(() => api("/reviews"), []);
  if (r.loading) return <Loading />;
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Hàng đợi thẩm định</h1>
          <p>Nhận bài, kiểm tra bằng chứng, ghi quyết định có trách nhiệm.</p>
        </div>
        <Button variant="secondary" onClick={r.refresh}>
          Làm mới
        </Button>
      </div>
      <ErrorBox message={r.error} />
      <section className="panel">
        {r.data?.length ? (
          r.data.map((c) => (
            <article className="contribution-row" key={c.id}>
              <div>
                <Status status={c.status} />
                <h3>{c.content.title}</h3>
                <p>
                  Tác giả: {c.author_name} ·{" "}
                  {c.reviewer_name
                    ? "Người nhận: " + c.reviewer_name
                    : "Chưa có người nhận"}
                </p>
              </div>
              <a className="btn secondary" href={"#/review/" + c.id}>
                Mở hồ sơ
                <ArrowRight size={16} />
              </a>
            </article>
          ))
        ) : (
          <Empty
            title="Không có bài chờ thẩm định."
            description="Bài do bạn viết không xuất hiện trong hàng đợi của chính bạn."
          />
        )}
      </section>
    </>
  );
}
export function ContributionDetail({ id, app, review = false }) {
  const r = useRemote(() => api("/contributions/" + id), [id]);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function claim() {
    setBusy(true);
    try {
      await api("/reviews/" + id + "/claim", {
        method: "POST",
        body: { version: r.data.version },
      });
      await r.refresh();
      app.notify("Đã nhận trách nhiệm thẩm định bài.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function decide(e) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    try {
      await api("/reviews/" + id + "/decision", {
        method: "POST",
        body: {
          decision: f.get("decision"),
          notes: f.get("notes"),
          evidence: f.get("evidence"),
          scienceChecked: f.get("science") === "on",
          safetyChecked: f.get("safety") === "on",
          materialsChecked: f.get("materials") === "on",
          version: r.data.version,
        },
      });
      app.notify("Đã ghi quyết định và nhật ký thẩm định.");
      await app.load();
      location.hash = "/reviews";
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (r.loading) return <Loading />;
  if (r.error) return <ErrorBox message={r.error} />;
  const d = r.data,
    c = d.content,
    mine = d.reviewer_id === app.user.id;
  return (
    <>
      <div className="page-title">
        <div>
          <Status status={d.status} />
          <h1 className="mt-3">{c.title}</h1>
          <p>
            Tác giả: {d.author_name} · Phiên bản {d.version}
          </p>
        </div>
        {review && d.status === "SUBMITTED" && (
          <Button busy={busy} onClick={claim}>
            Nhận thẩm định
          </Button>
        )}
      </div>
      <div className="review-layout">
        <section className="panel">
          <h2>Nội dung tác giả gửi</h2>
          <p className="muted mt-4">{c.description}</p>
          <p className="small mt-4">Dụng cụ: {c.tools.join(", ")}</p>
          {c.steps.map((s, i) => (
            <div className="review-step" key={i}>
              <h3>
                {i + 1}. {s.title}
              </h3>
              <p>{s.body}</p>
            </div>
          ))}
          <div className="notice">
            <AlertTriangle size={19} />
            <p>{c.warning}</p>
          </div>
          <p className="mt-5">
            <a
              className="link"
              href={c.sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {c.sourceTitle} ↗
            </a>
          </p>
          {d.media_id && (
            <div className="evidence-media mt-5">
              <h3>Minh họa do tác giả cung cấp</h3>
              {d.media_type?.startsWith("video") ? (
                <video src={"/api/media/" + d.media_id} controls playsInline />
              ) : (
                <img
                  src={"/api/media/" + d.media_id}
                  alt="Minh họa của tác giả"
                />
              )}
            </div>
          )}
        </section>
        <aside className="panel">
          <h2 className="flex gap-2 items-center">
            <ShieldCheck size={22} />
            Hồ sơ thẩm định
          </h2>
          <ErrorBox message={error} />
          {review && d.status === "IN_REVIEW" && mine ? (
            <form onSubmit={decide}>
              <p className="small muted mt-3">
                Bạn chịu trách nhiệm về quyết định này. Kiểm tra độc lập nguồn
                và clip, không xem độ đầy đủ là độ an toàn.
              </p>
              <div className="mt-5 space-y-3">
                <label className="check-row">
                  <input type="checkbox" name="science" />
                  Đã đối chiếu nguyên lý và nguồn khoa học
                </label>
                <label className="check-row">
                  <input type="checkbox" name="safety" />
                  Đã kiểm tra rủi ro và giới hạn an toàn
                </label>
                <label className="check-row">
                  <input type="checkbox" name="materials" />
                  Đã kiểm tra dụng cụ và minh họa thực tế
                </label>
              </div>
              <Field label="Bằng chứng đối chiếu">
                <textarea
                  name="evidence"
                  required
                  maxLength={2000}
                  placeholder="Ghi tên tài liệu, URL và kết quả đối chiếu…"
                />
              </Field>
              <Field label="Nhận xét gửi tác giả">
                <textarea
                  name="notes"
                  required
                  minLength={10}
                  maxLength={2500}
                />
              </Field>
              <Field label="Quyết định">
                <select name="decision">
                  <option value="REQUEST_CHANGES">Yêu cầu bổ sung</option>
                  <option value="APPROVE">Phê duyệt và xuất bản</option>
                  <option value="REJECT">Từ chối</option>
                </select>
              </Field>
              <Button busy={busy} type="submit">
                Ghi quyết định
              </Button>
            </form>
          ) : (
            <p className="muted mt-4">
              {d.status === "SUBMITTED"
                ? "Chờ người thẩm định nhận bài."
                : d.status === "IN_REVIEW"
                  ? "Người được phân công đang thẩm định bài."
                  : "Lịch sử quyết định được lưu trên máy chủ."}
            </p>
          )}
          {d.reviews?.map((h) => (
            <div key={h.id} className="review-step">
              <Status
                status={
                  h.decision === "APPROVE"
                    ? "APPROVED"
                    : h.decision === "REJECT"
                      ? "REJECTED"
                      : "CHANGES_REQUESTED"
                }
              />
              <h3 className="mt-3">{h.reviewer_name}</h3>
              <p className="small muted">
                {new Date(h.created_at).toLocaleString("vi-VN")}
              </p>
              <p className="mt-3">{h.notes}</p>
              <p className="small muted mt-3">Bằng chứng: {h.evidence}</p>
            </div>
          ))}
        </aside>
      </div>
    </>
  );
}
