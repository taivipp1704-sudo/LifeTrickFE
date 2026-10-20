import React, { useEffect, useRef, useState } from "react";
import { api } from "../models/api";
import { useRemote, Loading, ErrorBox, Button, Field } from "./shared";
import { categories } from "../models/content";
import {
  Bookmark,
  RotateCw,
  Play,
  Pause,
  ShieldCheck,
  AlertTriangle,
  Share2,
} from "lucide-react";
export default function TipDetail({ id, app }) {
  const r = useRemote(() => api("/tips/" + id), [id]);
  const stage = useRef(null),
    host = useRef(null);
  const [step, setStep] = useState(0),
    [auto, setAuto] = useState(false),
    [feedback, setFeedback] = useState("");
  useEffect(() => {
    setStep(0);
    setAuto(false);
    if (r.data && host.current) {
      stage.current = window.createStage(
        host.current,
        r.data.content.model || "water",
      );
      return () => stage.current?.dispose();
    }
  }, [r.data]);
  useEffect(() => {
    stage.current?.setStep(step);
  }, [step]);
  useEffect(() => {
    if (auto) {
      const t = setInterval(() => setStep((s) => (s + 1) % 3), 4200);
      return () => clearInterval(t);
    }
  }, [auto]);
  if (r.loading) return <Loading />;
  if (r.error) return <ErrorBox message={r.error} retry={r.refresh} />;
  const t = r.data,
    c = t.content,
    completed = app.notebook.completed.includes(id);
  return (
    <>
      <p className="breadcrumb">
        <a href="#/library">Thư viện</a> / {categories[c.category]} / Hướng dẫn
        thực hành
      </p>
      <div className="article-head">
        <div>
          <span className="status">{categories[c.category]}</span>
          <h1>{c.title}</h1>
          <p>{c.description}</p>
          <div className="source-box">
            <ShieldCheck size={25} />
            <div>
              <strong>
                {t.verification === "HUMAN_REVIEWED"
                  ? "Đã thẩm định bởi " + t.reviewer_name
                  : c.sourceTitle}
              </strong>
              <p>
                {t.verification === "HUMAN_REVIEWED"
                  ? "Quyết định và bằng chứng được lưu trên máy chủ."
                  : "Cẩm nang tham khảo. Chưa có quyết định thẩm định cộng đồng."}
              </p>
            </div>
            <a href={c.sourceUrl} target="_blank" rel="noreferrer">
              Đọc nguồn ↗
            </a>
          </div>
          <div className="article-actions">
            <Button variant="secondary" onClick={() => app.save(id)}>
              <Bookmark size={16} />
              {app.notebook.saved.includes(id) ? "Đã lưu" : "Lưu mẹo"}
            </Button>
            <Button
              variant="secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(location.href);
                  app.notify("Đã sao chép liên kết.");
                } catch {
                  app.notify(
                    "Bạn có thể sao chép đường dẫn trên thanh địa chỉ.",
                  );
                }
              }}
            >
              <Share2 size={16} />
              Chia sẻ
            </Button>
          </div>
        </div>
        <aside className="panel">
          <h3>Nguồn gốc rõ ràng.</h3>
          <p className="small muted mt-3">
            Mỗi hướng dẫn có dụng cụ, ba bước và giới hạn an toàn. Nội dung cộng
            đồng được duyệt bởi tài khoản có quyền thẩm định, không dựa vào điểm
            biểu mẫu.
          </p>
          <p className="small muted mt-4">
            Xuất bản: {new Date(t.published_at).toLocaleDateString("vi-VN")}
          </p>
        </aside>
      </div>
      <section className="section">
        <div className="section-head">
          <h2>Nhìn rõ. Làm từng bước.</h2>
          <span className="small muted">Mô hình 360°</span>
        </div>
        {t.media_id && (
          <div className="panel evidence-media">
            <h3>Minh họa thực tế của tác giả</h3>
            {t.media_type?.startsWith("video") ? (
              <video
                src={"/api/media/" + t.media_id}
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={"/api/media/" + t.media_id}
                alt={"Minh họa: " + c.title}
              />
            )}
          </div>
        )}
        <div className="detail-grid">
          <div>
            <div className="stage" ref={host}>
              <div className="stage-status">
                <RotateCw size={16} />
                Kéo để xoay mô hình
              </div>
              <button
                className="icon-btn stage-reset"
                aria-label="Đặt lại góc nhìn"
                onClick={() => stage.current?.reset()}
              >
                <RotateCw size={18} />
              </button>
            </div>
            <div className="stage-controls">
              <Button variant="secondary" onClick={() => setAuto(!auto)}>
                {auto ? <Pause size={16} /> : <Play size={16} />}
                {auto ? "Tạm dừng" : "Tự động chạy"}
              </Button>
              <span className="small muted">Bước {step + 1} / 3</span>
            </div>
          </div>
          <div>
            <div className="panel preparation">
              <h3>Chuẩn bị trong tầm tay</h3>
              <div className="chips">
                {c.tools.map((s) => (
                  <span key={s} className="chip">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="steps">
              {c.steps.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setStep(i);
                    setAuto(false);
                  }}
                  className={"step-btn " + (step === i ? "active" : "")}
                  aria-pressed={step === i}
                >
                  <span className="step-number">{i + 1}</span>
                  <span>
                    <strong>{s.title}</strong>
                    <p>{s.body}</p>
                  </span>
                </button>
              ))}
            </div>
            <div className="notice">
              <AlertTriangle size={20} />
              <div>
                <strong>Lưu ý trước khi làm</strong>
                <p>{c.warning}</p>
              </div>
            </div>
            <label className="check-row">
              <input
                type="checkbox"
                checked={completed}
                onChange={async (e) => {
                  if (!app.user) {
                    location.hash = "/login";
                    return;
                  }
                  try {
                    await api("/notebook/" + id + "/progress", {
                      method: "PUT",
                      body: { completed: e.target.checked },
                    });
                    app.setNotebook(await api("/notebook"));
                  } catch (e) {
                    app.notify(e.message);
                  }
                }}
              />
              Tôi đã đọc đủ ba bước và lưu ý an toàn
            </label>
          </div>
        </div>
      </section>
      <section className="section panel">
        <h2>Góp ý cho cẩm nang</h2>
        <p className="small muted mt-2">
          Góp ý được gửi đến quản trị viên, không hiển thị công khai.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api("/tips/" + id + "/feedback", {
                method: "POST",
                body: { text: feedback },
              });
              setFeedback("");
              app.notify("Đã gửi góp ý đến máy chủ.");
            } catch (e) {
              app.notify(e.message);
            }
          }}
        >
          <Field label="Nội dung cần làm rõ">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              required
              maxLength={1500}
            />
          </Field>
          <Button type="submit" disabled={!app.user}>
            Gửi góp ý
          </Button>
          {!app.user && (
            <a href="#/login" className="link ml-4">
              Đăng nhập để góp ý
            </a>
          )}
        </form>
      </section>
    </>
  );
}
