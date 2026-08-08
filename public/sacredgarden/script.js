function query(selector, root = document) {
  return root.querySelector(selector);
}

function queryAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function setHtml(selector, value, root = document) {
  if (value == null || value === '') return;
  queryAll(selector, root).forEach((node) => {
    node.innerHTML = String(value);
  });
}

function setText(selector, value, root = document) {
  if (value == null || value === '') return;
  queryAll(selector, root).forEach((node) => {
    node.textContent = String(value);
  });
}

function setHtmlMany(selectors, value) {
  selectors.forEach((selector) => setHtml(selector, value));
}

function setTextMany(selectors, value) {
  selectors.forEach((selector) => setText(selector, value));
}

function getOpeningRuntimeState() {
  const params = new URLSearchParams(window.location.search);
  const opening = window.__INVITE__?.renderConfig?.opening || window.__INVITE__?.opening || null;
  const openingSlug = String(opening?.slug || '');
  const openingType = String(opening?.type || '');

  return {
    opening,
    openingDisabled: params.get('farhaOpening') === '0' || openingSlug === 'no-opening',
    openingOnly: params.get('farhaOpeningOnly') === '1',
    hasTemplateReplacement: openingType === 'template-opening' || openingSlug.startsWith('template-opening:'),
  };
}

function syncSacredGardenOpeningState() {
  const { openingDisabled, openingOnly, hasTemplateReplacement } = getOpeningRuntimeState();
  const overlay = query('#weiOverlay');
  const videoWrap = query('#weiVideoWrap');
  const tapWrap = query('#weiTapWrap');
  const video = query('#weiVideo');
  const audioBtn = query('#weiAudioBtn');
  const audio = query('#weiAudio');
  const allRecords = query('#allrecords');

  if (openingOnly) {
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';
      overlay.style.pointerEvents = 'auto';
    }
    if (videoWrap) {
      videoWrap.style.display = '';
      videoWrap.style.visibility = 'visible';
    }
    return;
  }

  if (!openingDisabled && !hasTemplateReplacement) {
    return;
  }

  if (video && typeof video.pause === 'function') {
    try {
      video.pause();
      video.currentTime = 0;
    } catch (error) {
      void error;
    }
  }

  if (overlay) {
    overlay.style.display = 'none';
    overlay.style.opacity = '0';
    overlay.style.visibility = 'hidden';
    overlay.style.pointerEvents = 'none';
  }

  if (tapWrap) {
    tapWrap.style.display = 'none';
  }

  if (videoWrap) {
    videoWrap.classList.remove('wei-video-in', 'wei-video-out');
    videoWrap.style.display = 'none';
    videoWrap.style.opacity = '0';
    videoWrap.style.visibility = 'hidden';
    videoWrap.style.pointerEvents = 'none';
  }

  if (allRecords) {
    allRecords.style.opacity = '1';
    allRecords.style.visibility = 'visible';
    allRecords.style.pointerEvents = 'auto';
  }

  if (audioBtn) {
    audioBtn.style.visibility = 'visible';
    audioBtn.style.opacity = audio ? '1' : '0';
    audioBtn.style.pointerEvents = audio ? 'auto' : 'none';
  }
}

function getInitial(name) {
  if (!name) return '';
  const trimmed = String(name).trim();
  if (!trimmed) return '';
  return Array.from(trimmed)[0] || '';
}

function buildSealSvg(monogramText) {
  const safeText = String(monogramText || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 142">
      <defs>
        <radialGradient id="waxGlow" cx="50%" cy="40%" r="62%">
          <stop offset="0%" stop-color="#8f2031"/>
          <stop offset="45%" stop-color="#7b1827"/>
          <stop offset="72%" stop-color="#67111f"/>
          <stop offset="100%" stop-color="#4b0a15"/>
        </radialGradient>
        <radialGradient id="waxHighlight" cx="38%" cy="24%" r="40%">
          <stop offset="0%" stop-color="rgba(255,255,255,0.45)"/>
          <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
        </radialGradient>
        <filter id="waxShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#3b0710" flood-opacity="0.35"/>
        </filter>
        <linearGradient id="goldInk" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f3dfa2"/>
          <stop offset="25%" stop-color="#e2c67b"/>
          <stop offset="52%" stop-color="#fff1bf"/>
          <stop offset="72%" stop-color="#c39a47"/>
          <stop offset="100%" stop-color="#f0d387"/>
        </linearGradient>
      </defs>
      <g transform="translate(95 71)" filter="url(#waxShadow)">
        <path fill="url(#waxGlow)" d="M0,-50
          C8,-58 21,-57 30,-50
          C41,-52 52,-45 56,-34
          C67,-31 74,-19 72,-7
          C79,2 79,16 71,25
          C72,37 64,48 53,52
          C48,63 36,69 24,67
          C15,75 1,77 -10,72
          C-20,77 -34,75 -43,67
          C-55,68 -66,61 -71,50
          C-83,46 -90,35 -89,23
          C-97,14 -97,0 -89,-10
          C-91,-22 -83,-33 -71,-37
          C-66,-49 -54,-55 -42,-54
          C-33,-61 -19,-62 -8,-56
          Z"/>
        <ellipse cx="-15" cy="-22" rx="28" ry="18" fill="rgba(255,255,255,0.12)"/>
        <path fill="url(#waxHighlight)" d="M-40,-30 C-22,-55 18,-56 34,-35 C12,-42 -12,-41 -40,-30 Z"/>
        <text x="0" y="8"
          text-anchor="middle"
          font-family="Georgia, 'Times New Roman', serif"
          font-size="34"
          font-style="italic"
          font-weight="700"
          fill="url(#goldInk)"
          stroke="#f6e5af"
          stroke-width="0.7"
          paint-order="stroke fill">
          ${safeText}
        </text>
      </g>
    </svg>
  `.trim();
}

function ensureSealMonogram(brideName, groomName) {
  const sealLink = query('#rec2487446223 [data-elem-id="1782293057692"] a.tn-atom');
  if (!sealLink) return;

  sealLink.style.position = 'relative';
  sealLink.style.display = 'block';
  sealLink.style.width = '100%';
  sealLink.style.height = '100%';
  sealLink.style.overflow = 'hidden';

  const originalSealImage = query('img', sealLink);
  if (originalSealImage) {
    originalSealImage.style.opacity = '0';
    originalSealImage.style.visibility = 'hidden';
    originalSealImage.style.pointerEvents = 'none';
    originalSealImage.style.position = 'absolute';
    originalSealImage.style.inset = '0';
    originalSealImage.style.width = '100%';
    originalSealImage.style.height = '100%';
    originalSealImage.removeAttribute('srcset');
    originalSealImage.removeAttribute('data-original');
  }

  let generatedSealImage = sealLink.querySelector('[data-farha-generated-seal]');
  if (!generatedSealImage) {
    generatedSealImage = document.createElement('img');
    generatedSealImage.setAttribute('data-farha-generated-seal', 'true');
    generatedSealImage.alt = 'Seal monogram';
    generatedSealImage.draggable = false;
    generatedSealImage.style.position = 'absolute';
    generatedSealImage.style.inset = '0';
    generatedSealImage.style.width = '100%';
    generatedSealImage.style.height = '100%';
    generatedSealImage.style.objectFit = 'contain';
    generatedSealImage.style.zIndex = '3';
    generatedSealImage.style.pointerEvents = 'none';
    sealLink.appendChild(generatedSealImage);
  }

  const brideInitial = getInitial(brideName);
  const groomInitial = getInitial(groomName);
  const text = [brideInitial, groomInitial].filter(Boolean).join('&');
  if (text) {
    const sealSvg = buildSealSvg(text);
    generatedSealImage.src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(sealSvg)}`;
  }
}

function formatDisplayDate(dateValue) {
  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return '';

  return parsedDate
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
    .replace(/\//g, '.');
}

function getCountdownParts(targetDate) {
  if (!(targetDate instanceof Date) || Number.isNaN(targetDate.getTime())) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' };
  }

  const diff = Math.max(0, targetDate.getTime() - Date.now());
  return {
    days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
    hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
    minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
    seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'),
  };
}

function buildCountdownMarkup(dateValue) {
  const targetDate = new Date(dateValue);
  const initialParts = getCountdownParts(targetDate);

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://fonts.googleapis.com/css2?family=Ovo&display=swap" rel="stylesheet">
    <style>
      *{box-sizing:border-box;margin:0;padding:0;}
      body{background:transparent;}
      #countdownContainer{display:flex;justify-content:center;align-items:center;gap:6px;margin:80px 20px;}
      .time-block{text-align:center;}
      .number-wrap{overflow:hidden;height:56px;display:flex;align-items:center;justify-content:center;}
      .number{font-size:45px;font-family:'Ovo',serif;line-height:1.2;display:block;white-space:nowrap;background:linear-gradient(105deg,#B48C3D 0%,#B48C3D 25%,#cda95a 46%,#d8ba72 52%,#cda95a 58%,#B48C3D 75%,#B48C3D 100%);background-size:300% 100%;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;clip-path:inset(0 100% 0 0);transition:transform .55s cubic-bezier(.25,.1,.25,1),opacity .55s ease;}
      .number.revealed{animation:inkReveal 1.1s cubic-bezier(.4,0,.2,1) forwards,candleShimmer 4.5s ease-in-out 1.1s infinite;}
      @keyframes inkReveal{0%{clip-path:inset(0 100% 0 0);}100%{clip-path:inset(0 0 0 0);}}
      @keyframes candleShimmer{0%{background-position:100% 0;}50%{background-position:0 0;}100%{background-position:100% 0;}}
      .number.flip-out{transform:translateY(-60%);opacity:0;}
      .number.flip-in{transform:translateY(60%);opacity:0;transition:none;}
      .label{font-size:19px;margin-top:8px;font-weight:400;color:#B48C3D;font-family:'Ovo',serif;opacity:.85;}
      .separator{font-size:52px;margin-top:-40px;color:#B48C3D;line-height:1;font-family:'Ovo',serif;opacity:.9;}
    </style>
  </head>
  <body>
    <div id="countdownContainer">
      <div class="time-block"><div class="number-wrap"><div class="number revealed" id="days">${initialParts.days}</div></div><div class="label">Days</div></div>
      <div class="separator">:</div>
      <div class="time-block"><div class="number-wrap"><div class="number revealed" id="hours">${initialParts.hours}</div></div><div class="label">Hours</div></div>
      <div class="separator">:</div>
      <div class="time-block"><div class="number-wrap"><div class="number revealed" id="minutes">${initialParts.minutes}</div></div><div class="label">Minutes</div></div>
      <div class="separator">:</div>
      <div class="time-block"><div class="number-wrap"><div class="number revealed" id="seconds">${initialParts.seconds}</div></div><div class="label">Seconds</div></div>
    </div>
    <script>
      (function () {
        var eventDate = new Date(${JSON.stringify(targetDate.toISOString())});
        var elDays = document.getElementById('days');
        var elHours = document.getElementById('hours');
        var elMinutes = document.getElementById('minutes');
        var elSeconds = document.getElementById('seconds');

        function pad(value) {
          return String(value).padStart(2, '0');
        }

        function flip(el, nextValue) {
          if (!el || el.textContent === nextValue) return;
          el.classList.add('flip-out');
          setTimeout(function () {
            el.classList.remove('flip-out');
            el.classList.add('flip-in');
            el.textContent = nextValue;
            el.offsetHeight;
            el.classList.remove('flip-in');
          }, 520);
        }

        function tick() {
          var now = new Date();
          var diff = eventDate - now;
          if (diff <= 0) {
            var container = document.getElementById('countdownContainer');
            if (container) container.innerHTML = 'See you there!';
            return;
          }

          var days = Math.floor(diff / 86400000);
          var hours = Math.floor((diff % 86400000) / 3600000);
          var minutes = Math.floor((diff % 3600000) / 60000);
          var seconds = Math.floor((diff % 60000) / 1000);

          flip(elDays, pad(days));
          flip(elHours, pad(hours));
          flip(elMinutes, pad(minutes));
          flip(elSeconds, pad(seconds));
        }

        tick();
        setInterval(tick, 1000);
      })();
    </script>
  </body>
  </html>`;
}

function applySacredGardenConfig() {
  const config = window.__INVITE__?.config;
  if (!config) return;

  syncSacredGardenOpeningState();

  const groom = config.groomName || config.groom || config.groomName_en || config.groom_en || '';
  const bride = config.brideName || config.bride || config.brideName_en || config.bride_en || '';
  const combinedNames = [groom, bride].filter(Boolean).join(' <br /><br />');
  const inlineNames = [groom, bride].filter(Boolean).join(' and ');

  const displayDate = formatDisplayDate(config.weddingDate || config.date || '');
  const openingTitle = config.openingKicker || config.titleInvitation || '';
  const openingHint = config.openingHint || '';
  const introLine = config.welcomeMessage || config.heroSub || '';
  const invitationText = config.invitationText || '';
  const openingPoem = config.openingPoem || config.poemText || '';
  const scrollText = config.openingNames || config.ctaText || '';
  const titleCountdown = config.titleCountdown || '';
  const titleVenue = config.titleVenue || '';
  const titleRsvp = config.contactLabel || config.rsvpTitle || '';
  const rsvpDescription = config.contactName || config.rsvpDescription || '';
  const recapTitle = config.titleNotes || config.recapTitle || '';
  const venueName = config.venueName || '';
  const venueAddress = config.venueAddress || config.venueAddr || '';

  if (combinedNames) {
    setHtml('#rec2487446043 [data-elem-id="1763402147625"] .tn-atom', combinedNames);
  }

  ensureSealMonogram(bride, groom);

  if (inlineNames) {
    setText('#rec2487446253 [data-elem-id="1772813849329000001"] .tn-atom', inlineNames);
  }

  if (displayDate) {
    setText('#rec2487446043 [data-elem-id="176340401720454780"] .tn-atom', displayDate);
  }

  if (openingTitle) {
    setText('#rec2487446043 [data-elem-id="176340398328864790"] .tn-atom', openingTitle);
  }

  if (introLine) {
    setHtml('#rec2487446043 [data-elem-id="1780748008617000003"] .tn-atom', String(introLine).replace(/\n/g, '<br />'));
  }

  if (invitationText) {
    setHtmlMany(
      [
        '#rec2487446043 [data-elem-id="1780748008617000005"] .tn-atom',
        '#rec2487446233 .t702__descr',
      ],
      String(invitationText).replace(/\n/g, '<br />'),
    );
  }

  if (openingPoem) {
    setHtml('#rec2487446223 [data-elem-id="1772813849329000001"] .tn-atom', String(openingPoem).replace(/\n/g, '<br />'));
  }

  if (scrollText) {
    setTextMany(
      [
        '#rec2487446043 [data-elem-id="1782235970225000002"] .tn-atom',
        '#rec2487446223 [data-elem-id="1782316019612"] .tn-atom',
      ],
      scrollText,
    );
  }

  if (titleCountdown) {
    setText('#rec2487446093 [data-elem-id="1771277026942000001"] .tn-atom', titleCountdown);
  }

  if (titleVenue) {
    setText('#rec2487446123 [data-elem-id="1771277026942000001"] .tn-atom', titleVenue);
  }

  if (titleRsvp) {
    setTextMany(
      [
        '#rec2487446223 [data-elem-id="1763405219328"] .tn-atom',
        '#popuptitle_2487446233',
      ],
      titleRsvp,
    );
  }

  if (rsvpDescription) {
    setHtml('#rec2487446233 .t702__descr', String(rsvpDescription).replace(/\n/g, '<br />'));
  }

  if (recapTitle) {
    setText('#rec2487446253 [data-elem-id="1763405219328"] .tn-atom', recapTitle);
  }

  if (venueName) {
    setText('#rec2487446123 [data-elem-id="1772804808869"] .tn-atom', venueName);
  }

  if (venueAddress) {
    const normalizedAddress = /^address:/i.test(venueAddress) ? venueAddress : `Address: ${venueAddress}`;
    setText('#rec2487446123 [data-elem-id="1772813480591000001"] .tn-atom', normalizedAddress);
  }

  if (openingHint) {
    setText('#weiTapLabel', openingHint);
  }

  const countdownHost = query('#rec2487446093 [data-elem-id="1771277551711000001"] .tn-atom__html');
  if (countdownHost && (config.weddingDate || config.date)) {
    const parsedDate = new Date(config.weddingDate || config.date);
    if (!Number.isNaN(parsedDate.getTime())) {
      countdownHost.innerHTML = buildCountdownMarkup(parsedDate.toISOString());
    }
  }

  const music = query('#weiAudio');
  const musicUrl = config.musicUrl || '';
  if (music && musicUrl && music.getAttribute('src') !== musicUrl) {
    music.setAttribute('src', musicUrl);
    queryAll('source', music).forEach((sourceNode) => {
      sourceNode.setAttribute('src', musicUrl);
    });
    if (typeof music.load === 'function') music.load();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  syncSacredGardenOpeningState();
  applySacredGardenConfig();

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === 'FARHA_RENDER_CONFIG') {
      window.setTimeout(() => {
        syncSacredGardenOpeningState();
        applySacredGardenConfig();
      }, 60);
    }
  });

  let lastSignature = '';
  window.setInterval(() => {
    const config = window.__INVITE__?.config || {};
    const signature = JSON.stringify({
      groom: config.groomName || config.groom || '',
      bride: config.brideName || config.bride || '',
      date: config.weddingDate || config.date || '',
      invitationText: config.invitationText || '',
      openingPoem: config.openingPoem || config.poemText || '',
      musicUrl: config.musicUrl || '',
      venueName: config.venueName || '',
      venueAddress: config.venueAddress || config.venueAddr || '',
      openingTitle: config.openingKicker || config.titleInvitation || '',
      titleCountdown: config.titleCountdown || '',
      titleVenue: config.titleVenue || '',
      titleRsvp: config.contactLabel || config.rsvpTitle || '',
      recapTitle: config.titleNotes || config.recapTitle || '',
    });

    if (signature !== lastSignature) {
      lastSignature = signature;
      syncSacredGardenOpeningState();
      applySacredGardenConfig();
    }
  }, 600);

  const forms = document.querySelectorAll('form.t-form, form.js-form-proccess');
  forms.forEach((form) => {
    form.removeAttribute('action');

    const successBox = form.querySelector('.js-successbox') || form.parentElement?.querySelector('.js-successbox');

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const formData = new FormData(form);
      const data = {
        guestName: 'Guest',
        status: 'confirmed',
        companions: 0,
        message: '',
      };

      const extraMessages = [];

      for (const [key, val] of formData.entries()) {
        const normalizedKey = key.toLowerCase();
        const normalizedValue = String(val).toLowerCase();

        if (normalizedKey.includes('name') || normalizedKey.includes('nom')) {
          data.guestName = val;
        } else if (
          normalizedKey.includes('attend') ||
          normalizedKey.includes('come') ||
          normalizedKey.includes('presence') ||
          normalizedKey.includes('viens')
        ) {
          if (
            normalizedValue.includes('yes') ||
            normalizedValue.includes('accept') ||
            normalizedValue.includes('oui') ||
            normalizedValue.includes('pleasure') ||
            normalizedValue.includes('will')
          ) {
            data.status = 'confirmed';
          } else if (
            normalizedValue.includes('no') ||
            normalizedValue.includes('decline') ||
            normalizedValue.includes('non') ||
            normalizedValue.includes('regret') ||
            normalizedValue.includes('not')
          ) {
            data.status = 'declined';
          }
        } else if (
          normalizedKey.includes('guest') ||
          normalizedKey.includes('companion') ||
          normalizedKey.includes('person') ||
          normalizedKey.includes('number') ||
          normalizedKey.includes('combien')
        ) {
          const parsed = parseInt(val, 10);
          if (!Number.isNaN(parsed)) {
            data.companions = parsed;
          } else {
            const match = normalizedValue.match(/\d+/);
            if (match) data.companions = parseInt(match[0], 10);
          }
        } else if (val) {
          extraMessages.push(`${key}: ${val}`);
        }
      }

      if (extraMessages.length > 0) {
        data.message = extraMessages.join('\n');
      }

      const pathParts = window.location.pathname.split('/').filter(Boolean);
      data.templateId = pathParts[0] || 'unknown';

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;
      }

      try {
        const response = await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();
        if (successBox) {
          successBox.style.display = 'block';
          successBox.innerHTML = result.message || 'RSVP sent successfully!';
          successBox.style.color = '#2ecc71';
        }
        form.reset();
      } catch (error) {
        console.error('RSVP error:', error);
        if (successBox) {
          successBox.style.display = 'block';
          successBox.innerHTML = 'Failed to submit RSVP. Please try again.';
          successBox.style.color = '#e74c3c';
        }
      } finally {
        if (submitBtn) {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      }
    });
  });
});
