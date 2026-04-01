"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

gsap.registerPlugin(ScrollTrigger);

// ─── Frame config ─────────────────────────────────────────────────────────
const FRAME_COUNT = 192;
const FRAME_PATH = (n: number) =>
  `/frames/frame_${String(n).padStart(4, "0")}.jpg`;
const FRAME_SPEED = 1.45;
const IMAGE_SCALE = 0.86;
const FIRST_BATCH = 10;
const CANVAS_BG = "#d4d0c8";

// ─── Data ─────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    num: "01",
    name: "Diseño Arquitectónico",
    desc: "Proyectos residenciales, corporativos y culturales con enfoque en luz natural, materialidad honesta y eficiencia espacial.",
  },
  {
    num: "02",
    name: "Consultoría Técnica",
    desc: "Asesoramiento en etapas de prefactibilidad, documentación técnica, coordinación con ingeniería estructural y MEP.",
  },
  {
    num: "03",
    name: "Diseño de Interiores",
    desc: "Espacios interiores coherentes con la arquitectura: selección de materiales, amoblamiento a medida y dirección de obra.",
  },
  {
    num: "04",
    name: "Paisajismo y Entorno",
    desc: "Integración del paisaje como parte del programa: jardines, patios, cubiertas verdes y bordes de agua.",
  },
];

const PROJECTS = [
  { num: "001", name: "Casa Bardas",         type: "Residencial",  year: "2024" },
  { num: "002", name: "Centro Cívico Lomas", type: "Institucional", year: "2023" },
  { num: "003", name: "Loft Palermo",         type: "Residencial",  year: "2023" },
  { num: "004", name: "Biblioteca Moreno",    type: "Cultural",     year: "2022" },
  { num: "005", name: "Hotel Boutique Sur",   type: "Hospitalidad", year: "2022" },
  { num: "006", name: "Galería Norte",        type: "Comercial",    year: "2021" },
];

// ─── Win2k title bar close/min/max buttons ────────────────────────────────
function WinButtons() {
  return (
    <div className="vz-paper__titlebar-btns" aria-hidden="true">
      <div className="win-btn">_</div>
      <div className="win-btn">□</div>
      <div className="win-btn win-btn--close">✕</div>
    </div>
  );
}

// ─── Clock component ──────────────────────────────────────────────────────
function TaskbarClock() {
  const [time, setTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  });

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }));
    }, 10000);
    return () => clearInterval(id);
  }, []);

  return <span>{time}</span>;
}

// ─── Component ────────────────────────────────────────────────────────────
export function GenesisLanding() {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const ctxRef       = useRef<CanvasRenderingContext2D | null>(null);
  const videoZoneRef = useRef<HTMLDivElement>(null);
  const featureRef   = useRef<HTMLDivElement>(null);
  const servicesColumnRef = useRef<HTMLDivElement>(null);
  const heroRef      = useRef<HTMLDivElement>(null);
  const loaderRef    = useRef<HTMLDivElement>(null);

  const framesRef       = useRef<(HTMLImageElement | null)[]>(
    Array(FRAME_COUNT).fill(null),
  );
  const currentFrameRef = useRef(0);
  const rafRef          = useRef(0);
  const layoutRef = useRef({ cw: 0, ch: 0, dpr: 1 });

  const [loadPct, setLoadPct] = useState(0);

  // ── Draw ────────────────────────────────────────────────────────────────
  const drawFrame = useCallback((index: number) => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const img = framesRef.current[index];
    if (!img?.complete || !img.naturalWidth) return;

    const { cw, ch } = layoutRef.current;
    if (cw < 1 || ch < 1) return;

    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const sc = Math.max(cw / iw, ch / ih) * IMAGE_SCALE;
    const dw = iw * sc;
    const dh = ih * sc;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;

    ctx.fillStyle = CANVAS_BG;
    ctx.fillRect(0, 0, cw, ch);
    ctx.drawImage(img, dx, dy, dw, dh);
  }, []);

  const scheduleFrame = useCallback(
    (index: number) => {
      if (index === currentFrameRef.current) return;
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        currentFrameRef.current = index;
        drawFrame(index);
      });
    },
    [drawFrame],
  );

  // ── Resize ──────────────────────────────────────────────────────────────
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const w   = window.innerWidth;
    const h   = window.innerHeight;
    canvas.width  = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width  = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d", {
      alpha: false,
      desynchronized: true,
    });
    if (!ctx) return;
    ctxRef.current = ctx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "medium";

    layoutRef.current = { cw: w, ch: h, dpr };
    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  useLayoutEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, [resizeCanvas]);

  // ── Main effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    const videoZone = videoZoneRef.current;
    const feature = featureRef.current;
    const servicesColumn = servicesColumnRef.current;
    const hero = heroRef.current;
    const loader = loaderRef.current;
    if (!videoZone || !feature || !servicesColumn || !hero || !loader) return;

    const serviceRowsVideo = videoZone.querySelectorAll<HTMLElement>(
      ".service-li--video",
    );
    const loaderEl = loader;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = prefersReduced
      ? null
      : new Lenis({
          autoRaf: true,
          lerp: 0.055,
          smoothWheel: true,
          syncTouch: true,
          wheelMultiplier: 0.88,
          touchMultiplier: 1.15,
        });

    if (lenis) {
      lenis.on("scroll", ScrollTrigger.update);
    }

    const stVideo = ScrollTrigger.create({
      trigger: videoZone,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.12,
      onUpdate: ({ progress: p }) => {
        const acc = Math.min(p * FRAME_SPEED, 1);
        const idx = Math.min(Math.floor(acc * FRAME_COUNT), FRAME_COUNT - 1);
        scheduleFrame(idx);

        hero.style.opacity = String(Math.max(0, 1 - p / 0.14));
        hero.style.pointerEvents = p > 0.1 ? "none" : "";

        const leftIn = Math.max(0, Math.min(1, (p - 0.05) / 0.12));
        const leftOut = p > 0.94 ? Math.max(0, 1 - (p - 0.94) / 0.06) : 1;
        feature.style.opacity = String(leftIn * leftOut);

        const rightIn = Math.max(0, Math.min(1, (p - 0.1) / 0.12));
        servicesColumn.style.opacity = String(rightIn);
        servicesColumn.style.transform = `translateY(${(1 - rightIn) * 20}px)`;

        serviceRowsVideo.forEach((row, i) => {
          const start = 0.14 + i * 0.042;
          const end = start + 0.038;
          const t =
            p <= start ? 0 : p >= end ? 1 : (p - start) / (end - start);
          row.style.opacity = String(t);
          row.style.transform = `translateY(${(1 - t) * 12}px)`;
        });
      },
    });

    const revealEls = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    gsap.set(revealEls, { autoAlpha: 0, y: 24 });

    const revealTriggers: ScrollTrigger[] = [];

    revealEls.forEach((el) => {
      const siblings = Array.from(
        el.parentElement?.querySelectorAll<HTMLElement>("[data-reveal]") ?? [],
      );
      const sibIdx = siblings.indexOf(el);
      const delay  = sibIdx > 0 ? sibIdx * 0.06 : 0;

      const st = ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        onEnter: () => {
          gsap.to(el, {
            autoAlpha: 1,
            y: 0,
            duration: 0.5,
            delay,
            ease: "power2.out",
            overwrite: "auto",
          });
        },
        once: true,
      });
      revealTriggers.push(st);
    });

    const counterTriggers: ScrollTrigger[] = [];
    document.querySelectorAll<HTMLElement>(".stat-num[data-value]").forEach((el) => {
      const target   = parseFloat(el.dataset.value!);
      const decimals = parseInt(el.dataset.decimals ?? "0", 10);
      const proxy    = { val: 0 };

      const ct = ScrollTrigger.create({
        trigger: el.closest(".stat-cell") ?? el,
        start: "top 78%",
        toggleActions: "play none none reset",
        onEnter: () => {
          proxy.val = 0;
          gsap.to(proxy, {
            val: target,
            duration: 1.5,
            ease: "power2.out",
            onUpdate() {
              el.textContent = decimals > 0
                ? proxy.val.toFixed(decimals)
                : String(Math.round(proxy.val));
            },
            onComplete() {
              el.textContent = decimals > 0
                ? target.toFixed(decimals)
                : String(target);
            },
          });
        },
        onLeaveBack: () => {
          gsap.killTweensOf(proxy);
          proxy.val = 0;
          el.textContent = "0";
        },
      });
      counterTriggers.push(ct);
    });

    let loaded = 0;
    let firstPaintDone = false;
    let lastPctShown = -1;
    const reportPct = (pct: number) => {
      if (pct === 100 || pct - lastPctShown >= 4) {
        lastPctShown = pct;
        setLoadPct(pct);
      }
    };

    function loadImage(n: number): Promise<void> {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.decoding = "async";
        img.src = FRAME_PATH(n + 1);
        const done = () => {
          framesRef.current[n] = img;
          loaded++;
          reportPct(Math.round((loaded / FRAME_COUNT) * 100));
          if (!firstPaintDone && loaded >= FIRST_BATCH) {
            firstPaintDone = true;
            drawFrame(0);
          }
          resolve();
        };
        img.onload = () => {
          if ("decode" in img && typeof img.decode === "function") {
            img.decode().then(done).catch(done);
          } else {
            done();
          }
        };
        img.onerror = () => {
          loaded++;
          reportPct(Math.round((loaded / FRAME_COUNT) * 100));
          resolve();
        };
      });
    }

    async function loadAll() {
      for (let i = 0; i < Math.min(FIRST_BATCH, FRAME_COUNT); i++) {
        await loadImage(i);
      }
      const rest = Array.from(
        { length: FRAME_COUNT - FIRST_BATCH },
        (_, i) => i + FIRST_BATCH,
      );
      const CHUNK = 20;
      for (let i = 0; i < rest.length; i += CHUNK) {
        await Promise.all(rest.slice(i, i + CHUNK).map(loadImage));
      }
      setLoadPct(100);
      gsap.delayedCall(0.3, () => {
        loaderEl.classList.add("is-hidden");
        ScrollTrigger.refresh();
      });
    }

    loadAll();

    return () => {
      cancelAnimationFrame(rafRef.current);
      revealTriggers.forEach((t) => t.kill());
      counterTriggers.forEach((t) => t.kill());
      stVideo.kill();
      lenis?.destroy();
    };
  }, [drawFrame, scheduleFrame]);

  // ─── JSX ────────────────────────────────────────────────────────────────
  return (
    <>
      <a href="#servicios" className="skip-link">Ir al contenido</a>

      {/* ── Loader — Win2k dialog ── */}
      <div id="loader" ref={loaderRef} role="status" aria-live="polite">
        <div className="loader-dialog" role="dialog" aria-label="Cargando Génesis Arq">
          <div className="loader-titlebar">
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <div className="loader-titlebar-icon" aria-hidden="true">🏛</div>
              <span>Génesis Arq — Cargando...</span>
            </div>
            <div style={{ display: "flex", gap: "2px" }} aria-hidden="true">
              <div className="win-btn">_</div>
              <div className="win-btn">□</div>
              <div className="win-btn win-btn--close">✕</div>
            </div>
          </div>
          <div className="loader-body">
            <div className="loader-brand">Génesis Arq</div>
            <div className="loader-msg">Iniciando recursos del estudio...</div>
            <div id="loader-bar" role="progressbar" aria-valuenow={loadPct} aria-valuemin={0} aria-valuemax={100}>
              <div
                id="loader-fill"
                style={{ ["--fill" as string]: loadPct / 100 }}
              />
            </div>
            <span id="loader-pct" aria-hidden="true">{loadPct}%</span>
          </div>
        </div>
        <p style={{ fontFamily: "Tahoma, Arial, sans-serif", fontSize: "10px", color: "#c8e8c8", marginTop: "8px" }}>
          © Microsoft Windows 2000 — Bienvenido
        </p>
      </div>

      {/* ── Win2k top menu bar ── */}
      <header className="site-header" role="banner">
        <a href="#" className="site-logo" aria-label="Génesis Arq — inicio">
          <div className="site-logo-icon" aria-hidden="true">G</div>
          Génesis Arq
        </a>
        <nav className="site-nav" aria-label="Principal">
          <a href="#servicios">Servicios</a>
          <a href="#proyectos">Proyectos</a>
          <a href="#estudio">Estudio</a>
          <a href="#contacto">Contacto</a>
        </nav>
      </header>

      {/* ── Marquee bar — classic web 2000 ── */}
      <div className="marquee-bar" aria-hidden="true">
        <div className="marquee-inner">
          🏛 Bienvenido al sitio oficial de Génesis Arq &nbsp;·&nbsp; Estudio de arquitectura en Buenos Aires desde 2006 &nbsp;·&nbsp; 42 obras entregadas &nbsp;·&nbsp; 3 premios nacionales &nbsp;·&nbsp; Diseño arquitectónico · Consultoría técnica · Interiores · Paisajismo &nbsp;·&nbsp; Contáctenos: hola@genesisarq.studio &nbsp;·&nbsp; ¡Este sitio es optimizado para Internet Explorer 5.0 o superior! &nbsp;·&nbsp; Resolución recomendada: 1024×768 &nbsp;·&nbsp;
        </div>
      </div>

      {/* ── Canvas — fixed background ── */}
      <div className="canvas-wrap" aria-hidden="true">
        <canvas id="genesis-canvas" ref={canvasRef} />
      </div>

      {/* ── Grain disabled ── */}
      <div className="grain" aria-hidden="true" />

      {/* ── Hero overlay — Win2k dialog window ── */}
      <div id="hero-overlay" ref={heroRef}>
        <div className="hero-inner" role="region" aria-label="Bienvenida">
          {/* Title bar */}
          <div className="win-titlebar">
            <div className="win-titlebar-left">
              <div className="win-titlebar-icon" aria-hidden="true">🏛</div>
              Génesis Arq — Estudio de Arquitectura
            </div>
            <div className="win-titlebar-btns" aria-hidden="true">
              <div className="win-btn">_</div>
              <div className="win-btn">□</div>
              <div className="win-btn win-btn--close">✕</div>
            </div>
          </div>
          {/* Body */}
          <div className="win-body">
            <p className="hero-eyebrow">Estudio de arquitectura · Buenos Aires</p>
            <h1 className="hero-heading">
              <span className="hero-word">Génesis</span>{" "}
              <span className="hero-word">Arq</span>
            </h1>
            <span className="hero-line" aria-hidden="true" />
            <p className="hero-tagline">
              Espacios habitables, luz medida y materia honesta.
              Diseñamos desde la idea hasta la obra con una sola línea editorial.
            </p>
            <div className="scroll-cue" aria-hidden="true">
              <span className="scroll-cue-bar" />
              <span>Deslizar para explorar</span>
            </div>
          </div>
          {/* Status bar */}
          <div className="hero-statusbar" aria-hidden="true">
            <span className="statusbar-panel">Listo</span>
            <span className="statusbar-panel">Buenos Aires, Argentina</span>
            <span className="statusbar-panel">© 2025 Génesis Arq</span>
          </div>
        </div>
      </div>

      {/* ── Video zone: 2 columnas ── */}
      <div ref={videoZoneRef} className="video-zone">
        <div className="video-zone-sticky">
          <div className="video-zone-split shell">

            {/* ── Columna izquierda: Filosofía ── */}
            <div ref={featureRef} className="video-zone-col video-zone-col--left">
              <div className="vz-paper">
                {/* Title bar */}
                <div className="vz-paper__titlebar">
                  <div className="vz-paper__titlebar-left">
                    <div className="vz-paper__titlebar-icon" aria-hidden="true">💡</div>
                    002 · Filosofía — Génesis Arq
                  </div>
                  <WinButtons />
                </div>
                <div className="vz-paper__content">
                  <h2 className="vz-paper__h">Forma que habita</h2>
                  <p className="vz-paper__lead">
                    Cada proyecto parte de una lectura precisa del lugar, el clima y
                    el programa. La geometría es consecuencia, no punto de partida.
                  </p>
                  <div className="vz-paper__split">
                    <div className="vz-groupbox">
                      <span className="vz-groupbox__label">Misión</span>
                      <p className="vz-paper__note">
                        Traducir el habitar en proyectos construibles, con rigor
                        técnico y una sola línea editorial de principio a obra.
                      </p>
                    </div>
                    <div className="vz-groupbox">
                      <span className="vz-groupbox__label">Visión</span>
                      <p className="vz-paper__note">
                        Arquitectura contemporánea a escala humana: luz medida,
                        materia honesta y tiempo sostenible.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="vz-paper__statusbar" aria-hidden="true">
                  <span className="vz-paper__statusbar-panel">2 elementos</span>
                  <span className="vz-paper__statusbar-panel">Filosofía</span>
                </div>
              </div>
            </div>

            {/* ── Columna derecha: Servicios ── */}
            <div
              ref={servicesColumnRef}
              className="video-zone-col video-zone-col--right"
              id="servicios"
            >
              <div className="vz-paper vz-paper--services">
                {/* Title bar */}
                <div className="vz-paper__titlebar">
                  <div className="vz-paper__titlebar-left">
                    <div className="vz-paper__titlebar-icon" aria-hidden="true">🔧</div>
                    01 · Servicios — Lo que hacemos
                  </div>
                  <WinButtons />
                </div>
                <div className="vz-paper__content">
                  <h2 className="vz-paper__h">Lo que hacemos</h2>
                  <p className="vz-paper__lead">
                    Diseño y dirección de obra con el mismo equipo. Podés encargar
                    una etapa o el proyecto completo.
                  </p>
                  <ul className="vz-service-list" aria-label="Listado de servicios">
                    {SERVICES.map((s) => (
                      <li className="service-li service-li--video" key={s.num}>
                        <span className="service-li__num">{s.num}</span>
                        <div className="service-li__body">
                          <h3 className="service-li__name">{s.name}</h3>
                          <p className="service-li__desc">{s.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="vz-paper__statusbar" aria-hidden="true">
                  <span className="vz-paper__statusbar-panel">4 servicios</span>
                  <span className="vz-paper__statusbar-panel">Disponibles</span>
                </div>
              </div>
            </div>

          </div>
        </div>
        <div className="video-zone-gradient" aria-hidden="true" />
      </div>

      {/* ── Content sections ── */}
      <div className="content-sections">

        {/* ── Proyectos ── */}
        <section id="proyectos" className="section-pad section--white">
          <div className="shell">
            <header className="section-header">
              <span className="section-tag" data-reveal>02 / Proyectos</span>
              {/* Win2k titlebar-style section heading */}
              <div className="section-title-bar" data-reveal aria-hidden="true">
                <span>📂</span>
                <span>Explorador de Proyectos — Obra seleccionada</span>
              </div>
              <h2 className="section-title sr-only">Obra seleccionada</h2>
              <p className="section-lead" data-reveal>
                Seis años de trabajo entregado. Residencias, equipamiento público
                y espacios productivos a escala humana.
              </p>
            </header>

            <div className="projects-grid" role="list">
              {PROJECTS.map((p) => (
                <article className="project-card" key={p.num} data-reveal role="listitem">
                  {/* Title bar per card */}
                  <div className="project-card-titlebar">
                    <span>📄 {p.name}</span>
                    <div style={{ display: "flex", gap: "2px" }} aria-hidden="true">
                      <div className="win-btn" style={{ width: "14px", height: "12px", fontSize: "8px" }}>✕</div>
                    </div>
                  </div>
                  <div className="project-card-body">
                    <div className="project-card-top">
                      <span className="project-card-num">{p.num}</span>
                      <span className="project-card-year">{p.year}</span>
                    </div>
                    <h3 className="project-card-name">{p.name}</h3>
                    <p className="project-card-type">{p.type}</p>
                  </div>
                </article>
              ))}
            </div>

            {/* Stats as Win2k groupbox */}
            <div className="stats-band" data-reveal>
              <div className="stats-titlebar" aria-hidden="true">
                📊 Propiedades del estudio — Estadísticas generales
              </div>
              <div className="stats-body">
                <div className="stats-row">
                  <div className="stat-cell" data-reveal>
                    <span
                      className="stat-num"
                      data-value="18"
                      data-decimals="0"
                    >0</span>
                    <span className="stat-suf">años</span>
                    <span className="stat-lbl">Práctica continua</span>
                  </div>
                  <div className="stat-cell" data-reveal>
                    <span
                      className="stat-num"
                      data-value="42"
                      data-decimals="0"
                    >0</span>
                    <span className="stat-suf">obras</span>
                    <span className="stat-lbl">Entregadas y en curso</span>
                  </div>
                  <div className="stat-cell" data-reveal>
                    <span
                      className="stat-num"
                      data-value="3"
                      data-decimals="0"
                    >0</span>
                    <span className="stat-suf">premios</span>
                    <span className="stat-lbl">Reconocimientos nacionales</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Estudio ── */}
        <section id="estudio" className="section-pad section--paper studio-section">
          <div className="shell">
            <span className="section-tag" data-reveal>03 / Estudio</span>
            <div className="section-title-bar" data-reveal aria-hidden="true">
              <span>🏛</span>
              <span>Acerca de — Génesis Arq</span>
            </div>

            {/* Manifesto in a sunken textbox */}
            <p className="studio-statement" data-reveal>
              Creemos que la <em>buena arquitectura</em> nace de preguntas
              precisas, no de respuestas prediseñadas.
            </p>
            <div className="studio-cols">
              <div data-reveal>
                <span className="studio-col-label">Origen</span>
                <p className="studio-col-text">
                  Fundado en 2006 por un equipo interdisciplinario, Génesis Arq
                  opera desde Buenos Aires con proyectos en todo el país. Trabajamos
                  con equipos pequeños y comprometidos, donde cada integrante
                  conoce el proyecto de principio a fin.
                </p>
                <p className="studio-col-text" style={{ marginTop: "8px" }}>
                  Nuestra escala de trabajo deliberada nos permite un control de
                  calidad que los estudios grandes difícilmente pueden garantizar.
                </p>
              </div>
              <div data-reveal>
                <span className="studio-col-label">Valores</span>
                <ul className="values-list">
                  <li>Honestidad material y constructiva</li>
                  <li>Escala humana en cada decisión</li>
                  <li>Durabilidad sobre tendencia</li>
                  <li>Integración paisajística</li>
                  <li>Eficiencia energética pasiva</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── Contacto ── */}
        <section id="contacto" className="section-pad contact-section">
          <div className="shell">
            <div className="contact-split">
              <div className="contact-copy">
                <span className="section-tag" data-reveal>04 / Contacto</span>
                <h2 className="contact-heading" data-reveal>
                  Conversemos sobre su proyecto
                </h2>
                <p className="contact-sub" data-reveal>
                  Agenda de obra limitada. Respondemos en 48 horas hábiles con una
                  lectura inicial del sitio y un alcance preliminar sin costo.
                </p>
              </div>
              <div className="contact-actions" data-reveal>
                <a className="btn-primary" href="mailto:hola@genesisarq.studio">
                  ✉ Escribir al estudio
                </a>
                <a className="btn-ghost" href="tel:+541112345678">
                  📞 +54 11 1234-5678
                </a>
              </div>
            </div>
          </div>
        </section>

        <footer className="site-footer" role="contentinfo">
          <div className="shell footer-grid">
            <div className="footer-brand" data-reveal>
              🏛 Génesis Arq
            </div>
            <p className="footer-copy">
              © 2025 · Buenos Aires, Argentina
            </p>
            <p className="footer-tagline">
              Forma · Luz · Materia
            </p>
          </div>
        </footer>
      </div>

      {/* ── Win2k Taskbar ── */}
      <nav className="win-taskbar" aria-label="Barra de tareas">
        <button className="taskbar-start-btn" type="button" aria-label="Inicio">
          <span className="taskbar-start-icon" aria-hidden="true">🪟</span>
          Inicio
        </button>
        <div className="taskbar-divider" aria-hidden="true" />
        <div className="taskbar-tasks" role="list">
          <a href="#servicios" className="taskbar-task" role="listitem">
            🔧 Servicios
          </a>
          <a href="#proyectos" className="taskbar-task" role="listitem">
            📂 Proyectos
          </a>
          <a href="#estudio" className="taskbar-task" role="listitem">
            🏛 Estudio
          </a>
          <a href="#contacto" className="taskbar-task" role="listitem">
            ✉ Contacto
          </a>
        </div>
        <div className="taskbar-divider" aria-hidden="true" />
        <div className="taskbar-clock" aria-label="Hora actual">
          <TaskbarClock />
        </div>
      </nav>
    </>
  );
}
