/* ============================================================
   قالب wisal «وِصال» — أعراس/خطوبة
   الدخولية: يدان تمتدّان في ممرّ الضوء حتى تلتقيا (فيديو) ← عند انتهائه
   تنزاح الطبقة عن الواجهة الأساسية فتنزلق الأسماء نحو بعضها كاليدين.
   محرّك الفيديو بنمط rozana/classic المضمون على آيفون:
   تشغيل متدرّج بعد لمسة المستخدم + صمّام أمان لا يحبس الضيف أبداً.
   ============================================================ */

const WEDDING_CONFIG = (typeof window !== "undefined" && window.__INVITE__ && window.__INVITE__.config) || {
  groom: "آدم",
  bride: "ميرا",
  date: "2026-10-24T19:00:00",
  dateText: "يوم السبت، ٢٤ تشرين الأول ٢٠٢٦",
  timeText: "الساعة السابعة مساءً",
  heroSub: "يتشرّفان بدعوتكم لمشاركتهما فرحة العمر",
  verse: "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً",
  invitationText: "بقلوبٍ مفعمةٍ بالفرح والسرور، نتشرّف بدعوتكم لمشاركتنا أجمل لحظات حياتنا في حفل زفافنا. حضوركم شرفٌ لنا وبهجةٌ تكتمل بها فرحتنا.",
  groomParents: "نجل السيّد كريم عبد الله و السيّدة هدى",
  brideParents: "كريمة السيّد سامي حسن و السيّدة رنا",
  venueName: "قاعة الوصال",
  venueAddr: "بغداد — المنصور",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Baghdad",
  program: [
    { time: "٧:٠٠ مساءً", title: "استقبال الضيوف" },
    { time: "٨:٠٠ مساءً", title: "بدء الحفل" },
    { time: "٩:٣٠ مساءً", title: "العشاء" },
    { time: "١٠:٣٠ مساءً", title: "السهرة" },
  ],
  notes: [
    "يُرجى الحضور قبل الموعد بنصف ساعة",
    "نتشرّف بحضوركم بأبهى حلّة",
  ],
  closingNote: "حضوركم يزيّن فرحتنا ويُكمل بهجتنا",
  hashtag: "#آدم_وميرا",
  contactLabel: "للاستفسار والتأكيد",
  contactName: "أبو آدم",
  contactPhone: "+9647700000000",
  closingFamilies: "عائلة عبد الله  &  عائلة حسن",
  images: {},
};

/* ---------------- تعبئة المحتوى ---------------- */
function setText(id, value) { const el = document.getElementById(id); if (el && value != null) el.textContent = value; }

/* تصغير اسمٍ طويل حتى يتّسع بسطره (الأسماء بسطر واحد لا يلتفّ) */
function fitText(el) {
  if (!el) return;
  el.style.fontSize = "";
  const base = parseFloat(getComputedStyle(el).fontSize);
  let size = base, guard = 0;
  while (el.scrollWidth > el.clientWidth + 1 && size > base * 0.5 && guard < 26) {
    size -= base * 0.04;
    el.style.fontSize = size + "px";
    guard += 1;
  }
}

function fillContent() {
  const c = WEDDING_CONFIG;
  setText("heroGroom", c.groom);
  setText("heroBride", c.bride);
  setText("heroDate", c.dateText);
  setText("heroVenue", c.venueName);
  setText("heroAddr", c.venueAddr);
  setText("verseText", c.verse);
  setText("invitationText", c.invitationText);
  setText("groomParents", c.groomParents);
  setText("brideParents", c.brideParents);
  setText("weddingDate", c.dateText);
  setText("weddingTime", c.timeText);
  setText("wipeDate", c.dateText);
  setText("wipeTime", c.timeText);
  setText("venueName", c.venueName);
  setText("venueAddr", c.venueAddr);
  setText("closingNote", c.closingNote);
  setText("closingHashtag", c.hashtag);
  setText("closingFamilies", c.closingFamilies);

  const names = document.getElementById("coverNames");
  if (names && c.groom && c.bride) names.textContent = `${c.groom} & ${c.bride}`;

  const mapBtn = document.getElementById("mapBtn");
  if (mapBtn && c.mapUrl) mapBtn.href = c.mapUrl;
  else if (mapBtn) mapBtn.style.display = "none";

  buildTimeline(c.program);
  buildNotes(c.notes);
  buildContact(c);

  if (c.groom && c.bride) document.title = `دعوة زفاف ${c.groom} & ${c.bride}`;

  requestAnimationFrame(() => {
    fitText(document.getElementById("heroGroom"));
    fitText(document.getElementById("heroBride"));
    fitText(document.getElementById("coverNames"));
  });
}

function buildTimeline(items) {
  const ul = document.getElementById("timeline");
  if (!ul || !Array.isArray(items)) return;
  ul.innerHTML = "";
  items.forEach((it) => {
    const li = document.createElement("li");
    li.className = "timeline__item";
    li.innerHTML = `<span class="timeline__dot" aria-hidden="true"></span>
      <span class="timeline__time"></span>
      <span class="timeline__title"></span>`;
    li.querySelector(".timeline__time").textContent = it.time || "";
    li.querySelector(".timeline__title").textContent = it.title || "";
    ul.appendChild(li);
  });
  if (!items.length) { const sec = ul.closest(".card"); if (sec) sec.style.display = "none"; }
}

function buildNotes(items) {
  const ul = document.getElementById("notesList");
  if (!ul || !Array.isArray(items)) return;
  ul.innerHTML = "";
  items.forEach((txt) => {
    const li = document.createElement("li");
    li.className = "notes__item";
    const mark = document.createElement("span");
    mark.className = "notes__mark"; mark.setAttribute("aria-hidden", "true"); mark.innerHTML = "&#10022;";
    const body = document.createElement("span");
    body.textContent = txt;
    li.appendChild(mark); li.appendChild(body);
    ul.appendChild(li);
  });
  if (!items.length) { const sec = ul.closest(".card"); if (sec) sec.style.display = "none"; }
}

function buildContact(c) {
  const link = document.getElementById("contactLink");
  const label = document.querySelector(".contact__label");
  if (label && c.contactLabel) label.textContent = c.contactLabel;
  if (!link) return;
  const wa = (c.contactPhone || "").replace(/[^0-9]/g, "");
  if (wa) {
    link.href = `https://wa.me/${wa}`;
    link.target = "_blank"; link.rel = "noopener";
    link.innerHTML = `<span aria-hidden="true">&#9742;</span> `;
    link.appendChild(document.createTextNode(c.contactName ? c.contactName : c.contactPhone));
  } else {
    const box = document.getElementById("contactBox");
    if (box) box.style.display = "none";
  }
}

/* ---------------- ظهور البطاقات عند التمرير ----------------
   البطاقة تبدأ شفّافة وتظهر عند وصول الضيف إليها. صمّام أمان: أي بطاقة
   دخلت الشاشة ولم يُطلق لها المراقب حدثاً (بيئات لا تدعمه جيداً، أو قفزة
   مباشرة برابط) تُكشف بفحص تمرير مستقل — لا يبقى قسمٌ مخفياً عن ضيف أبداً. */
function setupReveal() {
  const items = document.querySelectorAll(".creveal");
  if (!items.length) return;

  function show(el) { el.classList.add("is-visible"); }

  if (!("IntersectionObserver" in window)) { items.forEach(show); return; }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { show(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12 });
  items.forEach((el) => obs.observe(el));

  /* الفحص الاحتياطي: يكشف ما دخل الشاشة فعلاً ولم يُكشَف بعد */
  let ticking = false;
  function sweep() {
    ticking = false;
    let left = 0;
    items.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) { show(el); obs.unobserve(el); }
      else left += 1;
    });
    if (!left) {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    }
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sweep);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  [600, 1800].forEach((ms) => window.setTimeout(sweep, ms));
}

/* ---------------- العدّاد التنازلي ---------------- */
function toArabicDigits(s) {
  const ar = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(s).replace(/[0-9]/g, (d) => ar[+d]);
}
function pad(n) { return toArabicDigits(String(n).padStart(2, "0")); }

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

/* ---------------- خيط الضوء الحي ----------------
   الخيط يقيس تقدّم الضيف داخل كتلة الأقسام لا داخل الصفحة كلها،
   وعلى رأسه خرزة ضوء تنزل معه، وبين كل بطاقتين عقدة ✦ تضيء لحظة
   مرور الخرزة بها — الحكاية «تنعقد» محطةً محطة حتى عقدة الختام. */
function setupThread() {
  const fill = document.getElementById("threadFill");
  const wrap = document.querySelector(".wrap");
  const thread = document.querySelector(".thread");
  if (!fill || !wrap || !thread) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    fill.style.height = "100%";
    return;
  }

  /* خرزة رأس الخيط */
  const bead = document.createElement("i");
  bead.className = "thread__bead";
  thread.appendChild(bead);

  /* عقدة بين كل بطاقتين (في منتصف الفجوة) */
  const cards = Array.from(wrap.querySelectorAll(".card"));
  const knots = cards.slice(0, -1).map((card) => {
    const k = document.createElement("span");
    k.className = "tknot";
    k.textContent = "✦";
    thread.appendChild(k);
    return { el: k, card, y: 0 };
  });
  function placeKnots() {
    knots.forEach((k) => {
      k.y = k.card.offsetTop + k.card.offsetHeight + 15;
      k.el.style.top = k.y - 7 + "px";
    });
  }

  let ticking = false;
  function update() {
    ticking = false;
    const r = wrap.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = r.height + vh * 0.5;
    const passed = vh * 0.75 - r.top;
    const pct = Math.max(0, Math.min(1, passed / total));
    fill.style.height = (pct * 100).toFixed(2) + "%";

    const px = pct * r.height;
    bead.style.top = px.toFixed(1) + "px";
    bead.classList.toggle("is-on", pct > 0.005 && pct < 0.995);
    knots.forEach((k) => k.el.classList.toggle("is-lit", px >= k.y));
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { placeKnots(); onScroll(); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { placeKnots(); update(); }).catch(() => {});
  }
  placeKnots();
  update();
}

/* ---------------- ومضات ذهب بين البطاقات ----------------
   شرارات ✦ صغيرة تومض وتخبو في فراغات العاج — الصفحة تتنفّس ذهباً.
   خلف البطاقات (z-index 0) فلا تزاحم النص أبداً. */
function startSparkles(count) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const wrap = document.querySelector(".wrap");
  if (!wrap || wrap.dataset.sparks) return;
  wrap.dataset.sparks = "1";
  for (let i = 0; i < count; i += 1) {
    const s = document.createElement("span");
    s.className = "spark";
    s.textContent = "✦";
    s.style.top = (2 + Math.random() * 95) + "%";
    s.style.left = (4 + Math.random() * 90) + "%";
    s.style.fontSize = (7 + Math.random() * 6) + "px";
    s.style.animationDuration = (2.8 + Math.random() * 3.4) + "s";
    s.style.animationDelay = (Math.random() * 4) + "s";
    wrap.appendChild(s);
  }
}

/* ---------------- ذرّات الضوء العائمة ---------------- */
function startMotes(count) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.getElementById("motes");
  if (!layer || layer.dataset.on) return;
  layer.dataset.on = "1";
  for (let i = 0; i < count; i += 1) {
    const s = document.createElement("span");
    const size = 1.4 + Math.random() * 2.6;
    s.className = "mote";
    s.style.left = Math.random() * 100 + "%";
    s.style.width = size + "px";
    s.style.height = size + "px";
    s.style.opacity = String(0.25 + Math.random() * 0.5);
    s.style.animationDuration = (13 + Math.random() * 14) + "s";
    s.style.animationDelay = (Math.random() * 12) + "s";
    layer.appendChild(s);
  }
}

/* ============================================================
   محرّك الدخولية
   ============================================================ */
(() => {
  const body = document.body;
  const gate = document.getElementById("gate");
  const video = document.getElementById("entVideo");
  const btn = document.getElementById("coverBtn");
  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let opened = false, finished = false, safetyTimer = 0;

  function revealHero() {
    document.querySelectorAll(".hero .reveal").forEach((el) => {
      const delay = Number(el.dataset.delay || 0);
      setTimeout(() => el.classList.add("is-in"), delay);
    });
  }

  if (!gate || !video) {
    body.classList.remove("locked");
    revealHero();
    startMotes(16);
    return;
  }

  /* لا مؤشّر تحميل قبل اللمس: iOS لا يخزّن الفيديو مؤقتاً قبل لمسة المستخدم
     (يتجاهل preload)، فأي شريط تقدّم يقف ويكذب على الضيف — واللمسة نفسها هي
     ما يبدأ التحميل والتشغيل. الانتظار يُعلن فقط إن تأخّر التشغيل بعد اللمس. */
  function showWaiting() {
    if (btn) btn.classList.add("is-loading");
  }

  /* أشرطة المنصّة تُحقن أسفل الشاشة بعد قالبنا (شريط الديمو، زرّ الموسيقى)
     فتغطّي زرّ الدخول. نقيس الموجود فعلاً ونرفع كتلة الغلاف بقدره — فتبقى
     دعوة الزبون النظيفة بلا أي فراغ زائد. */
  function measureBottomBars() {
    let h = 0;
    ["da3wa-democta", "da3wa-trybar", "da3wa-music"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.height > 4 && r.bottom > window.innerHeight - 8) h = Math.max(h, r.height);
    });
    document.documentElement.style.setProperty("--wl-bars", h ? h + 8 + "px" : "0px");
  }

  /* انزياح الدخولية عن الواجهة الأساسية */
  function finish() {
    if (finished) return;
    finished = true;
    window.clearTimeout(safetyTimer);
    gate.classList.add("is-gone");
    body.classList.remove("locked");
    /* فكّ القفل يعيد للصفحة طولها الكامل وقد يستعيد المتصفح إزاحة محفوظة —
       نُرجع الضيف لقمة الهيرو حتماً وإلا فتحت الدعوة في منتصف الأقسام */
    try { window.scrollTo({ top: 0, behavior: "instant" }); } catch { window.scrollTo(0, 0); }
    revealHero();
    startMotes(16);
    window.setTimeout(() => { gate.style.display = "none"; }, 1600);
  }

  function waitForAny(target, events, timeoutMs) {
    return new Promise((resolve) => {
      let timer = 0;
      const cleanup = () => {
        events.forEach((ev) => target.removeEventListener(ev, done));
        if (timer) window.clearTimeout(timer);
      };
      const done = () => { cleanup(); resolve(true); };
      events.forEach((ev) => target.addEventListener(ev, done, { once: true }));
      timer = window.setTimeout(() => { cleanup(); resolve(false); }, timeoutMs);
    });
  }

  async function open() {
    if (opened) return;
    opened = true;
    if (window.__da3waMusicGo) { try { window.__da3waMusicGo(); } catch { /* الموسيقى ليست أساسية */ } }
    if (reduced) { finish(); return; }

    video.muted = true;
    video.playsInline = true;
    /* الانتقال يبدأ قبل نهاية الفيديو بقليل فيتراكب التلاشي مع لحظة التقاء اليدين */
    video.addEventListener("timeupdate", () => {
      const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 10;
      if (video.currentTime >= dur - 0.45) finish();
    });
    video.addEventListener("ended", finish, { once: true });

    /* الغلاف يبقى ظاهراً حتى يبدأ الفيديو فعلاً — فلا تختفي النصوص على شاشة
       ساكنة إن كانت الشبكة بطيئة. وإن تجاوز الانتظار نصف ثانية نُعلن «لحظة…». */
    const waitLabel = window.setTimeout(showWaiting, 500);
    const started = await startPlayback();
    window.clearTimeout(waitLabel);

    if (!started) { finish(); return; }        /* تعذّر التشغيل: ننتقل للواجهة مباشرة */
    gate.classList.add("is-open");             /* الفيديو يعمل: يتلاشى الغلاف الآن */
    const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 10.2;
    const left = Math.max(0, dur - video.currentTime);
    safetyTimer = window.setTimeout(finish, Math.ceil(left * 1000) + 3200);
  }

  async function startPlayback() {
    try {
      const p = video.play();
      if (p && typeof p.then === "function") {
        await Promise.race([p.catch(() => {}), waitForAny(video, ["playing", "timeupdate"], 9000)]);
      } else {
        await waitForAny(video, ["playing", "timeupdate"], 9000);
      }
      return !video.paused || video.currentTime > 0;
    } catch { return false; }
  }

  gate.addEventListener("click", () => { if (!opened) open(); });

  measureBottomBars();
  [400, 1200, 2500].forEach((ms) => window.setTimeout(measureBottomBars, ms));
  window.addEventListener("resize", measureBottomBars);

  if (/[?&]autoopen=1/.test(location.search)) window.setTimeout(open, 600);
})();

/* ---------------- تشغيل ---------------- */
fillContent();
setupReveal();
setupCountdown();
setupThread();
startSparkles(14);
