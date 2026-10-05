// Decorative local canvas. Motion pauses in background tabs and respects reduced motion.
export function startParticles() {
  const canvas = document.getElementById(
    "network-background",
  ) as HTMLCanvasElement;
  const button = document.getElementById("motion-toggle") as HTMLButtonElement;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    button.hidden = true;
    return;
  }
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let enabled = !reduced.matches;
  let frame = 0,
    previous = 0,
    width = 0,
    height = 0;
  const points = Array.from({ length: 34 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: (Math.random() - 0.5) * 0.000015,
    vy: (Math.random() - 0.5) * 0.000015,
  }));
  function draw(delta: number) {
    ctx!.clearRect(0, 0, width, height);
    for (const p of points) {
      p.x = (p.x + p.vx * delta + 1) % 1;
      p.y = (p.y + p.vy * delta + 1) % 1;
      ctx!.fillStyle = "rgba(154,234,246,.38)";
      ctx!.beginPath();
      ctx!.arc(p.x * width, p.y * height, 1.25, 0, Math.PI * 2);
      ctx!.fill();
    }
    for (let i = 0; i < points.length; i++)
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i],
          b = points[j];
        const distance = Math.hypot((a.x - b.x) * width, (a.y - b.y) * height);
        if (distance > 145) continue;
        ctx!.strokeStyle = `rgba(55,164,227,${0.16 * (1 - distance / 145)})`;
        ctx!.lineWidth = 0.7;
        ctx!.beginPath();
        ctx!.moveTo(a.x * width, a.y * height);
        ctx!.lineTo(b.x * width, b.y * height);
        ctx!.stroke();
      }
  }
  function resize() {
    width = innerWidth;
    height = innerHeight;
    const ratio = Math.min(devicePixelRatio, 1.5);
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    ctx!.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw(0);
  }
  function tick(now: number) {
    if (!enabled || document.hidden || reduced.matches) return;
    const delta = previous ? Math.min(now - previous, 50) : 0;
    if (delta >= 30 || !previous) {
      draw(delta);
      previous = now;
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    cancelAnimationFrame(frame);
    previous = 0;
    const active = enabled && !reduced.matches;
    button.textContent = reduced.matches
      ? "Motion off · system preference"
      : `Background motion: ${active ? "on" : "off"}`;
    button.setAttribute("aria-pressed", String(active));
    button.disabled = reduced.matches;
    if (active && !document.hidden) frame = requestAnimationFrame(tick);
  }
  const toggle = () => {
    enabled = !enabled;
    sync();
  };
  button.addEventListener("click", toggle);
  reduced.addEventListener("change", sync);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("resize", resize);
  resize();
  sync();
  return () => {
    cancelAnimationFrame(frame);
    button.removeEventListener("click", toggle);
    window.removeEventListener("resize", resize);
    document.removeEventListener("visibilitychange", sync);
    reduced.removeEventListener("change", sync);
  };
}
