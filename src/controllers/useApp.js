import { useState, useEffect, useCallback } from "react";
import { api, login, logout, refreshCsrf, onExpired } from "../models/api";
export function useApp() {
  const [user, setUser] = useState(null),
    [tips, setTips] = useState([]),
    [notebook, setNotebook] = useState({ saved: [], completed: [] }),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [toast, setToast] = useState("");
  const notify = useCallback((s) => {
    setToast(s);
    setTimeout(() => setToast(""), 4000);
  }, []);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await refreshCsrf();
      const [pub, me] = await Promise.all([
        api("/tips?size=100"),
        api("/auth/me").catch((e) => {
          if (e.status === 401) return null;
          throw e;
        }),
      ]);
      setTips(pub.items);
      setUser(me);
      setNotebook(me ? await api("/notebook") : { saved: [], completed: [] });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    onExpired(() => {
      setUser(null);
      setNotebook({ saved: [], completed: [] });
    });
    load();
  }, [load]);
  const signIn = async (body) => {
    const u = await login(body);
    setUser(u);
    setNotebook(await api("/notebook"));
    notify("Đã đăng nhập và đồng bộ sổ tay.");
  };
  const signOut = async () => {
    await logout();
    setUser(null);
    setNotebook({ saved: [], completed: [] });
    notify("Đã đăng xuất.");
  };
  const save = async (id) => {
    if (!user) {
      location.hash = "/login";
      return;
    }
    try {
      const yes = notebook.saved.includes(id);
      await api(`/notebook/${id}/bookmark`, { method: yes ? "DELETE" : "PUT" });
      setNotebook(await api("/notebook"));
      notify(yes ? "Đã bỏ lưu mẹo." : "Đã lưu mẹo vào tài khoản.");
    } catch (e) {
      notify(e.message);
    }
  };
  return {
    user,
    setUser,
    tips,
    notebook,
    setNotebook,
    error,
    loading,
    toast,
    notify,
    load,
    signIn,
    signOut,
    save,
  };
}
