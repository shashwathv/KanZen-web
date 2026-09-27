// 花丸 (hanamaru) — the red spiral-and-petals mark Japanese teachers draw on
// good work. Built as one continuous stroke in a 100×100 box, so it can be
// "drawn" with a stroke-dashoffset animation, the way a teacher's pen would.
// Shared by the <Hanamaru> SVG and the canvas paper background.

function buildPath() {
  const c = 50;
  const points = [];

  // Spiral out from the centre...
  const turns = 2.2;
  const spiralEnd = 25;
  for (let i = 0; i <= 140; i++) {
    const t = i / 140;
    const a = t * turns * Math.PI * 2;
    const r = spiralEnd * t;
    points.push([c + r * Math.cos(a), c + r * Math.sin(a)]);
  }

  // ...then one lap of scalloped petals around it, overlapping slightly at
  // the end like a real pen stroke. The small wobble keeps it hand-drawn.
  const start = turns * Math.PI * 2;
  const petals = 7;
  for (let i = 1; i <= 260; i++) {
    const t = i / 260;
    const a = start + t * Math.PI * 2 * 1.06;
    const petal = Math.abs(Math.sin((petals * (a - start)) / 2));
    const r = (33 + 12 * petal) * (1 + 0.018 * Math.sin(a * 3.3));
    points.push([c + r * Math.cos(a), c + r * Math.sin(a)]);
  }

  return points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)} ${y.toFixed(2)}`).join("");
}

export const HANAMARU_PATH = buildPath();
