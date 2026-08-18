/* ============================================================
   قالب «البجعة» (reverie)
   دخولية: فيديو مظروف حقيقي بختم ذهبي يُفتح عند الضغط
   → كشف الهيرو (فيديو البجع على البحيرة)
   ============================================================ */
const WEDDING_CONFIG = (typeof window !== "undefined" && window.__INVITE__ && window.__INVITE__.config) || {
  groom: "محمد", bride: "زينب",
  date: "2026-11-20T19:00:00",
  dateText: "يوم الجمعة، ٢٠ تشرين الثاني ٢٠٢٦",
  timeText: "الساعة السابعة مساءً",
  heroSub: "يتشرّفان بدعوتكم لمشاركتهما فرحة العمر",
  verse: "اللّهُمَّ بارِكْ لهُما وبارِكْ عليهِما واجمَعْ بينهُما في خير",
  invitationText: "بقلوبٍ مفعمةٍ بالفرح والسرور، نتشرّف بدعوتكم لمشاركتنا أجمل لحظات حياتنا في حفل زفافنا. حضوركم شرفٌ لنا وبهجةٌ تكتمل بها فرحتنا.",
  groomParents: "نجل السيّد كريم عبد الله و السيّدة هدى",
  brideParents: "كريمة السيّد سامي حسن و السيّدة رنا",
  venueName: "قاعة بابل الكبرى", venueAddr: "بغداد — المنصور",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Baghdad",
  program: [
    { time: "٧:٠٠ مساءً", title: "استقبال الضيوف" },
    { time: "٧:٣٠ مساءً", title: "عقد القران" },
    { time: "٩:٠٠ مساءً", title: "العشاء" },
    { time: "١٠:٠٠ مساءً", title: "السهرة" },
  ],
  notes: ["يُرجى الحضور قبل الموعد بنصف ساعة", "الدعوة تشمل حاملها والعائلة الكريمة"],
  closingNote: "حضوركم يزيّن فرحتنا",
  hashtag: "#محمد_وزينب",
  contactLabel: "للتواصل والتأكيد", contactName: "أبو محمد", contactPhone: "+9647700000000",
  closingFamilies: "عائلة عبد الله  &  عائلة حسن",
  images: {},
};

function setText(id, v) { const el = document.getElementById(id); if (el && v != null) el.textContent = v; }
/* غبار ذهبي يطفو فوق المظروف في الدخولية */
function buildCoverFx() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const fx = document.getElementById("coverFx"); if (!fx || fx.dataset.on) return; fx.dataset.on = "1";
  for (let i = 0; i < 16; i++) {
    const m = document.createElement("span"); m.className = "mote";
    m.style.left = Math.random() * 100 + "%";
    const sz = 3 + Math.random() * 5; m.style.width = m.style.height = sz + "px";
    m.style.animationDuration = (9 + Math.random() * 8) + "s";
    m.style.animationDelay = (Math.random() * 9) + "s";
    m.style.opacity = (0.5 + Math.random() * 0.5).toFixed(2);
    fx.appendChild(m);
  }
}
function toArabicDigits(s) { const ar = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"]; return String(s).replace(/[0-9]/g, (d) => ar[+d]); }
function pad(n) { return toArabicDigits(String(n).padStart(2, "0")); }

function fillContent() {
  const c = WEDDING_CONFIG;
  const names = c.groom && c.bride ? `${c.groom} & ${c.bride}` : "";
  setText("coverNames", names);
  setText("heroGroom", c.groom); setText("heroBride", c.bride);
  setText("heroInvite", c.heroSub); setText("heroDate", c.dateText);
  setText("verseText", c.verse); setText("invitationText", c.invitationText);
  setText("groomParents", c.groomParents); setText("brideParents", c.brideParents);
  setText("venueName", c.venueName); setText("venueAddr", c.venueAddr);
  setText("closingNote", c.closingNote); setText("closingFamilies", c.closingFamilies); setText("closingHashtag", c.hashtag);
  const mapBtn = document.getElementById("mapBtn");
  if (mapBtn && c.mapUrl) mapBtn.href = c.mapUrl; else if (mapBtn) mapBtn.style.display = "none";
  buildTimeline(c.program); buildNotes(c.notes); buildContact(c);
  if (c.groom && c.bride) document.title = `دعوة زفاف ${c.groom} & ${c.bride}`;
}
/* وردة الجدول الزمني — SVG ثابتة (لا بيانات مستخدم) */
const ROSE_SVG = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<g transform="rotate(-8 32 32)">
<ellipse cx="14" cy="46" rx="8" ry="3.4" fill="#a9b895" opacity=".85" transform="rotate(-32 14 46)"/>
<ellipse cx="50" cy="46" rx="8" ry="3.4" fill="#9caf8f" opacity=".85" transform="rotate(32 50 46)"/>
<g stroke="rgba(146,84,90,.35)" stroke-width=".7">
<g fill="#ecc6bb">
<ellipse cx="32" cy="15" rx="8.5" ry="11.5"/><ellipse cx="32" cy="15" rx="8.5" ry="11.5" transform="rotate(45 32 32)"/>
<ellipse cx="32" cy="15" rx="8.5" ry="11.5" transform="rotate(90 32 32)"/><ellipse cx="32" cy="15" rx="8.5" ry="11.5" transform="rotate(135 32 32)"/>
<ellipse cx="32" cy="15" rx="8.5" ry="11.5" transform="rotate(180 32 32)"/><ellipse cx="32" cy="15" rx="8.5" ry="11.5" transform="rotate(225 32 32)"/>
<ellipse cx="32" cy="15" rx="8.5" ry="11.5" transform="rotate(270 32 32)"/><ellipse cx="32" cy="15" rx="8.5" ry="11.5" transform="rotate(315 32 32)"/>
</g>
<g fill="#e2b3a6">
<ellipse cx="32" cy="20.5" rx="6.5" ry="9" transform="rotate(30 32 32)"/><ellipse cx="32" cy="20.5" rx="6.5" ry="9" transform="rotate(90 32 32)"/>
<ellipse cx="32" cy="20.5" rx="6.5" ry="9" transform="rotate(150 32 32)"/><ellipse cx="32" cy="20.5" rx="6.5" ry="9" transform="rotate(210 32 32)"/>
<ellipse cx="32" cy="20.5" rx="6.5" ry="9" transform="rotate(270 32 32)"/><ellipse cx="32" cy="20.5" rx="6.5" ry="9" transform="rotate(330 32 32)"/>
</g>
<g fill="#d69c92">
<ellipse cx="32" cy="25" rx="5" ry="7" transform="rotate(60 32 32)"/><ellipse cx="32" cy="25" rx="5" ry="7" transform="rotate(150 32 32)"/>
<ellipse cx="32" cy="25" rx="5" ry="7" transform="rotate(240 32 32)"/><ellipse cx="32" cy="25" rx="5" ry="7" transform="rotate(330 32 32)"/>
</g>
</g>
<circle cx="32" cy="32" r="7.2" fill="#c9878b"/>
<path d="M32 26.5a5.5 5.5 0 0 1 5.5 5.5 5.5 5.5 0 0 1-5.5 5.5 4.2 4.2 0 0 1-4.2-4.2 3.2 3.2 0 0 1 3.2-3.2 2.4 2.4 0 0 1 2.4 2.4 1.7 1.7 0 0 1-1.7 1.7" fill="none" stroke="#a96b70" stroke-width="1.1" stroke-linecap="round"/>
</g></svg>`;

function buildTimeline(items) {
  const box = document.getElementById("timeline"); if (!box) return;
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
  const rose = document.createElement("span"); rose.className = "sched__rose"; rose.innerHTML = ROSE_SVG;
  box.appendChild(rose);
  setupSchedRose(box, rose);
}

/* الوردة تنزلق على الخط حسب موضع التمرير */
function setupSchedRose(box, rose) {
  const rows = () => box.querySelectorAll(".sched__row");
  const place = (p) => {
    const r = rows(); if (!r.length) return;
    const a = r[0], b = r[r.length - 1];
    const y0 = a.offsetTop + a.offsetHeight / 2, y1 = b.offsetTop + b.offsetHeight / 2;
    rose.style.top = (y0 + (y1 - y0) * p) + "px";
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
  const ul = document.getElementById("notesList"); if (!ul || !Array.isArray(items)) return; ul.innerHTML = "";
  items.forEach((txt) => { const li = document.createElement("li"); li.className = "notes__item";
    li.innerHTML = `<span class="notes__mark" aria-hidden="true">&#10086;</span><span></span>`;
    li.querySelector("span:last-child").textContent = txt; ul.appendChild(li); });
}
function buildContact(c) {
  const link = document.getElementById("contactLink"); const label = document.querySelector(".contact__label");
  if (label && c.contactLabel) label.textContent = c.contactLabel; if (!link) return;
  const wa = (c.contactPhone || "").replace(/[^0-9]/g, "");
  if (wa) { link.href = `https://wa.me/${wa}`; link.target = "_blank"; link.rel = "noopener";
    link.innerHTML = `<span aria-hidden="true">&#9742;</span> `; link.appendChild(document.createTextNode(c.contactName ? c.contactName : c.contactPhone)); }
  else { const box = document.getElementById("contactBox"); if (box) box.style.display = "none"; }
}
function loadImages() {
  const imgs = WEDDING_CONFIG.images || {};
  if (imgs.venue) { const img = new Image(); img.onload = () => { const vp = document.getElementById("venuePhoto"); const venue = document.querySelector(".venue");
    if (vp) vp.style.backgroundImage = `url("${imgs.venue}")`; if (venue) venue.classList.add("has-photo"); }; img.src = imgs.venue; }
}

/* عدّاد */
function setupCountdown() {
  const target = new Date(WEDDING_CONFIG.date).getTime(); if (isNaN(target)) return;
  const cd = document.getElementById("countdown"), arrived = document.getElementById("cdArrived");
  const els = { d: document.getElementById("cdDays"), h: document.getElementById("cdHours"), m: document.getElementById("cdMins"), s: document.getElementById("cdSecs") };
  function tick() { const diff = target - Date.now();
    if (diff <= 0) { if (cd) cd.style.display = "none"; if (arrived) arrived.hidden = false; clearInterval(t); return; }
    els.d.textContent = pad(Math.floor(diff / 86400000)); els.h.textContent = pad(Math.floor((diff % 86400000) / 3600000));
    els.m.textContent = pad(Math.floor((diff % 3600000) / 60000)); els.s.textContent = pad(Math.floor((diff % 60000) / 1000)); }
  const t = setInterval(tick, 1000); tick();
}

/* ظهور */
function setupReveal() {
  const items = document.querySelectorAll(".creveal");
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-visible")); return; }
  const obs = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-visible"); obs.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  items.forEach((el) => obs.observe(el));
}

/* عناصر متحركة */
function startFx() {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const pl = document.getElementById("petals");
  if (pl && !pl.dataset.on) { pl.dataset.on = "1";
    const glyphs = ["❀", "✿", "❁", "🌸", "❀"]; const colors = ["#e9c3ba", "#dcae9f", "#d8b878", "#c9a24b", "#eccfc6"];
    for (let i = 0; i < 18; i++) { const s = document.createElement("span"); s.className = "petal"; s.textContent = glyphs[i % glyphs.length];
      s.style.left = Math.random() * 100 + "%"; s.style.color = colors[i % colors.length]; s.style.fontSize = (10 + Math.random() * 16) + "px";
      s.style.animationDuration = (8 + Math.random() * 7) + "s"; s.style.animationDelay = (Math.random() * 8) + "s"; pl.appendChild(s); } }
  const sp = document.getElementById("sparkles");
  if (sp && !sp.dataset.on) { sp.dataset.on = "1";
    for (let i = 0; i < 26; i++) { const s = document.createElement("span"); s.className = "spark";
      s.style.left = Math.random() * 100 + "%"; s.style.top = Math.random() * 100 + "%";
      const sz = 2 + Math.random() * 4; s.style.width = s.style.height = sz + "px";
      s.style.animationDuration = (2 + Math.random() * 3) + "s"; s.style.animationDelay = (Math.random() * 4) + "s"; sp.appendChild(s); } }
}

/* دخولية الفيديو */
let opened = false;
function reveal() {
  const cover = document.getElementById("cover"); const invite = document.getElementById("invite"); const hero = document.getElementById("heroVid");
  document.body.classList.remove("locked");
  invite.classList.add("visible"); invite.setAttribute("aria-hidden", "false");
  cover.classList.add("is-open");
  if (hero) {
    const showHero = () => hero.classList.add("is-ready");
    if (hero.readyState >= 2) showHero();
    ["loadeddata", "canplay", "playing"].forEach((e) => hero.addEventListener(e, showHero));
    hero.play().catch(() => {});
  }
  document.querySelectorAll(".stage__inner .sreveal").forEach((el, i) => setTimeout(() => el.classList.add("is-in"), 120 + i * 40));
  setupReveal(); startFx();
  setTimeout(() => { cover.style.display = "none"; }, 2700);   // بعد اكتمال الذوبان الهادئ (٢.٤ث)
}
function openInvite() {
  if (opened) return; opened = true;
  const cover = document.getElementById("cover");
  const vid = document.getElementById("envVid");
  cover.classList.add("is-playing");   // يُخفي الزر والغبار بينما يعزف فيديو الفتح
  let done = false;
  const go = () => { if (done) return; done = true; reveal(); };
  if (vid) {
    vid.addEventListener("ended", go, { once: true });
    vid.addEventListener("error", go, { once: true });
    const p = vid.play();
    if (p && p.catch) p.catch(go);     // تعذّر التشغيل → دخول مباشر
    setTimeout(go, 4400);              // قبيل نهاية الفيديو (٥ث) لتتداخل الإذابة مع نهايته
  } else setTimeout(go, 680);
}

/* تشغيل */
fillContent(); loadImages(); setupCountdown();
(function bind() {
  const btn = document.getElementById("openBtn");
  if (btn) { btn.addEventListener("click", openInvite); btn.addEventListener("pointerdown", openInvite); }
  buildCoverFx();
  if (/[?&]autoopen=1/.test(location.search)) setTimeout(openInvite, 900);
})();
