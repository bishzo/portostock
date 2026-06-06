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
    thumb.style.left = e.clientX + 20 + "px";
    thumb.style.top = e.clientY - 60 + "px";
  });
});

console.log("Zoru — loaded");
