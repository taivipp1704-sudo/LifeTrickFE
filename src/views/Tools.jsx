import React, { useState, useEffect, useRef } from "react";
import { Button } from "./shared";
import { api } from "../models/api";
import { AlertTriangle, Volume2, Pause, Download, Compass } from "lucide-react";
const qs = [
  [
    "Nước đã trong sau khi qua chai lọc tự chế. Bạn nên làm gì?",
    [
      "Uống ngay",
      "Xử lý vi sinh phù hợp, tránh nguồn nghi nhiễm hóa chất",
      "Thêm muối",
    ],
    1,
    "Lọc cặn không làm nước nhiễm hóa chất an toàn. Nước trong vẫn có thể chứa vi sinh.",
  ],
  [
    "Bạn nhận ra mình bị lạc khi trời sắp tối. Ưu tiên là gì?",
    [
      "Chạy theo lối mòn bất kỳ",
      "Đi theo suối dù địa hình dốc",
      "Dừng lại, giữ bình tĩnh, tìm vị trí an toàn",
    ],
    2,
    "Ưu tiên bình tĩnh, an toàn và liên lạc hỗ trợ khi có thể.",
  ],
  [
    "Khi nghi bị rắn cắn, điều nào cần tránh?",
    [
      "Bất động và tìm hỗ trợ y tế",
      "Rạch vết cắn và hút nọc",
      "Tháo trang sức",
    ],
    1,
    "Không rạch, hút nọc hoặc garô. Hạn chế cử động và tổ chức vận chuyển y tế.",
  ],
];
export function Quiz() {
  const [i, setI] = useState(0),
    [answer, setAnswer] = useState(null),
    [score, setScore] = useState(0);
  if (i === qs.length)
    return (
      <div className="panel narrow">
        <h1>Bạn đã thêm một kỹ năng.</h1>
        <div className="quality-score">{score} / 3</div>
        <p>Kết quả giúp ôn kiến thức, không phải chứng nhận sơ cứu.</p>
        <Button
          onClick={() => {
            setI(0);
            setAnswer(null);
            setScore(0);
          }}
        >
          Thử lại
        </Button>
      </div>
    );
  const q = qs[i];
  return (
    <div className="narrow">
      <div className="page-title">
        <div>
          <h1>Nếu là bạn, bạn sẽ làm gì?</h1>
          <p>
            Câu {i + 1} / 3 · {score} câu đúng
          </p>
        </div>
      </div>
      <div className="panel">
        <h2>{q[0]}</h2>
        <div className="quiz-options">
          {q[1].map((a, j) => (
            <button
              key={a}
              disabled={answer !== null}
              className={answer !== null && j === q[2] ? "correct" : ""}
              onClick={() => {
                setAnswer(j);
                if (j === q[2]) setScore((s) => s + 1);
              }}
            >
              {a}
            </button>
          ))}
        </div>
        {answer !== null && (
          <>
            <div className="notice">
              <p>{q[3]}</p>
            </div>
            <Button
              onClick={() => {
                setI(i + 1);
                setAnswer(null);
              }}
            >
              Tiếp tục
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
const scenarios = {
  lost: [
    "Bị lạc đường",
    [
      [
        "Dừng lại và giữ bình tĩnh",
        "Đừng đi tiếp trong hoảng loạn. Kiểm tra sức khỏe, đồ dùng và người đi cùng.",
      ],
      [
        "Chọn nơi an toàn",
        "Tránh lòng suối, vách dốc, cây khô. Quan sát bản đồ và mốc địa hình nếu có.",
      ],
      [
        "Liên lạc và đánh dấu vị trí",
        "Khi có kết nối, gửi vị trí cho người tin cậy. Nếu không xác định được đường an toàn, giữ ở nơi an toàn và dễ được tìm thấy.",
      ],
    ],
  ],
  snake: [
    "Nghi rắn cắn",
    [
      [
        "Tìm hỗ trợ y tế ngay",
        "Rời khỏi tầm nguy hiểm nếu an toàn. Không cố bắt hoặc giết rắn.",
      ],
      [
        "Giữ bất động, tháo trang sức",
        "Hạn chế cử động toàn thân, nẹp chi nhẹ nhàng. Tháo nhẫn và vòng trước khi sưng.",
      ],
      [
        "Vận chuyển đến cơ sở y tế",
        "Không rạch, hút nọc, garô hoặc đắp lá. Không để người bị cắn tự đi bộ nếu có thể tổ chức vận chuyển.",
      ],
    ],
  ],
  cold: [
    "Mưa lạnh",
    [
      ["Tìm nơi trú an toàn", "Tránh nơi có nguy cơ lũ, cây khô và sườn dốc."],
      ["Giữ cơ thể khô", "Thay đồ ướt nếu có thể, cách người khỏi đất ẩm."],
      [
        "Tìm hỗ trợ khi có dấu hiệu nguy hiểm",
        "Lú lẫn, lơ mơ hoặc mất phối hợp cần hỗ trợ y tế. Không dùng rượu để giữ ấm.",
      ],
    ],
  ],
};
export function SOS() {
  const [kind, setKind] = useState("lost"),
    [playing, setPlaying] = useState(false);
  const audio = useRef(null),
    timer = useRef(null);
  function stop() {
    clearTimeout(timer.current);
    audio.current?.close();
    audio.current = null;
    setPlaying(false);
  }
  useEffect(() => {
    const hide = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      clearTimeout(timer.current);
      audio.current?.close();
      document.removeEventListener("visibilitychange", hide);
    };
  }, []);
  async function signal() {
    if (playing) {
      stop();
      return;
    }
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audio.current = ctx;
      await ctx.resume();
      const oscillator = ctx.createOscillator(),
        gain = ctx.createGain();
      oscillator.frequency.value = 880;
      gain.gain.value = 0;
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start();
      setPlaying(true);
      const durations = [
        150, 150, 150, 150, 150, 450, 450, 150, 450, 150, 450, 450, 150, 150,
        150, 150, 150, 1050,
      ];
      let index = 0;
      function beat() {
        if (!audio.current) return;
        gain.gain.setValueAtTime(index % 2 === 0 ? 0.08 : 0, ctx.currentTime);
        timer.current = setTimeout(() => {
          index = (index + 1) % durations.length;
          beat();
        }, durations[index]);
      }
      beat();
    } catch {
      stop();
    }
  }
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Bình tĩnh. Ưu tiên an toàn.</h1>
          <p>Chọn tình huống và tìm hỗ trợ phù hợp khi có thể.</p>
        </div>
      </div>
      <div className="chips">
        {Object.entries(scenarios).map(([id, s]) => (
          <button
            key={id}
            className={"chip " + (kind === id ? "active" : "")}
            onClick={() => setKind(id)}
          >
            {s[0]}
          </button>
        ))}
      </div>
      <div className="review-layout">
        <section className="panel">
          <h2>{scenarios[kind][0]}</h2>
          {scenarios[kind][1].map(([title, body], i) => (
            <div className="review-step" key={title}>
              <h3>
                {i + 1}. {title}
              </h3>
              <p>{body}</p>
            </div>
          ))}
          <div className="notice">
            <AlertTriangle size={20} />
            <p>
              Hướng dẫn ban đầu không thay thế chăm sóc y tế hay chỉ dẫn cứu hộ.
              Công cụ này không tự gọi hoặc gửi vị trí đến lực lượng cứu hộ.
            </p>
          </div>
          <p className="small muted mt-5">
            Nguồn:{" "}
            <a
              className="link"
              href="https://www.who.int/health-topics/snakebite/snakebite"
              target="_blank"
              rel="noreferrer"
            >
              WHO
            </a>{" "}
            ·{" "}
            <a
              className="link"
              href="https://www.nps.gov/articles/10essentials.htm"
              target="_blank"
              rel="noreferrer"
            >
              National Park Service
            </a>
          </p>
        </section>
        <aside className="panel">
          <h2>Tín hiệu SOS</h2>
          <div className="morse" aria-label="3 ngắn, 3 dài, 3 ngắn">
            ··· −−− ···
          </div>
          <Button variant="secondary" onClick={signal}>
            {playing ? <Pause size={18} /> : <Volume2 size={18} />}
            {playing ? "Dừng tín hiệu" : "Bật còi SOS"}
          </Button>
          <p className="small muted mt-5">
            Âm thanh 880 Hz chỉ phát trên thiết bị, tiêu thụ pin và tự dừng khi
            rời trang hoặc ẩn trình duyệt.
          </p>
        </aside>
      </div>
    </>
  );
}
export function Offline({ app }) {
  function download() {
    const text = app.tips
      .map((t) => {
        const c = t.content;
        return (
          c.title +
          "\nDụng cụ: " +
          c.tools.join(", ") +
          "\n" +
          c.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.body}`).join("\n") +
          "\nLƯU Ý: " +
          c.warning +
          "\nNguồn: " +
          c.sourceUrl +
          "\n"
        );
      })
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "Tui-Khon-Cam-Nang.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Hành trang không cần sóng.</h1>
          <p>Xuất các bài đã được công khai để mang theo trước chuyến đi.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <section className="panel">
          <Download size={30} />
          <h2 className="mt-4">Cẩm nang văn bản</h2>
          <p className="muted my-4">
            Tải nội dung đã công khai trên máy chủ, kèm đủ ba bước và nguồn.
            Không chứa thông tin tài khoản hoặc bài đang chờ duyệt.
          </p>
          <Button onClick={download}>
            Xuất {app.tips.length} hướng dẫn .txt
          </Button>
        </section>
        <section className="panel">
          <Compass size={30} />
          <h2 className="mt-4">Bộ thực hành ngoại tuyến</h2>
          <p className="muted my-4">
            Mở bộ cẩm nang 3D đã đóng gói, tải gói trước khi đi và kiểm tra lại
            khi tắt mạng. Nội dung gói này độc lập với bài đóng góp mới trên máy
            chủ.
          </p>
          <a className="btn secondary" href="/legacy/#/offline">
            Mở gói ngoại tuyến
          </a>
        </section>
      </div>
    </>
  );
}
