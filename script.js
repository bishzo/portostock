// ══════════════════════════════
// ZORU — script.js
// ══════════════════════════════

// ── Custom cursor ──
const cursor = document.getElementById("cursor");
const dot = document.getElementById("cursor-dot");
let mx = 0,
  my = 0,
  cx = 0,
  cy = 0;

document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  dot.style.left = mx + "px";
  dot.style.top = my + "px";
});

const animCursor = () => {
  cx += (mx - cx) * 0.12;
  cy += (my - cy) * 0.12;
  cursor.style.left = cx + "px";
  cursor.style.top = cy + "px";
  requestAnimationFrame(animCursor);
};
animCursor();

// Cursor expand on hover
document
  .querySelectorAll("a, button, .service-item, .work-row")
  .forEach((el) => {
    el.addEventListener("mouseenter", () =>
      document.body.classList.add("cursor-hover"),
    );
    el.addEventListener("mouseleave", () =>
      document.body.classList.remove("cursor-hover"),
    );
  });

// ── Nav scroll state — Native ──
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("nav--scrolled", window.scrollY > 30);
});

// ── Live date in nav ──
const dateEl = document.getElementById("nav-date");
const updateDate = () => {
  const now = new Date();
  const d = now.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    timeZone: "Asia/Kolkata",
  });
  const t = now.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
  if (dateEl) dateEl.textContent = `${d}, ${t} IST`;
};
updateDate();
setInterval(updateDate, 60000);

// ── Scroll reveal ──
const reveals = document.querySelectorAll("[data-reveal]");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("is-visible"), i * 60);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);
reveals.forEach((el) => observer.observe(el));

// ── Thumb follow mouse — work rows ONLY ──
document.querySelectorAll(".work-row").forEach((el) => {
  const thumb = el.querySelector(".work-row__thumb");
  if (!thumb) return;

  el.addEventListener("mousemove", (e) => {
    const thumbW = 220;
    const thumbH = 160;
    const margin = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let x = e.clientX + 20;
    let y = e.clientY - thumbH / 2; // vertically centered on cursor

    // prevent overflow right
    if (x + thumbW + margin > vw) x = e.clientX - thumbW - 20;

    // prevent overflow bottom
    if (y + thumbH + margin > vh) y = vh - thumbH - margin;

    // prevent overflow top
    if (y < margin) y = margin;

    thumb.style.left = x + "px";
    thumb.style.top = y + "px";
  });
});

// ── Interactive Hero Canvas Sandbox (Multi-Collision Engine - Smoother/Slower) ──
const canvasNodes = document.querySelectorAll(".canvas-node");
const canvasSandbox = document.getElementById("canvas-sandbox");

if (canvasNodes.length > 0 && canvasSandbox) {
  const nodes = Array.from(canvasNodes).map((el) => ({
    el,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: el.offsetWidth / 2, // Radius
    isDragging: false,
    startX: 0,
    startY: 0,
    lastMouseX: 0,
    lastMouseY: 0,
    lastTime: 0,
  }));

  const sandboxRect = canvasSandbox.getBoundingClientRect();

  // Initialize nodes
  nodes.forEach((node) => {
    const rect = node.el.getBoundingClientRect();
    node.x = rect.left - sandboxRect.left;
    node.y = rect.top - sandboxRect.top;
    node.r = node.el.offsetWidth / 2;
    node.el.style.left = `${node.x}px`;
    node.el.style.top = `${node.y}px`;

    node.el.addEventListener("pointerdown", (e) => {
      node.isDragging = true;
      node.el.classList.add("is-dragging");
      canvasSandbox.classList.add("is-active");

      node.startX = e.clientX - node.x;
      node.startY = e.clientY - node.y;
      node.lastMouseX = e.clientX;
      node.lastMouseY = e.clientY;
      node.lastTime = performance.now();
      node.vx = 0;
      node.vy = 0;

      node.el.setPointerCapture(e.pointerId);
    });

    node.el.addEventListener("pointermove", (e) => {
      if (!node.isDragging) return;
      e.preventDefault();

      node.x = e.clientX - node.startX;
      node.y = e.clientY - node.startY;

      const now = performance.now();
      const dt = Math.max(1, now - node.lastTime);

      // MULTIPLIER REDUCED: Changed from 15 to 7 to make the throw feel heavier and slower
      node.vx = ((e.clientX - node.lastMouseX) / dt) * 7;
      node.vy = ((e.clientY - node.lastMouseY) / dt) * 7;

      node.lastMouseX = e.clientX;
      node.lastMouseY = e.clientY;
      node.lastTime = now;
    });

    node.el.addEventListener("pointerup", (e) => {
      if (!node.isDragging) return;
      node.isDragging = false;
      node.el.classList.remove("is-dragging");
      canvasSandbox.classList.remove("is-active");
      node.el.releasePointerCapture(e.pointerId);
    });
  });

  // Master Physics Loop
  function physicsLoop() {
    const maxX = canvasSandbox.offsetWidth;
    const maxY = canvasSandbox.offsetHeight;

    // 1. Move & Wall Collision
    nodes.forEach((node) => {
      if (!node.isDragging) {
        // FRICTION INCREASED: Changed from 0.94 to 0.92 so they slow down faster
        node.vx *= 0.92;
        node.vy *= 0.92;

        node.x += node.vx;
        node.y += node.vy;

        // Wall collisions checking against the center + radius
        if (node.x <= 0) {
          node.x = 0;
          node.vx *= -0.7; // Bounce off wall slightly softened
        } else if (node.x + node.r * 2 >= maxX) {
          node.x = maxX - node.r * 2;
          node.vx *= -0.7;
        }

        if (node.y <= 0) {
          node.y = 0;
          node.vy *= -0.7;
        } else if (node.y + node.r * 2 >= maxY) {
          node.y = maxY - node.r * 2;
          node.vy *= -0.7;
        }
      }
    });

    // 2. Ball-to-Ball Collisions
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];

        // Find distance between centers
        const c1x = n1.x + n1.r;
        const c1y = n1.y + n1.r;
        const c2x = n2.x + n2.r;
        const c2y = n2.y + n2.r;

        const dx = c2x - c1x;
        const dy = c2y - c1y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = n1.r + n2.r;

        if (distance < minDistance) {
          const nx = dx / distance;
          const ny = dy / distance;
          const overlap = minDistance - distance;

          // Push them apart instantly so they don't stick together
          if (!n1.isDragging) {
            n1.x -= nx * (overlap / 2);
            n1.y -= ny * (overlap / 2);
          }
          if (!n2.isDragging) {
            n2.x += nx * (overlap / 2);
            n2.y += ny * (overlap / 2);
          }

          // Calculate elastic bounce transfer
          const rvx = n2.vx - n1.vx;
          const rvy = n2.vy - n1.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          // Only bounce if they are moving towards each other
          if (velAlongNormal < 0) {
            const bounceRestitution = 0.7; // BOUNCE SOFTENED: from 0.8 to 0.7
            const j = (-(1 + bounceRestitution) * velAlongNormal) / 2;

            const impulseX = j * nx;
            const impulseY = j * ny;

            if (!n1.isDragging) {
              n1.vx -= impulseX;
              n1.vy -= impulseY;
            }
            if (!n2.isDragging) {
              n2.vx += impulseX;
              n2.vy += impulseY;
            }
          }
        }
      }
    }

    // 3. Render Positions
    nodes.forEach((node) => {
      node.el.style.left = `${node.x}px`;
      node.el.style.top = `${node.y}px`;
    });

    requestAnimationFrame(physicsLoop);
  }

  // Start the engine
  requestAnimationFrame(physicsLoop);
}
