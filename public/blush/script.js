/* ============================================================
   قالب blush «وردة» — أعراس/خطوبة
   مشهد مظروف وردي بفيونكة (صورة) ← وميض وردي ← مشهد حديقة + لوحة الأسماء
   بلا فيديو: صور فقط = خفيف وآمن على آيفون
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
  venueName: "قاعة الوردة الكبرى",
  venueAddr: "بغداد — المنصور",
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Baghdad",
  program: [
    { time: "٧:٠٠ مساءً", title: "استقبال الضيوف" },
    { time: "٨:٠٠ مساءً", title: "بدء الحفل" },
    { time: "٩:٣٠ مساءً", title: "العشاء" },
    { time: "١٠:٣٠ مساءً", title: "الرقص والسهرة" },
  ],
  notes: [
    "يُرجى الحضور قبل الموعد بنصف ساعة",
    "نتشرّف بحضوركم بأبهى حلّة",
  ],
  closingNote: "حضوركم يزيّن فرحتنا",
  hashtag: "#آدم_وميرا",
  contactLabel: "للاستفسار والتأكيد",
  contactName: "أبو آدم",
  contactPhone: "+9647700000000",
  closingFamilies: "عائلة عبد الله  &  عائلة حسن",
  images: {},
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
  if (mapBtn && c.mapUrl) mapBtn.href = c.mapUrl;
  else if (mapBtn) mapBtn.style.display = "none";

  const names = document.getElementById("coverNames");
  if (names && c.groom && c.bride) names.textContent = `${c.groom} & ${c.bride}`;

  buildTimeline(c.program);
  buildNotes(c.notes);
  buildContact(c);

  document.title = `دعوة زفاف ${c.groom} & ${c.bride}`;
}

function setText(id, value) { const el = document.getElementById(id); if (el && value != null) el.textContent = value; }

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
    link.target = "_blank"; link.rel = "noopener";
    link.innerHTML = `<span aria-hidden="true">&#9742;</span> `;
    link.appendChild(document.createTextNode(c.contactName ? c.contactName : c.contactPhone));
  } else {
    const box = document.getElementById("contactBox");
    if (box) box.style.display = "none";
  }
}

/* ---------------- ظهور الأقسام عند التمرير ---------------- */
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

/* ---------------- بتلات وردية عائمة ---------------- */
function startPetals(count) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.getElementById("petals");
  if (!layer || layer.dataset.on) return;
  layer.dataset.on = "1";
  const glyphs = ["❀", "✿", "❁", "🌸", "·"];
  const colors = ["#e9aeb9", "#d98a9a", "#f3c9d1", "#c56b7e"];
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "petal";
    s.textContent = glyphs[i % glyphs.length];
    s.style.left = Math.random() * 100 + "%";
    s.style.color = colors[i % colors.length];
    s.style.fontSize = (10 + Math.random() * 16) + "px";
    s.style.animationDuration = (6 + Math.random() * 6) + "s";
    s.style.animationDelay = (Math.random() * 5) + "s";
    layer.appendChild(s);
  }
}

/* ============================================================
   مشهد الدخول: الحديقة خلفية حيّة، والظرف يغطّيها ثم ينزلق للأسفل عند النقر
   فتُكشف الصورة كاملة وترتفع الأسماء بشكل شاعري
   صور فقط (بلا فيديو) — خفيف وآمن على آيفون
   ============================================================ */
(() => {
  const body = document.body;
  const env = document.getElementById("envelope");
  const site = document.getElementById("site");
  let opening = false;

  // المشهد (الحديقة) ظاهر خلف الظرف من البداية كي يُطلّ من فتحة الظرف
  if (site) site.classList.add("visible");

  function revealHeroText() {
    document.querySelectorAll(".hero .reveal, .hero .reveal-mask").forEach((el) => {
      const delay = Number(el.dataset.delay || 0);
      setTimeout(() => el.classList.add("is-in"), delay);
    });
  }

  function open() {
    if (opening || !env) return;
    opening = true;
    if (window.__da3waMusicGo) window.__da3waMusicGo();  // الموسيقى تبدأ مع فتح الظرف (ضمن لمسة المستخدم)
    env.classList.add("lifting");                 // توهّج الختم قبل النزول
    setTimeout(() => env.classList.add("sliding"), 220);   // الظرف ينزلق للأسفل بهدوء (٢ ثانية)
    setTimeout(() => {
      body.classList.remove("locked");
      revealHeroText();                            // الأسماء ترتفع شاعرياً أثناء نزول الظرف
      startPetals(24);
    }, 1100);
    setTimeout(() => { env.style.display = "none"; }, 2500);   // بعد اكتمال النزول
  }

  if (env) {
    env.addEventListener("click", open);
    if (/[?&]autoopen=1/.test(location.search)) setTimeout(open, 500);
  } else {
    body.classList.remove("locked");
    revealHeroText();
  }
})();

/* ---------------- تشغيل ---------------- */
fillContent();
setupReveal();
setupCountdown();


window.renderFarhaTemplate = function() {
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
};
document.addEventListener('DOMContentLoaded', window.renderFarhaTemplate);
window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === 'FARHA_RENDER_CONFIG') {
        setTimeout(window.renderFarhaTemplate, 60);
    }
});
