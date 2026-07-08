const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const travel = document.getElementById('travel');
const car = document.getElementById('car');
const travelCopy = document.getElementById('travelCopy');

function updateTravel() {
  if (!travel || !car) return;

  const rect = travel.getBoundingClientRect();
  const scrollable = rect.height - window.innerHeight;
  const raw = clamp((-rect.top) / Math.max(1, scrollable));
  const p = easeInOut(raw);

  // Perspective path: starts close to the viewer, ends on the road horizon.
  const startY = window.innerHeight * 0.74;
  const endY = window.innerHeight * 0.22;
  const y = startY + (endY - startY) * p;

  // Non-linear shrinking: slow at first, then noticeably farther away.
  const scale = 0.98 - 0.92 * Math.pow(p, 1.45);

  // Tiny hand-drawn wobble. It fades away as the car reaches the horizon.
  const fadeProgress = clamp((raw - 0.68) / 0.32);
  const fadeEase = easeOutCubic(fadeProgress);
  const wobble = Math.sin(raw * Math.PI * 8) * 1.15 * (1 - p * 0.65) * (1 - fadeEase);
  const x = Math.sin(raw * Math.PI * 1.2) * 7 * p;

  // In the last third of the scroll the car softly disappears,
  // so it feels like it has gone into the distance rather than needing
  // to match the road horizon pixel-perfectly.
  const opacity = 1 - fadeEase;
  const blur = 1.8 * fadeEase;

  car.style.transform = `translate(-50%, -50%) translate(${x}px, ${y - window.innerHeight * 0.72}px) scale(${scale}) rotate(${wobble}deg)`;
  car.style.opacity = opacity.toFixed(3);
  car.style.filter = `drop-shadow(0 14px 10px rgba(54, 45, 35, .08)) blur(${blur.toFixed(2)}px)`;

  if (travelCopy) {
    const copyOpacity = clamp(1 - raw * 1.9);
    travelCopy.style.opacity = copyOpacity.toFixed(3);
    travelCopy.style.transform = `translateX(-50%) translateY(${-24 * raw}px)`;
  }
}

let ticking = false;
function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      updateTravel();
      ticking = false;
    });
    ticking = true;
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', updateTravel);
window.addEventListener('load', updateTravel);
updateTravel();
