window.renderFarhaTemplate = function() {
/* ============================================================
   قالب disney «ديزني» — خطوبة سحرية
   الدخول + الهيرو: محرّك مُجرّب (بوّابة ← تحميل ← توهّج كبير ← قصر)
   الأقسام: منطق البطاقة (ملء المحتوى + عدّاد + ظهور + بريق وفراشات)
   ============================================================ */

const WEDDING_CONFIG = (typeof window !== "undefined" && window.__INVITE__ && window.__INVITE__.config) || {
  groom: "علي",
  bride: "منار",

  date: "2026-12-18T19:00:00",
  dateText: "يوم الجمعة، ١٨ كانون الأول ٢٠٢٦",
  timeText: "الساعة السابعة مساءً",

  heroSub: "يتشرّفان بدعوتكم لمشاركتهما فرحة الخطوبة",

  verse: "على بركة الله وأطيب الأمنيات، تمّت خطوبتنا",

  invitationText: "بقلوبٍ مفعمةٍ بالفرح، نتشرّف بدعوتكم لحضور حفل خطوبتنا، لتكتمل فرحتنا بحضوركم الكريم.",

  groomParents: "نجل السيّد كريم عبد الله و السيّدة هدى",
  brideParents: "كريمة السيّد سامي حسن و السيّدة رنا",

  venueName: "قاعة الأميرة الكبرى",
  venueAddr: "بغداد — المنصور",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Baghdad",

  program: [
    { time: "٧:٠٠ مساءً", title: "استقبال الضيوف" },
    { time: "٧:٣٠ مساءً", title: "لحظة الخطوبة" },
    { time: "٨:٣٠ مساءً", title: "الكوكتيل والتصوير" },
    { time: "٩:٣٠ مساءً", title: "العشاء" },
    { time: "١٠:٣٠ مساءً", title: "السهرة" },
  ],

  notes: [
    "يُرجى الحضور قبل الموعد بنصف ساعة",
    "نتشرّف بحضوركم بأبهى حلّة",
    "الدعوة تشمل حاملها والعائلة الكريمة",
  ],

  closingNote: "حضوركم يزيّن فرحتنا",
  hashtag: "#علي_ومنار",
  contactLabel: "للاستفسار والتأكيد",
  contactName: "أبو علي",
  contactPhone: "+9647700000000",
  closingFamilies: "عائلة عبد الله  &  عائلة حسن",

  images: { venue: "", background: "" },
};

/* ---------------- تعبئة المحتوى ---------------- */
function fillContent() {
  const c = WEDDING_CONFIG;
  setText("heroGroom", c.groom);
  setText("heroBride", c.bride);
  setText("heroInvite", c.heroSub);
  setText("heroDate", c.dateText);
  setText("verseText", c.verse);
  setText("invitationText", c.invitationText);
  setText("groomParents", c.groomParents);
  setText("brideParents", c.brideParents);
  setText("weddingDate", c.dateText);
  setText("weddingTime", c.timeText);
  setText("venueName", c.venueName);
  setText("venueAddr", c.venueAddr);
  setText("closingNote", c.closingNote);
  setText("closingHashtag", c.hashtag);
  setText("closingFamilies", c.closingFamilies);

  const mapBtn = document.getElementById("mapBtn");
  if (mapBtn && c.mapUrl) { mapBtn.href = c.mapUrl; }
  else if (mapBtn) { mapBtn.style.display = "none"; }

  const names = document.getElementById("preloaderNames");
  if (names && c.groom && c.bride) names.textContent = `${c.groom} & ${c.bride}`;

  buildTimeline(c.program);
  buildNotes(c.notes);
  buildContact(c);

  document.title = `دعوة خطوبة ${c.groom} & ${c.bride}`;
}

function setText(id, value) { const el = document.getElementById(id); if (el && value != null) el.textContent = value; }

function loadImages() {
  const imgs = WEDDING_CONFIG.images || {};
  applyImageIfExists(imgs.venue, (src) => {
    const vp = document.getElementById("venuePhoto");
    const venue = document.querySelector(".venue");
    if (vp) vp.style.backgroundImage = `url("${src}")`;
    if (venue) venue.classList.add("has-photo");
  });
}
function applyImageIfExists(src, onload) {
  if (!src) return;
  const img = new Image();
  img.onload = () => onload(src);
  img.src = src;
}

function buildTimeline(items) {
  const ul = document.getElementById("timeline");
  if (!ul || !Array.isArray(items)) return;
  ul.innerHTML = "";
  items.forEach((it) => {
    const li = document.createElement("li");
    li.className = "timeline__item";
    li.innerHTML = `<span class="timeline__dot" aria-hidden="true"></span>
      <span class="timeline__time">${it.time}</span>
      <span class="timeline__title">${it.title}</span>`;
    ul.appendChild(li);
  });
}

function buildNotes(items) {
  const ul = document.getElementById("notesList");
  if (!ul || !Array.isArray(items)) return;
  ul.innerHTML = "";
  items.forEach((txt) => {
    const li = document.createElement("li");
    li.className = "notes__item";
    li.innerHTML = `<span class="notes__mark" aria-hidden="true">✦</span><span>${txt}</span>`;
    ul.appendChild(li);
  });
}

function buildContact(c) {
  const link = document.getElementById("contactLink");
  const label = document.querySelector(".contact__label");
  if (label && c.contactLabel) label.textContent = c.contactLabel;
  if (!link) return;
  const wa = (c.contactPhone || "").replace(/[^0-9]/g, "");
  if (wa) {
    link.href = `https://wa.me/${wa}`;
    link.target = "_blank";
    link.rel = "noopener";
    link.innerHTML = `<span aria-hidden="true">☎</span> `;
    link.appendChild(document.createTextNode(c.contactName ? c.contactName : c.contactPhone));
  } else {
    const box = document.getElementById("contactBox");
    if (box) box.style.display = "none";
  }
}

/* ---------------- ظهور أقسام البطاقة ---------------- */
function setupReveal() {
  const items = document.querySelectorAll(".creveal");
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-visible")); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => obs.observe(el));
}

/* ---------------- العدّاد التنازلي (أرقام عربية) ---------------- */
function setupCountdown() {
  const target = new Date(WEDDING_CONFIG.date).getTime();
  if (isNaN(target)) return;
  const els = {
    days: document.getElementById("cdDays"), hours: document.getElementById("cdHours"),
    mins: document.getElementById("cdMins"), secs: document.getElementById("cdSecs"),
  };
  const cd = document.getElementById("countdown");
  const arrived = document.getElementById("cdArrived");
  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) { if (cd) cd.hidden = true; if (arrived) arrived.hidden = false; clearInterval(timer); return; }
    if (els.days) els.days.textContent = pad(Math.floor(diff / 86400000));
    if (els.hours) els.hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    if (els.mins) els.mins.textContent = pad(Math.floor((diff % 3600000) / 60000));
    if (els.secs) els.secs.textContent = pad(Math.floor((diff % 60000) / 1000));
  }
  const timer = setInterval(tick, 1000);
  tick();
}
function pad(n) { return toArabicDigits(String(n).padStart(2, "0")); }
function toArabicDigits(s) {
  const ar = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(s).replace(/[0-9]/g, (d) => ar[+d]);
}

/* ---------------- بريق + فراشات + بتلات (تبدأ عند الكشف) ---------------- */
function reduced() { return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches; }

function startSparkles(count) {
  if (reduced()) return;
  const layer = document.getElementById("sparkles");
  if (!layer || layer.dataset.on) return;
  layer.dataset.on = "1";
  const glyphs = ["✦", "✧", "⋆", "·", "✩"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.fontSize = (7 + Math.random() * 12) + "px";
    s.style.setProperty("--tw", (2 + Math.random() * 3).toFixed(1) + "s");
    s.style.animationDelay = (Math.random() * 4).toFixed(1) + "s";
    layer.appendChild(s);
  }
}

function startButterflies(count) {
  if (reduced()) return;
  const layer = document.getElementById("butterflies");
  if (!layer || layer.dataset.on) return;
  layer.dataset.on = "1";
  const glyphs = ["🦋", "🦋", "🦋"];
  for (let i = 0; i < count; i++) {
    const b = document.createElement("span");
    b.className = "bfly";
    b.textContent = glyphs[i % glyphs.length];
    b.style.left = (5 + Math.random() * 85) + "%";
    b.style.bottom = (-6 - Math.random() * 8) + "%";
    b.style.fontSize = (16 + Math.random() * 16) + "px";
    b.style.setProperty("--fx", (Math.random() * 40 - 20) + "vw");
    b.style.setProperty("--fl", (12 + Math.random() * 9).toFixed(1) + "s");
    b.style.animationDelay = (Math.random() * 8).toFixed(1) + "s";
    b.style.filter = "drop-shadow(0 4px 6px rgba(150,80,140,.3))";
    layer.appendChild(b);
  }
}

function startPetals(count) {
  if (reduced()) return;
  const layer = document.getElementById("petals");
  if (!layer || layer.dataset.on) return;
  layer.dataset.on = "1";
  const glyphs = ["❀", "✿", "❁", "🌸"];
  const colors = ["#efb9d6", "#ded0f2", "#f7d9e8", "#e6bd74"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "petal";
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.color = colors[i % colors.length];
    s.style.fontSize = (10 + Math.random() * 14) + "px";
    s.style.animationDuration = (7 + Math.random() * 6) + "s";
    s.style.animationDelay = (Math.random() * 5) + "s";
    layer.appendChild(s);
  }
}

/* ============================================================
   محرّك الدخول السينمائي (مُجرّب) — بوّابة + شريط تحميل + توهّج كبير + قصر
   ============================================================ */
(() => {
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

  const body = document.body;
  const site = $("#site");
  const preloader = $("#preloader");
  const preloaderPoster = $("#preloaderPoster");
  const preloaderVideo = $("#preloaderVideo");
  const heroVideo = $("#heroVideo");
  const preloaderText = preloaderPoster ? $(".preloader-text", preloaderPoster) : null;
  const preloaderLabel = preloaderPoster ? $(".preloader-cta__label", preloaderPoster) : null;
  const preloaderProgress = $("#preloaderProgress");
  const preloaderProgressBar = $("#preloaderProgressBar");
  const preloaderPercent = $("#preloaderPercent");
  let introTimer = null;
  let progressTimer = null;
  let introStarting = false;
  let introFinishing = false;
  let siteRevealed = false;
  let heroPreparePromise = null;
  let heroRetryTimer = null;
  const HAVE_CURRENT_DATA = 2;
  const HAVE_FUTURE_DATA = 3;
  const HAVE_ENOUGH_DATA = 4;

  function waitForAny(target, events, timeoutMs) {
    return new Promise((resolve, reject) => {
      let timer = null;
      const cleanup = () => { events.forEach((e) => target.removeEventListener(e, done)); if (timer) window.clearTimeout(timer); };
      const done = (event) => { cleanup(); resolve(event); };
      events.forEach((e) => target.addEventListener(e, done, { once: true }));
      if (timeoutMs > 0) timer = window.setTimeout(() => { cleanup(); reject(new Error("media timeout")); }, timeoutMs);
    });
  }
  function hasFirstFrame(v) { return Boolean(v && v.readyState >= HAVE_CURRENT_DATA); }
  function clampPercent(v) { return Math.max(0, Math.min(100, Math.round(v))); }
  function ensureVideoSource(video) {
    if (!video) return;
    const src = video.dataset?.src;
    if (src && !video.getAttribute("src")) video.setAttribute("src", src);
  }

  function getBufferedPercent(video) {
    if (!video) return 0;
    if (video.readyState >= HAVE_ENOUGH_DATA) return 100;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0 || !video.buffered?.length) return hasFirstFrame(video) ? 35 : 0;
    let end = 0;
    for (let i = 0; i < video.buffered.length; i += 1) end = Math.max(end, video.buffered.end(i));
    return clampPercent((end / duration) * 100);
  }

  function updatePreloaderProgress(forcePercent) {
    if (!preloaderVideo || !preloaderPoster) return;
    const percent = clampPercent(Number.isFinite(forcePercent) ? forcePercent : getBufferedPercent(preloaderVideo));
    const ready = percent >= 100 || preloaderVideo.readyState >= HAVE_FUTURE_DATA;
    preloaderPoster.classList.toggle("is-ready", ready);
    if (preloaderProgressBar) preloaderProgressBar.style.setProperty("--progress", `${percent}%`);
    if (preloaderProgress) preloaderProgress.setAttribute("aria-valuenow", String(percent));
    if (preloaderPercent) preloaderPercent.textContent = `${percent}%`;
    if (introStarting || introFinishing) return;
    if (preloaderText) preloaderText.textContent = ready ? "اضغط لفتح البوّابة" : "جارٍ التحميل…";
  }

  function startProgressWatch() {
    updatePreloaderProgress();
    window.clearInterval(progressTimer);
    progressTimer = window.setInterval(() => {
      updatePreloaderProgress();
      if (preloaderVideo?.readyState >= HAVE_ENOUGH_DATA) window.clearInterval(progressTimer);
    }, 250);
  }

  function timeoutValue(ms, value = false) { return new Promise((resolve) => window.setTimeout(() => resolve(value), ms)); }
  function isTouchPhone() {
    const ua = navigator.userAgent || "";
    return /[?&]mobilehero=1/.test(location.search) || /iPhone|iPad|iPod|Android/i.test(ua) || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
  }

  async function waitForMediaReady(video, timeoutMs = 6000) {
    if (!video) return false;
    if (hasFirstFrame(video)) return true;
    ensureVideoSource(video);
    video.preload = "auto";
    try { video.load(); } catch { return hasFirstFrame(video); }
    try { await waitForAny(video, ["loadeddata", "canplay", "canplaythrough"], timeoutMs); }
    catch { return hasFirstFrame(video); }
    return hasFirstFrame(video);
  }

  function markHeroReady() { if (hasFirstFrame(heroVideo)) heroVideo.classList.add("is-ready"); }
  function markPreloaderReady() { if (hasFirstFrame(preloaderVideo)) preloaderVideo.classList.add("is-ready"); }

  function setupHeroVideoElement() {
    if (!heroVideo) return;
    ensureVideoSource(heroVideo);
    heroVideo.muted = true;
    heroVideo.defaultMuted = true;
    heroVideo.loop = true;
    heroVideo.autoplay = true;
    heroVideo.playsInline = true;
    heroVideo.preload = "auto";
    heroVideo.setAttribute("muted", "");
    heroVideo.setAttribute("autoplay", "");
    heroVideo.setAttribute("playsinline", "");
    heroVideo.setAttribute("webkit-playsinline", "");
  }

  function prepareHeroVideo() {
    if (!heroVideo) return Promise.resolve(false);
    if (heroPreparePromise) return heroPreparePromise;
    setupHeroVideoElement();
    heroPreparePromise = waitForMediaReady(heroVideo, 7000).then((ready) => { if (ready) markHeroReady(); else heroPreparePromise = null; return ready; });
    return heroPreparePromise;
  }

  async function startVideoPlayback(video, timeoutMs = 4500) {
    if (!video) return false;
    if (!video.paused && !video.ended) return true;
    try {
      const p = video.play();
      if (p && typeof p.then === "function") await Promise.race([p, waitForAny(video, ["playing", "timeupdate"], timeoutMs)]);
      else await waitForAny(video, ["playing", "timeupdate"], timeoutMs);
    } catch { return false; }
    return !video.paused || video.currentTime > 0;
  }

  function stopPreloaderVideo() {
    if (!preloaderVideo) return;
    try { preloaderVideo.pause(); } catch { /* تجاهل */ }
    try { preloaderVideo.removeAttribute("src"); preloaderVideo.load(); } catch { /* تجاهل */ }
  }

  async function playHeroVideo(timeoutMs = 4500) {
    if (!heroVideo) return false;
    setupHeroVideoElement();
    await Promise.race([prepareHeroVideo(), timeoutValue(timeoutMs)]);
    if (hasFirstFrame(heroVideo)) markHeroReady();
    if (!heroVideo.paused && !heroVideo.ended) return true;
    const started = await startVideoPlayback(heroVideo, timeoutMs);
    markHeroReady();
    return started || hasFirstFrame(heroVideo);
  }

  function keepHeroPlaying(durationMs = 9000) {
    if (!heroVideo) return;
    window.clearInterval(heroRetryTimer);
    const stopAt = Date.now() + durationMs;
    const tick = () => {
      if (!site || !site.classList.contains("visible")) return;
      playHeroVideo(1400).catch(() => {});
      if (Date.now() >= stopAt || (!heroVideo.paused && heroVideo.readyState >= HAVE_FUTURE_DATA)) {
        window.clearInterval(heroRetryTimer);
      }
    };
    tick();
    heroRetryTimer = window.setInterval(tick, 900);
  }

  async function startPreloaderVideo() {
    ensureVideoSource(preloaderVideo);
    preloaderVideo.muted = true;
    preloaderVideo.playsInline = true;
    preloaderVideo.preload = "auto";
    await waitForMediaReady(preloaderVideo, 8000);
    markPreloaderReady();
    updatePreloaderProgress(100);
    try { preloaderVideo.currentTime = 0; } catch { /* بعض المتصفحات ترفض seek مبكراً */ }
    const started = await startVideoPlayback(preloaderVideo, 7000);
    markPreloaderReady();
    updatePreloaderProgress(100);
    return started;
  }

  function armIntroTimer() {
    window.clearTimeout(introTimer);
    const duration = Number.isFinite(preloaderVideo.duration) && preloaderVideo.duration > 0 ? preloaderVideo.duration : 6;
    const currentTime = Number.isFinite(preloaderVideo.currentTime) ? preloaderVideo.currentTime : 0;
    const remainingMs = Math.max(2200, Math.ceil((duration - currentTime) * 1000) + 700);
    introTimer = window.setTimeout(finishIntro, remainingMs);
  }

  function revealHeroText() {
    $$(".hero .reveal, .hero .reveal-mask").forEach((el) => {
      const delay = Number(el.dataset.delay || 0);
      window.setTimeout(() => el.classList.add("is-in"), delay);
    });
  }

  function revealSite() {
    if (siteRevealed) { keepHeroPlaying(5000); return; }
    siteRevealed = true;
    body.classList.remove("locked");
    site.classList.add("visible");
    playHeroVideo(3000).catch(() => {});
    keepHeroPlaying();
    revealHeroText();
    if (typeof startSparkles === "function") startSparkles(46);
    if (typeof startButterflies === "function") startButterflies(9);
    if (typeof startPetals === "function") startPetals(16);
  }

  async function finishIntro() {
    if (!preloader || preloader.classList.contains("fade-out") || introFinishing) return;
    introFinishing = true;
    window.clearTimeout(introTimer);
    stopPreloaderVideo();
    playHeroVideo(2500).catch(() => {});
    // توهّج سحري كبير ينفجر أولاً، ثم يبيّض، ثم الانتقال للواجهة
    preloader.classList.add("glow");
    window.setTimeout(() => preloader.classList.add("whiteout"), 500);
    window.setTimeout(() => {
      revealSite();
      preloader.classList.add("fade-out");
      window.setTimeout(() => preloader.classList.add("hidden"), 1000);
    }, 1080);
  }

  function openHeroDirectlyForPhone() {
    if (!preloader || introFinishing) return;
    introFinishing = true;
    window.clearTimeout(introTimer);
    window.clearInterval(progressTimer);
    setupHeroVideoElement();
    revealSite();
    startVideoPlayback(heroVideo, 2400).catch(() => {});
    keepHeroPlaying(12000);
    stopPreloaderVideo();
    preloaderPoster.classList.add("hidden");
    preloader.classList.add("glow");
    window.setTimeout(() => preloader.classList.add("whiteout"), 120);
    window.setTimeout(() => {
      preloader.classList.add("fade-out");
      window.setTimeout(() => preloader.classList.add("hidden"), 700);
    }, 520);
  }

  if (preloaderPoster && preloaderVideo) {
    ensureVideoSource(preloaderVideo);
    preloaderVideo.load();
    startProgressWatch();
    // أمان ضدّ التعلّق: فعّل الزر بعد ثانيتين حتى لو لم يُطلق الفيديو حدث الجهوزية
    window.setTimeout(() => { if (!introStarting && !introFinishing) updatePreloaderProgress(100); }, 2000);

    preloaderPoster.addEventListener("click", async () => {
      if (introStarting || introFinishing) return;
      if (!preloaderPoster.classList.contains("is-ready")) return;   // انتظر جهوزية الفيديو قبل الفتح
      introStarting = true;
      preloaderPoster.classList.add("loading");
      preloaderPoster.setAttribute("aria-busy", "true");
      preloaderPoster.disabled = true;
      if (preloaderText) preloaderText.textContent = "جارٍ الفتح…";

      prepareHeroVideo().catch(() => {});
      const introStarted = await startPreloaderVideo();
      if (!introStarted) {
        introStarting = false;
        preloaderPoster.classList.remove("loading");
        preloaderPoster.removeAttribute("aria-busy");
        preloaderPoster.disabled = false;
        if (preloaderText) preloaderText.textContent = "اضغط مرة أخرى";
        return;
      }

      preloaderPoster.classList.add("hidden");
      window.setTimeout(() => { playHeroVideo(2500).catch(() => {}); keepHeroPlaying(5000); }, 250);
      armIntroTimer();
    });

    ["loadedmetadata", "loadeddata", "canplay", "canplaythrough", "progress", "suspend", "stalled", "timeupdate"].forEach((e) => {
      preloaderVideo.addEventListener(e, updatePreloaderProgress);
    });
    preloaderVideo.addEventListener("ended", finishIntro);

    if (/[?&]autoopen=1/.test(location.search)) {
      const ao = window.setInterval(() => {
        if (preloaderPoster.classList.contains("is-ready")) { window.clearInterval(ao); preloaderPoster.click(); }
      }, 300);
    }
  } else {
    window.setTimeout(finishIntro, 600);
  }

  window.setTimeout(() => { prepareHeroVideo().catch(() => {}); }, isTouchPhone() ? 250 : 650);

  if (heroVideo) ["loadeddata", "canplay", "playing", "timeupdate"].forEach((e) => heroVideo.addEventListener(e, markHeroReady));
  if (preloaderVideo) ["loadeddata", "canplay", "playing"].forEach((e) => preloaderVideo.addEventListener(e, markPreloaderReady));

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && site && site.classList.contains("visible")) keepHeroPlaying(5000);
  });
  window.addEventListener("pageshow", () => { if (site && site.classList.contains("visible")) keepHeroPlaying(5000); });
  ["pointerdown", "touchstart", "click"].forEach((eventName) => {
    document.addEventListener(eventName, () => {
      if (site && site.classList.contains("visible") && heroVideo && heroVideo.paused) playHeroVideo(1600).catch(() => {});
    }, { passive: true });
  });
})();

/* ---------------- تشغيل ملء المحتوى ---------------- */
fillContent();
loadImages();
setupReveal();
setupCountdown();

/* مؤشّر تشخيص (؟debug=1) */
if (/[?&]debug=1/.test(location.search)) {
  const b = document.getElementById("heroVideo");
  const d = document.createElement("div");
  d.style.cssText = "position:fixed;top:0;left:0;right:0;z-index:9999;background:rgba(0,0,0,.85);color:#0f0;font:13px monospace;padding:6px;text-align:center";
  document.body.appendChild(d);
  setInterval(() => {
    if (!b) { d.textContent = "no hero el"; return; }
    d.textContent = "t=" + b.currentTime.toFixed(2) + " paused=" + b.paused + " rs=" + b.readyState + " err=" + (b.error ? b.error.code : 0) + " src=" + (b.currentSrc.split("/").pop() || "-");
  }, 400);
}

};

document.addEventListener('DOMContentLoaded', window.renderFarhaTemplate);
window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === 'FARHA_RENDER_CONFIG') {
        setTimeout(window.renderFarhaTemplate, 60);
    }
});
