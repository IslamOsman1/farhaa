/* ============================================================
   قالب «هديل» (hadeel)
   لمسة → يحلّق الهديل عبر رواق الورد → يحطّ على النافورة →
   تنبثق الأسماء وتبقى الحطّة حيّة (حلقة ذهاب-إياب لآخر لحظة)
   ============================================================ */
const WEDDING_CONFIG = (typeof window !== "undefined" && window.__INVITE__ && window.__INVITE__.config) || {
  groom: "محمد", bride: "زينب",
  date: "2026-11-20T19:00:00",
  dateText: "يوم الجمعة، ٢٠ تشرين الثاني ٢٠٢٦",
  timeText: "الساعة السابعة مساءً",
  heroSub: "بكم يكتملُ الفرح… وبحضوركم تحلو الحكاية",
  verse: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
  invitationText: "أطلقنا هديلَنا الأبيض يزفُّ البشارة: في حديقةٍ يتعانق فيها الوردُ والرخام، وتحت سماءٍ صافيةٍ كقلوبنا، نحتفل بإذن الله بأجمل ليالي العمر. كونوا شهودَ فرحتنا — فبحضوركم تكتمل البهجة، وبدعائكم تدوم.",
  groomParents: "السيّد كريم عبد الله والسيّدة هدى",
  brideParents: "السيّد سامي حسن والسيّدة رنا",
  venueName: "قاعة بابل الكبرى", venueAddr: "بغداد — المنصور",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Babylon+Hotel+Baghdad",
  program: [
    { time: "٧:٠٠ مساءً", title: "استقبال الضيوف" },
    { time: "٧:٣٠ مساءً", title: "عقد القران" },
    { time: "٩:٠٠ مساءً", title: "العشاء" },
    { time: "١٠:٠٠ مساءً", title: "السهرة" },
  ],
  notes: ["يُرجى الحضور قبل الموعد بنصف ساعة", "الدعوة تشمل حاملها والعائلة الكريمة"],
  closingNote: "حضوركم هديلُ فرحتنا… وتمامُ بهجتنا",
  hashtag: "#محمد_وزينب",
  contactLabel: "للتواصل والتأكيد", contactName: "أبو محمد", contactPhone: "+9647700000000",
  closingFamilies: "عائلة عبد الله  &  عائلة حسن",
  images: {},
};

function byId(id) { return document.getElementById(id); }
function setText(id, v) { const el = byId(id); if (el && v != null) el.textContent = v; }
function toArabicDigits(s) { const ar = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"]; return String(s).replace(/[0-9]/g, (d) => ar[+d]); }
function pad(n) { return toArabicDigits(String(n).padStart(2, "0")); }

function applyFamilyOrder(brideFirst) {
  if (brideFirst !== true) return;
  const families = document.querySelector(".families");
  const groomFamily = byId("groomParents")?.closest(".family");
  const brideFamily = byId("brideParents")?.closest(".family");
  const heart = families?.querySelector(".families__heart");
  if (families && groomFamily && brideFamily && heart) {
    families.replaceChildren(brideFamily, heart, groomFamily);
  }
}

function fillContent() {
  const c = WEDDING_CONFIG;
  setText("heroGroom", c.groom); setText("heroBride", c.bride);
  setText("heroInvite", c.heroSub); setText("heroDate", c.dateText);
  setText("verseText", c.verse); setText("invitationText", c.invitationText);
  setText("groomParents", c.groomParents); setText("brideParents", c.brideParents);
  applyFamilyOrder(c.brideFirst);
  setText("venueName", c.venueName); setText("venueAddr", c.venueAddr);
  setText("closingNote", c.closingNote); setText("closingFamilies", c.closingFamilies); setText("closingHashtag", c.hashtag);
  const mapBtn = byId("mapBtn");
  if (mapBtn && c.mapUrl) mapBtn.href = c.mapUrl; else if (mapBtn) mapBtn.style.display = "none";
  buildTimeline(c.program); buildNotes(c.notes); buildContact(c);
  if (c.groom && c.bride) document.title = `دعوة زفاف ${c.groom} & ${c.bride}`;
}

/* وردة الجدول الزمني — SVG ثابتة بألوان القالب (لا بيانات مستخدم) */
const ROSE_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<g stroke="rgba(183,110,131,.45)" stroke-width=".8">
<ellipse cx="32" cy="17" rx="8" ry="12" fill="#eec3cd"/>
<ellipse cx="32" cy="17" rx="8" ry="12" fill="#eec3cd" transform="rotate(72 32 32)"/>
<ellipse cx="32" cy="17" rx="8" ry="12" fill="#dfa8b6" transform="rotate(144 32 32)"/>
<ellipse cx="32" cy="17" rx="8" ry="12" fill="#eec3cd" transform="rotate(216 32 32)"/>
<ellipse cx="32" cy="17" rx="8" ry="12" fill="#dfa8b6" transform="rotate(288 32 32)"/>
</g>
<circle cx="32" cy="32" r="6.5" fill="#f0e2bc" stroke="#c2a05e" stroke-width="1"/>
</svg>`;

function buildTimeline(items) {
  const box = byId("timeline"); if (!box) return;
  const sec = box.closest(".program");
  if (!Array.isArray(items) || !items.length) { if (sec) sec.style.display = "none"; return; }
  box.innerHTML = "";
  const line = document.createElement("span"); line.className = "sched__line"; box.appendChild(line);
  items.forEach((it) => {
    const row = document.createElement("div"); row.className = "sched__row";
    const t = document.createElement("span"); t.className = "sched__time"; t.textContent = it.time || "";
    const d = document.createElement("span"); d.className = "sched__dot";
    const e = document.createElement("span"); e.className = "sched__event"; e.textContent = it.title || "";
    row.append(t, d, e); box.appendChild(row);
  });
  const bloom = document.createElement("span"); bloom.className = "sched__bloom"; bloom.innerHTML = ROSE_SVG;
  box.appendChild(bloom);
  setupSchedBloom(box, bloom);
}

/* الوردة تنزلق على الخط حسب موضع التمرير */
function setupSchedBloom(box, bloom) {
  const rows = () => box.querySelectorAll(".sched__row");
  const place = (p) => {
    const r = rows(); if (!r.length) return;
    const a = r[0], b = r[r.length - 1];
    const y0 = a.offsetTop + a.offsetHeight / 2, y1 = b.offsetTop + b.offsetHeight / 2;
    bloom.style.top = (y0 + (y1 - y0) * p) + "px";
  };
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { place(0.5); return; }
  place(0);
  let tick = false;
  const onScroll = () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      tick = false;
      const rc = box.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.55 - rc.top) / rc.height));
      place(p);
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
}

function buildNotes(items) {
  const ul = byId("notesList"); if (!ul || !Array.isArray(items)) return; ul.innerHTML = "";
  items.forEach((txt) => { const li = document.createElement("li"); li.className = "notes__item";
    li.innerHTML = `<span class="notes__mark" aria-hidden="true">❀</span><span></span>`;
    li.querySelector("span:last-child").textContent = txt; ul.appendChild(li); });
}
function buildContact(c) {
  const link = byId("contactLink"); const label = document.querySelector(".contact__label");
  if (label && c.contactLabel) label.textContent = c.contactLabel; if (!link) return;
  const wa = (c.contactPhone || "").replace(/[^0-9]/g, "");
  if (wa) { link.href = `https://wa.me/${wa}`; link.target = "_blank"; link.rel = "noopener";
    link.innerHTML = `<span aria-hidden="true">&#9742;</span> `; link.appendChild(document.createTextNode(c.contactName ? c.contactName : c.contactPhone)); }
  else { const box = byId("contactBox"); if (box) box.style.display = "none"; }
}
function loadImages() {
  const imgs = WEDDING_CONFIG.images || {};
  if (imgs.venue) { const img = new Image(); img.onload = () => { const vp = byId("venuePhoto"); const venue = document.querySelector(".venue");
    if (vp) vp.style.backgroundImage = `url("${imgs.venue}")`; if (venue) venue.classList.add("has-photo"); }; img.src = imgs.venue; }
}

/* عدّاد */
function setupCountdown() {
  const target = new Date(WEDDING_CONFIG.date).getTime(); if (isNaN(target)) return;
  const cd = byId("countdown"), arrivedEl = byId("cdArrived");
  const els = { d: byId("cdDays"), h: byId("cdHours"), m: byId("cdMins"), s: byId("cdSecs") };
  function tick() { const diff = target - Date.now();
    if (diff <= 0) { if (cd) cd.style.display = "none"; if (arrivedEl) arrivedEl.hidden = false; clearInterval(t); return; }
    els.d.textContent = pad(Math.floor(diff / 86400000)); els.h.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    els.m.textContent = pad(Math.floor((diff % 3600000) / 60000)); els.s.textContent = pad(Math.floor((diff % 60000) / 1000)); }
  const t = setInterval(tick, 1000); tick();
}

/* ظهور أقسام البطاقة */
function setupReveal() {
  const items = document.querySelectorAll(".creveal");
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-visible")); return; }
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  items.forEach((el) => obs.observe(el));
}

/* بتلات وردية + وميض ذهبي */
function startFx() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const pl = byId("petals");
  if (pl && !pl.dataset.on) { pl.dataset.on = "1";
    const glyphs = ["❀", "✿", "❁", "✽", "❀"]; const colors = ["#eec3cd", "#dfa8b6", "#f3d9c9", "#f0e2bc", "#e8b4c2"];
    for (let i = 0; i < 16; i++) { const s = document.createElement("span"); s.className = "petal"; s.textContent = glyphs[i % glyphs.length];
      s.style.left = Math.random() * 100 + "%"; s.style.color = colors[i % colors.length]; s.style.fontSize = (10 + Math.random() * 15) + "px";
      s.style.animationDuration = (8 + Math.random() * 7) + "s"; s.style.animationDelay = (Math.random() * 8) + "s"; pl.appendChild(s); } }
  const sp = byId("sparkles");
  if (sp && !sp.dataset.on) { sp.dataset.on = "1";
    for (let i = 0; i < 20; i++) { const s = document.createElement("span"); s.className = "spark";
      s.style.left = Math.random() * 100 + "%"; s.style.top = Math.random() * 100 + "%";
      const sz = 2 + Math.random() * 4; s.style.width = s.style.height = sz + "px";
      s.style.animationDuration = (2 + Math.random() * 3) + "s"; s.style.animationDelay = (Math.random() * 4) + "s"; sp.appendChild(s); } }
}

/* أصوات مُصنَّعة لحظياً (بلا ملفات): رفّة جناح عند الإقلاع + رنّة حالمة عند الحطّة */
let audioCtx = null;
function ctx() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function reducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function wingSound() {
  try {
    const ac = ctx(); const t = ac.currentTime;
    /* ثلاث رفّات ناعمة: نبضات ضجيج مرشّح تتصاعد نغمتها */
    for (let i = 0; i < 3; i++) {
      const start = t + i * 0.16;
      const len = Math.floor(ac.sampleRate * 0.11);
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * Math.sin((j / len) * Math.PI);
      const src = ac.createBufferSource(); src.buffer = buf;
      const bp = ac.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 500 + i * 260; bp.Q.value = 0.9;
      const g = ac.createGain(); g.gain.value = 0.16;
      src.connect(bp); bp.connect(g); g.connect(ac.destination); src.start(start);
    }
  } catch (_) {}
}
function chimeNow(ac) {
  const t = ac.currentTime;
  [523.25, 659.25, 783.99].forEach((f, i) => {
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = "sine"; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + i * 0.09);
    g.gain.exponentialRampToValueAtTime(0.09, t + i * 0.09 + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 1.3);
    o.connect(g).connect(ac.destination); o.start(t + i * 0.09); o.stop(t + i * 0.09 + 1.4);
  });
}
function arriveChime() {
  try {
    const ac = ctx();
    /* الرنّة تعمل خارج لمسة المستخدم — إن بقي السياق موقوفاً نعيدها عند أول لمسة */
    if (ac.state === "suspended") {
      window.addEventListener("pointerup", () => {
        try { const a = ctx(); if (a.state !== "suspended") chimeNow(a); } catch (_) {}
      }, { once: true });
      return;
    }
    chimeNow(ac);
  } catch (_) {}
}

/* ============ رحلة الهديل ============ */
let started = false, arrived = false, revealStarted = false;

function tapRipple(e) {
  const layer = byId("tapLayer"); if (!layer) return;
  const x = (typeof e.clientX === "number" && e.clientX) || window.innerWidth / 2;
  const y = (typeof e.clientY === "number" && e.clientY) || window.innerHeight / 2;
  const r = document.createElement("span"); r.className = "tapring";
  r.style.left = x + "px"; r.style.top = y + "px";
  layer.appendChild(r); setTimeout(() => r.remove(), 760);
}

/* الأسماء تبدأ بالانبثاق قبيل الحطّة بلحظة — فتكتمل مع استقرار الهديل */
function beginReveal() {
  if (revealStarted) return; revealStarted = true;
  byId("stage").classList.add("is-landing");
  if (!reducedMotion()) arriveChime();
  document.querySelectorAll(".stage .sreveal").forEach((el, i) => setTimeout(() => el.classList.add("is-in"), 250 + i * 300));
}

function arrive() {
  if (arrived) return; arrived = true;
  beginReveal();
  const stage = byId("stage"), loop = byId("loopVid"), flight = byId("flightVid");
  /* حركة مخفّضة: بوستر الحلقة (نفس مشهد الحطّة) يكفي — بلا فيديو يتحرك */
  if (loop && !reducedMotion()) {
    /* إن منع المتصفح التشغيل خارج لمسة: نعيد المحاولة عند أول لمسة أو تمرير أو جاهزية البيانات */
    loop.play().catch(() => {
      const retry = () => { loop.play().catch(() => {}); };
      window.addEventListener("pointerdown", retry, { once: true });
      window.addEventListener("scroll", retry, { once: true, passive: true });
    });
    loop.addEventListener("canplay", () => { if (arrived && loop.paused && !document.hidden) loop.play().catch(() => {}); });
  }
  stage.classList.add("is-arrived");
  const arr = byId("arrival"); if (arr) arr.setAttribute("aria-hidden", "false");
  document.body.classList.remove("locked");
  setupReveal(); startFx(); schedDoves(600);
  setTimeout(() => { try { flight.pause(); } catch (_) {} }, 600);
}

function startFlight(e) {
  if (started) return; started = true;
  const stage = byId("stage"), flight = byId("flightVid"), loop = byId("loopVid");
  tapRipple(e || {});
  stage.classList.add("is-flying");
  /* حلقة الحطّة تُحمَّل الآن — صغيرة وتكسب مدة الرحلة كاملة لتجهز */
  if (loop) { loop.preload = "auto"; try { loop.load(); } catch (_) {} }
  /* حركة مخفّضة: بلا صوت ولا اهتزاز ولا رحلة — مباشرة لمشهد الحطّة الساكن */
  if (reducedMotion()) { arrive(); return; }
  wingSound();
  if (navigator.vibrate) { try { navigator.vibrate(16); } catch (_) {} }
  if (flight) {
    flight.addEventListener("timeupdate", () => {
      if (flight.duration && flight.currentTime > flight.duration - 1.05) beginReveal();
    });
    flight.addEventListener("ended", arrive, { once: true });
    /* تقطّع الشبكة: توقّف مستمر > ٢.٦ ثانية → ننتقل لمشهد الحطّة بدل فريم متجمّد */
    let stallTimer = null;
    const onStall = () => { clearTimeout(stallTimer); stallTimer = setTimeout(() => { if (!arrived) arrive(); }, 2600); };
    flight.addEventListener("waiting", onStall);
    flight.addEventListener("stalled", onStall);
    flight.addEventListener("playing", () => clearTimeout(stallTimer));
    const p = flight.play();
    if (p && p.catch) p.catch(() => arrive()); /* فشل التشغيل → مباشرة للمشهد الأخير */
    setTimeout(() => { if (!arrived) arrive(); }, 13000); /* صمّام أمان */
  } else { arrive(); }
}

/* الرجوع من الخلفية (واتساب ↔ الدعوة): iOS يوقف الفيديو ولا يستأنفه بنفسه */
document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  if (started && !arrived) {
    const f = byId("flightVid");
    const p = f && f.play();
    if (p && p.catch) p.catch(() => arrive());
  } else if (arrived && !reducedMotion()) {
    const l = byId("loopVid");
    if (l && l.paused) l.play().catch(() => {});
  }
});

/* ============ طيور بيضاء حيّة تعبر المشهد ============ */
let doveTimer = null;
function spawnDove() {
  const host = byId("doves");
  if (!host || reducedMotion()) return;
  if ((started && !arrived) || host.childElementCount >= 3 || document.hidden) { schedDoves(); return; }
  const far = !arrived; /* قبل الإقلاع: بعيدة وخافتة كي لا تزاحم المشهد */
  const dir = Math.random() < 0.5 ? 1 : -1;
  const d = document.createElement("span"); d.className = "dove";
  const i = document.createElement("i"); d.appendChild(i);
  d.style.setProperty("--x0", dir === 1 ? "-20vw" : "120vw");
  d.style.setProperty("--x1", dir === 1 ? "120vw" : "-20vw");
  d.style.setProperty("--sx", String(dir));
  d.style.setProperty("--y0", (6 + Math.random() * 30) + "vh");
  d.style.setProperty("--y1", (4 + Math.random() * 34) + "vh");
  d.style.setProperty("--s", ((far ? 0.32 : 0.5) + Math.random() * (far ? 0.22 : 0.5)).toFixed(2));
  d.style.setProperty("--o", far ? "0.55" : "0.92");
  d.style.setProperty("--gd", (8 + Math.random() * 6) + "s");
  i.style.animationDuration = (0.68 + Math.random() * 0.3) + "s";
  d.addEventListener("animationend", (ev) => { if (ev.target === d) d.remove(); });
  host.appendChild(d);
  schedDoves();
}
function schedDoves(firstDelay) {
  clearTimeout(doveTimer);
  const delay = firstDelay != null ? firstDelay : (arrived ? 5200 : 8500) + Math.random() * 4500;
  doveTimer = setTimeout(spawnDove, delay);
}

/* تشغيل */
fillContent(); loadImages(); setupCountdown();
(function bind() {
  const stage = byId("stage");
  if (stage) stage.addEventListener("pointerdown", startFlight);
  /* فكّ قفل الصوت على حدث تفعيل حقيقي — iOS يمنح التفعيل عند touchend/click لا pointerdown */
  ["touchend", "click"].forEach((ev) =>
    window.addEventListener(ev, () => { try { ctx(); } catch (_) {} }, { once: true, passive: true })
  );
  schedDoves();
  /* للتصوير والمعاينة: قفزة مباشرة لمشهد الحطّة */
  if (/[?&]autoopen=1/.test(location.search)) {
    started = true;
    const stageEl = byId("stage");
    stageEl.classList.add("is-flying");
    const loop = byId("loopVid"); if (loop) { loop.preload = "auto"; try { loop.load(); } catch (_) {} }
    revealStarted = true; /* بلا رنّة عند التصوير */
    stageEl.classList.add("is-landing");
    document.querySelectorAll(".stage .sreveal").forEach((el) => el.classList.add("is-in"));
    arrive();
  }
})();
