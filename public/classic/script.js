/* ============================================================
   قالب classic «كلاسيك»
   الدخول + الهيرو: محرّك Codex السينمائي (باب ← تحميل ← وميض ← طيور)
   الأقسام أسفل الهيرو: منطق البطاقة (ملء المحتوى + عدّاد + ظهور)
   ============================================================ */

const WEDDING_CONFIG = (typeof window !== "undefined" && window.__INVITE__ && window.__INVITE__.config) || {
  groom: "آدم",
  bride: "ميرا",

  date: "2026-11-20T19:00:00",
  dateText: "يوم الجمعة، ٢٠ تشرين الثاني ٢٠٢٦",
  timeText: "الساعة السابعة مساءً",

  heroSub: "يتشرّفان بدعوتكم لمشاركتهما فرحة العمر",

  verse: "اللّهُمَّ بارِكْ لهُما وبارِكْ عليهِما واجمَعْ بينهُما في خير",

  invitationText: "بقلوبٍ مفعمةٍ بالفرح والسرور، نتشرّف بدعوتكم لمشاركتنا أجمل لحظات حياتنا في حفل زفافنا. حضوركم شرفٌ لنا وبهجةٌ تكتمل بها فرحتنا.",

  groomParents: "نجل السيّد كريم عبد الله و السيّدة هدى",
  brideParents: "كريمة السيّد سامي حسن و السيّدة رنا",

  venueName: "قاعة بابل الكبرى",
  venueAddr: "بغداد — المنصور",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Babylon+Hotel+Baghdad",

  program: [
    { time: "٧:٠٠ مساءً", title: "استقبال الضيوف" },
    { time: "٧:٣٠ مساءً", title: "عقد القران" },
    { time: "٨:٣٠ مساءً", title: "الكوكتيل" },
    { time: "٩:٣٠ مساءً", title: "العشاء" },
    { time: "١٠:٣٠ مساءً", title: "الرقص والسهرة" },
  ],

  notes: [
    "يُرجى الحضور قبل الموعد بنصف ساعة",
    "نتشرّف بحضوركم بأبهى حلّة",
    "الدعوة تشمل حاملها والعائلة الكريمة",
  ],

  closingNote: "حضوركم يزيّن فرحتنا",
  hashtag: "#آدم_وميرا",
  contactLabel: "للاستفسار والتأكيد",
  contactName: "أبو آدم",
  contactPhone: "+9647700000000",
  closingFamilies: "عائلة عبد الله  &  عائلة حسن",

  images: { venue: "/templates/classic/assets/venue.jpg", background: "" },
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

  document.title = `دعوة زفاف ${c.groom} & ${c.bride}`;
}

function setText(id, value) { const el = document.getElementById(id); if (el && value != null) el.textContent = value; }

/* ---------------- صورة القاعة (إن وُجدت) ---------------- */
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

/* ---------------- ظهور أقسام البطاقة عند التمرير ---------------- */
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

/* ---------------- بتلات ورموز عائمة (تبدأ عند كشف الموقع) ---------------- */
function startPetals(count) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.getElementById("petals");
  if (!layer || layer.dataset.on) return;
  layer.dataset.on = "1";
  const glyphs = ["❀", "✿", "❁", "·"];
  const colors = ["#c9a87c", "#b8924f", "#cdab6a", "#8a7a64"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "petal";
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.color = colors[i % colors.length];
    s.style.fontSize = (9 + Math.random() * 15) + "px";
    s.style.animationDuration = (6 + Math.random() * 6) + "s";
    s.style.animationDelay = (Math.random() * 5) + "s";
    layer.appendChild(s);
  }
}

/* ============================================================
   محرّك Codex السينمائي — منسوخ حرفياً (يعمل على iPhone Karar)
   preloader (باب) ← شريط تحميل بنسبة ← وميض أبيض ← كشف ← فيديو الطيور
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
  const preloaderHint = preloaderPoster ? $(".preloader-cta__hint", preloaderPoster) : null;
  const preloaderProgress = $("#preloaderProgress");
  const preloaderProgressBar = $("#preloaderProgressBar");
  const preloaderPercent = $("#preloaderPercent");
  let introTimer = null;
  let progressTimer = null;
  let introStarting = false;
  let introFinishing = false;
  let heroPreparePromise = null;
  const HAVE_CURRENT_DATA = 2;
  const HAVE_FUTURE_DATA = 3;
  const HAVE_ENOUGH_DATA = 4;

  function waitForAny(target, events, timeoutMs) {
    return new Promise((resolve, reject) => {
      let timer = null;
      const cleanup = () => {
        events.forEach((eventName) => target.removeEventListener(eventName, done));
        if (timer) window.clearTimeout(timer);
      };
      const done = (event) => { cleanup(); resolve(event); };
      events.forEach((eventName) => target.addEventListener(eventName, done, { once: true }));
      if (timeoutMs > 0) {
        timer = window.setTimeout(() => { cleanup(); reject(new Error("media timeout")); }, timeoutMs);
      }
    });
  }

  function hasFirstFrame(video) { return Boolean(video && video.readyState >= HAVE_CURRENT_DATA); }
  function clampPercent(value) { return Math.max(0, Math.min(100, Math.round(value))); }

  function getBufferedPercent(video) {
    if (!video) return 0;
    if (video.readyState >= HAVE_ENOUGH_DATA) return 100;
    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0 || !video.buffered?.length) {
      return hasFirstFrame(video) ? 35 : 0;
    }
    let bufferedEnd = 0;
    for (let index = 0; index < video.buffered.length; index += 1) {
      bufferedEnd = Math.max(bufferedEnd, video.buffered.end(index));
    }
    return clampPercent((bufferedEnd / duration) * 100);
  }

  function updatePreloaderProgress(forcePercent) {
    if (!preloaderVideo || !preloaderPoster) return;
    const percent = clampPercent(
      Number.isFinite(forcePercent) ? forcePercent : getBufferedPercent(preloaderVideo)
    );
    const ready = percent >= 100 || preloaderVideo.readyState >= HAVE_FUTURE_DATA;
    preloaderPoster.classList.toggle("is-ready", ready);
    if (preloaderProgressBar) preloaderProgressBar.style.setProperty("--progress", `${percent}%`);
    if (preloaderProgress) preloaderProgress.setAttribute("aria-valuenow", String(percent));
    if (preloaderPercent) preloaderPercent.textContent = `${percent}%`;
    if (introStarting || introFinishing) return;
    if (preloaderText) preloaderText.textContent = ready ? "اضغط لفتح الباب" : "جارٍ التحميل…";
  }

  function startProgressWatch() {
    updatePreloaderProgress();
    window.clearInterval(progressTimer);
    progressTimer = window.setInterval(() => {
      updatePreloaderProgress();
      if (preloaderVideo?.readyState >= HAVE_ENOUGH_DATA) window.clearInterval(progressTimer);
    }, 250);
  }

  function timeoutValue(timeoutMs, value = false) {
    return new Promise((resolve) => { window.setTimeout(() => resolve(value), timeoutMs); });
  }

  async function waitForMediaReady(video, timeoutMs = 6000) {
    if (!video) return false;
    if (hasFirstFrame(video)) return true;
    video.preload = "auto";
    try { video.load(); } catch { return hasFirstFrame(video); }
    try { await waitForAny(video, ["loadeddata", "canplay", "canplaythrough"], timeoutMs); }
    catch { return hasFirstFrame(video); }
    return hasFirstFrame(video);
  }

  function markHeroReady() { if (hasFirstFrame(heroVideo)) heroVideo.classList.add("is-ready"); }
  function markPreloaderReady() { if (hasFirstFrame(preloaderVideo)) preloaderVideo.classList.add("is-ready"); }

  function prepareHeroVideo() {
    if (!heroVideo) return Promise.resolve(false);
    if (heroPreparePromise) return heroPreparePromise;
    heroVideo.muted = true;
    heroVideo.playsInline = true;
    heroPreparePromise = waitForMediaReady(heroVideo, 7000).then((ready) => {
      if (ready) markHeroReady();
      else heroPreparePromise = null;
      return ready;
    });
    return heroPreparePromise;
  }

  async function startVideoPlayback(video, timeoutMs = 4500) {
    if (!video) return false;
    if (!video.paused && !video.ended) return true;
    try {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        await Promise.race([playPromise, waitForAny(video, ["playing", "timeupdate"], timeoutMs)]);
      } else {
        await waitForAny(video, ["playing", "timeupdate"], timeoutMs);
      }
    } catch { return false; }
    return !video.paused || video.currentTime > 0;
  }

  async function playHeroVideo(timeoutMs = 4500) {
    if (!heroVideo) return false;
    await Promise.race([prepareHeroVideo(), timeoutValue(timeoutMs)]);
    if (hasFirstFrame(heroVideo)) markHeroReady();
    if (!heroVideo.paused && !heroVideo.ended) return true;
    const started = await startVideoPlayback(heroVideo, timeoutMs);
    markHeroReady();
    return started || hasFirstFrame(heroVideo);
  }

  async function startPreloaderVideo() {
    preloaderVideo.muted = true;
    preloaderVideo.playsInline = true;
    preloaderVideo.preload = "auto";
    await waitForMediaReady(preloaderVideo, 8000);
    markPreloaderReady();
    updatePreloaderProgress(100);
    try { preloaderVideo.currentTime = 0; } catch { /* بعض المتصفحات ترفض seek قبل اكتمال البيانات */ }
    const started = await startVideoPlayback(preloaderVideo, 7000);
    markPreloaderReady();
    updatePreloaderProgress(100);
    return started;
  }

  function armIntroTimer() {
    window.clearTimeout(introTimer);
    const duration = Number.isFinite(preloaderVideo.duration) && preloaderVideo.duration > 0 ? preloaderVideo.duration : 10;
    const currentTime = Number.isFinite(preloaderVideo.currentTime) ? preloaderVideo.currentTime : 0;
    const remainingMs = Math.max(2200, Math.ceil((duration - currentTime) * 1000) + 900);
    introTimer = window.setTimeout(finishIntro, remainingMs);
  }

  function revealHeroText() {
    $$(".hero .reveal, .hero .reveal-mask").forEach((element) => {
      const delay = Number(element.dataset.delay || 0);
      window.setTimeout(() => element.classList.add("is-in"), delay);
    });
  }

  function revealSite() {
    body.classList.remove("locked");
    site.classList.add("visible");
    playHeroVideo(3000).catch(() => {});
    revealHeroText();
    if (typeof startPetals === "function") startPetals(20);   // بتلات تصميمي فوق المشهد
  }

  async function finishIntro() {
    if (!preloader || preloader.classList.contains("fade-out") || introFinishing) return;
    introFinishing = true;
    window.clearTimeout(introTimer);
    playHeroVideo(2500).catch(() => {});
    preloader.classList.add("whiteout");
    window.setTimeout(() => {
      revealSite();
      preloader.classList.add("fade-out");
      window.setTimeout(() => preloader.classList.add("hidden"), 950);
    }, 520);
  }

  if (preloaderPoster && preloaderVideo) {
    preloaderVideo.load();
    startProgressWatch();
    // أمان ضدّ التعلّق: فعّل الزر بعد ٦ ثوانٍ حتى لو لم يُطلق الفيديو حدث الجهوزية
    window.setTimeout(() => { if (!introStarting && !introFinishing) updatePreloaderProgress(100); }, 6000);

    preloaderPoster.addEventListener("click", async () => {
      if (introStarting || introFinishing) return;
      if (!preloaderPoster.classList.contains("is-ready")) return;   // انتظر جهوزية الفيديو قبل الفتح
      introStarting = true;
      preloaderPoster.classList.add("loading");
      preloaderPoster.setAttribute("aria-busy", "true");
      preloaderPoster.disabled = true;
      if (preloaderText) preloaderText.textContent = "جارٍ الفتح…";

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
      window.setTimeout(() => { playHeroVideo(2500).catch(() => {}); }, 250);
      armIntroTimer();
    });

    ["loadedmetadata", "loadeddata", "canplay", "canplaythrough", "progress", "suspend", "stalled", "timeupdate"].forEach((eventName) => {
      preloaderVideo.addEventListener(eventName, updatePreloaderProgress);
    });
    preloaderVideo.addEventListener("ended", finishIntro);

    // خطّاف اختبار: ?autoopen=1 ينقر الزر تلقائياً بعد جهوزية التحميل
    if (/[?&]autoopen=1/.test(location.search)) {
      const ao = window.setInterval(() => {
        if (preloaderPoster.classList.contains("is-ready")) { window.clearInterval(ao); preloaderPoster.click(); }
      }, 300);
    }
  } else {
    window.setTimeout(finishIntro, 600);
  }

  if (heroVideo) {
    ["loadeddata", "canplay", "playing"].forEach((eventName) => heroVideo.addEventListener(eventName, markHeroReady));
  }
  if (preloaderVideo) {
    ["loadeddata", "canplay", "playing"].forEach((eventName) => preloaderVideo.addEventListener(eventName, markPreloaderReady));
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && site && site.classList.contains("visible")) playHeroVideo(2500).catch(() => {});
  });
})();

/* قياس ديناميكي لاسمَي الهيرو: الاسم الطويل يصغر خطه ليملأ سطراً واحداً بلا التفاف ولا قصّ */
function fitHeroNames() {
  ["heroGroom", "heroBride"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.style.whiteSpace = "nowrap";
    el.style.fontSize = "";                          // نبدأ من حجم الـCSS الأصلي كل مرة
    var host = el.closest(".hero__content") || el.parentElement;
    var max = Math.max(200, host.clientWidth - 28);
    var size = parseFloat(getComputedStyle(el).fontSize);
    var guard = 40;
    while (el.scrollWidth > max && size > 20 && guard--) {
      size -= 2;
      el.style.fontSize = size + "px";
    }
  });
}
var fitNamesTimer = null;
window.addEventListener("resize", function () {
  clearTimeout(fitNamesTimer);
  fitNamesTimer = setTimeout(fitHeroNames, 150);
});

/* ---------------- تشغيل ملء المحتوى (DOM جاهز: defer / نهاية body) ---------------- */
fillContent();
fitHeroNames();
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitHeroNames);
loadImages();
setupReveal();
setupCountdown();

/* مؤشّر تشخيص لحالة فيديو الطيور (؟debug=1) */
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


document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.rsvp-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if(btn) btn.innerText = 'جاري الإرسال...';
      
      const formData = new FormData(form);
      const data = {
        invitationId: window.__INVITE__?.config?.id,
        guestName: formData.get('guestName') || '',
        phone: formData.get('phone') || '',
        status: formData.get('status') || 'confirmed',
        companions: formData.get('companions') || '0',
        message: formData.get('message') || ''
      };

      try {
        const res = await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          alert('تم إرسال الرد بنجاح. شكراً لك!');
          form.reset();
        } else {
          alert('حدث خطأ. يرجى المحاولة لاحقاً.');
        }
      } catch(err) {
        alert('حدث خطأ في الاتصال.');
      }
      if(btn) btn.innerText = 'تأكيد الحضور';
    });
  }
});
