import React, { useState } from "react";
import { api } from "../models/api";
import {
  ArrowRight,
  Download,
  ShieldCheck,
  Search,
  Backpack,
} from "lucide-react";
import { categories, normalize } from "../models/content";
import { TipCard, Empty, ErrorBox, Loading } from "./shared";
export default function Library({ app, home = false, saved = false }) {
  const [category, setCategory] = useState("all"),
    [query, setQuery] = useState(""),
    [tool, setTool] = useState("");
  const tools = [...new Set(app.tips.flatMap((t) => t.content.tools))];
  const list = app.tips.filter(
    (t) =>
      (!saved || app.notebook.saved.includes(t.id)) &&
      (category === "all" || t.content.category === category) &&
      (!query ||
        normalize(query)
          .trim()
          .split(/\s+/)
          .every((word) =>
            normalize(
              t.content.title +
                " " +
                t.content.description +
                " " +
                t.content.tools.join(" "),
            ).includes(word),
          )) &&
      (!tool || t.content.tools.includes(tool)),
  );
  return (
    <>
      <div className="page-title">
        <div>
          <h1 className={home ? "greeting" : ""}>
            {home
              ? "Hôm nay, học một điều hay."
              : saved
                ? "Sổ tay của bạn"
                : "Thư viện mẹo hay"}
          </h1>
          <p>
            {saved
              ? "Mẹo đã lưu đồng bộ theo tài khoản."
              : "Từ căn bếp nhỏ đến chuyến đi xa, luôn có một mẹo dành cho bạn."}
          </p>
        </div>
        <a className="text-link" href="#/manage">
          {app.user ? app.user.display_name : "Khám phá cùng Túi Khôn"}
          <ArrowRight size={16} />
        </a>
      </div>
      {home && (
        <>
          <div className="feature-grid">
            <article className="feature">
              <img
                src="/assets/forest.jpg"
                alt="Ánh nắng xuyên qua khu rừng xanh"
              />
              <div>
                <span className="feature-label">Cẩm nang thực hành 3D</span>
                <h2>
                  Một chiếc chai.
                  <br />
                  Thêm một kỹ năng.
                </h2>
                <p>
                  Nhìn rõ từng tầng lọc cặn và hiểu những giới hạn an toàn trước
                  khi bắt đầu.
                </p>
                <a className="btn white" href="#/tip/water">
                  Khám phá cách làm
                  <ArrowRight size={17} />
                </a>
              </div>
            </article>
            <aside className="offline-feature">
              <Backpack size={32} />
              <h2>
                Kinh nghiệm nhỏ, <br />
                giá trị được sẻ chia.
              </h2>
              <p>
                Gửi hướng dẫn và video của bạn. Nội dung chỉ xuất bản sau khi
                người có quyền thẩm định kiểm tra và ghi nhận bằng chứng.
              </p>
              <a
                className="btn secondary"
                href={app.user ? "#/contribute" : "#/login"}
              >
                Đóng góp mẹo
                <ArrowRight size={17} />
              </a>
              <span className="small muted">
                Không tự duyệt · Có lịch sử quyết định
              </span>
            </aside>
          </div>
          <div className="trust-strip">
            <ShieldCheck size={20} />
            <span>
              <strong>Hiểu đúng trước khi làm.</strong> Nguồn và lưu ý an toàn
              đi cùng mỗi mẹo.
            </span>
            <a href="#/sos">
              Cần trợ giúp ngay? <ArrowRight size={16} />
            </a>
          </div>
        </>
      )}
      <section className="section">
        <div className="section-head">
          <div>
            <h2>
              {saved
                ? "Những mẹo bạn muốn giữ lại."
                : "Thêm khéo léo, bớt loay hoay."}
            </h2>
            <p className="small muted">
              {list.length} mẹo ·{" "}
              {app.user
                ? "Sổ tay đã đồng bộ với máy chủ"
                : "Đăng nhập để lưu vào sổ tay"}
            </p>
          </div>
          <a className="text-link" href="#/quiz">
            Thử thách kỹ năng
            <ArrowRight size={16} />
          </a>
        </div>
        <div className="toolbar">
          <label className="search-input">
            <Search size={17} />
            <input
              aria-label="Tìm kiếm mẹo"
              placeholder="Tìm tình huống hoặc mẹo bạn cần…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select
            aria-label="Dụng cụ đang có"
            value={tool}
            onChange={(e) => setTool(e.target.value)}
          >
            <option value="">Tôi đang có dụng cụ…</option>
            {tools.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="chips">
          {Object.entries(categories).map(([id, label]) => (
            <button
              key={id}
              className={"chip " + (category === id ? "active" : "")}
              onClick={() => setCategory(id)}
              aria-pressed={category === id}
            >
              {label}
            </button>
          ))}
        </div>
        <ErrorBox message={app.error} retry={app.load} />
        {app.loading ? (
          <Loading />
        ) : list.length ? (
          <div className="tips-grid">
            {list.map((t) => (
              <TipCard key={t.id} tip={t} app={app} />
            ))}
          </div>
        ) : (
          <Empty
            title="Chưa có mẹo phù hợp."
            description={
              saved
                ? "Lưu một mẹo để bắt đầu sổ tay của bạn."
                : "Thử từ khóa ngắn hơn hoặc bỏ bộ lọc."
            }
          />
        )}
      </section>
      <div className="section panel row-between">
        <div>
          <h3>Đã có sổ tay cũ trên trình duyệt?</h3>
          <p className="small muted">
            Bạn có thể nhập dấu trang từ bản trước vào tài khoản này.
          </p>
        </div>
        <button
          className="btn secondary"
          onClick={async () => {
            if (!app.user) {
              location.hash = "/login";
              return;
            }
            try {
              const ids = JSON.parse(localStorage.getItem("tk-saved") || "[]");
              for (const id of ids.filter((x) =>
                app.tips.some((t) => t.id === x),
              ))
                await api("/notebook/" + id + "/bookmark", { method: "PUT" });
              await app.load();
              app.notify("Đã nhập dấu trang vào tài khoản.");
            } catch (e) {
              app.notify(e.message);
            }
          }}
        >
          Nhập dấu trang cũ
          <Download size={16} />
        </button>
      </div>
    </>
  );
}
