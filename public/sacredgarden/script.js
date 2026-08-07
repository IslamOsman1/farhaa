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

function getInitial(name) {
  if (!name) return '';
  const trimmed = String(name).trim();
  if (!trimmed) return '';
  return Array.from(trimmed)[0] || '';
}

function ensureSealMonogram(brideName, groomName) {
  const sealLink = query('#rec2487446223 [data-elem-id="1782293057692"] a.tn-atom');
  if (!sealLink) return;

  sealLink.style.position = 'relative';
  sealLink.style.display = 'block';
  sealLink.style.width = '100%';
  sealLink.style.height = '100%';
  sealLink.style.overflow = 'hidden';

  const sealImage = query('img', sealLink);
  if (sealImage) {
    sealImage.style.display = 'block';
    sealImage.style.width = '100%';
    sealImage.style.height = '100%';
    sealImage.style.objectFit = 'contain';
  }

  let monogram = sealLink.querySelector('[data-farha-seal-monogram]');
  if (!monogram) {
    monogram = document.createElement('span');
    monogram.setAttribute('data-farha-seal-monogram', 'true');
    monogram.style.position = 'absolute';
    monogram.style.top = '50%';
    monogram.style.left = '50%';
    monogram.style.width = '100%';
    monogram.style.height = '100%';
    monogram.style.display = 'flex';
    monogram.style.alignItems = 'center';
    monogram.style.justifyContent = 'center';
    monogram.style.pointerEvents = 'none';
    monogram.style.zIndex = '4';
    monogram.style.fontFamily = '"Times New Roman", "Georgia", serif';
    monogram.style.fontStyle = 'italic';
    monogram.style.fontWeight = '600';
    monogram.style.fontSize = '46px';
    monogram.style.letterSpacing = '1.5px';
    monogram.style.lineHeight = '1';
    monogram.style.color = '#d9b56b';
    monogram.style.textShadow = '0 1px 0 rgba(92, 25, 35, 0.55), 0 0 10px rgba(246, 223, 159, 0.22)';
    monogram.style.transform = 'translate(-50%, -50%)';
    sealLink.appendChild(monogram);
  }

  const brideInitial = getInitial(brideName);
  const groomInitial = getInitial(groomName);
  const text = [brideInitial, groomInitial].filter(Boolean).join('&');
  if (text) {
    monogram.textContent = text;
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

  const groom = config.groomName || config.groom || '';
  const bride = config.brideName || config.bride || '';
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
  applySacredGardenConfig();

  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data?.type === 'FARHA_RENDER_CONFIG') {
      window.setTimeout(applySacredGardenConfig, 60);
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
