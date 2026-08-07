(() => {
  const initialSearchParams = new URLSearchParams(window.location.search);
  const initialPromoBarDisabled = initialSearchParams.get('farhaPromoBar') === '0';
  const initialOpeningDisabled = initialSearchParams.get('farhaOpening') === '0';

  if (initialPromoBarDisabled && !document.getElementById('farha-disable-promo-style')) {
    const style = document.createElement('style');
    style.id = 'farha-disable-promo-style';
    style.textContent = `
      #da3wa-democta,
      #farha-democta,
      #farha-template-bar {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      body {
        padding-bottom: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (initialOpeningDisabled && !document.getElementById('farha-disable-opening-style')) {
    const style = document.createElement('style');
    style.id = 'farha-disable-opening-style';
    style.textContent = `
      #envelope-screen,
      #intro-layer,
      #popup-overlay,
      #preloader,
      #opening-screen,
      #cover,
      #gate,
      #stage,
      #envelope,
      #env,
      #preloaderPoster,
      #preloaderVideo,
      #doorVid,
      #heroVid,
      #loopVid,
      #flightVid,
      #doorGlow,
      #preloaderWhite,
      #preloaderNight,
      #poster-container {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      #invitation-container,
      #main-content,
      #site,
      .site,
      #allrecords {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }
      #main-content.opacity-0,
      #invitation-container.hidden,
      #main-content.hidden,
      #site.hidden,
      #allrecords.hidden {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
  }

  const TEMPLATE_META = {
    jathuandthanu: { arabicName: 'جاثو وثانو' },
    royal: { arabicName: 'الملكي' },
    majestic: { arabicName: 'ماجستيك' },
    twilight: { arabicName: 'تويلايت' },
    imperial: { arabicName: 'إمبريال' },
    toscana: { arabicName: 'توسكانا' },
    sacredgarden: { arabicName: 'الحديقة المقدسة' },
    blossomoud: { arabicName: 'بلوسوم عود' },
    dolcevita: { arabicName: 'دولتشي فيتا' },
    destinationlove: { arabicName: 'حب السفر' },
    classic: { arabicName: 'كلاسيك' },
    bab: { arabicName: 'باب الفرح' },
    reverie: { arabicName: 'حُلم وردي' },
    ring: { arabicName: 'الخاتم' },
    letter: { arabicName: 'رسالة' },
    disney: { arabicName: 'ديزني' },
    rozana: { arabicName: 'روزنة' },
    hadeel: { arabicName: 'هديل' },
    wisal: { arabicName: 'وِصال' },
    vangogh: { arabicName: 'ليلة النجوم' },
    blush: { arabicName: 'وردة' },
  };

  const runtimeState = {
    templateSlug: '',
    manifest: null,
    renderConfig: null,
    preview: false,
    showPromoBar: !initialPromoBarDisabled,
    invitationId: null,
    styleTag: null,
    promoBarMounted: false,
    scrollLocked: false,
    lockedScrollY: 0,
  };
  let promoGuardObserver = null;
  let nativeOpeningObserver = null;

  const fallbackBindings = {
    groomName: { method: 'text', selector: '#groomName, #heroGroom' },
    groom: { method: 'text', selector: '#groomName, #heroGroom' },
    brideName: { method: 'text', selector: '#brideName, #heroBride' },
    bride: { method: 'text', selector: '#brideName, #heroBride' },
    guestName: { method: 'text', selector: '#env-guest-name' },
    welcomeMessage: { method: 'text', selector: '#heroInvite, #heroSubtitle' },
    heroSub: { method: 'text', selector: '#heroSub, #heroInvite, #heroSubtitle' },
    verseText: { method: 'text', selector: '#verseText' },
    verse: { method: 'text', selector: '#verseText' },
    invitationText: { method: 'text', selector: '#invitationText' },
    groomParentsLabel: { method: 'text', selector: '#groomParentsLabel, .family__label:first-of-type' },
    groomParents: { method: 'text', selector: '#groomParents' },
    brideParentsLabel: { method: 'text', selector: '#brideParentsLabel, .family__label:last-of-type' },
    brideParents: { method: 'text', selector: '#brideParents' },
    venueName: { method: 'text', selector: '#venueName' },
    venueAddress: { method: 'text', selector: '#venueAddr' },
    venueAddr: { method: 'text', selector: '#venueAddr, #heroAddr' },
    locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
    mapUrl: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
    contactLabel: { method: 'text', selector: '#contactLabel' },
    contactName: { method: 'text', selector: '#contactName' },
    contactPhone: { method: 'text', selector: '#contactPhone' },
    closingNote: { method: 'text', selector: '#closingNote' },
    closingHashtag: { method: 'text', selector: '#closingHashtag' },
    hashtag: { method: 'text', selector: '#closingHashtag' },
    closingFamilies: { method: 'text', selector: '#closingFamilies' },
    venueImage: { method: 'backgroundImage', selector: '#venuePhoto, #venueImage' },
    'images.hero': { method: 'media', selector: '#heroPhotoImg, [data-farha-slot="hero-image"]' },
    'images.background': { method: 'media', selector: '#coverBg .bg-photo, #coverBg img.bg-photo, [data-farha-slot="background-image"]' },
    'images.venue': { method: 'backgroundImage', selector: '#venuePhoto, #venueImage, [data-farha-slot="venue-image"]' },
    musicUrl: { method: 'media', selector: '#bgMusic, #invitation-audio' },
    galleryImages: { method: 'gallery', selector: '#galleryGrid, .mem-grid' },
    program: { method: 'schedule', selector: '#timeline, .program' },
    notes: { method: 'list', selector: '#notesList' },
    weddingDate: { method: 'computedDate', selector: '#heroDate, #weddingDate, #eventDate' },
    dateText: { method: 'text', selector: '#heroDate, #weddingDate, #eventDate, #wipeDate' },
    timeText: { method: 'text', selector: '#weddingTime, #wipeTime' },
    coupleInviteLine: { method: 'text', selector: '#coupleInviteLine' },
    groomRelationLabel: { method: 'text', selector: '#groomRelationLabel' },
    groomRelationName: { method: 'text', selector: '#groomRelationName' },
    brideRelationLabel: { method: 'text', selector: '#brideRelationLabel' },
    brideRelationName: { method: 'text', selector: '#brideRelationName' },
  };

  document.addEventListener('DOMContentLoaded', () => {
    runtimeState.templateSlug = window.location.pathname.split('/').filter(Boolean)[0] || '';

    hideLegacyTemplateBars();
    setupNativeOpeningGuard();
    if (initialOpeningDisabled) {
      hideNativeOpeningLayers();
    }
    if (!runtimeState.showPromoBar) {
      startPromoGuard();
    }
    installMessageBridge();
    applyLegacyWindowInvite();
    mountPromoBarIfNeeded();
    hijackRsvpForms();
  });

  function installMessageBridge() {
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data || event.data.type !== 'FARHA_RENDER_CONFIG' || event.data.version !== '1.0.0') {
        return;
      }

      const payload = event.data;
      if (!payload.renderConfig || !payload.manifest) {
        return;
      }

      runtimeState.manifest = payload.manifest;
      runtimeState.renderConfig = payload.renderConfig;
      runtimeState.preview = Boolean(payload.renderConfig.preview);
      runtimeState.showPromoBar = payload.renderConfig.ui?.showPromoBar !== false;
      runtimeState.invitationId = payload.renderConfig.invitationId || null;

      applyRenderConfig(payload.manifest, payload.renderConfig);
      if (runtimeState.preview || !runtimeState.showPromoBar) {
        removePromoBar();
        startPromoGuard();
      } else {
        stopPromoGuard();
        mountPromoBarIfNeeded();
      }
      hijackRsvpForms(true);
    });
  }

  function applyLegacyWindowInvite() {
    if (!window.__INVITE__ || !window.__INVITE__.config) return;

    const cfg = window.__INVITE__.config;
    const renderConfig = {
      version: '1.0.0',
      invitationId: cfg.id || null,
      invitationSlug: cfg.slug || null,
      templateSlug: runtimeState.templateSlug,
      opening: { slug: 'native-template', type: 'native-template', config: {} },
      fields: {
        groomName: cfg.groom || cfg.groomName || '',
        brideName: cfg.bride || cfg.brideName || '',
        weddingDate: cfg.date || '',
        welcomeMessage: cfg.heroSub || cfg.welcomeMessage || '',
        verseText: cfg.verse || cfg.verseText || '',
        invitationText: cfg.invitationText || '',
        guestName: cfg.guestName || '',
        occasion: cfg.occasion || 'wedding',
        groomParentsLabel: cfg.groomParentsLabel || '',
        groomParents: cfg.groomParents || '',
        brideParentsLabel: cfg.brideParentsLabel || '',
        brideParents: cfg.brideParents || '',
        showFamilies: cfg.showFamilies !== false,
        brideFirst: cfg.brideFirst === true,
        coupleInviteLine: cfg.coupleInviteLine || '',
        groomRelationLabel: cfg.groomRelationLabel || '',
        groomRelationName: cfg.groomRelationName || '',
        brideRelationLabel: cfg.brideRelationLabel || '',
        brideRelationName: cfg.brideRelationName || '',
        venueName: cfg.venueName || '',
        venueAddress: cfg.venueAddr || cfg.venueAddress || '',
        locationLink: cfg.mapUrl || cfg.locationLink || '',
        contactLabel: cfg.contactLabel || '',
        contactName: cfg.contactName || '',
        contactPhone: cfg.contactPhone || '',
        closingNote: cfg.closingNote || '',
        closingHashtag: cfg.hashtag || cfg.closingHashtag || '',
        closingFamilies: cfg.closingFamilies || '',
        musicUrl: cfg.musicUrl || '',
        venueImage: cfg.images && cfg.images.venue ? cfg.images.venue : '',
        'images.hero': cfg.images && cfg.images.hero ? cfg.images.hero : '',
        'images.background': cfg.images && cfg.images.background ? cfg.images.background : '',
        'images.venue': cfg.images && cfg.images.venue ? cfg.images.venue : '',
        galleryImages: Array.isArray(cfg.galleryImages) ? cfg.galleryImages : [],
        program: Array.isArray(cfg.program) ? cfg.program : [],
        notes: Array.isArray(cfg.notes) ? cfg.notes : [],
      },
      sections: {
        hero: true,
        details: true,
        timeline: true,
        gallery: true,
        rsvp: true,
        calendar: true,
      },
      theme: {},
      preview: false,
      ui: {
        showPromoBar: true,
      },
      locale: 'ar',
    };

    runtimeState.renderConfig = renderConfig;
    runtimeState.showPromoBar = renderConfig.ui?.showPromoBar !== false;
    runtimeState.invitationId = renderConfig.invitationId;
    applyRenderConfig(null, renderConfig);
  }

  function applyRenderConfig(manifest, renderConfig) {
    const fields = buildLegacyFields(renderConfig.fields || {});
    const bindings =
      (manifest && manifest.runtimeBindings && manifest.runtimeBindings.fieldBindings) || fallbackBindings;

    window.__INVITE__ = {
      ...(window.__INVITE__ || {}),
      config: {
        ...((window.__INVITE__ && window.__INVITE__.config) || {}),
        ...fields,
      },
    };

    Object.keys(fields).forEach((fieldKey) => {
      const binding = bindings[fieldKey] || fallbackBindings[fieldKey];
      if (!binding) return;

      const value = fields[fieldKey];
      applyBinding(binding, value, fields);
    });

    applyComputedDate(fields.weddingDate);
    applyTheme(renderConfig.theme || {});
    applySections(manifest, renderConfig.sections || {});
    applyFamilyPresentation(fields);
    applyMediaVisibility(fields);
    applyOpening(renderConfig.opening || { slug: 'native-template', type: 'native-template', config: {} });
  }

  function assignNestedValue(target, dottedKey, value) {
    if (!dottedKey.includes('.')) {
      target[dottedKey] = value;
      return;
    }

    const parts = dottedKey.split('.');
    let cursor = target;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];
      if (!cursor[part] || typeof cursor[part] !== 'object') {
        cursor[part] = {};
      }
      cursor = cursor[part];
    }
    cursor[parts[parts.length - 1]] = value;
  }

  function buildLegacyFields(sourceFields) {
    const fields = { ...sourceFields };

    Object.entries(sourceFields).forEach(([key, value]) => {
      if (key.includes('.')) {
        assignNestedValue(fields, key, value);
      }
    });

    if (!fields.groom && fields.groomName) fields.groom = fields.groomName;
    if (!fields.bride && fields.brideName) fields.bride = fields.brideName;
    if (!fields.heroSub && fields.welcomeMessage) fields.heroSub = fields.welcomeMessage;
    if (!fields.verse && fields.verseText) fields.verse = fields.verseText;
    if (!fields.hashtag && fields.closingHashtag) fields.hashtag = fields.closingHashtag;
    if (!fields.mapUrl && fields.locationLink) fields.mapUrl = fields.locationLink;
    if (!fields.venueAddr && fields.venueAddress) fields.venueAddr = fields.venueAddress;
    if (!fields.date && fields.weddingDate) fields.date = fields.weddingDate;

    if (!fields.images || typeof fields.images !== 'object') {
      fields.images = {};
    }
    if (fields.venueImage && !fields.images.venue) fields.images.venue = fields.venueImage;
    if (sourceFields['images.hero']) fields.images.hero = sourceFields['images.hero'];
    if (sourceFields['images.background']) fields.images.background = sourceFields['images.background'];
    if (sourceFields['images.venue']) fields.images.venue = sourceFields['images.venue'];

    if (fields.weddingDate && (!fields.dateText || !fields.timeText)) {
      const date = new Date(fields.weddingDate);
      if (!Number.isNaN(date.getTime())) {
        if (!fields.dateText) {
          fields.dateText = date.toLocaleDateString('ar-EG', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        }
        if (!fields.timeText) {
          fields.timeText = date.toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      }
    }

    return fields;
  }

  function applyBinding(binding, value, fields) {
    switch (binding.method) {
      case 'text':
        setText(binding.selector, value);
        break;
      case 'attribute':
        setAttribute(binding.selector, binding.attribute, value);
        break;
      case 'media':
        setMedia(binding.selector, value);
        break;
      case 'backgroundImage':
        setBackgroundImage(binding.selector, value);
        break;
      case 'gallery':
        renderGallery(binding.selector, value);
        break;
      case 'schedule':
        renderSchedule(binding.selector, value);
        break;
      case 'list':
        renderNotes(binding.selector, value);
        break;
      case 'computedDate':
        applyComputedDate(value);
        break;
      default:
        break;
    }

    if (binding.selector === '#contactPhone' && fields.contactPhone) {
      const waLink = `https://wa.me/${String(fields.contactPhone).replace(/[^0-9]/g, '')}`;
      setAttribute('#contactPhone, #contactWhatsapp, #contactLink', 'href', waLink);
      setText('#contactPhoneText', fields.contactPhone);
    }
  }

  function applyFamilyPresentation(fields) {
    const familySection =
      document.querySelector('.families')
      || document.getElementById('groomParents')?.closest('.families')
      || document.getElementById('brideParents')?.closest('.families');

    const closingFamilies = document.getElementById('closingFamilies');
    const groomFamily = document.getElementById('groomParents')?.closest('.family');
    const brideFamily = document.getElementById('brideParents')?.closest('.family');
    const heart = familySection?.querySelector('.families__heart, .families-jewel');

    if (familySection) {
      familySection.style.display = fields.showFamilies === false ? 'none' : '';
    }
    if (closingFamilies) {
      closingFamilies.style.display = fields.showFamilies === false ? 'none' : '';
    }

    if (fields.showFamilies === false || !familySection || !groomFamily || !brideFamily || !heart) {
      const existingRow = document.querySelector('.farha-rel-row');
      if (existingRow) existingRow.remove();
      return;
    }

    if (fields.brideFirst === true) {
      familySection.replaceChildren(brideFamily, heart, groomFamily);
    } else {
      familySection.replaceChildren(groomFamily, heart, brideFamily);
    }

    renderRelationshipRow(fields, familySection);
  }

  function renderRelationshipRow(fields, familySection) {
    const names = [fields.groomRelationName, fields.brideRelationName].filter(Boolean);
    const labels = [fields.groomRelationLabel, fields.brideRelationLabel].filter(Boolean);
    const line = fields.coupleInviteLine || '';
    const existingRow = document.querySelector('.farha-rel-row');

    if (!names.length || (!line && !labels.length)) {
      if (existingRow) existingRow.remove();
      return;
    }

    if (existingRow) {
      existingRow.remove();
    }

    const row = familySection.cloneNode(true);
    row.classList.add('farha-rel-row');
    row.querySelectorAll('[id]').forEach((node) => node.removeAttribute('id'));

    const rowFamilies = row.querySelectorAll('.family');
    const rowHeart = row.querySelector('.families__heart, .families-jewel');
    const [leftFamily, rightFamily] = rowFamilies;

    configureRelationshipFamily(leftFamily, fields.groomRelationLabel, fields.groomRelationName);
    configureRelationshipFamily(rightFamily, fields.brideRelationLabel, fields.brideRelationName);

    if ((!fields.groomRelationName || !fields.brideRelationName) && rowHeart) {
      rowHeart.style.display = 'none';
    }

    if (line) {
      const lineNode = document.createElement('p');
      lineNode.className = 'da3wa-relline farha-rel-line';
      lineNode.textContent = line;
      row.prepend(lineNode);
    }

    familySection.insertAdjacentElement('afterend', row);
  }

  function configureRelationshipFamily(familyNode, label, name) {
    if (!familyNode) return;

    const labelNode = familyNode.querySelector('.family__label, .family-label');
    const nameNode = familyNode.querySelector('.family__names, #groomParents, #brideParents, p');

    if (!name) {
      familyNode.style.display = 'none';
      return;
    }

    familyNode.style.display = '';
    if (nameNode) {
      nameNode.textContent = name;
    }
    if (labelNode) {
      if (label) {
        labelNode.textContent = label;
        labelNode.style.display = '';
      } else {
        labelNode.style.display = 'none';
      }
    }
  }

  function applyMediaVisibility(fields) {
    if (fields['images.hero']) {
      queryAll('#heroPhoto, [data-farha-slot="hero-image-wrapper"]').forEach((node) => {
        node.hidden = false;
        node.style.display = '';
      });
    }

    if (fields['images.background']) {
      queryAll('#coverBg .bg-photo, #coverBg img.bg-photo').forEach((node) => {
        node.classList?.add('is-shown');
        node.hidden = false;
      });
    }
  }

  function queryAll(selector) {
    if (!selector) return [];
    try {
      return Array.from(document.querySelectorAll(selector));
    } catch (error) {
      console.error('Invalid selector in runtime binding:', selector, error);
      return [];
    }
  }

  function setText(selector, value) {
    const safe = value == null ? '' : String(value);
    queryAll(selector).forEach((node) => {
      node.textContent = safe;
    });
  }

  function setAttribute(selector, attribute, value) {
    if (!attribute) return;
    const safe = value == null ? '' : String(value);
    queryAll(selector).forEach((node) => {
      node.setAttribute(attribute, safe);
    });
  }

  function setMedia(selector, value) {
    const safe = value == null ? '' : String(value);
    queryAll(selector).forEach((node) => {
      if (!safe) return;

      const tagName = (node.tagName || '').toLowerCase();

      if (tagName === 'img' || tagName === 'audio' || tagName === 'video' || tagName === 'iframe') {
        if (node.getAttribute('src') !== safe) {
          node.setAttribute('src', safe);
        }
        if (tagName === 'audio' || tagName === 'video') {
          node.load?.();
        }
        node.hidden = false;
        node.style.display = '';
        return;
      }

      if (tagName === 'source') {
        if (node.getAttribute('src') !== safe) {
          node.setAttribute('src', safe);
        }
        node.parentElement?.load?.();
        return;
      }

      if ('src' in node) {
        if (node.getAttribute('src') !== safe) {
          node.setAttribute('src', safe);
        }
        node.hidden = false;
        node.style.display = '';
        return;
      }

      node.style.backgroundImage = `url("${safe}")`;
      node.hidden = false;
      node.style.display = '';
      node.classList?.add('is-shown');
    });
  }

  function setBackgroundImage(selector, value) {
    const safe = value == null ? '' : String(value);
    if (!safe) return;

    queryAll(selector).forEach((node) => {
      const tagName = (node.tagName || '').toLowerCase();

      if (tagName === 'img') {
        node.setAttribute('src', safe);
      } else {
        node.style.backgroundImage = `url("${safe}")`;
      }

      node.hidden = false;
      node.style.display = '';
      node.classList?.add('is-shown');
    });
  }

  function applyComputedDate(dateValue) {
    if (!dateValue) return;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return;

    const longDate = date.toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const shortTime = date.toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
    const monthYear = date.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    const dayNum = date.toLocaleDateString('ar-EG', { day: 'numeric' });
    const weekDay = date.toLocaleDateString('ar-EG', { weekday: 'long' });

    setText('#heroDate, #eventDate, #weddingDate', longDate);
    setText('#weddingTime', shortTime);
    setText('.cal-top', monthYear);
    setText('.cal-wd', weekDay);
    setText('.cal-day', dayNum);
    setText('.cal-time', shortTime);
  }

  function renderGallery(selector, images) {
    if (!Array.isArray(images) || images.length === 0) return;

    const host = queryAll(selector)[0];
    if (!host) return;

    if (host.classList.contains('mem-grid')) {
      host.className = `mem-grid n${Math.min(images.length, 4)}`;
      host.innerHTML = '';
      images.slice(0, 6).forEach((imageUrl, index) => {
        const figure = document.createElement('figure');
        figure.className = 'mem-cell';
        const img = document.createElement('img');
        img.src = imageUrl;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.alt = `ذكرى ${index + 1}`;
        figure.appendChild(img);
        host.appendChild(figure);
      });
      return;
    }

    host.innerHTML = '';
    images.slice(0, 8).forEach((imageUrl, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'farha-gallery-item';
      const img = document.createElement('img');
      img.src = imageUrl;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.alt = `Gallery ${index + 1}`;
      wrapper.appendChild(img);
      host.appendChild(wrapper);
    });
  }

  function renderSchedule(selector, items) {
    if (!Array.isArray(items)) return;

    if (typeof window.buildTimeline === 'function') {
      window.buildTimeline(items);
      return;
    }

    const host = queryAll(selector)[0];
    if (!host) return;

    host.innerHTML = '';
    items.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'farha-schedule-item';

      const time = document.createElement('div');
      time.className = 'farha-schedule-time';
      time.textContent = item.time || '';

      const title = document.createElement('div');
      title.className = 'farha-schedule-title';
      title.textContent = item.title || '';

      row.appendChild(time);
      row.appendChild(title);
      host.appendChild(row);
    });
  }

  function renderNotes(selector, notes) {
    if (!Array.isArray(notes)) return;

    if (typeof window.buildNotes === 'function') {
      window.buildNotes(notes);
      return;
    }

    const host = queryAll(selector)[0];
    if (!host) return;

    host.innerHTML = '';
    notes.forEach((note) => {
      const item = document.createElement('p');
      item.className = 'farha-note-item';
      item.textContent = note;
      host.appendChild(item);
    });
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme.primaryColor) root.style.setProperty('--farha-primary', theme.primaryColor);
    if (theme.accentColor) root.style.setProperty('--farha-accent', theme.accentColor);
    if (theme.surfaceColor) root.style.setProperty('--farha-surface', theme.surfaceColor);
    if (theme.fontHeading) root.style.setProperty('--farha-font-heading', theme.fontHeading);
    if (theme.fontBody) root.style.setProperty('--farha-font-body', theme.fontBody);
  }

  function applySections(manifest, sectionConfig) {
    if (runtimeState.styleTag && runtimeState.styleTag.parentNode) {
      runtimeState.styleTag.parentNode.removeChild(runtimeState.styleTag);
    }

    const sectionSelectors =
      manifest && manifest.runtimeBindings && manifest.runtimeBindings.sectionSelectors
        ? manifest.runtimeBindings.sectionSelectors
        : {
            gallery: ['#gallery-section', '#da3wa-mem'],
            timeline: ['#program-section', '#timeline', '.program'],
            rsvp: ['#rsvp-section', '#da3wa-rsvp'],
            calendar: ['#calendar-section', '#da3wa-cal'],
          };

    let css = '#farha-democta, #da3wa-democta, #da3wa-credit { display: none !important; }\n';

    Object.keys(sectionConfig).forEach((sectionKey) => {
      if (sectionConfig[sectionKey] !== false) return;
      const selectors = sectionSelectors[sectionKey] || [];
      selectors.forEach((selector) => {
        css += `${selector} { display: none !important; }\n`;
      });
    });

    runtimeState.styleTag = document.createElement('style');
    runtimeState.styleTag.id = 'farha-runtime-style';
    runtimeState.styleTag.textContent = css;
    document.head.appendChild(runtimeState.styleTag);
  }

  function applyOpening(opening) {
    if (!opening || opening.slug === 'native-template') return;

    if (opening.slug === 'no-opening') {
      hideNativeOpeningLayers();
      return;
    }

    if (opening.type === 'template-opening' || opening.slug.startsWith('template-opening:')) {
      hideNativeOpeningLayers();
      return;
    }

    if (opening.slug === 'minimal-fade') {
      hideNativeOpeningLayers();
      showMinimalFadeOverlay(opening.config || {});
    }
  }

  function hideNativeOpeningLayers() {
    queryAll('#envelope-screen, #intro-layer, #popup-overlay, #preloader, #opening-screen, #cover, #gate, #stage, #envelope, #env').forEach((node) => {
      node.style.display = 'none';
      node.classList?.add('hidden');
      node.classList?.add('fade-out');
      node.classList?.add('is-gone');
      node.classList?.add('is-done');
      node.classList?.add('is-open');
      node.classList?.add('is-revealed');
      node.classList?.add('is-arrived');
    });
    queryAll('#preloaderPoster, #preloaderVideo, #doorGlow, #preloaderWhite, #preloaderNight, #poster-container, #doorVid, #heroVid, #loopVid, #flightVid').forEach((node) => {
      node.style.display = 'none';
      node.classList?.add('hidden');
      node.classList?.add('fade-out');
    });
    queryAll('#invitation-container, #main-content').forEach((node) => {
      node.classList.remove('hidden', 'hidden-opacity');
      node.style.opacity = '1';
      node.style.pointerEvents = 'auto';
      node.style.display = '';
    });
    queryAll('#site, .site, #allrecords').forEach((node) => {
      node.classList?.add('visible');
      node.classList?.remove('hidden', 'hidden-opacity');
      node.hidden = false;
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.pointerEvents = 'auto';
      node.style.display = '';
    });
    document.body.classList.remove('locked');
    unlockPageScroll();
  }

  function setupNativeOpeningGuard() {
    syncNativeOpeningState();
    bindNativeOpeningTriggers();

    const overlay = document.getElementById('popup-overlay');
    if (!overlay || nativeOpeningObserver) return;

    nativeOpeningObserver = new MutationObserver(() => {
      syncNativeOpeningState();
    });

    nativeOpeningObserver.observe(overlay, {
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });
  }

  function bindNativeOpeningTriggers() {
    queryAll('#popup-enter, .popup-enter').forEach((button) => {
      if (button.dataset.farhaOpeningBound === 'true') return;
      button.dataset.farhaOpeningBound = 'true';
      button.addEventListener('click', () => {
        window.setTimeout(syncNativeOpeningState, 50);
        window.setTimeout(syncNativeOpeningState, 250);
        window.setTimeout(syncNativeOpeningState, 800);
      });
    });
  }

  function syncNativeOpeningState() {
    const overlay = document.getElementById('popup-overlay');
    if (!overlay) {
      unlockPageScroll();
      return;
    }

    if (isElementVisible(overlay)) {
      lockPageScroll();
      return;
    }

    unlockPageScroll();
  }

  function isElementVisible(element) {
    if (!element || element.hidden) return false;
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  function lockPageScroll() {
    if (runtimeState.scrollLocked) return;

    runtimeState.scrollLocked = true;
    runtimeState.lockedScrollY = window.scrollY || window.pageYOffset || 0;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${runtimeState.lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.touchAction = 'none';
  }

  function unlockPageScroll() {
    const restoreY = runtimeState.lockedScrollY || 0;

    runtimeState.scrollLocked = false;
    runtimeState.lockedScrollY = 0;

    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.touchAction = '';

    if (window.scrollY !== restoreY) {
      window.scrollTo(0, restoreY);
    }
  }

  function showMinimalFadeOverlay(config) {
    if (document.getElementById('farha-minimal-opening')) return;

    const overlay = document.createElement('div');
    overlay.id = 'farha-minimal-opening';
    overlay.innerHTML = `
      <div class="fmo-card">
        <div class="fmo-mark">FARHA</div>
        <p class="fmo-text">لحظة واحدة... دعوتكم تُفتح الآن</p>
        <button type="button" class="fmo-skip">تخطي</button>
      </div>
    `;

    const style = document.createElement('style');
    style.id = 'farha-minimal-opening-style';
    style.textContent = `
      #farha-minimal-opening {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at top, rgba(195,154,88,.25), rgba(21,12,11,.92));
        color: #fffaf6;
        animation: farhaFadeOut 1.2s ease 1.2s forwards;
      }
      #farha-minimal-opening .fmo-card {
        padding: 32px 28px;
        min-width: 280px;
        text-align: center;
        border-radius: 24px;
        background: rgba(255,255,255,.08);
        backdrop-filter: blur(18px);
        border: 1px solid rgba(255,255,255,.18);
        box-shadow: 0 24px 48px rgba(0,0,0,.25);
      }
      #farha-minimal-opening .fmo-mark {
        font: 700 26px Georgia, serif;
        letter-spacing: 6px;
        color: #e7c98f;
      }
      #farha-minimal-opening .fmo-text {
        margin: 14px 0 0;
        font: 600 15px "Tajawal", sans-serif;
      }
      #farha-minimal-opening .fmo-skip {
        margin-top: 18px;
        padding: 10px 18px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,.32);
        background: transparent;
        color: inherit;
        font: inherit;
      }
      @keyframes farhaFadeOut {
        to {
          opacity: 0;
          visibility: hidden;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    const dismiss = () => {
      overlay.remove();
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };

    overlay.querySelector('.fmo-skip').addEventListener('click', dismiss);
    setTimeout(dismiss, Math.max(Number(config.overlayDurationMs || 2200), 900));
  }

  function hijackRsvpForms(forceRebind) {
    const forms = document.querySelectorAll('form.t-form, form.js-form-proccess, #rsvp-form, #da3wa-rsvp-form, form.rsvp-form');

    forms.forEach((form) => {
      if (form.dataset.farhaBound === 'true' && !forceRebind) return;

      form.dataset.farhaBound = 'true';
      form.removeAttribute('action');

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopPropagation();

        const data = collectRsvpPayload(form);
        const submitButton = form.querySelector('button[type="submit"], #submitBtn, .send');
        const feedback = findRsvpFeedbackTarget(form);
        const originalText = submitButton ? submitButton.textContent : '';

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = runtimeState.preview ? 'معاينة...' : 'جاري الإرسال...';
        }

        try {
          if (runtimeState.preview) {
            showFeedback(feedback, 'هذه معاينة فقط. تم حفظ الرد تجريبيًا داخل المعاينة.', true);
            form.reset();
            return;
          }

          const response = await fetch('/api/rsvp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          const result = await response.json();

          if (!response.ok) {
            throw new Error(result.error || 'تعذر إرسال الرد');
          }

          showFeedback(feedback, result.message || 'تم استلام ردكم بنجاح.', true);
          form.reset();
        } catch (error) {
          console.error('RSVP submit failed:', error);
          showFeedback(feedback, error.message || 'حدث خطأ أثناء إرسال الرد.', false);
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText || 'إرسال';
          }
        }
      });
    });
  }

  function collectRsvpPayload(form) {
    const rawData = new FormData(form);
    const payload = {
      invitationId:
        runtimeState.invitationId ||
        form.getAttribute('data-invitation-id') ||
        document.getElementById('da3wa-rsvp')?.getAttribute('data-inv') ||
        window.__INVITE__?.config?.id ||
        '',
      guestName: '',
      status: 'confirmed',
      companions: 0,
      message: '',
      phone: '',
    };

    rawData.forEach((value, key) => {
      const lower = key.toLowerCase();
      const safeValue = String(value);
      if (lower.includes('name')) payload.guestName = safeValue;
      else if (lower.includes('status') || lower.includes('attend')) payload.status = safeValue;
      else if (lower.includes('companion') || lower.includes('guest')) payload.companions = parseInt(safeValue, 10) || 0;
      else if (lower.includes('phone')) payload.phone = safeValue;
      else if (lower.includes('message')) payload.message = safeValue;
    });

    if (!payload.guestName) {
      payload.guestName = form.querySelector('input[name="guestName"], input[name="name"]')?.value || 'Guest';
    }

    payload.status =
      form.querySelector('#statusInput')?.value ||
      payload.status ||
      form.querySelector('.pill.active')?.dataset?.val ||
      'confirmed';

    payload.companions =
      parseInt(form.querySelector('#compInput')?.value || form.querySelector('#comp-count')?.textContent || payload.companions, 10) || 0;

    return payload;
  }

  function findRsvpFeedbackTarget(form) {
    return (
      form.querySelector('#rsvpMsg, #da3wa-err, .js-successbox') ||
      form.parentElement?.querySelector('#rsvpMsg, #da3wa-err, .js-successbox')
    );
  }

  function showFeedback(target, text, success) {
    if (!target) return;
    target.style.display = 'block';
    target.textContent = text;
    target.style.color = success ? '#1f9d61' : '#d9475c';
  }

  function hideLegacyTemplateBars() {
    queryAll('#da3wa-democta, #farha-democta').forEach((element) => {
      element.style.display = 'none';
      element.style.opacity = '0';
      element.style.visibility = 'hidden';
      element.style.pointerEvents = 'none';
    });
  }

  function startPromoGuard() {
    hideLegacyTemplateBars();
    removePromoBar();

    if (promoGuardObserver || !document.body) return;

    promoGuardObserver = new MutationObserver(() => {
      hideLegacyTemplateBars();
      removePromoBar();
    });
    promoGuardObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function stopPromoGuard() {
    if (!promoGuardObserver) return;
    promoGuardObserver.disconnect();
    promoGuardObserver = null;
  }

  async function mountPromoBarIfNeeded() {
    if (runtimeState.preview || runtimeState.promoBarMounted || runtimeState.showPromoBar === false) return;
    if (!TEMPLATE_META[runtimeState.templateSlug]) return;

    hideLegacyTemplateBars();

    const publicData = await loadPublicTemplateBarData();
    const whatsappNumber = publicData.whatsapp || '201001473345';
    const priceLabel = publicData.minPriceLabel ? `تبدأ من ${publicData.minPriceLabel} - ` : '';
    const whatsappText = encodeURIComponent(
      `مرحباً، أعجبني قالب «${TEMPLATE_META[runtimeState.templateSlug].arabicName}» وأرغب في طلبه من FARHA.`,
    );
    const orderUrl = `/order?tpl=${runtimeState.templateSlug}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

    const style = document.createElement('style');
    style.id = 'farha-template-bar-style';
    style.textContent = `
      #farha-template-bar {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 9999;
        direction: rtl;
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: space-between;
        padding: 8px 12px calc(8px + env(safe-area-inset-bottom, 0px));
        background: rgba(255, 252, 249, .97);
        border-top: 1px solid rgba(127, 42, 31, .1);
        box-shadow: 0 -10px 24px rgba(83, 38, 31, .08);
        backdrop-filter: blur(14px);
        font-family: "Tajawal", system-ui, sans-serif;
      }
      #farha-template-bar .ftb-copy { flex: 1; min-width: 0; text-align: right; }
      #farha-template-bar .ftb-title { margin: 0; color: #2f2430; font-size: 1.02rem; font-weight: 900; line-height: 1.2; }
      #farha-template-bar .ftb-sub { margin: 3px 0 0; color: #756774; font-size: .78rem; line-height: 1.45; }
      #farha-template-bar .ftb-note { margin: 2px 0 0; color: #8f7f78; font-size: .68rem; line-height: 1.4; }
      #farha-template-bar .ftb-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
      #farha-template-bar .ftb-order {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 40px;
        padding: 0 16px;
        border-radius: 999px;
        background: linear-gradient(135deg, #ff4d7d, #ff6f8f);
        color: #fff;
        text-decoration: none;
        font-size: .82rem;
        font-weight: 900;
        white-space: nowrap;
      }
      #farha-template-bar .ftb-wa {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #25d366, #128c43);
        color: #fff;
        text-decoration: none;
        flex-shrink: 0;
      }
      #farha-template-bar .ftb-wa svg {
        width: 18px;
        height: 18px;
      }
      #farha-template-bar .ftb-close {
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        color: #a396aa;
        font-size: 22px;
        line-height: 1;
        border-radius: 999px;
        display: grid;
        place-items: center;
      }
      body { padding-bottom: 64px !important; box-sizing: border-box; }
      @media (max-width: 620px) {
        #farha-template-bar {
          flex-wrap: wrap;
          gap: 6px;
          padding: 7px 10px calc(7px + env(safe-area-inset-bottom, 0px));
        }
        #farha-template-bar .ftb-copy {
          order: 2;
          width: 100%;
        }
        #farha-template-bar .ftb-actions {
          order: 1;
          width: 100%;
        }
        #farha-template-bar .ftb-title {
          font-size: .92rem;
        }
        #farha-template-bar .ftb-sub {
          font-size: .72rem;
          line-height: 1.35;
        }
        #farha-template-bar .ftb-note {
          font-size: .62rem;
          line-height: 1.3;
        }
        #farha-template-bar .ftb-order {
          height: 36px;
          padding: 0 14px;
          font-size: .74rem;
        }
        #farha-template-bar .ftb-wa {
          width: 36px;
          height: 36px;
        }
        #farha-template-bar .ftb-wa svg {
          width: 16px;
          height: 16px;
        }
        #farha-template-bar .ftb-close {
          width: 24px;
          height: 24px;
          font-size: 18px;
        }
        body {
          padding-bottom: 56px !important;
        }
      }
    `;
    document.head.appendChild(style);

    const bar = document.createElement('div');
    bar.id = 'farha-template-bar';
    bar.innerHTML = `
      <div class="ftb-copy">
        <p class="ftb-title">أعجبك قالب «${TEMPLATE_META[runtimeState.templateSlug].arabicName}»؟</p>
        <p class="ftb-sub">${priceLabel}اطلبه الآن من FARHA ونجهزه ليتناسب مع مناسبتكم</p>
        <p class="ftb-note">هذا الشريط للعرض فقط - دعوتكم النهائية تصلكم نظيفة بدونه</p>
      </div>
      <div class="ftb-actions">
        <button class="ftb-close" type="button" aria-label="إغلاق">×</button>
        <a class="ftb-wa" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" aria-label="واتساب">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </a>
        <a class="ftb-order" href="${orderUrl}">اطلبه الآن</a>
      </div>
    `;

    bar.querySelector('.ftb-close').addEventListener('click', removePromoBar);

    document.body.appendChild(bar);
    runtimeState.promoBarMounted = true;
  }

  function removePromoBar() {
    const bar = document.getElementById('farha-template-bar');
    const style = document.getElementById('farha-template-bar-style');
    if (bar) bar.remove();
    if (style) style.remove();
    runtimeState.promoBarMounted = false;
    document.body.style.paddingBottom = '0px';
  }

  async function loadPublicTemplateBarData() {
    const defaults = {
      whatsapp: '201001473345',
      minPriceLabel: '',
    };

    try {
      const [settingsRes, packagesRes] = await Promise.all([
        fetch('/api/public/site-settings', { cache: 'no-store' }),
        fetch('/api/packages', { cache: 'no-store' }),
      ]);

      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings && settings.whatsapp) {
          defaults.whatsapp = String(settings.whatsapp).replace(/[^0-9]/g, '') || defaults.whatsapp;
        }
      }

      if (packagesRes.ok) {
        const packages = await packagesRes.json();
        if (Array.isArray(packages) && packages.length > 0) {
          const cheapest = packages
            .filter((pkg) => typeof pkg.price === 'number' && !Number.isNaN(pkg.price))
            .sort((a, b) => a.price - b.price)[0];

          if (cheapest) {
            const currencyLabel = cheapest.currency === 'EGP' ? 'ج.م' : cheapest.currency || '';
            defaults.minPriceLabel = `${cheapest.price} ${currencyLabel}`.trim();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load FARHA promo bar data:', error);
    }

    return defaults;
  }
})();
