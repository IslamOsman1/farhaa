window.renderFarhaTemplate = function() {
/* ============================================================
   قالب letter «رسالة» — الإعدادات والتفاعل
   عدّل بيانات العرس من WEDDING_CONFIG في الأسفل فقط.
   ============================================================ */

const WEDDING_CONFIG = (typeof window!=="undefined" && window.__INVITE__ && window.__INVITE__.config) || {
  // ===== الأساسيات =====
  groom: "آدم",
  bride: "ميرا",

  // تاريخ ووقت العرس: YYYY-MM-DDTHH:MM:SS (نظام 24 ساعة) — لازم مستقبلي
  date: "2026-11-20T19:00:00",
  dateText: "يوم الجمعة، ٢٠ تشرين الثاني ٢٠٢٦",
  timeText: "الساعة السابعة مساءً",

  heroSub: "يتشرّفان بدعوتكم لمشاركتهما فرحة العمر",

  // ===== دعاء افتتاحي =====
  verse: "اللّهُمَّ بارِكْ لهُما وبارِكْ عليهِما واجمَعْ بينهُما في خير",

  // ===== نص الدعوة الرسمي =====
  invitationText: "بقلوبٍ مفعمةٍ بالفرح والسرور، نتشرّف بدعوتكم لمشاركتنا أجمل لحظات حياتنا في حفل زفافنا. حضوركم شرفٌ لنا وبهجةٌ تكتمل بها فرحتنا.",

  // ===== عائلتا العروسين =====
  groomParents: "نجل السيّد كريم عبد الله و السيّدة هدى",
  brideParents: "كريمة السيّد سامي حسن و السيّدة رنا",

  // ===== القاعة =====
  venueName: "قاعة بابل الكبرى",
  venueAddr: "بغداد — المنصور",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Babylon+Hotel+Baghdad",

  // ===== برنامج الحفل =====
  program: [
    { time: "٧:٠٠ مساءً", title: "استقبال الضيوف" },
    { time: "٧:٣٠ مساءً", title: "عقد القران" },
    { time: "٨:٣٠ مساءً", title: "الكوكتيل" },
    { time: "٩:٣٠ مساءً", title: "العشاء" },
    { time: "١٠:٣٠ مساءً", title: "الرقص والسهرة" },
  ],

  // ===== ملاحظات مهمة =====
  notes: [
    "يُرجى الحضور قبل الموعد بنصف ساعة",
    "نتشرّف بحضوركم بأبهى حلّة",
    "الدعوة تشمل حاملها والعائلة الكريمة",
  ],

  // ===== الخاتمة =====
  closingNote: "حضوركم يزيّن فرحتنا",
  hashtag: "#آدم_وميرا",
  contactLabel: "للاستفسار والتأكيد",
  contactName: "أبو آدم",
  contactPhone: "+9647700000000",   // رقم التواصل (واتساب)
  closingFamilies: "عائلة عبد الله  &  عائلة حسن",

  // ===== الصور (اختياري) =====
  // ضع صورك في مجلد assets/ بهذه الأسماء وتظهر تلقائياً بدون تعديل الكود.
  images: {
    hero: "assets/hero.jpg",      // صورة العرسين المؤطّرة في الواجهة
    venue: "assets/venue.jpg",    // صورة القاعة
    background: "",                // خلفية كامل الصفحة (اختياري) مثل: "assets/bg.jpg"
  },
};

/* ---------------- تعبئة المحتوى ---------------- */
function fillContent() {
  const c = WEDDING_CONFIG;
  setText("groomName", c.groom);
  setText("brideName", c.bride);
  setText("heroSub", c.heroSub);
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

  const coverNames = document.getElementById("coverNames");
  if (coverNames) coverNames.textContent = `${c.groom} & ${c.bride}`;

  // ===== صورة العرسين المؤطّرة (تظهر فقط إن وُجدت الصورة) =====
  const _imgs = (WEDDING_CONFIG.images) || {};
  const _src = _imgs.hero;
  const _box = document.getElementById("heroPhoto");
  const _im = document.getElementById("heroPhotoImg");
  if (_box && _im && _src) {
    _im.onload = function () { _box.classList.add("is-shown"); };
    _im.onerror = function () { _box.classList.remove("is-shown"); _box.style.display = "none"; };
    _im.src = _src;
  }

  // ===== خلفية مخصّصة بحواف متلاشية (تظهر فقط إن حُمّلت الصورة بنجاح) =====
  const _bg = (c.images && c.images.background);
  ['coverBg', 'heroBg'].forEach(function (id) {
    const el = document.getElementById(id);
    if (el && _bg) {
      const p = new Image();
      p.onload = function () { el.style.backgroundImage = 'url("' + _bg + '")'; el.classList.add('is-shown'); };
      p.onerror = function () { el.classList.remove('is-shown'); };
      p.src = _bg;
    }
  });

  buildTimeline(c.program);
  buildNotes(c.notes);
  buildContact(c);

  document.title = `دعوة زفاف ${c.groom} & ${c.bride}`;
}

function setText(id, value) { const el = document.getElementById(id); if (el && value != null) el.textContent = value; }
function firstLetter(name) { return (name || "").trim().charAt(0) || ""; }

/* ---------------- تحميل صورة القاعة تلقائياً (إن وُجدت) ---------------- */
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
    li.innerHTML = `<span class="notes__mark" aria-hidden="true">&#10047;</span><span>${txt}</span>`;
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
    link.innerHTML = `<span aria-hidden="true">&#9742;</span> `;
    link.appendChild(document.createTextNode(c.contactName ? c.contactName : c.contactPhone));
  } else {
    const box = document.getElementById("contactBox");
    if (box) box.style.display = "none";
  }
}

/* ---------------- فتح المظروف ---------------- */
function setupEnvelope() {
  const cover = document.getElementById("cover");
  const invite = document.getElementById("invite");
  const btn = document.getElementById("openBtn");
  const env = document.getElementById("env");
  if (!cover || !invite) return;
  let opened = false, revealed = false;
  const reveal = () => {
    if (revealed) return; revealed = true;
    cover.classList.add("is-open");                 // يتلاشى الغلاف كاشفاً الواجهة الرئيسية
    invite.setAttribute("aria-hidden", "false");
    revealFirst();
    startPetals(26);
    startMsgs(9);
    setTimeout(() => { cover.style.display = "none"; }, 800);
  };
  const open = () => {
    if (opened) return; opened = true;
    cover.classList.add("is-opening");               // يشغّل أنميشن السبرايت فوراً: التوهّج ثم فتح الأطراف
    setTimeout(reveal, 950);                          // يبدأ التقاطع مع الدعوة مع انفتاح الأطراف فتغطّي الفجوة الداكنة
  };
  // pointerdown أسرع استجابةً على اللمس من click
  if (btn) { btn.addEventListener("pointerdown", open); btn.addEventListener("click", open); }
  if (env) env.addEventListener("pointerdown", open);
}

/* ---------------- ظهور الأقسام ---------------- */
function setupReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-visible")); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => obs.observe(el));
}
function revealFirst() { document.querySelectorAll(".stage__content.reveal").forEach((el) => el.classList.add("is-visible")); }

/* ---------------- العدّاد التنازلي (أرقام عربية ٠١٢٣) ---------------- */
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

/* ---------------- بتلات وردية متساقطة ---------------- */
function startPetals(count) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.getElementById("petals");
  if (!layer) return;
  const glyphs = ["❀", "✿", "❁", "·"];
  const colors = ["#c39a8e", "#c2a05a", "#e7b7ab", "#a6705f"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "petal";
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.color = colors[i % colors.length];
    s.style.fontSize = (9 + Math.random() * 16) + "px";
    s.style.animationDuration = (6 + Math.random() * 6) + "s";
    s.style.animationDelay = (Math.random() * 5) + "s";
    layer.appendChild(s);
  }
}

/* ---------------- رسائل عائمة ترتفع بهدوء (أنميشن الرسائل) ---------------- */
function startMsgs(count) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.getElementById("petals");
  if (!layer) return;
  const glyphs = ["✉", "❤", "❦", "✦"];
  const colors = ["#c2a05a", "#a6705f", "#ddc185", "#8c1f2b"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "msg";
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = (4 + Math.random() * 92) + "%";
    s.style.color = colors[i % colors.length];
    s.style.fontSize = (12 + Math.random() * 12) + "px";
    s.style.setProperty("--mx", (Math.random() * 70 - 35) + "px");
    s.style.animationDuration = (12 + Math.random() * 9) + "s";
    s.style.animationDelay = (Math.random() * 12) + "s";
    layer.appendChild(s);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fillContent();
  loadImages();
  setupEnvelope();
  setupReveal();
  setupCountdown();
});

};

document.addEventListener('DOMContentLoaded', window.renderFarhaTemplate);
window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === 'FARHA_RENDER_CONFIG') {
        setTimeout(window.renderFarhaTemplate, 60);
    }
});
