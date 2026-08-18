const DEFAULT_GUEST_NAME = 'ضيفنا العزيز';

function getInviteConfig() {
  return (window.__INVITE__ && window.__INVITE__.config) || {};
}

function setElementText(id, value, options = {}) {
  const element = document.getElementById(id);
  if (!element) return;

  const safeValue = value == null ? '' : String(value).trim();
  if (!safeValue && !options.keepVisibleWhenEmpty) {
    element.textContent = '';
    element.style.display = 'none';
    return;
  }

  element.textContent = safeValue;
  element.style.display = '';
}

function parseWeddingDate(config) {
  const rawValue = config.weddingDate || config.date || '';
  if (!rawValue) return null;

  const parsed = new Date(rawValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toArabicDigits(value) {
  const digits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(value).replace(/[0-9]/g, (digit) => digits[Number(digit)]);
}

function formatDatePart(date, options) {
  return date.toLocaleDateString('ar-EG', options);
}

function formatTimePart(date) {
  return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function buildGoogleCalendarUrl(config, date) {
  if (!date) return '#';

  const endDate = new Date(date.getTime() + (4 * 60 * 60 * 1000));
  const title = `${config.groomName || 'العريس'} و ${config.brideName || 'العروس'}`;
  const details = config.invitationText || 'دعوة زفاف';
  const location = config.venueName || config.venueAddress || '';
  const format = (value) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details,
    location,
    dates: `${format(date)}/${format(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function buildIcsDataUrl(config, date) {
  if (!date) return '#';

  const endDate = new Date(date.getTime() + (4 * 60 * 60 * 1000));
  const title = `${config.groomName || 'العريس'} و ${config.brideName || 'العروس'}`;
  const details = config.invitationText || 'دعوة زفاف';
  const location = config.venueName || config.venueAddress || '';
  const format = (value) => value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${format(date)}`,
    `DTEND:${format(endDate)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${details}`,
    `LOCATION:${location}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

function setMediaSource(element, value, options = {}) {
  if (!element) return;

  const safeValue = value == null ? '' : String(value).trim();
  const defaultValue = options.defaultValue || element.getAttribute('data-default-src') || '';
  const nextValue = safeValue || defaultValue;

  if (!nextValue) {
    element.removeAttribute('src');
    if (options.hideWhenEmpty) {
      element.classList.add('hidden');
    }
    return;
  }

  element.src = nextValue;
  element.classList.remove('hidden');
}

function setBackgroundImage(element, value) {
  if (!element) return;

  const safeValue = value == null ? '' : String(value).trim();
  if (!safeValue) {
    element.style.backgroundImage = '';
    element.style.display = 'none';
    return;
  }

  element.style.backgroundImage = `url("${safeValue}")`;
  element.style.display = '';
}

function setupScrollReveal() {
  const elements = Array.from(document.querySelectorAll('.reveal-on-scroll'));
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  elements.forEach((element) => observer.observe(element));
}

function renderGallery(images) {
  const section = document.getElementById('gallery-section');
  const grid = document.getElementById('galleryGrid');
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];

  if (!section || !grid) return;
  if (!safeImages.length) {
    section.style.display = 'none';
    grid.innerHTML = '';
    return;
  }

  section.style.display = 'block';
  grid.innerHTML = safeImages.map((source, index) => (
    `<img src="${source}" alt="ذكرى ${index + 1}" loading="lazy" class="reveal-on-scroll">`
  )).join('');
}

function renderTimeline(program) {
  const section = document.getElementById('program-section');
  const wrap = document.getElementById('timeline');
  const safeProgram = Array.isArray(program) ? program.filter(Boolean) : [];

  if (!section || !wrap) return;
  if (!safeProgram.length) {
    section.style.display = 'none';
    wrap.innerHTML = '';
    return;
  }

  section.style.display = 'block';
  wrap.innerHTML = safeProgram.map((item) => {
    const time = item.time || '';
    const title = item.title || item.activity || '';

    return `
      <div class="timeline-item flex flex-col items-center w-full">
        <div class="text-center py-2 reveal-on-scroll">
          <h3 class="text-xl md:text-2xl text-foreground mb-1 font-medium">${time}</h3>
          <p class="text-foreground/80 text-lg">${title}</p>
        </div>
        <div class="timeline-line w-px bg-foreground/30 h-10 md:h-14 my-2"></div>
      </div>
    `;
  }).join('');
}

function renderNotes(notes) {
  const section = document.getElementById('notes-section');
  const wrap = document.getElementById('notesList');
  const safeNotes = Array.isArray(notes) ? notes.filter(Boolean) : [];

  if (!section || !wrap) return;
  if (!safeNotes.length) {
    section.style.display = 'none';
    wrap.innerHTML = '';
    return;
  }

  section.style.display = 'block';
  wrap.innerHTML = safeNotes.map((note) => `<p>• ${note}</p>`).join('');
}

function renderCountdown(weddingDate) {
  const section = document.getElementById('countdown-section');
  const countdown = document.getElementById('countdown');
  const arrived = document.getElementById('cdArrived');

  if (!section || !countdown || !arrived) return;
  if (!weddingDate) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  if (window.__farhaMajesticCountdownTimer) {
    window.clearInterval(window.__farhaMajesticCountdownTimer);
  }

  const dayElement = document.getElementById('cdDays');
  const hourElement = document.getElementById('cdHours');
  const minuteElement = document.getElementById('cdMins');
  const secondElement = document.getElementById('cdSecs');

  const update = () => {
    const difference = weddingDate.getTime() - Date.now();

    if (difference <= 0) {
      countdown.classList.add('hidden');
      arrived.classList.remove('hidden');
      window.clearInterval(window.__farhaMajesticCountdownTimer);
      return;
    }

    countdown.classList.remove('hidden');
    arrived.classList.add('hidden');

    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference % 86400000) / 3600000);
    const minutes = Math.floor((difference % 3600000) / 60000);
    const seconds = Math.floor((difference % 60000) / 1000);

    if (dayElement) dayElement.textContent = toArabicDigits(String(days).padStart(2, '0'));
    if (hourElement) hourElement.textContent = toArabicDigits(String(hours).padStart(2, '0'));
    if (minuteElement) minuteElement.textContent = toArabicDigits(String(minutes).padStart(2, '0'));
    if (secondElement) secondElement.textContent = toArabicDigits(String(seconds).padStart(2, '0'));
  };

  update();
  window.__farhaMajesticCountdownTimer = window.setInterval(update, 1000);
}

function renderCalendar(config, weddingDate) {
  const section = document.getElementById('calendar-section');
  const monthYear = document.getElementById('calendarMonthYear');
  const weekday = document.getElementById('calendarWeekday');
  const day = document.getElementById('calendarDay');
  const time = document.getElementById('calendarTime');
  const google = document.getElementById('calendarGoogle');
  const ics = document.getElementById('calendarIcs');

  if (!section || !monthYear || !weekday || !day || !time || !google || !ics) return;
  if (!weddingDate) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  monthYear.textContent = formatDatePart(weddingDate, { month: 'long', year: 'numeric' });
  weekday.textContent = formatDatePart(weddingDate, { weekday: 'long' });
  day.textContent = formatDatePart(weddingDate, { day: 'numeric' });
  time.textContent = config.timeText || formatTimePart(weddingDate);
  google.href = buildGoogleCalendarUrl(config, weddingDate);
  ics.href = buildIcsDataUrl(config, weddingDate);
}

function renderPrimaryContent() {
  const config = getInviteConfig();
  const weddingDate = parseWeddingDate(config);
  const openingNames = config.openingNames || [config.groomName, config.brideName].filter(Boolean).join(' و ');
  const openingPoem = config.openingPoem || config.welcomeMessage || '';

  setElementText('env-guest-name', config.guestName || DEFAULT_GUEST_NAME, { keepVisibleWhenEmpty: true });
  setElementText('coverKicker', config.openingKicker || 'دعوة زفاف', { keepVisibleWhenEmpty: true });
  setElementText('coverNames', openingNames, { keepVisibleWhenEmpty: true });
  setElementText('coverHint', config.openingHint || 'اضغط لفتح الدعوة', { keepVisibleWhenEmpty: true });
  setElementText('heroInvite', config.openingEyebrow || config.welcomeMessage);
  setElementText('groomName', config.groomName);
  setElementText('brideName', config.brideName);
  setElementText('verseText', config.verseText);
  setElementText('invitationText', config.invitationText);
  setElementText('openingPoem', openingPoem);
  setElementText('groomParentsLabel', config.groomParentsLabel || 'عائلة العريس', { keepVisibleWhenEmpty: true });
  setElementText('groomParents', config.groomParents);
  setElementText('brideParentsLabel', config.brideParentsLabel || 'عائلة العروس', { keepVisibleWhenEmpty: true });
  setElementText('brideParents', config.brideParents);
  setElementText('venueName', config.venueName);
  setElementText('venueAddr', config.venueAddress);
  setElementText('contactLabel', config.contactLabel || 'للاستفسار والتأكيد', { keepVisibleWhenEmpty: true });
  setElementText('contactName', config.contactName);
  setElementText('contactPhone', config.contactPhone);
  setElementText('closingNote', config.closingNote);
  setElementText('closingGroom', config.groomName);
  setElementText('closingBride', config.brideName);
  setElementText('closingHashtag', config.closingHashtag);
  setElementText('closingFamilies', config.closingFamilies);

  if (weddingDate) {
    const dateText = config.dateText || formatDatePart(weddingDate, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeText = config.timeText || formatTimePart(weddingDate);

    setElementText('heroDate', dateText, { keepVisibleWhenEmpty: true });
    setElementText('weddingDate', dateText, { keepVisibleWhenEmpty: true });
    setElementText('weddingTime', timeText, { keepVisibleWhenEmpty: true });
  } else {
    setElementText('heroDate', config.dateText || '');
    setElementText('weddingDate', config.dateText || '');
    setElementText('weddingTime', config.timeText || '');
  }

  const mapButton = document.getElementById('mapBtn');
  if (mapButton) {
    if (config.locationLink) {
      mapButton.href = config.locationLink;
      mapButton.style.display = 'inline-flex';
    } else {
      mapButton.removeAttribute('href');
      mapButton.style.display = 'none';
    }
  }

  const backgroundMusic = document.getElementById('bgMusic');
  if (backgroundMusic) {
    backgroundMusic.src = config.musicUrl || './music.mp3';
  }

  setMediaSource(
    document.getElementById('heroPhotoImg'),
    config['images.hero'] || '',
    { defaultValue: './couple-dancing.png' },
  );
  setBackgroundImage(
    document.getElementById('venuePhoto'),
    config['images.venue'] || config.venueImage || '',
  );

  const contactBox = document.getElementById('contactBox');
  if (contactBox) {
    const hasContact = Boolean(String(config.contactName || '').trim() || String(config.contactPhone || '').trim());
    contactBox.style.display = hasContact ? '' : 'none';
  }

  renderCountdown(weddingDate);
  renderGallery(config.galleryImages);
  renderTimeline(config.program);
  renderNotes(config.notes);
  renderCalendar(config, weddingDate);
  setupScrollReveal();
}

function initEnvelopeAndMusic() {
  if (window.__farhaMajesticUiInitialized) return;
  window.__farhaMajesticUiInitialized = true;

  const introLayer = document.getElementById('intro-layer');
  const introVideo = document.getElementById('intro-video');
  const posterContainer = document.getElementById('poster-container');
  const mainContent = document.getElementById('main-content');
  const music = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  let isPlaying = false;

  if (introLayer) {
    introLayer.addEventListener('click', () => {
      if (introVideo) {
        if (posterContainer) {
          posterContainer.classList.add('hidden-opacity');
        }
        introVideo.classList.remove('opacity-0');
        introVideo.play().catch(() => {});

        if (music && music.src) {
          music.play().then(() => {
            isPlaying = true;
            if (musicToggle) {
              musicToggle.classList.remove('hidden');
              musicToggle.style.opacity = '1';
            }
          }).catch(() => {});
        }

        window.setTimeout(() => {
          introLayer.classList.add('hidden-opacity');
          if (mainContent) {
            mainContent.classList.remove('opacity-0');
          }
          window.setTimeout(() => {
            introLayer.style.display = 'none';
          }, 1000);
        }, 3000);
      } else {
        introLayer.classList.add('hidden-opacity');
        if (mainContent) {
          mainContent.classList.remove('opacity-0');
        }
        window.setTimeout(() => {
          introLayer.style.display = 'none';
        }, 1000);
      }
    });
  }

  if (musicToggle && music) {
    musicToggle.addEventListener('click', () => {
      if (isPlaying) {
        music.pause();
        musicToggle.style.opacity = '0.5';
      } else {
        music.play().catch(() => {});
        musicToggle.style.opacity = '1';
      }
      isPlaying = !isPlaying;
    });
  }
}

function initRsvpForm() {
  if (window.__farhaMajesticRsvpInitialized) return;
  window.__farhaMajesticRsvpInitialized = true;

  const pills = Array.from(document.querySelectorAll('.pill'));
  const statusInput = document.getElementById('statusInput');
  const compMinus = document.getElementById('comp-minus');
  const compPlus = document.getElementById('comp-plus');
  const compCount = document.getElementById('comp-count');
  const compInput = document.getElementById('compInput');
  const form = document.getElementById('rsvp-form');
  let companions = 0;

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((item) => item.classList.remove('active'));
      pill.classList.add('active');
      if (statusInput) {
        statusInput.value = pill.getAttribute('data-val') || 'confirmed';
      }
    });
  });

  if (compMinus && compPlus && compCount && compInput) {
    const syncCompanions = () => {
      compCount.textContent = String(companions);
      compInput.value = String(companions);
    };

    compMinus.addEventListener('click', () => {
      companions = Math.max(0, companions - 1);
      syncCompanions();
    });

    compPlus.addEventListener('click', () => {
      companions = Math.min(10, companions + 1);
      syncCompanions();
    });
  }

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = document.getElementById('submitBtn');
    const messageElement = document.getElementById('rsvpMsg');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'جارٍ الإرسال...';
    }
    if (messageElement) {
      messageElement.className = 'mt-4 text-center font-bold';
      messageElement.textContent = '';
    }

    const formData = new FormData(form);
    const payload = {
      invitationId: getInviteConfig().id,
      guestName: formData.get('guestName'),
      status: formData.get('status') || 'confirmed',
      companions: parseInt(String(formData.get('companions') || '0'), 10),
      message: formData.get('message') || '',
    };

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || 'تعذر إرسال تأكيد الحضور.');
      }

      if (messageElement) {
        messageElement.classList.add('text-green-700');
        messageElement.textContent = 'تم إرسال تأكيد الحضور بنجاح.';
      }

      form.reset();
      companions = 0;
      if (compCount) compCount.textContent = '0';
      if (compInput) compInput.value = '0';
      if (statusInput) statusInput.value = 'confirmed';
      pills.forEach((item, index) => item.classList.toggle('active', index === 0));
    } catch (error) {
      if (messageElement) {
        messageElement.classList.add('text-red-700');
        messageElement.textContent = error.message || 'حدث خطأ في الاتصال.';
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'إرسال التأكيد';
      }
    }
  });
}

window.renderFarhaTemplate = function renderFarhaTemplate() {
  renderPrimaryContent();
  initEnvelopeAndMusic();
  initRsvpForm();
};

document.addEventListener('DOMContentLoaded', window.renderFarhaTemplate);
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) return;
  if (event.data && event.data.type === 'FARHA_RENDER_CONFIG') {
    window.setTimeout(window.renderFarhaTemplate, 60);
  }
});
