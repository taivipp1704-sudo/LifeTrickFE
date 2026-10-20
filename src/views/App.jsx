import React, { useState, useEffect } from "react";
import { useApp } from "../controllers/useApp";
import { PREVIEW_MODE } from "../models/preview";
import Library from "./Library";
import Auth from "./Auth";
import TipDetail from "./TipDetail";
import Dashboard from "./Dashboard";
import Editor from "./Editor";
import { ReviewQueue, ContributionDetail } from "./Reviews";
import Admin from "./Admin";
import Settings from "./Settings";
import { Quiz, SOS, Offline } from "./Tools";
import { Loading, Empty } from "./shared";
import {
  Bookmark,
  Menu,
  Sun,
  Moon,
  LogOut,
  Compass,
  UserRound,
  Plus,
  Grid2X2,
  ShieldCheck,
  Siren,
} from "lucide-react";
const readRoute = () => location.hash.replace(/^#\/?/, "").split("/");
export default function App() {
  const app = useApp(),
    [route, setRoute] = useState(readRoute),
    [menu, setMenu] = useState(false),
    [dark, setDark] = useState(localStorage.getItem("tk-theme") === '"dark"');
  useEffect(() => {
    const change = () => {
      setRoute(readRoute());
      setMenu(false);
      scrollTo(0, 0);
    };
    addEventListener("hashchange", change);
    return () => removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("tk-theme", JSON.stringify(dark ? "dark" : "light"));
  }, [dark]);
  const [r, id] = route;
  const protectedView = (view, roles) =>
    app.loading ? (
      <Loading />
    ) : !app.user ? (
      <Auth app={app} />
    ) : roles && !roles.includes(app.user.role) ? (
      <Empty
        title="Bạn không có quyền vào khu vực này."
        description="Liên hệ quản trị viên nếu bạn cần tham gia thẩm định."
      />
    ) : (
      view
    );
  let view;
  if (!r) view = <Library app={app} home />;
  else if (r === "library") view = <Library app={app} />;
  else if (r === "saved") view = protectedView(<Library app={app} saved />);
  else if (r === "tip") view = <TipDetail app={app} id={id} key={id} />;
  else if (r === "login" || r === "register")
    view = <Auth app={app} register={r === "register"} key={r} />;
  else if (r === "manage") view = protectedView(<Dashboard app={app} />);
  else if (r === "contribute")
    view = protectedView(<Editor app={app} id={id} key={id || "new"} />);
  else if (r === "contribution")
    view = protectedView(<ContributionDetail app={app} id={id} key={id} />);
  else if (r === "reviews")
    view = protectedView(<ReviewQueue app={app} />, ["REVIEWER", "ADMIN"]);
  else if (r === "review")
    view = protectedView(
      <ContributionDetail app={app} id={id} review key={id} />,
      ["REVIEWER", "ADMIN"],
    );
  else if (r === "admin") view = protectedView(<Admin app={app} />, ["ADMIN"]);
  else if (r === "settings") view = protectedView(<Settings app={app} />);
  else if (r === "quiz") view = <Quiz />;
  else if (r === "sos" || r === "survival") view = <SOS />;
  else if (r === "offline") view = <Offline app={app} />;
  else
    view = (
      <Empty
        title="Không tìm thấy trang."
        action={<a href="#/">Về trang chủ</a>}
      />
    );
  const links = [
    ["", "Khám phá"],
    ["library", "Mẹo đời sống"],
    ["survival", "Sinh tồn & sơ cứu"],
    ["offline", "Cẩm nang ngoại tuyến"],
    ["contribute", "Đóng góp mẹo"],
    ["manage", "Góc của tôi"],
  ];
  if (["ADMIN", "REVIEWER"].includes(app.user?.role))
    links.push(["reviews", "Thẩm định"]);
  if (app.user?.role === "ADMIN") links.push(["admin", "Quản trị"]);
  return (
    <>
      <a className="skip" href="#main">
        Đến nội dung
      </a>
      <header>
        <div className="wrap topbar">
          <a className="brand" href="#/">
            <img src="/assets/icon.svg" alt="" />
            <span>
              <strong>Túi Khôn</strong>
              <small>Mẹo nhỏ, bản lĩnh lớn.</small>
            </span>
          </a>
          <div className="top-caption">
            Cẩm nang kỹ năng · Cộng đồng có thẩm định
          </div>
          <div className="header-tools">
            <button
              className="icon-btn"
              aria-label={dark ? "Giao diện sáng" : "Giao diện tối"}
              onClick={() => setDark(!dark)}
            >
              {dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <a className="icon-btn" href="#/saved" aria-label="Mẹo đã lưu">
              <Bookmark size={19} />
            </a>
            {app.user ? (
              <>
                <a
                  className="avatar"
                  href="#/settings"
                  aria-label="Cài đặt tài khoản"
                >
                  {app.user.display_name[0]}
                </a>
                <button
                  className="icon-btn desktop-only"
                  aria-label="Đăng xuất"
                  onClick={async () => {
                    try {
                      await app.signOut();
                      location.hash = "/";
                    } catch (e) {
                      app.notify(e.message);
                    }
                  }}
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <a className="btn secondary login-link" href="#/login">
                Đăng nhập
              </a>
            )}
            <button
              className="icon-btn menu-toggle"
              aria-label="Mở menu"
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              <Menu size={21} />
            </button>
          </div>
        </div>
        <div className={"navigation " + (menu ? "open" : "")}>
          <nav className="wrap" aria-label="Điều hướng chính">
            {links.map(([path, label]) => (
              <a
                key={path}
                href={"#/" + path}
                className={(r || "") === path ? "active" : ""}
              >
                {label}
              </a>
            ))}
            {menu && app.user && (
              <button
                onClick={() =>
                  app.signOut().catch((e) => app.notify(e.message))
                }
              >
                Đăng xuất
              </button>
            )}
          </nav>
        </div>
      </header>
      {PREVIEW_MODE && (
        <div className="wrap preview-banner" role="status">
          <strong>Bản xem thử giao diện.</strong> Dữ liệu mẫu · Chưa kết nối máy
          chủ · Đăng nhập, tải video và gửi thẩm định chưa được bật.
        </div>
      )}
      <main className="wrap main" id="main">
        {view}
      </main>
      <footer className="wrap footer">
        <a className="brand" href="#/">
          <img src="/assets/icon.svg" alt="" />
          <strong>Túi Khôn</strong>
        </a>
        <span>Mẹo nhỏ mỗi ngày. Kỹ năng cho mọi tình huống.</span>
        <a href="#/offline">Mang cẩm nang theo bạn</a>
      </footer>
      <a className="sos-button" href="#/sos">
        <Siren size={18} />
        Trợ giúp SOS
      </a>
      <nav className="bottom-nav" aria-label="Điều hướng điện thoại">
        {[
          ["", "Khám phá", Compass],
          ["library", "Thư viện", Grid2X2],
          ["saved", "Đã lưu", Bookmark],
          ["manage", "Cá nhân", UserRound],
          ["sos", "SOS", Siren],
        ].map(([path, label, Icon]) => (
          <a
            key={path}
            className={(r || "") === path ? "active" : ""}
            href={"#/" + path}
          >
            <Icon size={19} />
            {label}
          </a>
        ))}
      </nav>
      {app.toast && (
        <div className="toast" role="status">
          {app.toast}
        </div>
      )}
    </>
  );
}
