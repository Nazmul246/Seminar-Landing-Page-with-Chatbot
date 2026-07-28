import { useEffect, useRef, useState } from "react";
import "./App.css";
import ChatLauncher from "./components/ChatWidget/ChatLauncher";

const CONFIG = {
  videos: {
    erp: "https://www.youtube.com/embed/VIDEO_ID_ERP",
    soundcam: "https://www.youtube.com/embed/VIDEO_ID_SOUNDCAM",
    counting: "https://www.youtube.com/embed/VIDEO_ID_COUNTING",
    vision: "https://www.youtube.com/embed/VIDEO_ID_VISION",
    sealing: "https://www.youtube.com/embed/VIDEO_ID_SEALING",
    maintenance: "https://www.youtube.com/embed/VIDEO_ID_MAINTENANCE",
    dashboard: "https://www.youtube.com/embed/VIDEO_ID_DASHBOARD",
    iot: "https://www.youtube.com/embed/VIDEO_ID_IOT",
  },
};

function App() {
  const bootRef = useRef(null);
  const bootTextRef = useRef(null);
  const bootBarRef = useRef(null);
  const progressBarRef = useRef(null);
  const heroCanvasRef = useRef(null);
  const waveCanvasRef = useRef(null);
  const pulseCanvasRef = useRef(null);
  const iotCanvasRef = useRef(null);
  const countingSectionRef = useRef(null);

  const [activeVideo, setActiveVideo] = useState(null);
  const [countNum, setCountNum] = useState(0);
  const [litBoxes, setLitBoxes] = useState(0);

  // ---------------- Boot sequence ----------------
  useEffect(() => {
    const lines = [
      "> INITIALIZING SEMINAR HUB...",
      "> LOADING PRODUCT CHANNELS [8/8]",
      "> LINKING DEMOS + CASE STUDIES...",
      "> READY.",
    ];
    const el = bootTextRef.current;
    const bar = bootBarRef.current;
    const bootEl = bootRef.current;
    let out = "";
    let li = 0;
    let ci = 0;
    let cancelled = false;

    function finish() {
      if (cancelled) return;
      cancelled = true;
      if (bootEl) {
        bootEl.classList.add("hide");
        setTimeout(() => bootEl.remove(), 700);
      }
    }

    function typeLine() {
      if (cancelled) return;
      if (li >= lines.length) return finish();
      const current = lines[li];
      if (ci <= current.length) {
        el.innerHTML =
          out + current.slice(0, ci) + '<span class="cursor"></span>';
        bar.style.width =
          Math.min(100, ((li + ci / current.length) / lines.length) * 100) +
          "%";
        ci++;
        setTimeout(typeLine, 14);
      } else {
        out += current + "\n";
        li++;
        ci = 0;
        setTimeout(typeLine, 160);
      }
    }
    typeLine();
    const safety = setTimeout(finish, 3200);

    return () => {
      cancelled = true;
      clearTimeout(safety);
    };
  }, []);

  // ---------------- Scroll progress ----------------
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      if (progressBarRef.current)
        progressBarRef.current.style.width = scrolled + "%";
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  // ---------------- Active side-nav dot ----------------
  useEffect(() => {
    const navLinks = document.querySelectorAll("#sidenav a");
    const sections = document.querySelectorAll("section");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((l) =>
              l.classList.toggle("active", l.getAttribute("href") === "#" + id),
            );
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  // ---------------- Scroll reveal ----------------
  useEffect(() => {
    const els = document.querySelectorAll(".reveal,.reveal-l,.reveal-r");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // ---------------- Hero title line reveal ----------------
  useEffect(() => {
    const spans = document.querySelectorAll("#hero h1 .line span");
    const timers = [];
    spans.forEach((span, i) => {
      span.style.transform = "translateY(110%)";
      span.style.opacity = "0";
      span.style.transition =
        "transform .9s cubic-bezier(.16,.8,.3,1), opacity .9s ease";
      timers.push(
        setTimeout(
          () => {
            span.style.transform = "translateY(0)";
            span.style.opacity = "1";
          },
          150 + i * 140,
        ),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  // ---------------- Video modal: Escape key ----------------
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setActiveVideo(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ---------------- Hero canvas particles ----------------
  useEffect(() => {
    const canvas = heroCanvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, particles, raf;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }
    function init() {
      resize();
      const count = Math.min(70, Math.floor(w / 22));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6,
      }));
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#23d5ff";
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < 110) {
            ctx.globalAlpha = (1 - d / 110) * 0.12;
            ctx.strokeStyle = "#23d5ff";
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener("resize", resize);
    init();
    frame();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ---------------- Soundcam waveform ----------------
  useEffect(() => {
    const canvas = waveCanvasRef.current;
    const ctx = canvas.getContext("2d");
    let w,
      h,
      t = 0,
      raf;
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
    }
    const bars = 46;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      const bw = w / bars;
      for (let i = 0; i < bars; i++) {
        const n = Math.sin(i * 0.4 + t) * Math.sin(i * 0.15 - t * 0.6);
        const spike =
          i > bars * 0.55 && i < bars * 0.62 ? Math.sin(t * 6) * 0.9 : 0;
        const amp = (Math.abs(n) * 0.55 + Math.abs(spike)) * h * 0.42 + 4;
        const isAnomaly = spike > 0.3;
        ctx.fillStyle = isAnomaly ? "#ff5470" : "#23d5ff";
        ctx.globalAlpha = isAnomaly ? 1 : 0.75;
        ctx.fillRect(i * bw + bw * 0.2, h / 2 - amp / 2, bw * 0.6, amp);
      }
      t += 0.045;
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener("resize", resize);
    resize();
    frame();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ---------------- Maintenance pulse line ----------------
  useEffect(() => {
    const canvas = pulseCanvasRef.current;
    const ctx = canvas.getContext("2d");
    let w,
      h,
      t = 0,
      raf;
    function resize() {
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
    }
    function frame() {
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.strokeStyle = "#35f2a0";
      ctx.lineWidth = 1.6;
      for (let x = 0; x < w; x++) {
        const p = (x / w) * Math.PI * 8 + t;
        const y =
          h / 2 +
          Math.sin(p) * h * 0.28 * (0.3 + 0.7 * Math.abs(Math.sin(t * 0.3)));
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
      t += 0.05;
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener("resize", resize);
    resize();
    frame();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ---------------- IoT node network ----------------
  useEffect(() => {
    const canvas = iotCanvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, nodes, raf;
    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width;
      h = canvas.height = rect.height;
      nodes = Array.from({ length: 9 }, () => ({
        x: Math.random() * w * 0.8 + w * 0.1,
        y: Math.random() * h * 0.8 + h * 0.1,
        phase: Math.random() * Math.PI * 2,
      }));
    }
    function frame(t) {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(35,213,255,.25)";
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const d = Math.hypot(
            nodes[i].x - nodes[j].x,
            nodes[i].y - nodes[j].y,
          );
          if (d < Math.min(w, h) * 0.42) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
      nodes.forEach((n) => {
        const pulse = (Math.sin(t * 0.002 + n.phase) + 1) / 2;
        ctx.beginPath();
        ctx.fillStyle = "#23d5ff";
        ctx.arc(n.x, n.y, 3 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.strokeStyle = `rgba(35,213,255,${0.35 * (1 - pulse)})`;
        ctx.arc(n.x, n.y, 6 + pulse * 14, 0, Math.PI * 2);
        ctx.stroke();
      });
      raf = requestAnimationFrame(frame);
    }
    window.addEventListener("resize", resize);
    resize();
    raf = requestAnimationFrame(frame);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ---------------- Counting ticker (runs once, on scroll into view) ----------------
  useEffect(() => {
    let started = false;
    function run() {
      if (started) return;
      started = true;
      let n = 0;
      const target = 1284;
      const step = () => {
        n += Math.ceil((target - n) * 0.08) + 3;
        if (n >= target) n = target;
        setCountNum(n);
        if (n < target) requestAnimationFrame(step);
      };
      step();
      let bi = 0;
      const boxTimer = setInterval(() => {
        if (bi >= 12) {
          clearInterval(boxTimer);
          bi = 0;
          setLitBoxes(0);
          return;
        }
        bi++;
        setLitBoxes(bi);
      }, 220);
    }
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.5 },
    );
    if (countingSectionRef.current) obs.observe(countingSectionRef.current);
    return () => obs.disconnect();
  }, []);

  function openVideo(key) {
    setActiveVideo(key);
  }

  return (
    <>
      <div id="boot" ref={bootRef}>
        <div className="mark" ref={bootTextRef}></div>
        <div className="bar">
          <i ref={bootBarRef}></i>
        </div>
        <button
          className="skip"
          onClick={() => bootRef.current?.classList.add("hide")}
        >
          Skip →
        </button>
      </div>

      <div id="progress">
        <i ref={progressBarRef}></i>
      </div>

      <nav id="sidenav">
        <a href="#hero" data-label="INTRO" className="active"></a>
        <a href="#erp" data-label="CH.01 ERP"></a>
        <a href="#soundcam" data-label="CH.02 SOUNDCAM"></a>
        <a href="#counting" data-label="CH.03 COUNTING"></a>
        <a href="#vision" data-label="CH.04 VISION"></a>
        <a href="#sealing" data-label="CH.05 SEALING"></a>
        <a href="#maintenance" data-label="CH.06 MAINTENANCE"></a>
        <a href="#dashboard" data-label="CH.07 DASHBOARD"></a>
        <a href="#iot" data-label="CH.08 IOT"></a>
        <a href="#contact" data-label="SIGNAL / CONTACT"></a>
      </nav>

      <section id="hero">
        <canvas ref={heroCanvasRef}></canvas>
        <div className="wrap hero-inner">
          <div className="hero-tag">
            <span className="pill">
              <i></i>SYSTEM ONLINE
            </span>
            <span>SMART FACTORY AI SEMINAR</span>
          </div>
          <h1 className="title">
            <span className="line">
              <span>Every machine has</span>
            </span>
            <span className="line">
              <span>
                a story. <em className="accent">We built the</em>
              </span>
            </span>
            <span className="line">
              <span className="accent">sensors that listen.</span>
            </span>
          </h1>
          <p className="hero-sub reveal d2">
            You're looking at the table screen from today's seminar. Everything
            you saw on stage — demos, dashboards, case studies — is here, in one
            place, ready whenever you are.
          </p>

          <div className="hero-meta reveal d3">
            <div className="m">
              <label>Date</label>
              <span className="v">22 SEP 2026</span>
            </div>
            <div className="m">
              <label>Channels</label>
              <span className="v">08 Active</span>
            </div>
            <div className="m">
              <label>Access</label>
              <span className="v">QR / Direct</span>
            </div>
          </div>

          <div className="hero-cta reveal d4">
            <a href="#erp" className="btn btn-primary">
              Explore the products
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </a>
            <a
              href="/assets/company-prospectus.pdf"
              download
              className="btn btn-outline"
            >
              Download full prospectus
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
              </svg>
            </a>
          </div>
        </div>
        <div className="scrollcue">
          <div className="track">
            <i></i>
          </div>
          Scroll
        </div>
      </section>

      <section id="erp">
        <div className="gridbg"></div>
        <div className="wrap channel">
          <div>
            <span className="ch-index reveal">
              CH.01 / 08 — ENTERPRISE RESOURCE PLANNING
            </span>
            <div className="eyebrow reveal">THAIBIZ360 ERP</div>
            <h2 className="ch-title reveal d1">
              Run the whole business from one screen.
            </h2>
            <p className="ch-body reveal d2">
              Sales, inventory, accounting and production, unified into a single
              live system built for Thai businesses — so every team sees the
              same numbers, at the same time.
            </p>
            <div className="ch-actions reveal d3">
              <button
                className="btn btn-primary"
                onClick={() => openVideo("erp")}
              >
                Watch demo
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <a
                href="/assets/thaibiz360-brochure.pdf"
                download
                className="btn btn-outline"
              >
                Download brochure
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
                </svg>
              </a>
            </div>
          </div>
          <div className="panel reveal-r">
            <div className="hud">
              <span>MODULE / ERP-CORE</span>
              <span className="live">
                <i></i>SYNCED
              </span>
            </div>
            <div className="scanline"></div>
            <div className="stage">
              <div className="viz-erp">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div className="cell" key={i}></div>
                ))}
              </div>
            </div>
            <div className="corner tl"></div>
            <div className="corner br"></div>
          </div>
        </div>
      </section>

      <section id="soundcam">
        <div className="gridbg"></div>
        <div className="wrap channel rev">
          <div>
            <span className="ch-index reveal">
              CH.02 / 08 — ACOUSTIC ANOMALY DETECTION
            </span>
            <div className="eyebrow reveal">SOUNDCAM AI</div>
            <h2 className="ch-title reveal d1">
              Hear a compressor failing before it fails.
            </h2>
            <p className="ch-body reveal d2">
              SoundCam AI listens to the sound signature of your machines around
              the clock, and flags the exact moment a compressor starts drifting
              from normal — days before a human ear would notice.
            </p>
            <div className="ch-actions reveal d3">
              <button
                className="btn btn-primary"
                onClick={() => openVideo("soundcam")}
              >
                Compressor detection demo
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
              <a
                href="/assets/soundcam-case-study.pdf"
                download
                className="btn btn-outline"
              >
                Download case study
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 3v12M7 10l5 5 5-5M4 21h16" />
                </svg>
              </a>
            </div>
          </div>
          <div className="panel reveal-l">
            <div className="hud">
              <span>MODULE / ACOUSTIC-01</span>
              <span className="live">
                <i></i>LISTENING
              </span>
            </div>
            <canvas
              className="stage"
              ref={waveCanvasRef}
              style={{ position: "absolute" }}
            ></canvas>
            <div className="corner tl"></div>
            <div className="corner br"></div>
          </div>
        </div>
      </section>

      <section id="counting" ref={countingSectionRef}>
        <div className="gridbg"></div>
        <div className="wrap channel">
          <div>
            <span className="ch-index reveal">
              CH.03 / 08 — AUTOMATED COUNTING
            </span>
            <div className="eyebrow reveal">AI COUNTING SYSTEM</div>
            <h2 className="ch-title reveal d1">
              Every unit counted. Zero manual tally.
            </h2>
            <p className="ch-body reveal d2">
              A camera and a trained model replace the clipboard — counting
              cartons, bottles or parts on the line in real time, with an audit
              trail you can trust.
            </p>
            <div className="ch-actions reveal d3">
              <button
                className="btn btn-primary"
                onClick={() => openVideo("counting")}
              >
                Watch intro video
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="panel reveal-r">
            <div className="hud">
              <span>MODULE / COUNT-01</span>
              <span className="live">
                <i></i>COUNTING
              </span>
            </div>
            <div className="stage">
              <div className="viz-count">
                <div className="num">{countNum.toLocaleString()}</div>
                <div className="lbl">Units / Hour</div>
                <div className="boxes">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <i key={i} className={i < litBoxes ? "on" : ""}></i>
                  ))}
                </div>
              </div>
            </div>
            <div className="corner tl"></div>
            <div className="corner br"></div>
          </div>
        </div>
      </section>

      <section id="vision">
        <div className="gridbg"></div>
        <div className="wrap channel rev">
          <div>
            <span className="ch-index reveal">
              CH.04 / 08 — VISUAL QUALITY CONTROL
            </span>
            <div className="eyebrow reveal">AI VISION INSPECTION</div>
            <h2 className="ch-title reveal d1">
              Catch the defect the human eye blinks past.
            </h2>
            <p className="ch-body reveal d2">
              Trained vision models scan every unit at line speed, catching
              scratches, misprints and shape defects consistently — shift after
              shift, with no fatigue.
            </p>
            <div className="ch-actions reveal d3">
              <button
                className="btn btn-primary"
                onClick={() => openVideo("vision")}
              >
                Watch intro video
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="panel reveal-l">
            <div className="hud">
              <span>MODULE / VISION-01</span>
              <span className="live">
                <i></i>SCANNING
              </span>
            </div>
            <div className="scanline"></div>
            <div className="stage">
              <div className="viz-target">
                <div className="ring"></div>
                <span className="tick">PASS ✓</span>
              </div>
            </div>
            <div className="corner tl"></div>
            <div className="corner br"></div>
          </div>
        </div>
      </section>

      <section id="sealing">
        <div className="gridbg"></div>
        <div className="wrap channel">
          <div>
            <span className="ch-index reveal">
              CH.05 / 08 — PACKAGE INTEGRITY
            </span>
            <div className="eyebrow reveal">AI SEALING INSPECTION</div>
            <h2 className="ch-title reveal d1">
              Confirm every seal, before it leaves the line.
            </h2>
            <p className="ch-body reveal d2">
              A dedicated model checks seal alignment and coverage on every
              pack, catching the loose or crooked seal that leads to a return or
              a spoiled shipment.
            </p>
            <div className="ch-actions reveal d3">
              <button
                className="btn btn-primary"
                onClick={() => openVideo("sealing")}
              >
                Watch intro video
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="panel reveal-r">
            <div className="hud">
              <span>MODULE / SEAL-01</span>
              <span className="live">
                <i></i>INSPECTING
              </span>
            </div>
            <div className="scanline"></div>
            <div className="stage">
              <div
                className="viz-target"
                style={{ width: "46%", borderRadius: "6px" }}
              >
                <div
                  className="ring"
                  style={{ width: "70%", height: "40%", borderRadius: "6px" }}
                ></div>
                <span className="tick" style={{ animationDelay: "1.6s" }}>
                  SEAL OK ✓
                </span>
              </div>
            </div>
            <div className="corner tl"></div>
            <div className="corner br"></div>
          </div>
        </div>
      </section>

      <section id="maintenance">
        <div className="gridbg"></div>
        <div className="wrap channel rev">
          <div>
            <span className="ch-index reveal">
              CH.06 / 08 — MACHINE HEALTH MONITORING
            </span>
            <div className="eyebrow reveal">PREDICTIVE MAINTENANCE</div>
            <h2 className="ch-title reveal d1">
              Know which machine needs you next week — not next breakdown.
            </h2>
            <p className="ch-body reveal d2">
              Vibration and sensor data are read continuously to flag drifting
              equipment health, turning surprise downtime into a scheduled,
              low-cost repair.
            </p>
            <div className="ch-actions reveal d3">
              <a
                href="https://demo.example.com/predictive-maintenance"
                target="_blank"
                rel="noopener"
                className="btn btn-primary"
              >
                Dashboard demo
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17l5-5 3 3 5-6M14 8h5v5" />
                </svg>
              </a>
              <button
                className="btn btn-outline"
                onClick={() => openVideo("maintenance")}
              >
                YouTube video
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="panel reveal-l">
            <div className="hud">
              <span>MODULE / MAINT-01</span>
              <span className="live">
                <i></i>MONITORING
              </span>
            </div>
            <div className="stage">
              <div className="viz-gear">
                <svg
                  viewBox="0 0 100 100"
                  width="120"
                  height="120"
                  fill="none"
                  stroke="var(--cyan-dim)"
                  strokeWidth="4"
                >
                  <circle cx="50" cy="50" r="18" strokeWidth="4" />
                  <g stroke="var(--cyan-dim)">
                    <path d="M50 12v14M50 74v14M88 50H74M26 50H12M74.5 25.5l-9.9 9.9M35.4 64.6l-9.9 9.9M74.5 74.5l-9.9-9.9M35.4 35.4l-9.9-9.9" />
                  </g>
                </svg>
              </div>
            </div>
            <canvas className="viz-wave" ref={pulseCanvasRef}></canvas>
            <div className="corner tl"></div>
            <div className="corner br"></div>
          </div>
        </div>
      </section>

      <section id="dashboard">
        <div className="gridbg"></div>
        <div className="wrap channel">
          <div>
            <span className="ch-index reveal">
              CH.07 / 08 — REAL-TIME OPERATIONS
            </span>
            <div className="eyebrow reveal">SMART FACTORY DASHBOARD</div>
            <h2 className="ch-title reveal d1">
              Your whole factory floor, on one live screen.
            </h2>
            <p className="ch-body reveal d2">
              Output, downtime, quality and energy use, pulled from every line
              into a single dashboard — so shift leads and management always see
              the same live picture.
            </p>
            <div className="ch-actions reveal d3">
              <a
                href="https://demo.example.com/smart-factory"
                target="_blank"
                rel="noopener"
                className="btn btn-primary"
              >
                Dashboard demo
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17l5-5 3 3 5-6M14 8h5v5" />
                </svg>
              </a>
              <button
                className="btn btn-outline"
                onClick={() => openVideo("dashboard")}
              >
                YouTube video
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="panel reveal-r">
            <div className="hud">
              <span>MODULE / DASH-01</span>
              <span className="live">
                <i></i>STREAMING
              </span>
            </div>
            <div className="stage">
              <div className="viz-bars">
                {Array.from({ length: 7 }).map((_, i) => (
                  <i key={i}></i>
                ))}
              </div>
            </div>
            <div className="corner tl"></div>
            <div className="corner br"></div>
          </div>
        </div>
      </section>

      <section id="iot">
        <div className="gridbg"></div>
        <div className="wrap channel rev">
          <div>
            <span className="ch-index reveal">
              CH.08 / 08 — CONNECTED DEVICES
            </span>
            <div className="eyebrow reveal">INDUSTRIAL IOT</div>
            <h2 className="ch-title reveal d1">
              Every sensor talking. Every signal logged.
            </h2>
            <p className="ch-body reveal d2">
              Meters, PLCs and legacy machines connected onto one network, so
              any reading from any point on the floor is visible, logged and
              ready to trigger an alert.
            </p>
            <div className="ch-actions reveal d3">
              <a
                href="https://demo.example.com/industrial-iot"
                target="_blank"
                rel="noopener"
                className="btn btn-primary"
              >
                Dashboard demo
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M7 17l5-5 3 3 5-6M14 8h5v5" />
                </svg>
              </a>
              <button
                className="btn btn-outline"
                onClick={() => openVideo("iot")}
              >
                YouTube video
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="panel reveal-l">
            <div className="hud">
              <span>MODULE / IOT-01</span>
              <span className="live">
                <i></i>CONNECTED
              </span>
            </div>
            <canvas
              className="viz-iot stage"
              ref={iotCanvasRef}
              style={{ position: "absolute" }}
            ></canvas>
            <div className="corner tl"></div>
            <div className="corner br"></div>
          </div>
        </div>
      </section>

      <section id="contact">
        <div className="gridbg"></div>
        <div className="wrap">
          <div className="eyebrow reveal" style={{ justifyContent: "center" }}>
            SIGNAL / GET IN TOUCH
          </div>
          <h2 className="ch-title reveal d1">
            Seen enough? Let's put it on your line.
          </h2>
          <p className="ch-body reveal d2">
            Book a free demo and we'll walk through which of these systems fits
            your factory first — no commitment, just a straight look at the
            numbers.
          </p>
          <div className="contact-cta reveal d3">
            <a
              href="https://forms.example.com/book-demo"
              target="_blank"
              rel="noopener"
              className="btn btn-primary"
              style={{ padding: "19px 38px", fontSize: "13px" }}
            >
              Book a free demo
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M8 7V3M16 7V3M4 11h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
              </svg>
            </a>
          </div>

          <div className="channels reveal d4">
            <a
              className="chan-card"
              href="https://line.me/ti/p/~yourlineid"
              target="_blank"
              rel="noopener"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              <span className="cl">LINE</span>
              <span className="cv">@yourlineid</span>
            </a>
            <a className="chan-card" href="mailto:contact@yourcompany.com">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M4 4h16v16H4z" />
                <path d="m4 6 8 7 8-7" />
              </svg>
              <span className="cl">Email</span>
              <span className="cv">contact@yourcompany.com</span>
            </a>
            <a
              className="chan-card"
              href="https://www.yourcompany.com"
              target="_blank"
              rel="noopener"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
              </svg>
              <span className="cl">Website</span>
              <span className="cv">www.yourcompany.com</span>
            </a>
          </div>
        </div>
      </section>

      <footer>
        <div>SMART FACTORY AI SEMINAR — 22 SEPTEMBER 2026</div>
        <div className="fline">
          © 2026 YOUR COMPANY NAME. ALL RIGHTS RESERVED.
        </div>
      </footer>

      <div id="modal" className={activeVideo ? "open" : ""}>
        <div className="box">
          <button className="close" onClick={() => setActiveVideo(null)}>
            Close ✕
          </button>
          {activeVideo && (
            <iframe
              src={CONFIG.videos[activeVideo] + "?autoplay=1"}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          )}
        </div>
      </div>

      <ChatLauncher />
    </>
  );
}

export default App;
