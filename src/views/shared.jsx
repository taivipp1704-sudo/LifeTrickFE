import React, { useState, useEffect } from "react";
import {
  LoaderCircle,
  AlertCircle,
  ArrowRight,
  Bookmark,
  ShieldCheck,
  RotateCw,
  Clock,
  FileVideo,
} from "lucide-react";
import { categories, statuses } from "../models/content";
export function Button({ children, busy = false, variant = "", ...props }) {
  return (
    <button
      className={"btn " + variant}
      disabled={busy || props.disabled}
      {...props}
    >
      {busy ? <LoaderCircle size={17} className="animate-spin" /> : null}
      {children}
    </button>
  );
}
export function Field({ label, children, hint }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function ErrorBox({ message, retry }) {
  return message ? (
    <div className="error-box" role="alert">
      <AlertCircle size={18} />
      <div>
        {message}
        {retry && (
          <button className="link" onClick={retry}>
            Thử lại
          </button>
        )}
      </div>
    </div>
  ) : null;
}
export function Loading() {
  return (
    <div
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      aria-label="Đang tải"
      aria-busy="true"
    >
      {[1, 2, 3].map((n) => (
        <div key={n} className="panel animate-pulse h-48 bg-surface" />
      ))}
    </div>
  );
}
export function Empty({ title = "Chưa có nội dung.", description, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Status({ status }) {
  return (
    <span
      className={
        "status " +
        (status === "APPROVED"
          ? "positive"
          : status === "CHANGES_REQUESTED"
            ? "warning"
            : "")
      }
    >
      {statuses[status] || status}
    </span>
  );
}
export function TipCard({ tip, app }) {
  const c = tip.content,
    saved = app.notebook.saved.includes(tip.id);
  return (
    <article className="tip-card">
      <div className="card-media">
        <a href={"#/tip/" + tip.id}>
          <img
            src={"/assets/" + (c.image || "forest") + ".jpg"}
            alt={c.title + " — ảnh minh họa"}
            loading="lazy"
          />
        </a>
        <button
          className={"save-button " + (saved ? "saved" : "")}
          aria-label={saved ? "Bỏ lưu " + c.title : "Lưu " + c.title}
          aria-pressed={saved}
          onClick={() => app.save(tip.id)}
        >
          <Bookmark size={17} />
        </button>
        <span className="media-tag">
          {tip.media_id ? (
            <>
              <FileVideo size={13} />
              Có minh họa thực tế
            </>
          ) : (
            <>
              <RotateCw size={13} />
              3D tương tác
            </>
          )}
        </span>
      </div>
      <div className="card-meta">{categories[c.category]} · 3 bước</div>
      <a href={"#/tip/" + tip.id}>
        <h3>{c.title}</h3>
      </a>
      <p className="card-source">
        <ShieldCheck size={13} />
        {tip.verification === "HUMAN_REVIEWED"
          ? "Đã thẩm định bởi " + tip.reviewer_name
          : "Cẩm nang có nguồn tham khảo"}
      </p>
    </article>
  );
}
export function useRemote(load, deps = []) {
  const key = JSON.stringify(deps);
  const [state, setState] = useState({
    data: null,
    error: "",
    loading: true,
    key,
  });
  const refresh = async () => {
    setState({ data: null, error: "", loading: true, key });
    try {
      const data = await load();
      setState({ data, error: "", loading: false, key });
    } catch (e) {
      setState({ data: null, error: e.message, loading: false, key });
    }
  };
  useEffect(() => {
    let live = true;
    setState({ data: null, error: "", loading: true, key });
    load()
      .then((data) => {
        if (live) setState({ data, error: "", loading: false, key });
      })
      .catch((e) => {
        if (live)
          setState({ data: null, error: e.message, loading: false, key });
      });
    return () => {
      live = false;
    };
  }, deps);
  return {
    ...(state.key === key ? state : { data: null, error: "", loading: true }),
    refresh,
  };
}
