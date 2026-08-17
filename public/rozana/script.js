window.renderFarhaTemplate = function() {
/* ============================================================
   قالب rozana «روزنة» — أعراس/خطوبة
   الدخولية: ختم شمعي وزهور مجفّفة (فيديو) ← عند اللمس يسقط الختم
   وتتشقّق الورقة ثم تتمزّق عن حديقة العرس ← تنزاح الطبقة عن الواجهة
   الأساسية (خلفية الروزنة مفتوحة) فترتفع الأسماء على الورق.
   محرّك الفيديو بنمط classic المضمون على آيفون:
   مراقبة تخزين مؤقت + تشغيل متدرّج + صمّام أمان لا يحبس الضيف أبداً.
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
  venueName: "جناح الحديقة",
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

/* تصغير اسمٍ طويل حتى يتّسع بسطره */
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
  if (!items.length) { const sec = ul.closest(".sheet"); if (sec) sec.style.display = "none"; }
}

function buildNotes(items) {
  const ul = document.getElementById("notesList");
  if (!ul || !Array.isArray(items)) return;
  ul.innerHTML = "";
  items.forEach((txt) => {
    const li = document.createElement("li");
    li.className = "notes__item";
    const mark = document.createElement("span");
    mark.className = "notes__mark"; mark.setAttribute("aria-hidden", "true"); mark.innerHTML = "&#10047;";
    const body = document.createElement("span");
    body.textContent = txt;
    li.appendChild(mark); li.appendChild(body);
    ul.appendChild(li);
  });
  if (!items.length) { const sec = ul.closest(".sheet"); if (sec) sec.style.display = "none"; }
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

/* ---------------- ظهور الأوراق عند التمرير ---------------- */
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

/* ---------------- العدّاد التنازلي ---------------- */
function pad(n) { return toArabicDigits(String(n).padStart(2, "0")); }
function toArabicDigits(s) {
  const ar = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(s).replace(/[0-9]/g, (d) => ar[+d]);
}
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

/* ============================================================
   موعد الفرح: غبار ورقي يغطّي التاريخ، يُمسح بالإصبع فيظهر.
   ضمانة: من لا يمسح (أو لا يفهم أن يمسح) يُكشف له تلقائياً بعد ثوانٍ —
   لا يفوت أحداً موعد الحفل بسبب تفاعل لم ينتبه له.
   ============================================================ */
function setupWipe() {
  const box = document.getElementById("wipe");
  const cv = document.getElementById("wipeCanvas");
  if (!box || !cv || !cv.getContext) return;

  const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) { box.classList.add("is-clear"); return; }   /* بلا تفاعل: التاريخ ظاهر مباشرة */

  const ctx = cv.getContext("2d");
  let w = 0, h = 0, painted = false, cleared = false, wiping = false;
  const R = 26;                       /* نصف قطر أثر الإصبع */
  const GRID = 12;                    /* شبكة قياس نسبة الممسوح */
  let cells = null;

  function paintDust() {
    const rect = box.getBoundingClientRect();
    if (rect.width < 40 || rect.height < 40) return false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    w = rect.width; h = rect.height;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, w, h);

    /* ورق شفّاف (vellum) فوق الورقة: كريمي دافئ لا رمادي — الرمادي يُقرأ
       كوسخٍ ويخرج عن لوحة القالب. بقع فاتحة غالبة + لمسات بيج خفيفة جداً
       + ذرّات ذهب، ثم ڤنييت وحدّ رفيع كي يُقرأ كطبقة مستقلة فوق الورق. */
    ctx.fillStyle = "#ece5d4";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 74; i += 1) {
      const x = Math.random() * w, y = Math.random() * h, r = 14 + Math.random() * 52;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const light = Math.random() > 0.3;
      /* الطرف الشفّاف يحمل نفس اللون لا الأسود: التدرّج إلى rgba(0,0,0,0)
         يُنتقل عبر الرمادي فتظهر هالات رمادية تُفسد اللوحة الكريمية */
      g.addColorStop(0, light ? "rgba(255,253,247,0.55)" : "rgba(196,183,159,0.16)");
      g.addColorStop(1, light ? "rgba(255,253,247,0)" : "rgba(196,183,159,0)");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    }
    for (let i = 0; i < 700; i += 1) {
      ctx.fillStyle = Math.random() > 0.42 ? "rgba(255,255,252,0.3)" : "rgba(150,138,116,0.1)";
      ctx.fillRect(Math.random() * w, Math.random() * h, 1.1, 1.1);
    }
    for (let i = 0; i < 30; i += 1) {   /* ذرّات ذهب متفرّقة */
      ctx.fillStyle = "rgba(183,160,107,0.42)";
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, 0.7 + Math.random() * 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
    /* ڤنييت دافئ: الحواف أغمق قليلاً فتبدو الطبقة ملقاة فوق الورق */
    const vg = ctx.createLinearGradient(0, 0, 0, h);
    vg.addColorStop(0, "rgba(168,154,128,0.18)");
    vg.addColorStop(0.5, "rgba(168,154,128,0)");
    vg.addColorStop(1, "rgba(168,154,128,0.16)");
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "rgba(150,73,47,0.2)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    cells = new Uint8Array(GRID * GRID);
    painted = true;
    return true;
  }

  function erase(x, y) {
    ctx.globalCompositeOperation = "destination-out";
    const g = ctx.createRadialGradient(x, y, 0, x, y, R);
    g.addColorStop(0, "rgba(0,0,0,1)");
    g.addColorStop(0.65, "rgba(0,0,0,0.92)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.fill();
    if (!cells) return;
    /* نعلّم كل الخلايا التي غطّاها نصف قطر الإصبع لا خليّة مركزه فقط —
       وإلا صارت مسحة كاملة عبر الصندوق تُحسب ٨٪ (صفّ واحد) ولا تكفي أبداً */
    const cw = w / GRID, chh = h / GRID;
    const c0 = Math.max(0, Math.floor((x - R) / cw)), c1 = Math.min(GRID - 1, Math.floor((x + R) / cw));
    const r0 = Math.max(0, Math.floor((y - R) / chh)), r1 = Math.min(GRID - 1, Math.floor((y + R) / chh));
    for (let cy = r0; cy <= r1; cy += 1) {
      for (let cx = c0; cx <= c1; cx += 1) cells[cy * GRID + cx] = 1;
    }
  }

  function clearedRatio() {
    if (!cells) return 0;
    let n = 0;
    for (let i = 0; i < cells.length; i += 1) n += cells[i];
    return n / cells.length;
  }

  function finishWipe() {
    if (cleared) return;
    cleared = true;
    box.classList.add("is-clear");
  }

  /* مسح تلقائي: مسحة قوسية تعبر التاريخ ثم يزول الغطاء.
     ضمانة: requestAnimationFrame يتجمّد حين تكون الصفحة في الخلف (الضيف بدّل
     التطبيق)، فمؤقّت مستقل يُكمل الكشف على أي حال — الموعد لا يبقى مستوراً. */
  function autoWipe() {
    if (cleared || wiping || !painted) return;
    let t = 0;
    const step = () => {
      if (cleared) return;
      t += 0.028;
      const x = w * t;
      const y = h * (0.5 + Math.sin(t * Math.PI * 1.6) * 0.16);
      erase(x, y); erase(x, y - R * 0.7); erase(x, y + R * 0.7);
      if (t < 1) requestAnimationFrame(step);
      else finishWipe();
    };
    requestAnimationFrame(step);
    window.setTimeout(finishWipe, 1500);
  }

  function pointFrom(ev) {
    const r = cv.getBoundingClientRect();
    const p = ev.touches && ev.touches.length ? ev.touches[0] : ev;
    return [p.clientX - r.left, p.clientY - r.top];
  }

  function onMove(ev) {
    if (!painted || cleared) return;
    const [x, y] = pointFrom(ev);
    if (x < -R || y < -R || x > w + R || y > h + R) return;
    if (!wiping) { wiping = true; box.classList.add("is-wiping"); }
    if (ev.cancelable && ev.type === "touchmove") ev.preventDefault();  /* لا يسحب الصفحة أثناء المسح */
    erase(x, y);
    /* مسحة واحدة كاملة عبر الصندوق تغطّي نحو ٤٥٪ من الشبكة، فعتبة ٠٫٣٢ تُكشف
       بمسحة واضحة واحدة ثم يزول الباقي وحده (سلوك بطاقة الحكّ)، ولا تُكشف
       بلمسة عابرة. عتبة ٠٫٥ السابقة كانت تُلزم الضيف بفرك الصندوق كله. */
    if (clearedRatio() >= 0.32) finishWipe();
  }

  cv.addEventListener("pointerdown", onMove);
  cv.addEventListener("pointermove", (e) => { if (e.buttons || e.pointerType === "touch") onMove(e); });
  cv.addEventListener("touchstart", onMove, { passive: true });
  cv.addEventListener("touchmove", onMove, { passive: false });
  cv.addEventListener("click", onMove);

  /* الرسم: نحاول فوراً ونعيد المحاولة حتى يصير للصندوق مقاس (الخطوط تغيّر
     ارتفاعه بعد تحميلها). بلا الاعتماد على IntersectionObserver — بعض البيئات
     لا تُطلقه فيبقى التاريخ مغطّى للأبد. */
  function tryPaint(tries) {
    if (painted || cleared) return;
    if (paintDust()) return;
    if (tries > 0) window.setTimeout(() => tryPaint(tries - 1), 300);
    else finishWipe();                 /* تعذّر القياس: نكشف التاريخ ولا نحجبه */
  }

  /* عدّاد الكشف التلقائي يبدأ عند وصول الضيف للقسم (لا عند تحميل الصفحة) */
  let armed = false;
  function armAuto() {
    if (armed || cleared) return;
    const r = box.getBoundingClientRect();
    if (!(r.top < window.innerHeight * 0.85 && r.bottom > window.innerHeight * 0.15)) return;
    armed = true;
    tryPaint(2);                        /* احتياط: إن لم يكن مرسوماً بعد */
    window.setTimeout(() => { if (!wiping) autoWipe(); }, 7000);
  }

  tryPaint(14);
  window.addEventListener("scroll", armAuto, { passive: true });
  window.setTimeout(armAuto, 700);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => { if (!painted) tryPaint(4); }).catch(() => {});
  }

  window.addEventListener("resize", () => {
    if (cleared || wiping) return;
    painted = false;
    paintDust();
  });
}

/* ---------------- بتلات ورقية عائمة ---------------- */
function startPetals(count) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.getElementById("petals");
  if (!layer || layer.dataset.on) return;
  layer.dataset.on = "1";
  const glyphs = ["❀", "✿", "❁", "·"];
  const colors = ["#d9b2a5", "#c9967f", "#e6cdb8", "#b7a06b"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "petal";
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.color = colors[i % colors.length];
    s.style.fontSize = (9 + Math.random() * 15) + "px";
    s.style.animationDuration = (7 + Math.random() * 7) + "s";
    s.style.animationDelay = (Math.random() * 6) + "s";
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
  const hint = document.getElementById("coverHint");
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
    return;
  }

  /* لا مؤشّر تحميل قبل اللمس: iOS لا يخزّن الفيديو مؤقتاً إطلاقاً قبل لمسة
     المستخدم (يتجاهل preload)، فأي شريط تقدّم يبقى واقفاً ويكذب على الضيف —
     والزرّ جاهز فعلاً لأن اللمسة نفسها هي ما يبدأ التحميل والتشغيل.
     الانتظار يُعلن فقط إن تأخّر التشغيل فعلياً بعد اللمس. */
  function showWaiting() {
    if (btn) btn.classList.add("is-loading");
  }

  /* أشرطة المنصّة تُحقن أسفل الشاشة بعد قالبنا (شريط الديمو ٨٧px، زرّ الموسيقى)
     فتغطّي زرّ فكّ الختم. نقيس الموجود فعلاً ونرفع كتلة الغلاف بقدره — فتبقى
     دعوة الزبون النظيفة بلا أي فراغ زائد. النغمة تُحقن بسكربتها فنُعيد القياس. */
  function measureBottomBars() {
    let h = 0;
    ["da3wa-democta", "da3wa-trybar", "da3wa-music"].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.height > 4 && r.bottom > window.innerHeight - 8) h = Math.max(h, r.height);
    });
    document.documentElement.style.setProperty("--rz-bars", h ? h + 8 + "px" : "0px");
  }

  /* انزياح الدخولية عن الواجهة الأساسية */
  function finish() {
    if (finished) return;
    finished = true;
    window.clearTimeout(safetyTimer);
    gate.classList.add("is-gone");
    body.classList.remove("locked");
    /* فكّ القفل يعيد للصفحة طولها الكامل وقد يستعيد المتصفح إزاحة محفوظة —
       نُرجع الضيف لقمة الهيرو حتماً وإلا فتحت الدعوة في منتصف الأوراق */
    try { window.scrollTo({ top: 0, behavior: "instant" }); } catch { window.scrollTo(0, 0); }
    revealHero();
    startPetals(16);
    /* إخراج الطبقة من الشجرة بعد اكتمال التلاشي */
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
    /* الانتقال يبدأ قبل نهاية الفيديو بقليل فيتراكب التلاشي مع اكتمال التمزّق */
    video.addEventListener("timeupdate", () => {
      const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 8;
      if (video.currentTime >= dur - 0.45) finish();
    });
    video.addEventListener("ended", finish, { once: true });

    /* الغلاف يبقى ظاهراً حتى يبدأ الفيديو فعلاً — فلا تختفي النصوص على
       شاشة ساكنة إن كانت الشبكة بطيئة. وإن تجاوز الانتظار نصف ثانية
       نُعلن «لحظة…» بدل الصمت. */
    const waitLabel = window.setTimeout(showWaiting, 500);
    const started = await startPlayback();
    window.clearTimeout(waitLabel);

    if (!started) { finish(); return; }        /* تعذّر التشغيل: ننتقل للواجهة مباشرة */
    gate.classList.add("is-open");             /* الفيديو يعمل: يتلاشى الغلاف الآن */
    const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : 8.2;
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
setupWipe();

};

document.addEventListener('DOMContentLoaded', window.renderFarhaTemplate);
window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === 'FARHA_RENDER_CONFIG') {
        setTimeout(window.renderFarhaTemplate, 60);
    }
});
