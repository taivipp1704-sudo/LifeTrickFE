import React, { useState, useEffect } from "react";
import { api } from "../models/api";
import { emptyContent, validateContent, categories } from "../models/content";
import { Button, Field, ErrorBox, Loading, Status } from "./shared";
import {
  Upload,
  Save,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
export default function Editor({ app, id }) {
  const [content, setContent] = useState(emptyContent),
    [media, setMedia] = useState(null),
    [version, setVersion] = useState(0),
    [draftId, setDraftId] = useState(id || null),
    [phase, setPhase] = useState(0),
    [busy, setBusy] = useState(false),
    [loading, setLoading] = useState(!!id),
    [error, setError] = useState(""),
    [reviews, setReviews] = useState([]);
  useEffect(() => {
    if (id)
      api("/contributions/" + id)
        .then((c) => {
          setContent(c.content);
          setMedia(
            c.media_id ? { id: c.media_id, mime_type: c.media_type } : null,
          );
          setVersion(c.version);
          setReviews(c.reviews || []);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
  }, [id]);
  const set = (key, value) => setContent((c) => ({ ...c, [key]: value }));
  const setStep = (i, key, value) =>
    setContent((c) => ({
      ...c,
      steps: c.steps.map((s, j) => (j === i ? { ...s, [key]: value } : s)),
    }));
  async function save(submit = false) {
    setError("");
    if (submit) {
      const invalid = validateContent(content);
      if (invalid) {
        setError(invalid);
        return;
      }
      if (!media) {
        setError("Cần tải ảnh hoặc video minh họa để gửi thẩm định.");
        return;
      }
    }
    setBusy(true);
    try {
      let d = await api(
        draftId ? "/contributions/" + draftId : "/contributions",
        {
          method: draftId ? "PUT" : "POST",
          body: {
            content: {
              ...content,
              tools: content.tools.map((s) => s.trim()).filter(Boolean),
            },
            mediaId: media?.id || null,
            version,
          },
        },
      );
      setDraftId(d.id);
      setVersion(d.version);
      if (submit) {
        await api("/contributions/" + d.id + "/submit", {
          method: "POST",
          body: { version: d.version },
        });
        app.notify("Đã gửi bài đến hàng đợi thẩm định trên máy chủ.");
        location.hash = "/manage";
      } else app.notify("Đã lưu bản nháp trên máy chủ.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file) {
    if (!file) return;
    if (file.size > 30 * 1024 * 1024) {
      setError("Tệp không vượt 30 MB.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const m = await api("/media", { method: "POST", body: form });
      setMedia(m);
      app.notify("Đã kiểm tra và lưu tệp trên máy chủ.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const fields = [
      content.title,
      content.description,
      content.tools.length,
      content.steps.every((s) => s.title && s.body),
      content.warning,
      content.sourceUrl,
      media,
    ],
    score = Math.round((fields.filter(Boolean).length / fields.length) * 100);
  if (loading) return <Loading />;
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Góp một mẹo, thêm một kỹ năng.</h1>
          <p>
            Nguồn rõ ràng, thao tác cụ thể, được thẩm định trước khi xuất bản.
          </p>
        </div>
        <Button variant="secondary" busy={busy} onClick={() => save()}>
          <Save size={16} />
          Lưu bản nháp
        </Button>
      </div>
      <div className="wizard-progress">
        {[
          "Thông tin & phân loại",
          "Nội dung & minh họa",
          "Ba bước & an toàn",
          "Xem lại & gửi",
        ].map((s, i) => (
          <button
            key={s}
            onClick={() => setPhase(i)}
            className={phase === i ? "active" : ""}
          >
            <span>{i + 1}</span>
            {s}
          </button>
        ))}
      </div>
      <div className="editor-grid">
        <section className="panel">
          <ErrorBox message={error} />
          {reviews.length > 0 && (
            <div className="notice">
              <AlertTriangle size={18} />
              <div>
                <strong>Nhận xét từ người thẩm định</strong>
                <p>{reviews.at(-1).notes}</p>
                <p>Bằng chứng: {reviews.at(-1).evidence}</p>
              </div>
            </div>
          )}
          {phase === 0 && (
            <>
              <h2>Bắt đầu từ một kinh nghiệm.</h2>
              <Field label="Tên mẹo">
                <input
                  value={content.title}
                  maxLength={160}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>
              <Field label="Nhóm nội dung">
                <select
                  value={content.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {Object.entries(categories)
                    .filter(([k]) => k !== "all")
                    .map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Mô tả mẹo">
                <textarea
                  value={content.description}
                  maxLength={2500}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
              <Field label="Dụng cụ, ngăn cách bằng dấu phẩy">
                <input
                  value={content.tools.join(", ")}
                  onChange={(e) =>
                    set(
                      "tools",
                      e.target.value
                        .split(",")
                        .map((s) => s.trimStart())
                        .slice(0, 20),
                    )
                  }
                />
              </Field>
            </>
          )}
          {phase === 1 && (
            <>
              <h2>Cho mọi người thấy cách làm.</h2>
              <div className="upload-box">
                <Upload size={30} />
                <p>
                  Ảnh JPEG/PNG hoặc video MP4/WebM, tối đa 30 MB.
                  <br />
                  Video không quá 60 giây. Máy chủ kiểm tra và xử lý lại tệp.
                </p>
                <input
                  aria-label="Tải minh họa lên máy chủ"
                  type="file"
                  accept="image/jpeg,image/png,video/mp4,video/webm"
                  disabled={busy}
                  onChange={(e) => upload(e.target.files[0])}
                />
              </div>
              {media && (
                <div className="evidence-media">
                  {media.mime_type?.startsWith("video") ? (
                    <video
                      controls
                      playsInline
                      src={"/api/media/" + media.id}
                    />
                  ) : (
                    <img
                      src={"/api/media/" + media.id}
                      alt="Minh họa đã lưu trên máy chủ"
                    />
                  )}
                  <p className="small muted">Tệp đã lưu · {media.id}</p>
                </div>
              )}
              <Field label="Tên nguồn tham khảo">
                <input
                  value={content.sourceTitle}
                  maxLength={500}
                  onChange={(e) => set("sourceTitle", e.target.value)}
                />
              </Field>
              <Field label="Đường dẫn nguồn HTTPS">
                <input
                  type="url"
                  value={content.sourceUrl}
                  maxLength={480}
                  onChange={(e) => set("sourceUrl", e.target.value)}
                  placeholder="https://…"
                />
              </Field>
            </>
          )}
          {phase === 2 && (
            <>
              <h2>Ba bước dễ hiểu, đủ lưu ý.</h2>
              {content.steps.map((s, i) => (
                <div className="form-step" key={i}>
                  <Field label={"Bước " + (i + 1) + " — tiêu đề"}>
                    <input
                      value={s.title}
                      maxLength={150}
                      onChange={(e) => setStep(i, "title", e.target.value)}
                    />
                  </Field>
                  <Field label="Cách thực hiện">
                    <textarea
                      value={s.body}
                      maxLength={2500}
                      onChange={(e) => setStep(i, "body", e.target.value)}
                    />
                  </Field>
                </div>
              ))}
              <Field label="Rủi ro và điều cần tránh">
                <textarea
                  value={content.warning}
                  maxLength={2500}
                  onChange={(e) => set("warning", e.target.value)}
                />
              </Field>
              <Field label="Mô hình minh họa gần nhất">
                <select
                  value={content.model}
                  onChange={(e) => set("model", e.target.value)}
                >
                  {[
                    ["water", "Bộ lọc nước"],
                    ["fire", "Nhóm lửa"],
                    ["watch", "Đồng hồ"],
                    ["jar", "Lọ thủy tinh"],
                    ["bottle", "Chai nước"],
                    ["cable", "Dây cáp"],
                    ["shelter", "Chỗ trú"],
                    ["medical", "Sơ cứu"],
                  ].map(([k, v]) => (
                    <option key={k} value={k}>
                      {v}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}
          {phase === 3 && (
            <>
              <h2>Xem lại trước khi gửi.</h2>
              <h3 className="mt-5">{content.title || "Chưa có tên mẹo"}</h3>
              <p className="mt-3 muted">{content.description}</p>
              <p className="mt-3 small">Dụng cụ: {content.tools.join(", ")}</p>
              {content.steps.map((s, i) => (
                <div className="review-step" key={i}>
                  <strong>
                    {i + 1}. {s.title}
                  </strong>
                  <p>{s.body}</p>
                </div>
              ))}
              <div className="notice">
                <AlertTriangle size={18} />
                <p>{content.warning || "Cần bổ sung lưu ý an toàn."}</p>
              </div>
              <p className="small muted mt-4">
                Nguồn: {content.sourceTitle} · {content.sourceUrl}
              </p>
              <p className="small muted mt-5">
                Khi gửi, bạn xác nhận có quyền sử dụng tệp minh họa và đồng ý để
                người thẩm định kiểm tra. Bài chưa được công khai cho đến khi có
                quyết định phê duyệt.
              </p>
            </>
          )}
          <div className="row-between mt-6">
            <Button
              variant="secondary"
              onClick={() => setPhase(Math.max(0, phase - 1))}
              disabled={phase === 0 || busy}
            >
              Quay lại
            </Button>
            {phase < 3 ? (
              <Button onClick={() => setPhase(phase + 1)} disabled={busy}>
                Tiếp tục
                <ArrowRight size={16} />
              </Button>
            ) : (
              <Button busy={busy} onClick={() => save(true)}>
                Gửi chờ thẩm định
                <ArrowRight size={16} />
              </Button>
            )}
          </div>
        </section>
        <aside className="panel">
          <h3 className="flex items-center gap-2">
            <ShieldCheck size={20} />
            Kiểm tra nội dung
          </h3>
          <div className="quality-score">
            {score}
            <small>/ 100</small>
          </div>
          <p className="small muted">Mức độ đầy đủ biểu mẫu</p>
          <progress className="progress" max="100" value={score} />
          <p className="muted mt-5">
            Điểm này không xác nhận an toàn. Người có quyền thẩm định sẽ kiểm
            tra nguồn, video, dụng cụ và rủi ro trước khi đưa ra quyết định.
          </p>
          <div className="notice">
            <AlertTriangle size={18} />
            <p>
              Mẹo sơ cứu và sinh tồn cần bằng chứng đáng tin. Không tự làm thử
              hành động nguy hiểm để quay video.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
