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

function renderPrimaryContent() {
  const config = getInviteConfig();
  const weddingDate = parseWeddingDate(config);

  setElementText('env-guest-name', config.guestName || DEFAULT_GUEST_NAME, { keepVisibleWhenEmpty: true });
  setElementText('coverKicker', config.openingKicker || 'دعوة زفاف', { keepVisibleWhenEmpty: true });
  setElementText('coverNames', config.openingNames || [config.groomName, config.brideName].filter(Boolean).join(' و '), { keepVisibleWhenEmpty: true });
  setElementText('heroInvite', config.welcomeMessage);
  setElementText('groomName', config.groomName);
  setElementText('brideName', config.brideName);
  setElementText('verseText', config.verseText);
  setElementText('invitationText', config.invitationText);
  setElementText('openingPoem', config.openingPoem || config.welcomeMessage);
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
      mapButton.style.display = 'inline-block';
    } else {
      mapButton.removeAttribute('href');
      mapButton.style.display = 'none';
    }
  }

  const backgroundMusic = document.getElementById('bgMusic');
  if (backgroundMusic && config.musicUrl) {
    backgroundMusic.src = config.musicUrl;
  }

  const heroPhoto = document.getElementById('heroPhotoImg');
  const heroImage = config['images.hero'] || '';
  if (heroPhoto) {
    if (heroImage) {
      heroPhoto.src = heroImage;
      heroPhoto.classList.remove('hidden');
    } else {
      heroPhoto.removeAttribute('src');
      heroPhoto.classList.add('hidden');
    }
  }

  const venuePhoto = document.getElementById('venuePhoto');
  const venueImage = config['images.venue'] || config.venueImage || '';
  if (venuePhoto) {
    if (venueImage) {
      venuePhoto.style.backgroundImage = `url("${venueImage}")`;
      venuePhoto.classList.remove('hidden');
    } else {
      venuePhoto.style.backgroundImage = '';
      venuePhoto.classList.add('hidden');
    }
  }

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
    `<img src="${source}" alt="ذكرى ${index + 1}" loading="lazy">`
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
      <div class="timeline-item">
        <span class="time-badge">${time}</span>
        <span class="act-text">${title}</span>
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
  if (window.__farhaRoyalCountdownTimer) {
    window.clearInterval(window.__farhaRoyalCountdownTimer);
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
      window.clearInterval(window.__farhaRoyalCountdownTimer);
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
  window.__farhaRoyalCountdownTimer = window.setInterval(update, 1000);
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

function initEnvelopeAndMusic() {
  if (window.__farhaRoyalUiInitialized) return;
  window.__farhaRoyalUiInitialized = true;

  const envelope = document.getElementById('envelope');
  const screen = document.getElementById('envelope-screen');
  const invitation = document.getElementById('invitation-container');
  const music = document.getElementById('bgMusic');
  const toggle = document.getElementById('musicToggle');
  let isPlaying = false;

  const openInvitation = () => {
    if (!envelope || !screen || !invitation) return;
    envelope.classList.add('open');

    if (music && music.src) {
      music.play().then(() => {
        isPlaying = true;
        if (toggle) {
          toggle.classList.remove('hidden');
          toggle.style.opacity = '1';
        }
      }).catch(() => {});
    }

    window.setTimeout(() => {
      screen.classList.add('hide');
      invitation.classList.remove('hidden');
      void invitation.offsetWidth;
      invitation.classList.add('visible');
    }, 800);

    window.setTimeout(() => {
      screen.style.display = 'none';
    }, 1800);
  };

  if (envelope) {
    envelope.addEventListener('click', openInvitation);
    envelope.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openInvitation();
      }
    });
  }

  if (toggle && music) {
    toggle.addEventListener('click', () => {
      if (isPlaying) {
        music.pause();
        toggle.style.opacity = '0.5';
      } else {
        music.play().catch(() => {});
        toggle.style.opacity = '1';
      }
      isPlaying = !isPlaying;
    });
  }
}

function initRsvpForm() {
  if (window.__farhaRoyalRsvpInitialized) return;
  window.__farhaRoyalRsvpInitialized = true;

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
      messageElement.className = 'form-msg';
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
        messageElement.className = 'form-msg success';
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
        messageElement.className = 'form-msg error';
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
