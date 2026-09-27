import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { HANAMARU_PATH } from "../../lib/hanamaruPath";

// The whole site sits on a sheet of 田字格 kanji practice paper.
//
// Every square secretly holds a kanji (picked deterministically from its
// position). A few are always faintly visible, like pencil practice someone
// left behind, and a handful of those carry the teacher's red hanamaru.
// Moving the pointer "writes" the kanji in nearby squares in ink, and they
// fade out again over a couple of seconds like pencil being erased.
//
// Two fixed, viewport-sized canvases: a static base layer (grid, ghost kanji,
// marks) redrawn only on resize or theme change, and a trace layer animated
// only while there's something fading.

// The first kanji learners meet (JLPT N5), so the sheet reads as real practice.
const KANJI = [..."日一国人年大十二本中長出三時行見月後前生五間上東四今金九入学高円子外八六下来気小七山話女北午百書先名川千水半男西電校語土木聞食車何南万毎白天母火右読友左休父雨"];

const GHOST_PERCENT = 7;   // share of squares with faint practice kanji
const MARK_PERCENT = 8;    // share of those with a red hanamaru
const TRACE_RADIUS = 1.7;  // in squares
const FADE_MS = 2600;

// Cheap integer hash so each square always gets the same kanji.
function hash(col, row) {
  let h = Math.imul(col + 1, 374761393) + Math.imul(row + 1, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (h ^ (h >>> 16)) >>> 0;
}

export default function PaperBackground() {
  const baseRef = useRef(null);
  const traceRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const base = baseRef.current;
    const trace = traceRef.current;
    const bctx = base.getContext("2d");
    const tctx = trace.getContext("2d");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hanamaru = new Path2D(HANAMARU_PATH);
    const active = new Map(); // "col,row" -> { col, row, v } for squares being traced

    let cell = 56;
    let width = 0;
    let height = 0;
    let colors = null;
    let pointer = null;
    let raf = 0;
    let lastFrame = 0;
    let resizeTimer = 0;
    let cancelled = false;

    // Colours and strengths come from CSS custom properties so each theme
    // controls its own look (ink on paper, or chalk on a board).
    const readColors = () => {
      const cs = getComputedStyle(document.documentElement);
      const v = (name) => cs.getPropertyValue(name).trim();
      return {
        ink: v("--ink"), shu: v("--shu"), grid: v("--page-grid"),
        ghost: parseFloat(v("--ghost-alpha")) || 0.07,
        trace: parseFloat(v("--trace-alpha")) || 0.3,
        mark: parseFloat(v("--mark-alpha")) || 0.2,
      };
    };

    const resize = () => {
      // Faint pencil marks don't need full retina resolution; capping it keeps
      // the two full-screen canvases light on large, high-DPI displays.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = window.innerWidth;
      height = window.innerHeight;
      cell = width < 600 ? 44 : 56;
      for (const [canvas, ctx] of [[base, bctx], [trace, tctx]]) {
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    const setFont = (ctx) => {
      ctx.font = `600 ${Math.round(cell * 0.62)}px "Klee One", "Hiragino Mincho ProN", "Yu Mincho", serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
    };

    const drawKanji = (ctx, col, row) => {
      ctx.fillText(KANJI[hash(col, row) % KANJI.length], col * cell + cell / 2, row * cell + cell / 2 + cell * 0.03);
    };

    const drawBase = () => {
      const cols = Math.ceil(width / cell);
      const rows = Math.ceil(height / cell);
      bctx.clearRect(0, 0, width, height);
      bctx.lineWidth = 1;
      bctx.strokeStyle = colors.grid;

      // Square outlines.
      bctx.beginPath();
      for (let c = 0; c <= cols; c++) { bctx.moveTo(c * cell + 0.5, 0); bctx.lineTo(c * cell + 0.5, height); }
      for (let r = 0; r <= rows; r++) { bctx.moveTo(0, r * cell + 0.5); bctx.lineTo(width, r * cell + 0.5); }
      bctx.stroke();

      // Dashed centre guides — the 田 cross that helps balance a character.
      bctx.save();
      bctx.setLineDash([3, 5]);
      bctx.globalAlpha = 0.55;
      bctx.beginPath();
      for (let c = 0; c < cols; c++) { const x = c * cell + cell / 2 + 0.5; bctx.moveTo(x, 0); bctx.lineTo(x, height); }
      for (let r = 0; r < rows; r++) { const y = r * cell + cell / 2 + 0.5; bctx.moveTo(0, y); bctx.lineTo(width, y); }
      bctx.stroke();
      bctx.restore();

      // Ghost practice kanji, and the occasional teacher's mark on them.
      setFont(bctx);
      bctx.fillStyle = colors.ink;
      const marks = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const h = hash(c, r);
          if ((h >>> 8) % 100 >= GHOST_PERCENT) continue;
          bctx.globalAlpha = colors.ghost;
          drawKanji(bctx, c, r);
          if ((h >>> 20) % 100 < MARK_PERCENT) marks.push([c, r, h]);
        }
      }
      bctx.strokeStyle = colors.shu;
      bctx.globalAlpha = colors.mark;
      bctx.lineCap = "round";
      bctx.lineJoin = "round";
      for (const [c, r, h] of marks) {
        const size = cell * 0.95;
        bctx.save();
        bctx.translate(c * cell + cell * 0.45, r * cell - cell * 0.2);
        bctx.rotate(((h % 40) - 20) / 100);
        bctx.scale(size / 100, size / 100);
        bctx.lineWidth = 3.4;
        bctx.stroke(hanamaru);
        bctx.restore();
      }
      bctx.globalAlpha = 1;
    };

    const frame = (now) => {
      const dt = lastFrame ? Math.min(now - lastFrame, 64) : 16;
      lastFrame = now;

      // Write the squares around the pointer, strongest at the centre.
      if (pointer) {
        const { x, y } = pointer;
        pointer = null;
        const col0 = Math.floor(x / cell);
        const row0 = Math.floor(y / cell);
        const reach = TRACE_RADIUS * cell;
        for (let r = row0 - 2; r <= row0 + 2; r++) {
          for (let c = col0 - 2; c <= col0 + 2; c++) {
            if (c < 0 || r < 0) continue;
            const strength = 1 - Math.hypot(c * cell + cell / 2 - x, r * cell + cell / 2 - y) / reach;
            if (strength <= 0) continue;
            const key = `${c},${r}`;
            const square = active.get(key);
            if (square) square.v = Math.max(square.v, strength);
            else active.set(key, { col: c, row: r, v: strength });
          }
        }
      }

      tctx.clearRect(0, 0, width, height);
      setFont(tctx);
      tctx.fillStyle = colors.ink;
      for (const [key, square] of active) {
        square.v -= dt / FADE_MS;
        if (square.v <= 0) { active.delete(key); continue; }
        tctx.globalAlpha = colors.trace * Math.min(1, square.v * 1.5);
        drawKanji(tctx, square.col, square.row);
      }

      // Only keep animating while something is still fading.
      if (active.size || pointer) {
        raf = requestAnimationFrame(frame);
      } else {
        raf = 0;
        lastFrame = 0;
      }
    };

    const onPointerMove = (e) => {
      pointer = { x: e.clientX, y: e.clientY };
      if (!raf && colors) raf = requestAnimationFrame(frame);
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        active.clear();
        tctx.clearRect(0, 0, width, height);
        drawBase();
      }, 120);
    };

    // Deferred a frame so a theme change has been applied to <html> before
    // the colours are read.
    const start = requestAnimationFrame(() => {
      colors = readColors();
      resize();
      drawBase();
      // Redraw once Klee One has loaded, so the kanji use the textbook face.
      document.fonts?.load(`600 ${Math.round(cell * 0.62)}px "Klee One"`, KANJI.join(""))
        .then(() => { if (!cancelled) drawBase(); })
        .catch(() => {});
    });

    window.addEventListener("resize", onResize);
    if (!reduceMotion) window.addEventListener("pointermove", onPointerMove, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(start);
      cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [theme]);

  return (
    <div className="paper-bg" aria-hidden="true">
      <canvas ref={baseRef} />
      <canvas ref={traceRef} />
    </div>
  );
}
