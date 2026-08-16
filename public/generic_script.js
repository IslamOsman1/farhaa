(() => {
  const initialSearchParams = new URLSearchParams(window.location.search);
  const initialPromoBarDisabled = initialSearchParams.get('farhaPromoBar') === '0';
  const initialOpeningDisabled = initialSearchParams.get('farhaOpening') === '0';
  const initialOpeningOnly = initialSearchParams.get('farhaOpeningOnly') === '1';

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
      #envelope,
      #env,
      #preloaderPoster,
      #preloaderVideo,
      #doorVid,
      #doorGlow,
      #preloaderWhite,
      #preloaderNight,
      #poster-container,
      #weiOverlay,
      #weiVideoWrap,
      #weiTapWrap,
      #weiVideo {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      #invitation-container,
      #main-content,
      #invite,
      #site,
      .site,
      #allrecords,
      .invite {
        display: block !important;
        opacity: 1 !important;
        visibility: visible !important;
        pointer-events: auto !important;
      }
      #main-content.opacity-0,
      #invitation-container.hidden,
      #invite.hidden,
      #main-content.hidden,
      #site.hidden,
      #allrecords.hidden,
      .invite.hidden,
      #invite[aria-hidden="true"] {
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
  }

  if (initialOpeningOnly && !document.getElementById('farha-opening-only-style')) {
    const style = document.createElement('style');
    style.id = 'farha-opening-only-style';
    style.textContent = `
      #invitation-container,
      #main-content,
      #invite,
      #site,
      .site,
      #allrecords,
      .invite,
      .hero,
      #hero,
      .stage,
      #stage,
      .card,
      .wrap,
      .sheet {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
        pointer-events: none !important;
      }
      body {
        overflow: hidden !important;
      }
    `;
    document.head.appendChild(style);
  }

  const TEMPLATE_META = {
    jathuandthanu: { arabicName: 'Ã˜Â¬Ã˜Â§Ã˜Â«Ã™Ë† Ã™Ë†Ã˜Â«Ã˜Â§Ã™â€ Ã™Ë†' },
    royal: { arabicName: 'Ã˜Â§Ã™â€žÃ™â€¦Ã™â€žÃ™Æ’Ã™Å ' },
    majestic: { arabicName: 'Ã™â€¦Ã˜Â§Ã˜Â¬Ã˜Â³Ã˜ÂªÃ™Å Ã™Æ’' },
    twilight: { arabicName: 'Ã˜ÂªÃ™Ë†Ã™Å Ã™â€žÃ˜Â§Ã™Å Ã˜Âª' },
    imperial: { arabicName: 'Ã˜Â¥Ã™â€¦Ã˜Â¨Ã˜Â±Ã™Å Ã˜Â§Ã™â€ž' },
    toscana: { arabicName: 'Ã˜ÂªÃ™Ë†Ã˜Â³Ã™Æ’Ã˜Â§Ã™â€ Ã˜Â§' },
    sacredgarden: { arabicName: 'Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â¯Ã™Å Ã™â€šÃ˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã™â€šÃ˜Â¯Ã˜Â³Ã˜Â©' },
    blossomoud: { arabicName: 'Ã˜Â¨Ã™â€žÃ™Ë†Ã˜Â³Ã™Ë†Ã™â€¦ Ã˜Â¹Ã™Ë†Ã˜Â¯' },
    dolcevita: { arabicName: 'Ã˜Â¯Ã™Ë†Ã™â€žÃ˜ÂªÃ˜Â´Ã™Å  Ã™ÂÃ™Å Ã˜ÂªÃ˜Â§' },
    destinationlove: { arabicName: 'Ã˜Â­Ã˜Â¨ Ã˜Â§Ã™â€žÃ˜Â³Ã™ÂÃ˜Â±' },
    classic: { arabicName: 'Ã™Æ’Ã™â€žÃ˜Â§Ã˜Â³Ã™Å Ã™Æ’' },
    bab: { arabicName: 'Ã˜Â¨Ã˜Â§Ã˜Â¨ Ã˜Â§Ã™â€žÃ™ÂÃ˜Â±Ã˜Â­' },
    reverie: { arabicName: 'Ã˜Â­Ã™ÂÃ™â€žÃ™â€¦ Ã™Ë†Ã˜Â±Ã˜Â¯Ã™Å ' },
    ring: { arabicName: 'Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â§Ã˜ÂªÃ™â€¦' },
    letter: { arabicName: 'Ã˜Â±Ã˜Â³Ã˜Â§Ã™â€žÃ˜Â©' },
    disney: { arabicName: 'Ã˜Â¯Ã™Å Ã˜Â²Ã™â€ Ã™Å ' },
    rozana: { arabicName: 'Ã˜Â±Ã™Ë†Ã˜Â²Ã™â€ Ã˜Â©' },
    hadeel: { arabicName: 'Ã™â€¡Ã˜Â¯Ã™Å Ã™â€ž' },
    wisal: { arabicName: 'Ã™Ë†Ã™ÂÃ˜ÂµÃ˜Â§Ã™â€ž' },
    vangogh: { arabicName: 'Ã™â€žÃ™Å Ã™â€žÃ˜Â© Ã˜Â§Ã™â€žÃ™â€ Ã˜Â¬Ã™Ë†Ã™â€¦' },
    blush: { arabicName: 'Ã™Ë†Ã˜Â±Ã˜Â¯Ã˜Â©' },
  };

  const MUSIC_SELECTORS = [
    '#bgMusic',
    '#invitation-audio',
    '#weiAudio',
    'audio[data-farha-slot="music"]',
    'audio[data-role="bg-music"]',
    'main audio[loop]',
    '#allrecords audio[loop]',
  ].join(', ');

  const NATIVE_AUDIO_BUTTON_SELECTORS = [
    '#musicToggle',
    '#weiAudioBtn',
    '#da3wa-music',
  ].join(', ');

  const FALLBACK_OVERLAY_FONT_LIBRARY = [
    { id: 'tajawal', family: 'Tajawal', nameAr: 'تجوال', nameEn: 'Tajawal' },
    { id: 'cairo', family: 'Cairo', nameAr: 'القاهرة', nameEn: 'Cairo' },
    { id: 'noto-kufi-arabic', family: 'Noto Kufi Arabic', nameAr: 'نوتو كوفي', nameEn: 'Noto Kufi Arabic' },
    { id: 'noto-naskh-arabic', family: 'Noto Naskh Arabic', nameAr: 'نوتو نسخ', nameEn: 'Noto Naskh Arabic' },
    { id: 'amiri', family: 'Amiri', nameAr: 'أميري', nameEn: 'Amiri' },
    { id: 'aref-ruqaa', family: 'Aref Ruqaa', nameAr: 'عرف رقعة', nameEn: 'Aref Ruqaa' },
    { id: 'reem-kufi', family: 'Reem Kufi', nameAr: 'ريم كوفي', nameEn: 'Reem Kufi' },
    { id: 'el-messiri', family: 'El Messiri', nameAr: 'المسيري', nameEn: 'El Messiri' },
    { id: 'changa', family: 'Changa', nameAr: 'تشانغا', nameEn: 'Changa' },
    { id: 'marhey', family: 'Marhey', nameAr: 'مرحي', nameEn: 'Marhey' },
    { id: 'playfair-display', family: 'Playfair Display', nameAr: 'بلايفير', nameEn: 'Playfair Display' },
    { id: 'cormorant-garamond', family: 'Cormorant Garamond', nameAr: 'كورمورانت جاراموند', nameEn: 'Cormorant Garamond' },
    { id: 'cinzel-decorative', family: 'Cinzel Decorative', nameAr: 'سينزل ديكور', nameEn: 'Cinzel Decorative' },
    { id: 'great-vibes', family: 'Great Vibes', nameAr: 'جريت فايبز', nameEn: 'Great Vibes' },
    { id: 'dm-serif-display', family: 'DM Serif Display', nameAr: 'دي إم سيريف', nameEn: 'DM Serif Display' },
    { id: 'abril-fatface', family: 'Abril Fatface', nameAr: 'أبريل فاتفايس', nameEn: 'Abril Fatface' },
    { id: 'bodoni-moda', family: 'Bodoni Moda', nameAr: 'بودوني مودا', nameEn: 'Bodoni Moda' },
    { id: 'prata', family: 'Prata', nameAr: 'براتا', nameEn: 'Prata' },
    { id: 'bellefair', family: 'Bellefair', nameAr: 'بيليفير', nameEn: 'Bellefair' },
    { id: 'libre-baskerville', family: 'Libre Baskerville', nameAr: 'ليبر باسكرفيل', nameEn: 'Libre Baskerville' },
  ];

  const runtimeState = {
    templateSlug: '',
    manifest: null,
    renderConfig: null,
    preview: false,
    editorAddMode: '',
    showPromoBar: !initialPromoBarDisabled,
    invitationId: null,
    invitationSlug: null,
    styleTag: null,
    promoBarMounted: false,
    scrollLocked: false,
    lockedScrollY: 0,
    themeStyleTag: null,
    audioToggle: null,
    audioSyncHandler: null,
    baseFields: null,
    activeLocale: 'ar',
    languageToggle: null,
    selectedCustomElementId: null,
    selectedNativeElementId: null,
    nativeElementOverrides: {},
    selectedTemplateTextPath: null,
    activeDeviceMode: 'mobile',
    deviceResizeHandler: null,
    activeTextEditor: null,
    entryPassUi: null,
    nativeOverlaySyncHandler: null,
    nativeOverlayRaf: 0,
    editorDock: null,
    editorDockHandler: null,
    fontLibrary: FALLBACK_OVERLAY_FONT_LIBRARY,
    fontLibraryPromise: null,
    previewMutationSyncRaf: 0,
    previewMutationObserver: null,
  };
  let promoGuardObserver = null;
  let nativeOpeningObserver = null;

  const templateBindingOverrides = {
    sacredgarden: {
      openingNames: { method: 'text', selector: '#rec2487446043 [data-elem-id="1763402147625"] .tn-atom, #rec2487446253 [data-elem-id="1772813849329000001"] .tn-atom' },
      openingKicker: { method: 'text', selector: '#rec2487446043 [data-elem-id="176340398328864790"] .tn-atom' },
      openingHint: { method: 'text', selector: '#rec2487446223 [data-elem-id="1782316019612"] .tn-atom' },
      dateText: { method: 'text', selector: '#rec2487446043 [data-elem-id="176340401720454780"] .tn-atom' },
      verseText: { method: 'text', selector: '#rec2487446043 [data-elem-id="1780748008617000003"] .tn-atom' },
      invitationText: { method: 'text', selector: '#rec2487446043 [data-elem-id="1780748008617000005"] .tn-atom' },
      titleCountdown: { method: 'text', selector: '#rec2487446093 [data-elem-id="1771277026942000001"] .tn-atom' },
      titleVenue: { method: 'text', selector: '#rec2487446123 [data-elem-id="1771277026942000001"] .tn-atom' },
      venueName: { method: 'text', selector: '#rec2487446123 [data-elem-id="1772804808869"] .tn-atom' },
      venueAddress: { method: 'text', selector: '#rec2487446123 [data-elem-id="1772813480591000001"] .tn-atom' },
      contactLabel: { method: 'text', selector: '#rec2487446223 [data-elem-id="1763405219328"] .tn-atom, #popuptitle_2487446233' },
      contactName: { method: 'text', selector: '#rec2487446233 .t702__descr' },
      closingNote: { method: 'text', selector: '#rec2487446253 [data-elem-id="1763405219328"] .tn-atom' },
    },
    blossomoud: {
      openingNames: { method: 'text', selector: '[data-elem-id="1779566247730000001"] .tn-atom, [data-elem-id="1763405219328"] .tn-atom' },
      openingHint: { method: 'text', selector: '[data-elem-id="1777183175514000001"] .tn-atom' },
      dateText: { method: 'text', selector: '[data-elem-id="1779566247730000003"] .tn-atom' },
      timeText: { method: 'text', selector: '[data-elem-id="1779626065755000001"] .tn-atom' },
      invitationText: { method: 'text', selector: '[data-elem-id="1779624381838000001"] .tn-atom' },
      venueName: { method: 'text', selector: '[data-elem-id="1779472210551000005"] .tn-atom' },
      venueAddress: { method: 'text', selector: '[data-elem-id="1779545032699000001"] .tn-atom' },
    },
    destinationlove: {
      openingNames: { method: 'text', selector: '[data-elem-id="1739457970056"] .tn-atom, [data-elem-id="1741107633653"] .tn-atom, [data-elem-id="1705236303923"] .tn-atom' },
      openingKicker: { method: 'text', selector: '[data-elem-id="1739457970059"] .tn-atom' },
      invitationText: { method: 'text', selector: '[data-elem-id="1739457970066"] .tn-atom' },
      dateText: { method: 'text', selector: '[data-elem-id="1739457970065"] .tn-atom, [data-elem-id="1741107633658"] .tn-atom' },
      venueName: { method: 'text', selector: '[data-elem-id="1739457970068"] .tn-atom, [data-elem-id="1741107633670"] .tn-atom, [data-elem-id="1739461934117"] .tn-atom' },
      venueAddress: { method: 'text', selector: '[data-elem-id="1739461934122"] .tn-atom' },
      titleProgram: { method: 'text', selector: '[data-elem-id="1739462100511"] .tn-atom' },
      titleVenue: { method: 'text', selector: '[data-elem-id="1739461934107"] .tn-atom' },
      titleNotes: { method: 'text', selector: '[data-elem-id="1741427070967"] .tn-atom' },
      contactLabel: { method: 'text', selector: '[data-elem-id="1741438897474"] .tn-atom' },
      contactName: { method: 'text', selector: '[data-elem-id="1741438897481"] .tn-atom' },
      closingNote: { method: 'text', selector: '[data-elem-id="1705236303918"] .tn-atom' },
    },
    dolcevita: {
      openingNames: { method: 'text', selector: '[data-elem-id="1776948176126"] .tn-atom, [data-elem-id="1710522265391"] .tn-atom' },
      openingHint: { method: 'text', selector: '[data-elem-id="1777183175514000001"] .tn-atom' },
      welcomeMessage: { method: 'text', selector: '[data-elem-id="1705235414679"] .tn-atom' },
      invitationText: { method: 'text', selector: '[data-elem-id="1705235414678"] .tn-atom' },
      titleVenue: { method: 'text', selector: '[data-elem-id="1776866271348000001"] .tn-atom' },
      venueName: { method: 'text', selector: '[data-elem-id="1776866271348000003"] .tn-atom' },
      venueAddress: { method: 'text', selector: '[data-elem-id="1776866271348000004"] .tn-atom' },
      titleNotes: { method: 'text', selector: '[data-elem-id="1741427070967"] .tn-atom' },
      contactLabel: { method: 'text', selector: '#popuptitle_2442651153' },
      contactName: { method: 'text', selector: '[data-elem-id="1772813849329000001"] .tn-atom' },
      closingNote: { method: 'text', selector: '[data-elem-id="1710522265387"] .tn-atom' },
    },
    jathuandthanu: {
      openingNames: { method: 'text', selector: '[data-elem-id="1730310670429"] .tn-atom, [data-elem-id="1710522265391"] .tn-atom' },
      dateText: { method: 'text', selector: '[data-elem-id="1730310670422"] .tn-atom, [data-elem-id="1705235414658"] .tn-atom' },
      venueName: { method: 'text', selector: '[data-elem-id="1730310670428"] .tn-atom' },
      welcomeMessage: { method: 'text', selector: '[data-elem-id="1730310670432"] .tn-atom' },
      invitationText: { method: 'text', selector: '[data-elem-id="1730408987892"] .tn-atom' },
      titleProgram: { method: 'text', selector: '[data-elem-id="1705235414648"] .tn-atom' },
      titleCountdown: { method: 'text', selector: '[data-elem-id="1688561179508"] .tn-atom' },
      titleNotes: { method: 'text', selector: '[data-elem-id="1730375467543"] .tn-atom' },
      contactLabel: { method: 'text', selector: '[data-elem-id="1688212272397"] .tn-atom' },
      contactName: { method: 'text', selector: '[data-elem-id="1730375049860"] .tn-atom' },
      contactPhone: { method: 'text', selector: '[data-elem-id="1730375049855"] .tn-atom, [data-elem-id="1730375049858"] .tn-atom' },
      closingNote: { method: 'text', selector: '[data-elem-id="1710522265387"] .tn-atom' },
    },
    royal: {
      guestName: { method: 'text', selector: '#env-guest-name' },
      welcomeMessage: { method: 'text', selector: '#heroInvite' },
      groomName: { method: 'text', selector: '#groomName' },
      brideName: { method: 'text', selector: '#brideName' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    majestic: {
      welcomeMessage: { method: 'text', selector: '#heroInvite' },
      groomName: { method: 'text', selector: '#groomName' },
      brideName: { method: 'text', selector: '#brideName' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    twilight: {
      groomName: { method: 'text', selector: '#groomName' },
      brideName: { method: 'text', selector: '#brideName' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    imperial: {
      groomName: { method: 'text', selector: '#groomName' },
      brideName: { method: 'text', selector: '#brideName' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    toscana: {
      groomName: { method: 'text', selector: '#groomName' },
      brideName: { method: 'text', selector: '#brideName' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    classic: {
      openingNames: { method: 'text', selector: '#preloaderNames' },
      groomName: { method: 'text', selector: '#heroGroom' },
      brideName: { method: 'text', selector: '#heroBride' },
      welcomeMessage: { method: 'text', selector: '#heroInvite' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    bab: {
      openingNames: { method: 'text', selector: '#coverNames' },
      openingHint: { method: 'text', selector: '#knockHint' },
      groomName: { method: 'text', selector: '#heroGroom' },
      brideName: { method: 'text', selector: '#heroBride' },
      welcomeMessage: { method: 'text', selector: '#heroInvite' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    reverie: {
      openingNames: { method: 'text', selector: '#coverNames' },
      groomName: { method: 'text', selector: '#heroGroom' },
      brideName: { method: 'text', selector: '#heroBride' },
      welcomeMessage: { method: 'text', selector: '#heroInvite' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    ring: {
      openingNames: { method: 'text', selector: '#coverNames' },
      openingHint: { method: 'text', selector: '#hintLabel' },
      groomName: { method: 'text', selector: '#groomName' },
      brideName: { method: 'text', selector: '#brideName' },
      welcomeMessage: { method: 'text', selector: '#heroSub' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      contactLabel: { method: 'text', selector: '#contactLabel' },
      contactName: { method: 'text', selector: '#contactName' },
      contactPhone: { method: 'text', selector: '#contactPhoneText' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    letter: {
      openingKicker: { method: 'text', selector: '#coverKicker' },
      openingNames: { method: 'text', selector: '#coverNames' },
      openingHint: { method: 'text', selector: '#coverHint' },
      groomName: { method: 'text', selector: '#groomName' },
      brideName: { method: 'text', selector: '#brideName' },
      welcomeMessage: { method: 'text', selector: '#heroSub' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    disney: {
      openingNames: { method: 'text', selector: '#preloaderNames' },
      groomName: { method: 'text', selector: '#heroGroom' },
      brideName: { method: 'text', selector: '#heroBride' },
      welcomeMessage: { method: 'text', selector: '#heroInvite' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    rozana: {
      openingNames: { method: 'text', selector: '#coverNames' },
      openingHint: { method: 'text', selector: '#coverHint' },
      groomName: { method: 'text', selector: '#heroGroom' },
      brideName: { method: 'text', selector: '#heroBride' },
      dateText: { method: 'text', selector: '#wipeDate, #weddingDate' },
      timeText: { method: 'text', selector: '#wipeTime, #weddingTime' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      venueName: { method: 'text', selector: '#heroVenue, #venueName' },
      venueAddress: { method: 'text', selector: '#heroAddr, #venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    hadeel: {
      groomName: { method: 'text', selector: '#heroGroom' },
      brideName: { method: 'text', selector: '#heroBride' },
      welcomeMessage: { method: 'text', selector: '#heroInvite' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    wisal: {
      openingNames: { method: 'text', selector: '#coverNames' },
      openingHint: { method: 'text', selector: '#coverHint' },
      groomName: { method: 'text', selector: '#heroGroom' },
      brideName: { method: 'text', selector: '#heroBride' },
      dateText: { method: 'text', selector: '#wipeDate, #weddingDate' },
      timeText: { method: 'text', selector: '#wipeTime, #weddingTime' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      venueName: { method: 'text', selector: '#heroVenue, #venueName' },
      venueAddress: { method: 'text', selector: '#heroAddr, #venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    vangogh: {
      openingNames: { method: 'text', selector: '#preloaderNames' },
      groomName: { method: 'text', selector: '#heroGroom' },
      brideName: { method: 'text', selector: '#heroBride' },
      welcomeMessage: { method: 'text', selector: '#heroInvite' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
    blush: {
      openingKicker: { method: 'text', selector: '#coverKicker' },
      openingNames: { method: 'text', selector: '#coverNames' },
      openingHint: { method: 'text', selector: '#coverHint' },
      groomName: { method: 'text', selector: '#heroGroom' },
      brideName: { method: 'text', selector: '#heroBride' },
      welcomeMessage: { method: 'text', selector: '#heroInvite' },
      verseText: { method: 'text', selector: '#verseText' },
      invitationText: { method: 'text', selector: '#invitationText' },
      weddingDate: { method: 'computedDate', selector: '#weddingDate' },
      timeText: { method: 'text', selector: '#weddingTime' },
      venueName: { method: 'text', selector: '#venueName' },
      venueAddress: { method: 'text', selector: '#venueAddr' },
      locationLink: { method: 'attribute', selector: '#mapBtn', attribute: 'href' },
      closingNote: { method: 'text', selector: '#closingNote' },
      closingHashtag: { method: 'text', selector: '#closingHashtag' },
    },
  };

  const templateSectionSelectorOverrides = {
    sacredgarden: {
      countdown: ['#rec2487446093'],
      timeline: ['#rec2487446103'],
      rsvp: ['#rec2487446223', '#rec2487446233'],
      notes: ['#rec2487446253'],
    },
    blossomoud: {
      countdown: ['#rec2443433753'],
      timeline: ['#rec2443433773'],
      notes: ['#rec2443433803'],
      rsvp: ['#rec2443433813'],
      calendar: ['#rec2443433823'],
    },
    destinationlove: {
      timeline: ['#rec1141006126'],
      notes: ['#rec1141006181'],
      rsvp: ['#rec1141006156', '#rec1141006166'],
      calendar: ['#rec1141006176'],
    },
  };

  const fallbackBindings = {
    groomName: { method: 'text', selector: '#groomName, #heroGroom' },
    groom: { method: 'text', selector: '#groomName, #heroGroom' },
    brideName: { method: 'text', selector: '#brideName, #heroBride' },
    bride: { method: 'text', selector: '#brideName, #heroBride' },
    guestName: { method: 'text', selector: '#env-guest-name' },
    openingKicker: { method: 'text', selector: '#coverKicker, .cover__kick, .cover-kicker, .env__kicker, .preloader-cta__label', skipIfEmpty: true },
    openingNames: { method: 'text', selector: '#coverNames, .cover__names, .env__names, .cover-names', skipIfEmpty: true },
    openingHint: { method: 'text', selector: '#coverHint, #knockHint, .cover__hint, .env__hint, .preloader-text, .tap-hint', skipIfEmpty: true },
    openingPoem: { method: 'text', selector: '.cover__poem', skipIfEmpty: true },
    openingVideo: { method: 'media', selector: '#preloaderVideo, #doorVid, #weiVideo, [data-farha-slot="opening-video"]', skipIfEmpty: true },
    openingPoster: { method: 'backgroundImage', selector: '#preloader, #preloaderPoster, #poster-container, #opening-screen, #cover, #gate, #envelope-screen, [data-farha-slot="opening-poster"]', skipIfEmpty: true },
    openingBackgroundImage: { method: 'backgroundImage', selector: '#preloader, #preloaderPoster, #poster-container, #opening-screen, #cover, #gate, #envelope-screen, [data-farha-slot="opening-poster"]', skipIfEmpty: true },
    openingEyebrow: { method: 'text', selector: '.hero__eyebrow', skipIfEmpty: true },
    titleInvitation: { method: 'text', selector: '.invitation .sec__title, .invitation .section__title, .sheet__kick, .card__kick, .sec-title span', skipIfEmpty: true },
    titleCountdown: { method: 'text', selector: '.count .sec__title, .when .section__title', skipIfEmpty: true },
    titleProgram: { method: 'text', selector: '.program .sec__title, .program .section__title, #program-section h2', skipIfEmpty: true },
    titleVenue: { method: 'text', selector: '.venue .sec__title, .venue .section__title', skipIfEmpty: true },
    titleNotes: { method: 'text', selector: '.notes .sec__title, .notes .section__title', skipIfEmpty: true },
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
    musicUrl: { method: 'media', selector: MUSIC_SELECTORS },
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

  const defaultSectionSelectors = {
    gallery: ['#gallery-section', '#da3wa-mem'],
    countdown: ['#countdown-section', '#countdown', '.count', '.when'],
    timeline: ['#program-section', '#timeline', '.program'],
    rsvp: ['#rsvp-section', '#da3wa-rsvp'],
    notes: ['#notes-section', '#notesList', '.notes'],
    calendar: ['#calendar-section', '#da3wa-cal'],
  };

  function buildTemplateBindings(slug) {
    return {
      ...fallbackBindings,
      ...(templateBindingOverrides[slug] || {}),
    };
  }

  function buildTemplateSectionSelectors(slug) {
    return {
      ...defaultSectionSelectors,
      ...(templateSectionSelectorOverrides[slug] || {}),
    };
  }

  const STATIC_FIELD_TRANSLATIONS = {
    openingKicker: {
      selector: '#coverKicker, .cover__kick, .cover-kicker, .env__kicker, .preloader-cta__label',
      en: 'Wedding Invitation',
    },
    openingHint: {
      selector: '#coverHint, #knockHint, .cover__hint, .env__hint, .preloader-text, .tap-hint',
      en: 'Tap to open the invitation',
    },
    titleInvitation: {
      selector: '.invitation .sec__title, .invitation .section__title, .sheet__kick, .card__kick, .sec-title span',
      en: 'Invitation',
    },
    titleCountdown: {
      selector: '.count .sec__title, .when .section__title, .countdown-title, #countdownTitle',
      en: 'Countdown',
    },
    titleProgram: {
      selector: '.program .sec__title, .program .section__title, #program-section h2, .program-title',
      en: 'Event Schedule',
    },
    titleVenue: {
      selector: '.venue .sec__title, .venue .section__title, #venue-section h2, .venue-title',
      en: 'Venue',
    },
    titleNotes: {
      selector: '.notes .sec__title, .notes .section__title, #notes-section h2, .notes-title',
      en: 'Notes',
    },
    contactLabel: {
      selector: '#contactLabel, .contact__label, .rsvp-title',
      en: 'Contact & RSVP',
    },
  };

  const STATIC_TEXT_TRANSLATIONS = {
    en: {
      'Ã˜Â¨Ã˜Â·Ã˜Â§Ã™â€šÃ˜Â© Ã˜Â¯Ã˜Â¹Ã™Ë†Ã˜Â©': 'Invitation Card',
      'Ã˜Â¨Ã˜Â§Ã˜Â¨ Ã˜Â¹Ã™â€žÃ™â€° Ã™ÂÃ˜Â±Ã˜Â­Ã™â€ Ã˜Â§': 'A Door to Our Joy',
      'Ã™â€¦Ã™Æ’Ã˜Â§Ã™â€  Ã˜Â§Ã™â€žÃ˜Â­Ã™ÂÃ™â€ž': 'Venue',
      'Ã˜Â§Ã™â€žÃ™â€¦Ã™Æ’Ã˜Â§Ã™â€ ': 'Venue',
      'Ã˜Â§Ã™â€žÃ™â€¦Ã™Æ’Ã˜Â§Ã™â€  Ã™Ë†Ã˜Â§Ã™â€žÃ˜Â²Ã™â€¦Ã˜Â§Ã™â€ ': 'Venue & Time',
      'Ã˜Â§Ã™â€žÃ˜Â¹Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜ÂªÃ™â€ Ã˜Â§Ã˜Â²Ã™â€žÃ™Å ': 'Countdown',
      'Ã˜Â§Ã™â€žÃ˜Â¹Ã˜Â§Ã˜Â¦Ã™â€žÃ˜Â§Ã˜Âª': 'Families',
      'Ã˜Â¹Ã˜Â§Ã˜Â¦Ã™â€žÃ˜Â§Ã˜ÂªÃ™â€ Ã˜Â§': 'Our Families',
      'Ã˜Â§Ã™â€žÃ˜Â¨Ã˜Â±Ã™â€ Ã˜Â§Ã™â€¦Ã˜Â¬': 'Event Schedule',
      'Ã˜ÂªÃ™ÂÃ˜Â§Ã˜ÂµÃ™Å Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â¹Ã™Ë†Ã˜Â©': 'Invitation Details',
      'Ã˜ÂªÃ˜Â£Ã™Æ’Ã™Å Ã˜Â¯ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â¶Ã™Ë†Ã˜Â±': 'RSVP',
      'Ã™â€žÃ™â€žÃ˜ÂªÃ™Ë†Ã˜Â§Ã˜ÂµÃ™â€ž Ã™Ë†Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â£Ã™Æ’Ã™Å Ã˜Â¯': 'Contact & RSVP',
      'Ã˜Â§Ã˜Â¶Ã˜ÂºÃ˜Â· Ã™â€žÃ™ÂÃ˜ÂªÃ˜Â­ Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â¹Ã™Ë†Ã˜Â©': 'Tap to open the invitation',
      'Ã˜Â§Ã˜Â¶Ã˜ÂºÃ˜Â· Ã™â€žÃ™ÂÃ˜ÂªÃ˜Â­ Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â¹Ã™Ë†Ã˜Â©...': 'Tap to open the invitation',
      'Ã˜Â§Ã˜Â¶Ã˜ÂºÃ˜Â· Ã˜Â¹Ã™â€žÃ™â€° Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â§Ã˜Â´Ã˜Â©': 'Tap the screen',
      'Ã˜Â§Ã˜Â¶Ã˜ÂºÃ˜Â· Ã˜Â¹Ã™â€žÃ™â€° Ã˜Â§Ã™â€žÃ˜Â¸Ã˜Â±Ã™Â': 'Tap the envelope',
      'Ã˜Â¯Ã™â€š Ã™â€žÃ™ÂÃ˜ÂªÃ˜Â­ Ã˜Â§Ã™â€žÃ˜Â¯Ã˜Â¹Ã™Ë†Ã˜Â©': 'Knock to open the invitation',
      'Ã˜Â§Ã™Æ’Ã˜ÂªÃ˜Â´Ã™Â Ã˜Â§Ã™â€žÃ˜ÂªÃ™ÂÃ˜Â§Ã˜ÂµÃ™Å Ã™â€ž': 'Discover the details',
    },
  };

  document.addEventListener('DOMContentLoaded', () => {
    runtimeState.templateSlug = window.location.pathname.split('/').filter(Boolean)[0] || '';
    runtimeState.invitationSlug = window.location.pathname.includes('/invite/')
      ? window.location.pathname.split('/').filter(Boolean).pop() || null
      : runtimeState.invitationSlug;
    runtimeState.manifest = {
      runtimeBindings: {
        fieldBindings: buildTemplateBindings(runtimeState.templateSlug),
        sectionSelectors: buildTemplateSectionSelectors(runtimeState.templateSlug),
      },
    };

    ensureSharedFontLibraryStyles();
    void loadSharedFontLibrary();
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

  function normalizeTextOverrides(rawOverrides) {
    if (!rawOverrides) return [];

    if (Array.isArray(rawOverrides)) {
      return rawOverrides
        .map((item, index) => ({
          id: item?.id || `override-${index}`,
          path: item?.path || item?.id || '',
          text: item?.text == null ? '' : String(item.text),
        }))
        .filter((item) => item.path);
    }

    if (typeof rawOverrides === 'object') {
      return Object.entries(rawOverrides)
        .map(([path, text], index) => ({
          id: `override-${index}`,
          path,
          text: text == null ? '' : String(text),
        }))
        .filter((item) => item.path);
    }

    return [];
  }

  function ensureSharedFontLibraryStyles() {
    if (document.querySelector('link[data-farha-font-library-styles="true"]')) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/api/public/font-library/styles';
    link.dataset.farhaFontLibraryStyles = 'true';
    document.head.appendChild(link);
  }

  function normalizeOverlayFontLibrary(rawFonts) {
    const source = Array.isArray(rawFonts) && rawFonts.length ? rawFonts : FALLBACK_OVERLAY_FONT_LIBRARY;
    const seen = new Set();

    return source
      .map((entry, index) => {
        const family = String(entry?.family || '').trim();
        if (!family || seen.has(family)) {
          return null;
        }

        seen.add(family);
        return {
          id: String(entry?.id || `font-${index}`),
          family,
          nameAr: String(entry?.nameAr || family).trim(),
          nameEn: String(entry?.nameEn || family).trim(),
        };
      })
      .filter(Boolean);
  }

  function getOverlayFontLabel(font) {
    if (!font) {
      return '';
    }

    const nameAr = String(font.nameAr || '').trim();
    const nameEn = String(font.nameEn || '').trim();
    if (nameAr && nameEn && nameAr !== nameEn) {
      return `${nameAr} / ${nameEn}`;
    }
    return nameAr || nameEn || String(font.family || '').trim();
  }

  async function loadSharedFontLibrary() {
    if (runtimeState.fontLibraryPromise) {
      return runtimeState.fontLibraryPromise;
    }

    runtimeState.fontLibraryPromise = fetch('/api/public/font-library', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || 'Failed to load font library');
        }

        const nextFonts = normalizeOverlayFontLibrary(payload?.data?.all);
        if (nextFonts.length) {
          runtimeState.fontLibrary = nextFonts;
        }
        return runtimeState.fontLibrary;
      })
      .catch(() => runtimeState.fontLibrary)
      .finally(() => {
        runtimeState.fontLibraryPromise = null;
        queueNativeOverlaySync();
      });

    return runtimeState.fontLibraryPromise;
  }

  function cssColorToHex(value, fallback = '#7f2a1f') {
    const candidate = String(value || '').trim();
    if (!candidate || typeof document === 'undefined' || !document.body) {
      return fallback;
    }

    const probe = document.createElement('span');
    probe.style.color = '';
    probe.style.color = candidate;
    if (!probe.style.color) {
      return fallback;
    }

    probe.style.display = 'none';
    document.body.appendChild(probe);
    const resolved = window.getComputedStyle(probe).color || '';
    probe.remove();

    const match = resolved.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!match) {
      return fallback;
    }

    return `#${[match[1], match[2], match[3]]
      .map((item) => Number(item).toString(16).padStart(2, '0'))
      .join('')}`;
  }

  function populateNativeOverlayFontSelect(select, currentValue = '') {
    if (!select) {
      return;
    }

    const fonts = normalizeOverlayFontLibrary(runtimeState.fontLibrary);
    const normalizedValue = String(currentValue || '').trim();
    select.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'الخط الأصلي';
    select.appendChild(defaultOption);

    fonts.forEach((font) => {
      const option = document.createElement('option');
      option.value = font.family;
      option.textContent = getOverlayFontLabel(font);
      option.style.fontFamily = `'${font.family}', sans-serif`;
      select.appendChild(option);
    });

    if (normalizedValue && !fonts.some((font) => font.family === normalizedValue)) {
      const customOption = document.createElement('option');
      customOption.value = normalizedValue;
      customOption.textContent = normalizedValue;
      customOption.style.fontFamily = normalizedValue;
      select.appendChild(customOption);
    }

    select.value = normalizedValue;
  }

  function applyTextOverrides(rawOverrides) {
    const overrides = normalizeTextOverrides(rawOverrides);
    if (!overrides.length) return;

    const bindings =
      (runtimeState.manifest && runtimeState.manifest.runtimeBindings && runtimeState.manifest.runtimeBindings.fieldBindings)
      || fallbackBindings
      || {};

    overrides.forEach((override) => {
      const path = override.path;
      const text = override.text;
      const binding = bindings[path];

      if (binding && binding.method === 'text' && binding.selector) {
        queryAll(binding.selector).forEach((node) => {
          if (document.activeElement === node || node.contains?.(document.activeElement)) return;
          node.textContent = text;
        });
      }

      queryAll(`[data-farha-studio-field="${path}"], [data-farha-text-path="${path}"]`).forEach((node) => {
        if (document.activeElement === node || node.contains?.(document.activeElement)) return;
        node.textContent = text;
      });
    });
  }

  function normalizeTextStyleOverrides(rawOverrides) {
    if (!rawOverrides || typeof rawOverrides !== 'object' || Array.isArray(rawOverrides)) {
      return [];
    }

    return Object.entries(rawOverrides)
      .map(([path, style]) => {
        if (!path || !style || typeof style !== 'object' || Array.isArray(style)) {
          return null;
        }

        const fontFamily = style.fontFamily == null ? '' : String(style.fontFamily).trim();
        const color = style.color == null ? '' : String(style.color).trim();
        if (!fontFamily && !color) {
          return null;
        }

        return {
          path,
          fontFamily,
          color,
        };
      })
      .filter(Boolean);
  }

  function applyTextStyleOverrides(rawOverrides) {
    const overrides = normalizeTextStyleOverrides(rawOverrides);
    if (!overrides.length) {
      return;
    }

    ensureSharedFontLibraryStyles();

    const bindings =
      (runtimeState.manifest && runtimeState.manifest.runtimeBindings && runtimeState.manifest.runtimeBindings.fieldBindings)
      || fallbackBindings
      || {};

    overrides.forEach((override) => {
      const boundNodes = [];
      const binding = bindings[override.path];

      if (binding && binding.method === 'text' && binding.selector) {
        boundNodes.push(...queryAll(binding.selector));
      }

      boundNodes.push(...queryAll(`[data-farha-studio-field="${override.path}"], [data-farha-text-path="${override.path}"]`));

      Array.from(new Set(boundNodes)).forEach((node) => {
        const textNode = getNativeTextEditTarget(node) || node;
        if (!textNode) {
          return;
        }

        if (override.color) {
          textNode.style.color = override.color;
        }

        if (override.fontFamily) {
          textNode.style.fontFamily = `"${String(override.fontFamily).replace(/"/g, '')}"`;
        }
      });
    });
  }

  function getTextLockMap() {
    const locks = runtimeState.renderConfig?.ui?.textLocks;
    return locks && typeof locks === 'object' && !Array.isArray(locks) ? locks : {};
  }

  function isTextPathLocked(path) {
    return Boolean(path && getTextLockMap()[path]);
  }

  function getStudioFieldLabel(path) {
    return runtimeState.manifest?.editableFields?.find((field) => field.key === path)?.labelAr || path;
  }

  function findTemplateTextNode(path, bindingsOverride = null) {
    if (!path) {
      return null;
    }

    const directNode = queryAll(`[data-farha-studio-field="${path}"], [data-farha-text-path="${path}"]`)
      .find((node) => node && typeof node.textContent === 'string');
    if (directNode) {
      return directNode;
    }

    const bindings =
      bindingsOverride
      || (runtimeState.manifest && runtimeState.manifest.runtimeBindings && runtimeState.manifest.runtimeBindings.fieldBindings)
      || fallbackBindings
      || {};
    const binding = bindings[path];
    if (!binding || binding.method !== 'text' || !binding.selector) {
      return null;
    }

    return queryAll(binding.selector).find((node) => node && typeof node.textContent === 'string') || null;
  }

  function buildTemplateTextCatalog(bindingsOverride = null) {
    const bindings =
      bindingsOverride
      || (runtimeState.manifest && runtimeState.manifest.runtimeBindings && runtimeState.manifest.runtimeBindings.fieldBindings)
      || fallbackBindings
      || {};

    return Object.entries(bindings)
      .filter(([, binding]) => binding && binding.method === 'text')
      .map(([path, binding]) => {
        const node = findTemplateTextNode(path, bindings);
        const rawText = node?.innerText || node?.textContent || '';
        return {
          path,
          label: getStudioFieldLabel(path),
          selector: binding.selector || path,
          locked: isTextPathLocked(path),
          text: String(rawText || '').trim(),
        };
      })
      .filter((item) => item.path);
  }

  function postTemplateTextCatalog(bindingsOverride = null) {
    window.parent.postMessage({
      type: 'FARHA_TEMPLATE_TEXT_CATALOG',
      payload: {
        items: buildTemplateTextCatalog(bindingsOverride),
      },
    }, '*');
  }

  function buildNativeElementCatalog() {
    const catalogMap = new Map();

    getAllNativeElementCandidates().forEach((node) => {
      const id = buildNativeElementId(node);
      if (!id || catalogMap.has(id)) {
        return;
      }

      const override = runtimeState.nativeElementOverrides?.[id] || {};
      catalogMap.set(id, {
        id,
        label: override.label || getNativeElementLabel(node),
        selector: override.selector || getNativeElementSelectorHint(node) || id,
        kind: override.kind || getNativeElementKind(node),
        previewUrl: getNativeElementPreviewUrl(node),
        basePreviewUrl: getNativeElementBasePreviewUrl(node),
        aspectRatio: getNodeAspectRatio(node),
        locked: Boolean(override.locked),
        hidden: Boolean(override.hidden),
      });
    });

    return Array.from(catalogMap.values());
  }

  function postNativeElementCatalog() {
    window.parent.postMessage({
      type: 'FARHA_NATIVE_ELEMENT_CATALOG',
      payload: {
        items: buildNativeElementCatalog(),
      },
    }, '*');
  }

  function postStudioCatalogs(bindingsOverride = null) {
    if (!runtimeState.preview) {
      return;
    }

    postTemplateTextCatalog(bindingsOverride);
    postNativeElementCatalog();
  }

  function syncTemplateTextSelection() {
    queryAll('.farha-studio-editable').forEach((node) => {
      const path = node.dataset.farhaStudioField || '';
      const isSelected = String(path) === String(runtimeState.selectedTemplateTextPath || '');
      const locked = isTextPathLocked(path);
      node.dataset.farhaSelected = isSelected ? 'true' : 'false';
      node.dataset.farhaLocked = locked ? 'true' : 'false';
      node.setAttribute('aria-disabled', locked ? 'true' : 'false');
    });
  }

  function selectTemplateText(path, options = {}) {
    runtimeState.selectedTemplateTextPath = path || null;
    if (path && !options.preserveNativeSelection) {
      selectNativeElement(null, { silent: true });
    }
    syncTemplateTextSelection();

    window.parent.postMessage({
      type: 'FARHA_TEMPLATE_TEXT_SELECT',
      payload: path
        ? {
            path,
            text: options.text ?? '',
            label: options.label || getStudioFieldLabel(path),
            locked: isTextPathLocked(path),
            preserveNativeSelection: Boolean(options.preserveNativeSelection),
          }
        : { path: null },
    }, '*');
  }

  function detectViewportDeviceMode() {
    const viewportWidth = window.innerWidth || document.documentElement?.clientWidth || 390;
    if (viewportWidth <= 520) {
      return 'mobile';
    }
    if (viewportWidth <= 980) {
      return 'tablet';
    }
    return 'desktop';
  }

  function resolveRenderDeviceMode(renderConfig) {
    return renderConfig?.ui?.deviceMode || detectViewportDeviceMode();
  }

  function resolveCustomElementForDevice(element, deviceMode) {
    if (!element || !deviceMode) {
      return element;
    }

    const deviceOverrides = element.deviceOverrides && typeof element.deviceOverrides === 'object'
      ? element.deviceOverrides[deviceMode]
      : null;

    if (!deviceOverrides || typeof deviceOverrides !== 'object') {
      return element;
    }

    return {
      ...element,
      ...deviceOverrides,
      deviceOverrides: element.deviceOverrides,
    };
  }

  function normalizeNativeElementOverrides(rawOverrides) {
    if (Array.isArray(rawOverrides)) {
      return rawOverrides.reduce((accumulator, item) => {
        if (!item || typeof item !== 'object' || !item.id) {
          return accumulator;
        }

        accumulator[item.id] = item;
        return accumulator;
      }, {});
    }

    if (!rawOverrides || typeof rawOverrides !== 'object') {
      return {};
    }

    return rawOverrides;
  }

  function ensureNativeElementStyleTag() {
    if (document.getElementById('farha-native-editable-style')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'farha-native-editable-style';
    style.textContent = `
      .farha-native-editable-target {
        pointer-events: auto !important;
          transition: box-shadow 0.18s ease, outline-color 0.18s ease, opacity 0.18s ease;
      }
      .farha-native-editable-target[data-farha-selected="true"] {
        outline: 2px solid rgba(127, 42, 31, 0.82) !important;
        outline-offset: 4px !important;
        box-shadow: 0 0 0 3px rgba(255,255,255,0.88), 0 0 0 6px rgba(127, 42, 31, 0.18) !important;
        cursor: move !important;
      }
      .farha-native-editable-target[data-farha-selected="true"][data-farha-locked="true"] {
        outline-style: dashed !important;
        cursor: not-allowed !important;
      }
      #farha-native-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        z-index: 2147483000;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.16s ease;
      }
      #farha-native-overlay[data-visible="true"] {
        opacity: 1;
      }
      .farha-native-overlay__toolbar {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        justify-content: flex-start;
        gap: 8px;
        padding: 10px;
        border-radius: 24px;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 248, 244, 0.96) 100%);
        box-shadow: 0 20px 46px rgba(15, 23, 42, 0.18);
        border: 1px solid rgba(127, 42, 31, 0.14);
        pointer-events: auto;
        transform: translateY(calc(-100% - 10px));
        max-width: min(92vw, 720px);
        direction: rtl;
        backdrop-filter: blur(14px);
      }
      .farha-native-overlay__toolbar[data-inside="true"] {
        transform: translateY(10px);
      }
      .farha-native-overlay__meta {
        display: grid;
        gap: 4px;
        min-width: 0;
        padding: 2px 4px 2px 2px;
      }
      .farha-native-overlay__label {
        display: inline-flex;
        align-items: center;
        max-width: 180px;
        min-width: 0;
        padding: 0 12px;
        height: 34px;
        border-radius: 999px;
        background: rgba(127, 42, 31, 0.08);
        color: #7f2a1f;
        font: 800 13px/1.1 Tajawal, sans-serif;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .farha-native-overlay__hint {
        color: #6b7280;
        font: 700 10px/1.2 Tajawal, sans-serif;
        padding-inline: 6px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .farha-native-overlay__field {
        display: none;
        align-items: center;
        gap: 8px;
        height: 40px;
        padding: 0 10px;
        border-radius: 999px;
        background: rgba(255, 247, 244, 0.96);
        box-shadow: inset 0 0 0 1px rgba(127, 42, 31, 0.12);
        pointer-events: auto;
      }
      .farha-native-overlay__field[data-visible="true"] {
        display: inline-flex;
      }
      .farha-native-overlay__field-label {
        color: #7f2a1f;
        font: 800 10px/1 Tajawal, sans-serif;
        white-space: nowrap;
      }
      .farha-native-overlay__color {
        width: 30px;
        height: 30px;
        padding: 0;
        border: none;
        border-radius: 999px;
        background: transparent;
        cursor: pointer;
      }
      .farha-native-overlay__select {
        max-width: 190px;
        min-width: 112px;
        height: 30px;
        border: none;
        background: transparent;
        color: #7f2a1f;
        font: 700 11px/1.2 Tajawal, sans-serif;
        outline: none;
        cursor: pointer;
      }
      .farha-native-overlay__btn,
      .farha-native-overlay__handle {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.96);
        color: #7f2a1f;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
        font: 800 12px/1 Tajawal, sans-serif;
        cursor: pointer;
        touch-action: none;
        user-select: none;
        transition: transform 0.16s ease, box-shadow 0.16s ease, background 0.16s ease, color 0.16s ease;
      }
      .farha-native-overlay__btn:hover,
      .farha-native-overlay__handle:hover {
        transform: translateY(-1px);
        box-shadow: 0 14px 28px rgba(15, 23, 42, 0.18);
      }
      .farha-native-overlay__btn[data-locked="true"] {
        background: #7f2a1f;
        color: #fff;
      }
      .farha-native-overlay__btn[data-active="true"] {
        background: #7f2a1f;
        color: #fff;
      }
      .farha-native-overlay__btn--wide {
        width: auto;
        min-width: 62px;
        padding: 0 14px;
        font-size: 11px;
        letter-spacing: 0;
      }
      .farha-native-overlay__btn--danger {
        color: #b42318;
        background: #fff1f2;
      }
      .farha-native-overlay__corner-delete {
        position: absolute;
        top: -12px;
        right: -12px;
        width: 28px;
        height: 28px;
        border: 2px solid #fff;
        border-radius: 999px;
        background: #b42318;
        color: #fff;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.2);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font: 900 14px/1 Tajawal, sans-serif;
        pointer-events: auto;
        cursor: pointer;
        z-index: 3;
      }
      .farha-native-overlay__corner-delete:hover {
        transform: scale(1.04);
      }
      .farha-native-overlay__handle {
        position: absolute;
        right: -14px;
        bottom: -14px;
        width: 34px;
        height: 34px;
        background: #7f2a1f;
        color: #fff;
        font-size: 16px;
        pointer-events: auto;
        cursor: nwse-resize;
      }
      .farha-native-overlay__handle--rotate {
        left: -14px;
        right: auto;
        cursor: grab;
      }
      @media (max-width: 640px) {
        .farha-native-overlay__toolbar {
          max-width: min(94vw, 92vw);
          border-radius: 22px;
          gap: 6px;
          padding: 8px;
        }
        .farha-native-overlay__meta {
          width: 100%;
        }
        .farha-native-overlay__select {
          max-width: 126px;
          min-width: 94px;
        }
        .farha-native-overlay__btn--wide {
          min-width: 54px;
          padding: 0 12px;
          font-size: 10px;
        }
      }
      #farha-snap-guides {
        position: fixed;
        inset: 0;
        z-index: 2147482500;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.14s ease;
      }
      #farha-snap-guides[data-visible="true"] {
        opacity: 1;
      }
      .farha-snap-guides__line {
        position: absolute;
        background: rgba(127, 42, 31, 0.82);
        box-shadow: 0 0 0 1px rgba(255,255,255,0.65);
        border-radius: 999px;
      }
      .farha-snap-guides__line--v {
        width: 2px;
      }
      .farha-snap-guides__line--h {
        height: 2px;
      }
      .farha-snap-guides__segment {
        position: absolute;
        background: rgba(127, 42, 31, 0.58);
        border-radius: 999px;
        box-shadow: 0 0 0 1px rgba(255,255,255,0.45);
      }
      .farha-snap-guides__segment--h {
        height: 3px;
      }
      .farha-snap-guides__segment--v {
        width: 3px;
      }
    `;
    document.head.appendChild(style);
  }

  function getNativeElementSelectorHint(node) {
    if (!node || !node.tagName) {
      return '';
    }

    if (node.id) {
      return `#${node.id}`;
    }

    if (node.dataset?.farhaSlot) {
      return `[data-farha-slot="${node.dataset.farhaSlot}"]`;
    }

    const stableClasses = Array.from(node.classList || [])
      .filter((className) => className && !className.startsWith('farha-'))
      .slice(0, 2);

    if (stableClasses.length) {
      return `${node.tagName.toLowerCase()}.${stableClasses.join('.')}`;
    }

    return node.tagName.toLowerCase();
  }

  function getNativeElementKind(node) {
    if (!node) {
      return 'native';
    }

    const textTarget = getNativeTextEditTarget(node);
    if (textTarget && !isNativeReplaceableImageNode(node)) {
      const hasBackgroundMedia = window.getComputedStyle(node).backgroundImage !== 'none';
      if (!hasBackgroundMedia) {
        return 'text';
      }
    }

    const targetNode = getNativeImageTarget(node);
    const tagName = (targetNode?.tagName || node?.tagName || '').toLowerCase();
    if (['img', 'video', 'svg', 'canvas', 'picture'].includes(tagName)) {
      return 'media';
    }
    if (window.getComputedStyle(node).backgroundImage !== 'none') {
      return 'media';
    }
    return 'native';
  }

  function getNativeElementLabel(node) {
    if (!node) {
      return 'عنصر من القالب';
    }

    const textLabel = (node.getAttribute('aria-label') || node.getAttribute('title') || node.getAttribute('alt') || '').trim();
    if (textLabel) {
      return textLabel;
    }

    const contentLabel = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (contentLabel) {
      return contentLabel.slice(0, 42);
    }

    if (node.id) {
      return node.id;
    }

    if (node.dataset?.farhaSlot) {
      return node.dataset.farhaSlot;
    }

    const className = Array.from(node.classList || [])
      .filter((item) => item && !item.startsWith('farha-'))[0];
    return className || node.tagName.toLowerCase();
  }

  function buildNativeElementId(node) {
    if (!node) {
      return '';
    }

    if (node.dataset?.farhaNativeId) {
      return node.dataset.farhaNativeId;
    }

    const parts = [];
    let current = node;
    while (current && current !== document.body && current !== document.documentElement) {
      if (current.id) {
        parts.unshift(`${current.tagName.toLowerCase()}#${current.id}`);
        break;
      }

      if (current.dataset?.farhaSlot) {
        parts.unshift(`${current.tagName.toLowerCase()}[slot=${current.dataset.farhaSlot}]`);
        break;
      }

      const parent = current.parentElement;
      if (!parent) {
        break;
      }

      const siblings = Array.from(parent.children).filter(
        (child) => (child.tagName || '').toLowerCase() === (current.tagName || '').toLowerCase(),
      );
      const index = Math.max(0, siblings.indexOf(current));
      const classHint = Array.from(current.classList || [])
        .filter((className) => className && !className.startsWith('farha-'))
        .slice(0, 1)
        .join('.');
      const classSuffix = classHint ? `.${classHint}` : '';
      parts.unshift(`${current.tagName.toLowerCase()}${classSuffix}:nth-of-type(${index + 1})`);
      current = parent;
    }

    const nativeId = parts.join('>');
    node.dataset.farhaNativeId = nativeId;
    return nativeId;
  }

  function isNativeElementCandidate(node) {
      if (!node || node.nodeType !== 1) {
        return false;
      }

      if (node.closest('#farha-custom-elements, .farha-floating-text-editor, #farha-template-bar, #farha-native-overlay, #farha-editor-dock')) {
        return false;
      }

      if (node.matches('html, body, iframe, form, input, textarea, select, option')) {
        return false;
      }

      if (node.closest('form, input, textarea, select')) {
        return false;
      }

      if (node.id === 'allrecords' || node.id === 'invitation-container' || node.id === 'farha-root') {
        return false;
      }

      const style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return false;
      }

      return true;
    }
  
  function resolveNativeElementTarget(startNode) {
    let current = startNode?.nodeType === 1 ? startNode : startNode?.parentElement;
    const explicitEditable = current?.closest?.('.farha-studio-editable, [data-farha-studio-field], [data-farha-text-path]') || null;
    let firstCandidate = null;
    let preferredTextCandidate = null;

    while (current && current !== document.body && current !== document.documentElement) {
      if (current.closest('.farha-custom-element')) {
        return null;
      }

      if (isNativeElementCandidate(current)) {
        firstCandidate = firstCandidate || current;

        if (!explicitEditable) {
          return current;
        }

        const candidateTextTarget = getNativeTextEditTarget(current);
        if (candidateTextTarget === explicitEditable) {
          const editableDescendants = current.querySelectorAll('.farha-studio-editable, [data-farha-studio-field], [data-farha-text-path]').length;
          const candidateStyle = window.getComputedStyle(current);
          const isInlineOnly = candidateStyle.display === 'inline' || candidateStyle.display === 'contents';
          if (editableDescendants <= 1) {
            preferredTextCandidate = current;
          }
          if (
            editableDescendants <= 1
            && (
              candidateStyle.position !== 'static'
              || !isInlineOnly
            )
          ) {
            return current;
          }
        } else if (preferredTextCandidate) {
          return preferredTextCandidate;
        }
      }

      current = current.parentElement;
    }

    return preferredTextCandidate || firstCandidate || null;
  }

  function isCanvasBackgroundTarget(startNode) {
    const node = startNode?.nodeType === 1 ? startNode : startNode?.parentElement;
    if (!node) {
      return true;
    }

    if (node.closest('.farha-custom-element, .farha-floating-text-editor, #farha-native-overlay, #farha-editor-dock')) {
      return false;
    }

    const tagName = (node.tagName || '').toLowerCase();
    if (
      ['img', 'picture', 'video', 'svg', 'canvas', 'button', 'a', 'input', 'textarea', 'select', 'option', 'label'].includes(tagName)
      || node.matches?.('[role="button"], [data-farha-native-action], [data-farha-native-control], [data-farha-action]')
    ) {
      return false;
    }

    if (
      node.classList?.contains('farha-studio-editable')
      || node.dataset?.farhaStudioField
      || node.dataset?.farhaTextPath
      || node.isContentEditable
    ) {
      return false;
    }

    const directText = Array.from(node.childNodes || [])
      .filter((child) => child.nodeType === Node.TEXT_NODE)
      .map((child) => child.textContent || '')
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (directText) {
      return false;
    }

    const explicitLabel = (node.getAttribute('aria-label') || node.getAttribute('title') || node.getAttribute('alt') || '').trim();
    if (explicitLabel) {
      return false;
    }

    return true;
  }

  function setEditorAddMode(mode = '') {
    const normalizedMode = mode === 'text' || mode === 'image' ? mode : '';
    runtimeState.editorAddMode = normalizedMode;
    if (normalizedMode) {
      document.body.dataset.farhaEditorAddMode = normalizedMode;
    } else {
      delete document.body.dataset.farhaEditorAddMode;
    }
  }

  function ensureNativeElementBaseState(node) {
    if (!node) {
      return;
    }

    if (node.dataset.farhaNativeBaseTransform === undefined) {
      const inlineTransform = node.style.transform;
      const computedTransform = window.getComputedStyle(node).transform;
      node.dataset.farhaNativeBaseTransform = inlineTransform || (computedTransform !== 'none' ? computedTransform : '');
    }
    if (node.dataset.farhaNativeBaseOpacity === undefined) {
      node.dataset.farhaNativeBaseOpacity = node.style.opacity || '';
    }
    if (node.dataset.farhaNativeBaseDisplay === undefined) {
      node.dataset.farhaNativeBaseDisplay = node.style.display || '';
    }
    if (node.dataset.farhaNativeBasePointerEvents === undefined) {
      node.dataset.farhaNativeBasePointerEvents = node.style.pointerEvents || '';
    }
    if (node.dataset.farhaNativeBaseTouchAction === undefined) {
      node.dataset.farhaNativeBaseTouchAction = node.style.touchAction || '';
    }
    if (node.dataset.farhaNativeBaseBackgroundImage === undefined) {
      const computedBackgroundImage = window.getComputedStyle(node).backgroundImage;
      node.dataset.farhaNativeBaseBackgroundImage = node.style.backgroundImage || (computedBackgroundImage !== 'none' ? computedBackgroundImage : '');
    }
    if (node.dataset.farhaNativeBaseBackgroundPosition === undefined) {
      node.dataset.farhaNativeBaseBackgroundPosition = node.style.backgroundPosition || '';
    }
    if (node.dataset.farhaNativeBaseBackgroundSize === undefined) {
      node.dataset.farhaNativeBaseBackgroundSize = node.style.backgroundSize || '';
    }
    if (node.dataset.farhaNativeBaseBackgroundColor === undefined) {
      node.dataset.farhaNativeBaseBackgroundColor = node.style.backgroundColor || '';
    }
    if (node.dataset.farhaNativeBaseWidth === undefined) {
      node.dataset.farhaNativeBaseWidth = node.style.width || '';
    }
    if (node.dataset.farhaNativeBaseHeight === undefined) {
      node.dataset.farhaNativeBaseHeight = node.style.height || '';
    }
    if (node.dataset.farhaNativeBaseZIndex === undefined) {
      node.dataset.farhaNativeBaseZIndex = node.style.zIndex || '';
    }
    if (node.dataset.farhaNativeBaseBorderRadius === undefined) {
      node.dataset.farhaNativeBaseBorderRadius = node.style.borderRadius || '';
    }
    if (node.dataset.farhaNativeBaseBorderWidth === undefined) {
      node.dataset.farhaNativeBaseBorderWidth = node.style.borderWidth || '';
    }
    if (node.dataset.farhaNativeBaseBorderColor === undefined) {
      node.dataset.farhaNativeBaseBorderColor = node.style.borderColor || '';
    }
    if (node.dataset.farhaNativeBaseBorderStyle === undefined) {
      node.dataset.farhaNativeBaseBorderStyle = node.style.borderStyle || '';
    }
    if (node.dataset.farhaNativeBaseBoxShadow === undefined) {
      node.dataset.farhaNativeBaseBoxShadow = node.style.boxShadow || '';
    }
    if (node.dataset.farhaNativeBaseSrc === undefined) {
      const mediaNode = ((node.tagName || '').toLowerCase() === 'picture' ? node.querySelector('img') : node);
      node.dataset.farhaNativeBaseSrc = mediaNode?.getAttribute?.('src') || '';
    }
    const imageNode = getNativeImageTarget(node);
    if (imageNode?.dataset?.farhaNativeBaseObjectPosition === undefined) {
      imageNode.dataset.farhaNativeBaseObjectPosition = imageNode.style.objectPosition || '';
    }
    if (imageNode?.dataset?.farhaNativeBaseObjectFit === undefined) {
      imageNode.dataset.farhaNativeBaseObjectFit = imageNode.style.objectFit || '';
    }
    const textTargets = getNativeTextStyleTargets(node);
    textTargets.forEach((textTarget, index) => {
      if (index === 0 && textTarget?.dataset?.farhaNativeBaseText === undefined) {
        textTarget.dataset.farhaNativeBaseText = textTarget.innerText || textTarget.textContent || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseColor === undefined) {
        textTarget.dataset.farhaNativeBaseColor = textTarget.style.color || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseFontFamily === undefined) {
        textTarget.dataset.farhaNativeBaseFontFamily = textTarget.style.fontFamily || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseFontSize === undefined) {
        textTarget.dataset.farhaNativeBaseFontSize = textTarget.style.fontSize || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseFontWeight === undefined) {
        textTarget.dataset.farhaNativeBaseFontWeight = textTarget.style.fontWeight || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseFontStyle === undefined) {
        textTarget.dataset.farhaNativeBaseFontStyle = textTarget.style.fontStyle || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseLineHeight === undefined) {
        textTarget.dataset.farhaNativeBaseLineHeight = textTarget.style.lineHeight || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseLetterSpacing === undefined) {
        textTarget.dataset.farhaNativeBaseLetterSpacing = textTarget.style.letterSpacing || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseTextAlign === undefined) {
        textTarget.dataset.farhaNativeBaseTextAlign = textTarget.style.textAlign || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseTextTransform === undefined) {
        textTarget.dataset.farhaNativeBaseTextTransform = textTarget.style.textTransform || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseTextDecoration === undefined) {
        textTarget.dataset.farhaNativeBaseTextDecoration = textTarget.style.textDecoration || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseDirection === undefined) {
        textTarget.dataset.farhaNativeBaseDirection = textTarget.style.direction || '';
      }
      if (textTarget?.dataset?.farhaNativeBaseTextShadow === undefined) {
        textTarget.dataset.farhaNativeBaseTextShadow = textTarget.style.textShadow || '';
      }
    });

    node.classList.add('farha-native-editable-target');
    node.dataset.farhaNativeManaged = 'true';
    buildNativeElementId(node);
  }

  function getNativeImageTarget(node) {
    if (!node) {
      return null;
    }

    const tagName = (node.tagName || '').toLowerCase();
    if (tagName === 'picture') {
      return node.querySelector('img');
    }

    if (['img', 'video', 'svg', 'canvas'].includes(tagName)) {
      return node;
    }

    const directMediaChild = node.querySelector(':scope > picture img, :scope > img, :scope > video, :scope > svg, :scope > canvas');
    if (directMediaChild) {
      return directMediaChild;
    }

    const nestedMediaChild = node.querySelector('picture img, img, video, svg, canvas');
    if (nestedMediaChild) {
      return nestedMediaChild;
    }

    return node;
  }

  function extractCssUrl(value) {
    if (!value || value === 'none') {
      return '';
    }

    const match = String(value).match(/url\((['"]?)(.*?)\1\)/i);
    return match?.[2] || '';
  }

  function getNodeAspectRatio(node) {
    const rect = node?.getBoundingClientRect?.();
    if (!rect || rect.height <= 0 || rect.width <= 0) {
      return 390 / 844;
    }

    return rect.width / rect.height;
  }

  function getNativeElementPreviewUrl(node) {
    if (!node) {
      return '';
    }

    ensureNativeElementBaseState(node);
    const targetNode = getNativeImageTarget(node);
    const tagName = (targetNode?.tagName || '').toLowerCase();

    if (tagName === 'img') {
      return targetNode.currentSrc || targetNode.getAttribute('src') || node.dataset.farhaNativeBaseSrc || '';
    }

    const inlineBackground = node.style.backgroundImage && node.style.backgroundImage !== 'none'
      ? node.style.backgroundImage
      : '';
    const computedBackground = window.getComputedStyle(node).backgroundImage;
    return extractCssUrl(inlineBackground) || extractCssUrl(computedBackground) || extractCssUrl(node.dataset.farhaNativeBaseBackgroundImage || '');
  }

  function getNativeElementBasePreviewUrl(node) {
    if (!node) {
      return '';
    }

    ensureNativeElementBaseState(node);
    const targetNode = getNativeImageTarget(node);
    const tagName = (targetNode?.tagName || '').toLowerCase();

    if (tagName === 'img') {
      return node.dataset.farhaNativeBaseSrc || targetNode.getAttribute('src') || '';
    }

    return extractCssUrl(node.dataset.farhaNativeBaseBackgroundImage || '') || node.dataset.farhaNativeBaseSrc || '';
  }

  function getCanvasPlacementFromNode(node, offsetX = 0, offsetY = 0) {
    if (!node) {
      return {
        x: 40,
        y: 40,
        width: 160,
        height: 160,
      };
    }

    const target = getEditorOverlayTarget();
    const rect = node.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const scrollX = target === document.body || target === document.documentElement
      ? (window.scrollX || 0)
      : (target.scrollLeft || 0);
    const scrollY = target === document.body || target === document.documentElement
      ? (window.scrollY || 0)
      : (target.scrollTop || 0);

    return {
      x: Math.max(12, Math.round(rect.left - targetRect.left + scrollX + offsetX)),
      y: Math.max(12, Math.round(rect.top - targetRect.top + scrollY + offsetY)),
      width: Math.max(24, Math.round(rect.width || 160)),
      height: Math.max(24, Math.round(rect.height || 160)),
    };
  }

  function buildNativeClipboardPayload(node, override = {}) {
    if (!node) {
      return null;
    }

    const label = override.label || getNativeElementLabel(node);
    const selector = override.selector || getNativeElementSelectorHint(node) || buildNativeElementId(node);
    const previewUrl = getNativeElementPreviewUrl(node);
    const textTarget = getNativeTextEditTarget(node);
    const computedTextStyle = textTarget ? window.getComputedStyle(textTarget) : null;
    const placement = getCanvasPlacementFromNode(node, 22, 22);
    const resolvedKind =
      override.kind === 'native'
        ? (previewUrl ? 'media' : (textTarget ? 'text' : getNativeElementKind(node)))
        : (override.kind || getNativeElementKind(node));

    if (resolvedKind === 'text' && textTarget) {
      const textContent = override.textContent == null || override.textContent === ''
        ? (textTarget.innerText || textTarget.textContent || '')
        : String(override.textContent);

      return {
        source: 'native',
        label,
        selector,
        element: {
          type: 'text',
          content: textContent,
          x: placement.x,
          y: placement.y,
          fontSize: textTarget.style.fontSize || computedTextStyle?.fontSize || '24px',
          color: textTarget.style.color || computedTextStyle?.color || '#1f2937',
          fontFamily: textTarget.style.fontFamily || computedTextStyle?.fontFamily || '',
          opacity: Number.isFinite(Number(override.opacity)) ? Number(override.opacity) : 1,
          rotation: Number.isFinite(Number(override.rotation)) ? Number(override.rotation) : 0,
        },
      };
    }

    if ((resolvedKind === 'media' || previewUrl) && previewUrl) {
      return {
        source: 'native',
        label,
        selector,
        element: {
          type: 'image',
          content: previewUrl,
          x: placement.x,
          y: placement.y,
          width: `${placement.width}px`,
          height: `${placement.height}px`,
          cropX: Number.isFinite(Number(override.cropX)) ? Number(override.cropX) : 50,
          cropY: Number.isFinite(Number(override.cropY)) ? Number(override.cropY) : 50,
          opacity: Number.isFinite(Number(override.opacity)) ? Number(override.opacity) : 1,
          rotation: Number.isFinite(Number(override.rotation)) ? Number(override.rotation) : 0,
        },
      };
    }

    return null;
  }

  function isNativeReplaceableImageNode(node) {
    if (!node) {
      return false;
    }

    const targetNode = getNativeImageTarget(node);
    const tagName = (targetNode?.tagName || '').toLowerCase();
    if (tagName === 'img') {
      return true;
    }

    return window.getComputedStyle(node).backgroundImage !== 'none';
  }

  function getNativeTextEditTarget(node) {
    if (!node || isNativeReplaceableImageNode(node)) {
      return null;
    }

    if (
      node.classList?.contains('farha-studio-editable')
      || node.dataset?.farhaStudioField
      || node.dataset?.farhaTextPath
    ) {
      return node;
    }

    const explicitTarget = node.querySelector?.('.farha-studio-editable, [data-farha-studio-field], [data-farha-text-path]');
    if (explicitTarget && explicitTarget.children.length <= 2) {
      return explicitTarget;
    }

    const normalizedText = (node.textContent || '').replace(/\s+/g, ' ').trim();
    if (normalizedText && node.children.length === 0) {
      return node;
    }

    return null;
  }

  function getNativeTextPathForNode(node) {
    const target = getNativeTextEditTarget(node);
    if (!target) {
      return '';
    }

    return target.dataset?.farhaStudioField || target.dataset?.farhaTextPath || '';
  }

  function isNativeTextEditableNode(node) {
    return Boolean(getNativeTextEditTarget(node));
  }

  function getNativeTextStyleTargets(node) {
    const textTarget = getNativeTextEditTarget(node);
    if (!textTarget) {
      return [];
    }

    const targets = [textTarget];
    if (!textTarget.querySelectorAll) {
      return targets;
    }

    const descendants = Array.from(textTarget.querySelectorAll('*')).filter((element) => {
      if (!element || element.nodeType !== 1) {
        return false;
      }
      if (isNativeReplaceableImageNode(element)) {
        return false;
      }

      const normalizedText = (element.textContent || '').replace(/\s+/g, ' ').trim();
      return Boolean(normalizedText);
    });

    descendants.forEach((element) => {
      if (!targets.includes(element)) {
        targets.push(element);
      }
    });

    return targets;
  }

  function toCssPropertyName(property) {
    return String(property || '').replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
  }

  function applyInlineStyle(target, property, overrideValue, baseValue = '', options = {}) {
    if (!target) {
      return;
    }

    const cssProperty = toCssPropertyName(property);
    const hasOverride = !(overrideValue == null || overrideValue === '');
    const priority = options.important ? 'important' : '';

    if (hasOverride) {
      target.style.setProperty(cssProperty, String(overrideValue), priority);
      return;
    }

    if (baseValue) {
      target.style.setProperty(cssProperty, String(baseValue), priority);
      return;
    }

    target.style.removeProperty(cssProperty);
  }

  function applyNativeBoxStylesToNode(node, override = {}) {
    if (!node) {
      return;
    }

    ensureNativeElementBaseState(node);
    applyInlineStyle(node, 'width', override?.width, node.dataset.farhaNativeBaseWidth || '');
    applyInlineStyle(node, 'height', override?.height, node.dataset.farhaNativeBaseHeight || '');
    applyInlineStyle(node, 'zIndex', override?.zIndex, node.dataset.farhaNativeBaseZIndex || '');
    applyInlineStyle(node, 'backgroundColor', override?.backgroundColor, node.dataset.farhaNativeBaseBackgroundColor || '');
    applyInlineStyle(node, 'borderRadius', override?.borderRadius, node.dataset.farhaNativeBaseBorderRadius || '');
    applyInlineStyle(node, 'borderWidth', override?.borderWidth, node.dataset.farhaNativeBaseBorderWidth || '');
    applyInlineStyle(node, 'borderColor', override?.borderColor, node.dataset.farhaNativeBaseBorderColor || '');
    applyInlineStyle(node, 'boxShadow', override?.boxShadow, node.dataset.farhaNativeBaseBoxShadow || '');

    const hasBorderOverride = !(
      (override?.borderWidth == null || override.borderWidth === '')
      && (override?.borderColor == null || override.borderColor === '')
    );
    node.style.borderStyle = hasBorderOverride
      ? (node.dataset.farhaNativeBaseBorderStyle || 'solid')
      : (node.dataset.farhaNativeBaseBorderStyle || '');
  }

  function applyNativeTextStylesToNode(node, override = {}) {
    const textTargets = getNativeTextStyleTargets(node);
    if (!textTargets.length) {
      return;
    }

    ensureNativeElementBaseState(node);
    textTargets.forEach((textTarget) => {
      applyInlineStyle(textTarget, 'color', override?.color, textTarget.dataset.farhaNativeBaseColor || '', { important: true });
      applyInlineStyle(textTarget, 'fontFamily', override?.fontFamily, textTarget.dataset.farhaNativeBaseFontFamily || '', { important: true });
      applyInlineStyle(textTarget, 'fontSize', override?.fontSize, textTarget.dataset.farhaNativeBaseFontSize || '', { important: true });
      applyInlineStyle(textTarget, 'fontWeight', override?.fontWeight, textTarget.dataset.farhaNativeBaseFontWeight || '', { important: true });
      applyInlineStyle(textTarget, 'fontStyle', override?.fontStyle, textTarget.dataset.farhaNativeBaseFontStyle || '', { important: true });
      applyInlineStyle(textTarget, 'lineHeight', override?.lineHeight, textTarget.dataset.farhaNativeBaseLineHeight || '', { important: true });
      applyInlineStyle(textTarget, 'letterSpacing', override?.letterSpacing, textTarget.dataset.farhaNativeBaseLetterSpacing || '', { important: true });
      applyInlineStyle(textTarget, 'textAlign', override?.textAlign, textTarget.dataset.farhaNativeBaseTextAlign || '', { important: true });
      applyInlineStyle(textTarget, 'textTransform', override?.textTransform, textTarget.dataset.farhaNativeBaseTextTransform || '', { important: true });
      applyInlineStyle(textTarget, 'textDecoration', override?.textDecoration, textTarget.dataset.farhaNativeBaseTextDecoration || '', { important: true });
      applyInlineStyle(textTarget, 'direction', override?.direction, textTarget.dataset.farhaNativeBaseDirection || '', { important: true });
      applyInlineStyle(textTarget, 'textShadow', override?.textShadow, textTarget.dataset.farhaNativeBaseTextShadow || '', { important: true });
    });
  }

  function getNativeElementSelectionMeta(node) {
    if (!node) {
      return {};
    }

    ensureNativeElementBaseState(node);
    const placement = getCanvasPlacementFromNode(node);
    const computedNodeStyle = window.getComputedStyle(node);
    const textTarget = getNativeTextEditTarget(node);
    const computedTextStyle = textTarget ? window.getComputedStyle(textTarget) : null;
    const imageTarget = getNativeImageTarget(node);
    const computedImageStyle = imageTarget ? window.getComputedStyle(imageTarget) : null;

    return {
      canvasX: placement.x,
      canvasY: placement.y,
      renderWidth: `${placement.width}px`,
      renderHeight: `${placement.height}px`,
      textContent: textTarget ? (textTarget.innerText || textTarget.textContent || '') : '',
      textPath: getNativeTextPathForNode(node),
      width: node.style.width || computedNodeStyle.width || '',
      height: node.style.height || computedNodeStyle.height || '',
      zIndex: computedNodeStyle.zIndex && computedNodeStyle.zIndex !== 'auto' ? Number(computedNodeStyle.zIndex) : undefined,
      color: computedTextStyle ? (textTarget.style.color || computedTextStyle.color || '') : '',
      fontFamily: computedTextStyle ? (textTarget.style.fontFamily || computedTextStyle.fontFamily || '') : '',
      fontSize: computedTextStyle ? (textTarget.style.fontSize || computedTextStyle.fontSize || '') : '',
      fontWeight: computedTextStyle ? (textTarget.style.fontWeight || computedTextStyle.fontWeight || '') : '',
      fontStyle: computedTextStyle ? (textTarget.style.fontStyle || computedTextStyle.fontStyle || '') : '',
      lineHeight: computedTextStyle ? (textTarget.style.lineHeight || computedTextStyle.lineHeight || '') : '',
      letterSpacing: computedTextStyle ? (textTarget.style.letterSpacing || computedTextStyle.letterSpacing || '') : '',
      textAlign: computedTextStyle ? (textTarget.style.textAlign || computedTextStyle.textAlign || '') : '',
      textTransform: computedTextStyle ? (textTarget.style.textTransform || computedTextStyle.textTransform || '') : '',
      textDecoration: computedTextStyle ? (textTarget.style.textDecoration || computedTextStyle.textDecoration || '') : '',
      direction: computedTextStyle ? (textTarget.style.direction || computedTextStyle.direction || '') : '',
      textShadow: computedTextStyle ? (textTarget.style.textShadow || computedTextStyle.textShadow || '') : '',
      backgroundColor: node.style.backgroundColor || computedNodeStyle.backgroundColor || '',
      borderRadius: node.style.borderRadius || computedNodeStyle.borderRadius || '',
      borderWidth: node.style.borderWidth || computedNodeStyle.borderWidth || '',
      borderColor: node.style.borderColor || computedNodeStyle.borderColor || '',
      boxShadow: node.style.boxShadow || computedNodeStyle.boxShadow || '',
      objectFit: computedImageStyle ? (imageTarget.style.objectFit || computedImageStyle.objectFit || '') : '',
    };
  }

  function applyNativeMediaToNode(node, mediaUrl = '') {
    if (!node) {
      return;
    }

    ensureNativeElementBaseState(node);
    const targetNode = getNativeImageTarget(node);
    const targetTagName = (targetNode?.tagName || '').toLowerCase();
    const safeUrl = mediaUrl == null ? '' : String(mediaUrl).trim();

    if (targetTagName === 'img') {
      const nextSrc = safeUrl || node.dataset.farhaNativeBaseSrc || '';
      if (nextSrc) {
        targetNode.setAttribute('src', nextSrc);
      }
    }

    if (window.getComputedStyle(node).backgroundImage !== 'none' || node.dataset.farhaNativeBaseBackgroundImage) {
      node.style.backgroundImage = safeUrl ? `url("${safeUrl}")` : (node.dataset.farhaNativeBaseBackgroundImage || '');
    }
  }

  function applyNativeCropToNode(node, override = {}) {
    if (!node || !isNativeReplaceableImageNode(node)) {
      return;
    }

    ensureNativeElementBaseState(node);
    const cropX = clamp(Number.isFinite(Number(override?.cropX)) ? Number(override.cropX) : 50, 0, 100);
    const cropY = clamp(Number.isFinite(Number(override?.cropY)) ? Number(override.cropY) : 50, 0, 100);
    const imageNode = getNativeImageTarget(node);
    const imageTagName = (imageNode?.tagName || '').toLowerCase();
    const requestedFit = override?.objectFit == null ? '' : String(override.objectFit).trim();

    if (imageTagName === 'img') {
      const baseFit = imageNode.dataset.farhaNativeBaseObjectFit || '';
      imageNode.style.objectFit = requestedFit || (baseFit && baseFit !== 'fill' ? baseFit : 'cover');
      imageNode.style.objectPosition = `${cropX}% ${cropY}%`;
    }

    if (window.getComputedStyle(node).backgroundImage !== 'none' || node.dataset.farhaNativeBaseBackgroundImage) {
      const baseSize = node.dataset.farhaNativeBaseBackgroundSize || '';
      const nextBackgroundSize = requestedFit === 'fill'
        ? '100% 100%'
        : requestedFit
          ? requestedFit
          : (baseSize && baseSize !== 'auto' && baseSize !== 'auto auto' ? baseSize : 'cover');
      node.style.backgroundSize = nextBackgroundSize;
      node.style.backgroundPosition = `${cropX}% ${cropY}%`;
    }
  }

  function applyNativeTextToNode(node, override = {}) {
    const textTarget = getNativeTextEditTarget(node);
    if (!textTarget) {
      return;
    }

    const textPath = getNativeTextPathForNode(node);
    const nextText = override?.textContent;
    if (typeof nextText === 'string') {
      textTarget.textContent = nextText;
      return;
    }

    if (textPath) {
      return;
    }

    if (textTarget.dataset?.farhaNativeBaseText !== undefined) {
      textTarget.textContent = textTarget.dataset.farhaNativeBaseText;
    }
  }

  function resetNativeElementNode(node) {
    if (!node) {
      return;
    }

    ensureNativeElementBaseState(node);
    node.style.transform = node.dataset.farhaNativeBaseTransform || '';
    node.style.opacity = node.dataset.farhaNativeBaseOpacity || '';
    node.style.display = node.dataset.farhaNativeBaseDisplay || '';
    node.style.pointerEvents = node.dataset.farhaNativeBasePointerEvents || '';
    node.style.touchAction = node.dataset.farhaNativeBaseTouchAction || '';
    node.style.backgroundPosition = node.dataset.farhaNativeBaseBackgroundPosition || '';
    node.style.backgroundSize = node.dataset.farhaNativeBaseBackgroundSize || '';
    node.style.backgroundColor = node.dataset.farhaNativeBaseBackgroundColor || '';
    node.style.width = node.dataset.farhaNativeBaseWidth || '';
    node.style.height = node.dataset.farhaNativeBaseHeight || '';
    node.style.zIndex = node.dataset.farhaNativeBaseZIndex || '';
    node.style.borderRadius = node.dataset.farhaNativeBaseBorderRadius || '';
    node.style.borderWidth = node.dataset.farhaNativeBaseBorderWidth || '';
    node.style.borderColor = node.dataset.farhaNativeBaseBorderColor || '';
    node.style.borderStyle = node.dataset.farhaNativeBaseBorderStyle || '';
    node.style.boxShadow = node.dataset.farhaNativeBaseBoxShadow || '';
    applyNativeMediaToNode(node, '');
    const imageNode = getNativeImageTarget(node);
    if (imageNode) {
      imageNode.style.objectPosition = imageNode.dataset.farhaNativeBaseObjectPosition || '';
      imageNode.style.objectFit = imageNode.dataset.farhaNativeBaseObjectFit || '';
    }
    applyNativeTextToNode(node, {});
    applyNativeTextStylesToNode(node, {});
    node.dataset.farhaSelected = 'false';
    node.dataset.farhaLocked = 'false';
    node.dataset.farhaHidden = 'false';
    node.dataset.farhaCropMode = 'false';
  }

  function applyNativeOverrideToNode(node, override = {}) {
    if (!node) {
      return;
    }

    ensureNativeElementBaseState(node);
    const baseTransform = node.dataset.farhaNativeBaseTransform || '';
    const x = Number.isFinite(Number(override?.x)) ? Number(override.x) : 0;
    const y = Number.isFinite(Number(override?.y)) ? Number(override.y) : 0;
    const scale = Math.max(0.1, Number.isFinite(Number(override?.scale)) ? Number(override.scale) : 1);
    const rotation = Number.isFinite(Number(override?.rotation)) ? Number(override.rotation) : 0;
    const opacity = Math.min(1, Math.max(0.05, Number.isFinite(Number(override?.opacity)) ? Number(override.opacity) : 1));
    const hidden = Boolean(override?.hidden);
    const locked = Boolean(override?.locked);
    const mediaUrl = override?.mediaUrl == null ? '' : String(override.mediaUrl).trim();
    const nextTransform = [
      baseTransform,
      `translate3d(${x}px, ${y}px, 0)`,
      `rotate(${rotation}deg)`,
      `scale(${scale})`,
    ].filter(Boolean).join(' ');

    node.style.transform = nextTransform.trim();
    node.style.opacity = String(opacity);
    node.style.display = hidden ? 'none' : (node.dataset.farhaNativeBaseDisplay || '');
    node.style.pointerEvents = hidden ? 'none' : (node.dataset.farhaNativeBasePointerEvents || '');
    node.style.touchAction = runtimeState.preview && runtimeState.selectedNativeElementId === node.dataset.farhaNativeId && !locked
      ? 'none'
      : (node.dataset.farhaNativeBaseTouchAction || '');
    node.dataset.farhaLocked = locked ? 'true' : 'false';
    node.dataset.farhaHidden = hidden ? 'true' : 'false';
    node.dataset.farhaSelected = String(runtimeState.selectedNativeElementId || '') === String(node.dataset.farhaNativeId || '') ? 'true' : 'false';
    applyNativeBoxStylesToNode(node, override);
    applyNativeMediaToNode(node, mediaUrl);
    applyNativeCropToNode(node, override);
    applyNativeTextToNode(node, override);
    applyNativeTextStylesToNode(node, override);
  }

  function getNativeElementCandidatesRoot() {
    return document.getElementById('allrecords')
      || document.getElementById('invitation-container')
      || document.getElementById('main-content')
      || document.getElementById('invite')
      || document.getElementById('site')
      || document.body;
  }

  function getEditorOverlayTarget() {
    const candidates = [
      document.getElementById('allrecords'),
      document.getElementById('invitation-container'),
      document.getElementById('main-content'),
      document.getElementById('invite'),
      document.getElementById('site'),
      document.querySelector('.site'),
      document.querySelector('.invite'),
    ].filter(Boolean);

    if (!candidates.length) {
      return document.body;
    }

    return candidates.sort((a, b) => {
      const aArea = Math.max(a.scrollHeight || 0, a.offsetHeight || 0);
      const bArea = Math.max(b.scrollHeight || 0, b.offsetHeight || 0);
      return bArea - aArea;
    })[0];
  }

  function getAllNativeElementCandidates() {
    return Array.from(getNativeElementCandidatesRoot().querySelectorAll('*')).filter(isNativeElementCandidate);
  }

  function findNativeElementById(id) {
    if (!id) {
      return null;
    }

    return getAllNativeElementCandidates().find((node) => buildNativeElementId(node) === id) || null;
  }

  function queueNativeOverlaySync() {
    if (runtimeState.nativeOverlayRaf) {
      window.cancelAnimationFrame(runtimeState.nativeOverlayRaf);
    }

    runtimeState.nativeOverlayRaf = window.requestAnimationFrame(() => {
      runtimeState.nativeOverlayRaf = 0;
      syncNativeElementOverlay();
    });
  }

  function ensureNativeElementOverlay() {
    let overlay = document.getElementById('farha-native-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'farha-native-overlay';
      overlay.dataset.visible = 'false';
      overlay.innerHTML = `
        <div class="farha-native-overlay__toolbar" data-farha-native-role="toolbar">
          <span class="farha-native-overlay__label" data-farha-native-role="label">عنصر القالب</span>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--wide" data-farha-native-action="move" aria-label="تحريك العنصر">تحريك</button>
          <button type="button" class="farha-native-overlay__btn" data-farha-native-action="nudge-right" aria-label="تحريك يمين">→</button>
          <button type="button" class="farha-native-overlay__btn" data-farha-native-action="nudge-left" aria-label="تحريك يسار">←</button>
          <button type="button" class="farha-native-overlay__btn" data-farha-native-action="nudge-up" aria-label="تحريك أعلى">↑</button>
          <button type="button" class="farha-native-overlay__btn" data-farha-native-action="nudge-down" aria-label="تحريك أسفل">↓</button>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--wide" data-farha-native-action="replace" aria-label="استبدال الصورة">استبدال</button>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--wide" data-farha-native-action="add-text" aria-label="إضافة نص هنا">نص</button>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--wide" data-farha-native-action="add-image" aria-label="إضافة صورة هنا">صورة</button>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--danger" data-farha-native-action="delete" aria-label="حذف العنصر">حذف</button>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--wide" data-farha-native-action="edit" aria-label="تحرير النص">تحرير</button>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--wide" data-farha-native-action="crop-toggle" aria-label="قص الصورة">قص</button>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--wide" data-farha-native-action="duplicate" aria-label="تكرار العنصر">تكرار</button>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--wide" data-farha-native-action="copy" aria-label="نسخ العنصر">نسخ</button>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--wide" data-farha-native-action="paste" aria-label="لصق عنصر">لصق</button>
          <button type="button" class="farha-native-overlay__btn farha-native-overlay__btn--wide" data-farha-native-action="hide" aria-label="إخفاء العنصر">إخفاء</button>
          <button type="button" class="farha-native-overlay__btn" data-farha-native-action="lock" aria-label="قفل أو فتح العنصر">قفل</button>
          <button type="button" class="farha-native-overlay__btn" data-farha-native-action="reset" aria-label="إعادة العنصر لأصله">أصل</button>
        </div>
        <button type="button" class="farha-native-overlay__handle farha-native-overlay__handle--rotate" data-farha-native-action="rotate" aria-label="تدوير العنصر">↻</button>
        <button type="button" class="farha-native-overlay__handle" data-farha-native-action="scale" aria-label="تكبير أو تصغير العنصر">+</button>
      `;
      document.body.appendChild(overlay);

      const toolbar = overlay.querySelector('[data-farha-native-role="toolbar"]');
      if (toolbar) {
        const colorField = document.createElement('label');
        colorField.className = 'farha-native-overlay__field';
        colorField.dataset.farhaNativeRole = 'color-field';
        colorField.dataset.visible = 'false';
        colorField.innerHTML = `
          <span class="farha-native-overlay__field-label">لون</span>
          <input type="color" class="farha-native-overlay__color" data-farha-native-control="color" aria-label="لون الخط" value="#7f2a1f" />
        `;

        const fontField = document.createElement('label');
        fontField.className = 'farha-native-overlay__field';
        fontField.dataset.farhaNativeRole = 'font-field';
        fontField.dataset.visible = 'false';
        fontField.innerHTML = `
          <span class="farha-native-overlay__field-label">خط</span>
          <select class="farha-native-overlay__select" data-farha-native-control="fontFamily" aria-label="نوع الخط"></select>
        `;

        toolbar.appendChild(colorField);
        toolbar.appendChild(fontField);
      }

      if (!overlay.querySelector('.farha-native-overlay__corner-delete')) {
        const deleteCorner = document.createElement('button');
        deleteCorner.type = 'button';
        deleteCorner.className = 'farha-native-overlay__corner-delete';
        deleteCorner.dataset.farhaNativeAction = 'delete';
        deleteCorner.setAttribute('aria-label', 'حذف العنصر');
        deleteCorner.textContent = 'X';
        overlay.appendChild(deleteCorner);
      }

      const handleControlChange = (event) => {
        const control = event.target?.closest?.('[data-farha-native-control]');
        if (!control) {
          return;
        }

        const selectedId = runtimeState.selectedNativeElementId;
        const selectedNode = selectedId ? findNativeElementById(selectedId) : null;
        if (!selectedId || !selectedNode || !isNativeTextEditableNode(selectedNode)) {
          return;
        }

        event.stopPropagation();

        const baseOverride = runtimeState.nativeElementOverrides?.[selectedId] || {
          label: getNativeElementLabel(selectedNode),
          selector: getNativeElementSelectorHint(selectedNode) || selectedId,
          kind: getNativeElementKind(selectedNode),
        };
        const controlName = control.dataset.farhaNativeControl;
        const nextOverride = {
          ...baseOverride,
        };

        if (controlName === 'color') {
          nextOverride.color = String(control.value || '').trim();
        } else if (controlName === 'fontFamily') {
          nextOverride.fontFamily = String(control.value || '').trim();
        } else {
          return;
        }

        applyLocalNativeOverride(selectedId, selectedNode, nextOverride);
        persistNativeUpdate(selectedId, selectedNode, nextOverride);
      };

      overlay.addEventListener('input', handleControlChange, true);
      overlay.addEventListener('change', handleControlChange, true);
    }

    if (!runtimeState.nativeOverlaySyncHandler) {
      runtimeState.nativeOverlaySyncHandler = () => queueNativeOverlaySync();
      window.addEventListener('resize', runtimeState.nativeOverlaySyncHandler);
      window.addEventListener('scroll', runtimeState.nativeOverlaySyncHandler, true);
    }

    return overlay;
  }

  function ensureEditorDock() {
    if (!document.getElementById('farha-editor-dock-style')) {
      const style = document.createElement('style');
      style.id = 'farha-editor-dock-style';
      style.textContent = `
        #farha-editor-dock {
          position: fixed;
          left: 14px;
          bottom: 14px;
          z-index: 2147482800;
          display: none;
          align-items: center;
          gap: 8px;
          padding: 10px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(127, 42, 31, 0.14);
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.18);
          backdrop-filter: blur(14px);
          direction: ltr;
        }
        #farha-editor-dock[data-visible="true"] {
          display: flex;
        }
        #farha-editor-dock button {
          border: none;
          border-radius: 999px;
          background: #fff7f4;
          color: #7f2a1f;
          height: 42px;
          min-width: 42px;
          padding: 0 14px;
          font: 800 11px/1 Tajawal, sans-serif;
          letter-spacing: .02em;
          box-shadow: inset 0 0 0 1px rgba(127, 42, 31, 0.12);
          cursor: pointer;
        }
        #farha-editor-dock button[data-kind="primary"] {
          background: #7f2a1f;
          color: #fff;
          box-shadow: none;
        }
        @media (max-width: 640px) {
          #farha-editor-dock {
            left: 10px;
            right: 10px;
            bottom: calc(10px + env(safe-area-inset-bottom, 0px));
            justify-content: center;
            flex-wrap: wrap;
          }
          #farha-editor-dock button {
            flex: 1 1 auto;
            min-width: 72px;
          }
        }
      `;
      document.head.appendChild(style);
    }

    let dock = document.getElementById('farha-editor-dock');
    if (!dock) {
      dock = document.createElement('div');
      dock.id = 'farha-editor-dock';
      dock.dataset.visible = 'false';
      dock.innerHTML = `
        <button type="button" data-farha-editor-action="add-text" data-kind="primary">TEXT</button>
        <button type="button" data-farha-editor-action="add-image">IMAGE</button>
        <button type="button" data-farha-editor-action="paste-element">PASTE</button>
        <button type="button" data-farha-editor-action="open-layers">LAYERS</button>
        <button type="button" data-farha-editor-action="cancel-add">ESC</button>
      `;
      dock.addEventListener('click', (event) => {
        const actionButton = event.target.closest('[data-farha-editor-action]');
        if (!actionButton) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        window.parent.postMessage({
          type: 'FARHA_EMULATOR_TOOL_ACTION',
          payload: {
            action: actionButton.dataset.farhaEditorAction || '',
          },
        }, '*');
      });
      document.body.appendChild(dock);
    }

    runtimeState.editorDock = dock;
    return dock;
  }

  function syncEditorDockState() {
    const dock = runtimeState.editorDock || document.getElementById('farha-editor-dock');
    if (!dock) {
      return;
    }

    dock.dataset.visible = runtimeState.preview ? 'true' : 'false';
  }

  function syncNativeElementOverlay() {
    const overlay = document.getElementById('farha-native-overlay') || (runtimeState.preview ? ensureNativeElementOverlay() : null);
    if (!overlay) {
      return;
    }

    const selectedId = runtimeState.selectedNativeElementId;
    const selectedNode = selectedId ? findNativeElementById(selectedId) : null;
    if (
      !runtimeState.preview
      || !selectedId
      || !selectedNode
      || selectedNode.dataset.farhaHidden === 'true'
    ) {
      overlay.dataset.visible = 'false';
      overlay.style.pointerEvents = 'none';
      overlay.style.width = '0';
      overlay.style.height = '0';
      return;
    }

    const rect = selectedNode.getBoundingClientRect();
    const outsideViewport =
      rect.width < 8
      || rect.height < 8
      || rect.bottom < 0
      || rect.right < 0
      || rect.top > window.innerHeight
      || rect.left > window.innerWidth;
    if (outsideViewport) {
      overlay.dataset.visible = 'false';
      overlay.style.pointerEvents = 'none';
      return;
    }

    const currentOverride = runtimeState.nativeElementOverrides?.[selectedId] || {};
    const toolbar = overlay.querySelector('[data-farha-native-role="toolbar"]');
    const label = overlay.querySelector('[data-farha-native-role="label"]');
    const lockButton = overlay.querySelector('[data-farha-native-action="lock"]');
    const editButton = overlay.querySelector('[data-farha-native-action="edit"]');
    const replaceButton = overlay.querySelector('[data-farha-native-action="replace"]');
    const cropButton = overlay.querySelector('[data-farha-native-action="crop-toggle"]');
    const colorField = overlay.querySelector('[data-farha-native-role="color-field"]');
    const fontField = overlay.querySelector('[data-farha-native-role="font-field"]');
    const colorInput = overlay.querySelector('[data-farha-native-control="color"]');
    const fontSelect = overlay.querySelector('[data-farha-native-control="fontFamily"]');
    const canStyleText = isNativeTextEditableNode(selectedNode);

    overlay.dataset.visible = 'true';
    overlay.style.pointerEvents = 'none';
    overlay.style.left = `${Math.max(0, rect.left)}px`;
    overlay.style.top = `${Math.max(0, rect.top)}px`;
    overlay.style.width = `${Math.max(28, rect.width)}px`;
    overlay.style.height = `${Math.max(28, rect.height)}px`;

    if (toolbar) {
      toolbar.dataset.inside = rect.top < 72 ? 'true' : 'false';
    }
    if (label) {
      label.textContent = currentOverride.label || getNativeElementLabel(selectedNode);
      label.title = currentOverride.selector || getNativeElementSelectorHint(selectedNode) || selectedId;
    }
    if (lockButton) {
      lockButton.dataset.locked = currentOverride.locked ? 'true' : 'false';
      lockButton.textContent = currentOverride.locked ? 'فتح' : 'قفل';
    }
    if (editButton) {
      editButton.style.display = isNativeTextEditableNode(selectedNode) ? 'inline-flex' : 'none';
    }
    if (replaceButton) {
      replaceButton.style.display = isNativeReplaceableImageNode(selectedNode) ? 'inline-flex' : 'none';
    }
    if (cropButton) {
      const canCrop = isNativeReplaceableImageNode(selectedNode);
      cropButton.style.display = canCrop ? 'inline-flex' : 'none';
      cropButton.dataset.active = canCrop && selectedNode.dataset.farhaCropMode === 'true' ? 'true' : 'false';
    }
    if (colorField) {
      colorField.dataset.visible = canStyleText ? 'true' : 'false';
    }
    if (fontField) {
      fontField.dataset.visible = canStyleText ? 'true' : 'false';
    }
    if (canStyleText) {
      if (colorInput) {
        colorInput.value = cssColorToHex(currentOverride.color || getNativeElementSelectionMeta(selectedNode).color || '#7f2a1f');
      }
      if (fontSelect) {
        populateNativeOverlayFontSelect(fontSelect, currentOverride.fontFamily || getNativeElementSelectionMeta(selectedNode).fontFamily || '');
      }
      void loadSharedFontLibrary().then(() => {
        if (document.getElementById('farha-native-overlay') === overlay) {
          populateNativeOverlayFontSelect(fontSelect, currentOverride.fontFamily || getNativeElementSelectionMeta(selectedNode).fontFamily || '');
        }
      });
    }
  }

  function selectNativeElement(nodeOrId, options = {}) {
    const node = typeof nodeOrId === 'string' ? findNativeElementById(nodeOrId) : nodeOrId;
    const nativeId = node ? buildNativeElementId(node) : (typeof nodeOrId === 'string' ? nodeOrId : null);
    runtimeState.selectedNativeElementId = nativeId || null;

    queryAll('[data-farha-native-managed="true"]').forEach((candidate) => {
      candidate.dataset.farhaSelected = String(candidate.dataset.farhaNativeId || '') === String(runtimeState.selectedNativeElementId || '') ? 'true' : 'false';
      const override = runtimeState.nativeElementOverrides?.[candidate.dataset.farhaNativeId] || {};
      applyNativeOverrideToNode(candidate, override);
    });

    queueNativeOverlaySync();

    if (options.silent) {
      return;
    }

    window.parent.postMessage({
      type: 'FARHA_NATIVE_ELEMENT_SELECT',
      payload: nativeId
        ? {
            id: nativeId,
            label: options.label || getNativeElementLabel(node),
            selector: options.selector || getNativeElementSelectorHint(node) || nativeId,
            kind: options.kind || getNativeElementKind(node),
            previewUrl: getNativeElementPreviewUrl(node),
            basePreviewUrl: getNativeElementBasePreviewUrl(node),
            aspectRatio: getNodeAspectRatio(node),
            ...getNativeElementSelectionMeta(node),
          }
        : { id: null },
    }, '*');
  }

  function applyNativeElementOverrides(rawOverrides) {
    ensureNativeElementStyleTag();
    if (runtimeState.preview) {
      ensureNativeElementOverlay();
    }
    const overrides = normalizeNativeElementOverrides(rawOverrides);
    runtimeState.nativeElementOverrides = overrides;

    queryAll('[data-farha-native-managed="true"]').forEach((node) => resetNativeElementNode(node));

    const candidates = getAllNativeElementCandidates();
    candidates.forEach((node) => {
      const nativeId = buildNativeElementId(node);
      const override = overrides[nativeId];
      if (override) {
        applyNativeOverrideToNode(node, override);
      } else {
        ensureNativeElementBaseState(node);
        node.dataset.farhaSelected = String(runtimeState.selectedNativeElementId || '') === String(nativeId) ? 'true' : 'false';
        node.dataset.farhaLocked = 'false';
        node.dataset.farhaHidden = 'false';
      }
    });

    if (runtimeState.selectedNativeElementId) {
      const selectedNode = findNativeElementById(runtimeState.selectedNativeElementId);
      if (selectedNode) {
        selectNativeElement(selectedNode, {
          label: overrides[runtimeState.selectedNativeElementId]?.label || getNativeElementLabel(selectedNode),
          selector: overrides[runtimeState.selectedNativeElementId]?.selector || getNativeElementSelectorHint(selectedNode),
          kind: overrides[runtimeState.selectedNativeElementId]?.kind || getNativeElementKind(selectedNode),
          silent: true,
        });
      } else {
        runtimeState.selectedNativeElementId = null;
      }
    }

    queueNativeOverlaySync();
  }

  function initUniversalTextEditor() {
    if (!runtimeState.preview) return;

    queryAll('.farha-studio-editable, .farha-custom-element__text').forEach((node) => {
      node.style.userSelect = 'none';
      node.style.webkitUserSelect = 'none';
      node.style.pointerEvents = 'auto';
      node.style.cursor = node.classList.contains('farha-custom-element__text') ? 'grab' : 'move';
    });
    syncTemplateTextSelection();
  }

  function syncPreviewEditableBindings() {
    if (!runtimeState.preview) {
      return;
    }

    const bindings =
      (runtimeState.manifest && runtimeState.manifest.runtimeBindings && runtimeState.manifest.runtimeBindings.fieldBindings)
      || fallbackBindings;

    attachStudioInlineEditors(bindings);
    applyTextOverrides(runtimeState.renderConfig?.textOverrides || []);
    applyTextStyleOverrides(runtimeState.renderConfig?.ui?.textStyleOverrides || {});
    applyNativeElementOverrides(runtimeState.renderConfig?.nativeElementOverrides || {});
    initUniversalTextEditor();
    queueNativeOverlaySync();
  }

  function schedulePreviewEditableBindingsSync() {
    if (!runtimeState.preview) {
      return;
    }

    if (runtimeState.previewMutationSyncRaf) {
      window.cancelAnimationFrame(runtimeState.previewMutationSyncRaf);
    }

    runtimeState.previewMutationSyncRaf = window.requestAnimationFrame(() => {
      runtimeState.previewMutationSyncRaf = 0;
      syncPreviewEditableBindings();
    });
  }

  function ensurePreviewEditableBindingsObserver() {
    if (!runtimeState.preview || !document.body) {
      if (runtimeState.previewMutationObserver) {
        runtimeState.previewMutationObserver.disconnect();
        runtimeState.previewMutationObserver = null;
      }
      if (runtimeState.previewMutationSyncRaf) {
        window.cancelAnimationFrame(runtimeState.previewMutationSyncRaf);
        runtimeState.previewMutationSyncRaf = 0;
      }
      return;
    }

    if (runtimeState.previewMutationObserver) {
      return;
    }

    runtimeState.previewMutationObserver = new MutationObserver((mutations) => {
      const shouldSync = mutations.some((mutation) => {
        if (mutation.type !== 'childList') {
          return false;
        }

        if (mutation.addedNodes.length || mutation.removedNodes.length) {
          return true;
        }

        return false;
      });

      if (shouldSync) {
        schedulePreviewEditableBindingsSync();
      }
    });

    runtimeState.previewMutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function placeCaretWithinTarget(target, triggerEvent = null) {
    if (!target) {
      return;
    }

    target.focus();
    const selection = window.getSelection?.();
    if (!selection) {
      return;
    }

    let range = null;
    if (triggerEvent) {
      if (document.caretPositionFromPoint) {
        const caretPosition = document.caretPositionFromPoint(triggerEvent.clientX, triggerEvent.clientY);
        if (caretPosition && target.contains(caretPosition.offsetNode)) {
          range = document.createRange();
          range.setStart(caretPosition.offsetNode, caretPosition.offset);
          range.collapse(true);
        }
      } else if (document.caretRangeFromPoint) {
        const caretRange = document.caretRangeFromPoint(triggerEvent.clientX, triggerEvent.clientY);
        if (caretRange && target.contains(caretRange.startContainer)) {
          range = caretRange;
          range.collapse(true);
        }
      }
    }

    if (!range) {
      range = document.createRange();
      range.selectNodeContents(target);
      range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }

  function closeFloatingTextEditor(commit = true) {
    const active = runtimeState.activeTextEditor;
    if (!active) return;

    const { target, cleanup, onCommit, initialValue } = active;
    const nextValue = target.innerText;

    if (commit) {
      if (typeof onCommit === 'function') {
        onCommit(nextValue);
      }
    } else {
      target.innerText = initialValue;
    }

    cleanup?.();
    target.classList.remove('farha-studio-editing');
    target.contentEditable = 'false';
    target.removeAttribute('data-farha-editing');
    target.style.userSelect = 'none';
    target.style.webkitUserSelect = 'none';
    target.style.webkitTouchCallout = 'none';
    target.style.cursor = target.classList.contains('farha-custom-element__text') ? 'grab' : 'move';
    runtimeState.activeTextEditor = null;
  }

  function openFloatingTextEditor({ target, initialValue = '', onCommit, triggerEvent = null }) {
    if (!runtimeState.preview || !target) return;

    if (runtimeState.activeTextEditor?.target === target) {
      placeCaretWithinTarget(target, triggerEvent);
      return;
    }

    closeFloatingTextEditor(true);
    target.classList.add('farha-studio-editing');
    target.contentEditable = 'true';
    target.spellcheck = false;
    target.setAttribute('data-farha-editing', 'true');
    target.setAttribute('dir', target.getAttribute('dir') || 'auto');
    target.style.userSelect = 'text';
    target.style.webkitUserSelect = 'text';
    target.style.webkitTouchCallout = 'default';
    target.style.cursor = 'text';
    if ((target.innerText || '') !== initialValue) {
      target.innerText = initialValue;
    }

    const handleKeydown = (event) => {
      event.stopPropagation();
      if (event.key === 'Escape') {
        event.preventDefault();
        closeFloatingTextEditor(false);
      }
      if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        closeFloatingTextEditor(true);
      }
    };

    const cleanup = () => {
      target.removeEventListener('keydown', handleKeydown);
      target.removeEventListener('blur', handleBlur);
    };

    const handleBlur = () => {
      closeFloatingTextEditor(true);
    };

    target.addEventListener('keydown', handleKeydown);
    target.addEventListener('blur', handleBlur);

    runtimeState.activeTextEditor = {
      target,
      onCommit,
      cleanup,
      initialValue,
    };

    placeCaretWithinTarget(target, triggerEvent);
  }

  function installMessageBridge() {
    window.addEventListener('message', (event) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data) {
        return;
      }

      if (event.data.type === 'FARHA_REQUEST_STUDIO_CATALOGS') {
        const bindings =
          (runtimeState.manifest && runtimeState.manifest.runtimeBindings && runtimeState.manifest.runtimeBindings.fieldBindings)
          || fallbackBindings
          || {};
        postStudioCatalogs(bindings);
        return;
      }

      if (event.data.type === 'FARHA_EDITOR_ADD_MODE') {
        setEditorAddMode(event.data.payload?.mode || '');
        return;
      }

      if (event.data.type === 'FARHA_SELECT_NATIVE_ELEMENT') {
        const nextId = event.data.payload?.id;
        if (!nextId) {
          return;
        }

        const node = findNativeElementById(nextId);
        if (node) {
          node.scrollIntoView?.({ block: 'center', inline: 'center', behavior: 'smooth' });
          selectNativeElement(node);
        }
        return;
      }

      if (event.data.type === 'FARHA_SELECT_TEMPLATE_TEXT') {
        const path = event.data.payload?.path;
        if (!path) {
          return;
        }

        const bindings =
          (runtimeState.manifest && runtimeState.manifest.runtimeBindings && runtimeState.manifest.runtimeBindings.fieldBindings)
          || fallbackBindings
          || {};
        const binding = bindings[path];
        const node = findTemplateTextNode(path, bindings);

        if (node) {
          node.scrollIntoView?.({ block: 'center', inline: 'center', behavior: 'smooth' });
          selectNativeElement(node, {
            label: getStudioFieldLabel(path),
            selector: binding?.selector || path,
            kind: 'text',
          });
        }

        selectTemplateText(path, {
          text: node?.innerText || node?.textContent || '',
          label: getStudioFieldLabel(path),
          preserveNativeSelection: true,
        });
        return;
      }

      if (event.data.type === 'FARHA_NATIVE_ELEMENT_UPDATE') {
        const nextId = event.data.payload?.id;
        if (!nextId) {
          return;
        }

        const node = findNativeElementById(nextId);
        if (!node) {
          return;
        }

        const currentOverride = runtimeState.nativeElementOverrides?.[nextId] || {};
        const nextOverride = {
          ...currentOverride,
          label: event.data.payload?.label || currentOverride.label || getNativeElementLabel(node),
          selector: event.data.payload?.selector || currentOverride.selector || getNativeElementSelectorHint(node) || nextId,
          kind: event.data.payload?.kind || currentOverride.kind || getNativeElementKind(node),
          ...(event.data.payload?.updates || {}),
        };

        runtimeState.nativeElementOverrides = {
          ...(runtimeState.nativeElementOverrides || {}),
          [nextId]: nextOverride,
        };

        applyNativeOverrideToNode(node, nextOverride);
        queueNativeOverlaySync();
        return;
      }

      if (event.data.type === 'FARHA_THEME_UPDATE') {
        const nextTheme = event.data.payload?.theme;
        if (!nextTheme || typeof nextTheme !== 'object' || Array.isArray(nextTheme)) {
          return;
        }

        runtimeState.renderConfig = {
          ...(runtimeState.renderConfig || {}),
          theme: {
            ...((runtimeState.renderConfig && runtimeState.renderConfig.theme) || {}),
            ...nextTheme,
          },
        };
        ensureSharedFontLibraryStyles();
        applyTheme(runtimeState.renderConfig.theme || {});
        return;
      }

      if (event.data.type === 'FARHA_TEXT_OVERRIDE') {
        const path = event.data.payload?.path;
        if (!path) {
          return;
        }

        const nextText = String(event.data.payload?.text ?? '');
        const currentOverrides = Array.isArray(runtimeState.renderConfig?.textOverrides)
          ? runtimeState.renderConfig.textOverrides
          : [];
        const otherOverrides = currentOverrides.filter((item) => item?.path !== path);
        const nextOverrides = [
          ...otherOverrides,
          {
            id: path,
            path,
            text: nextText,
          },
        ];

        runtimeState.renderConfig = {
          ...(runtimeState.renderConfig || {}),
          textOverrides: nextOverrides,
        };
        applyTextOverrides(nextOverrides);
        return;
      }

      if (event.data.type === 'FARHA_CUSTOM_ELEMENTS_SYNC') {
        const nextElements = Array.isArray(event.data.payload?.elements)
          ? event.data.payload.elements
          : [];

        runtimeState.renderConfig = {
          ...(runtimeState.renderConfig || {}),
          customElements: nextElements,
        };
        applyCustomElements(nextElements);
        return;
      }

      if (event.data.type !== 'FARHA_RENDER_CONFIG' || event.data.version !== '1.0.0') {
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
      runtimeState.invitationSlug = payload.renderConfig.invitationSlug || null;

      applyRenderConfig(payload.manifest, payload.renderConfig);
      document.querySelectorAll('form.t-form, form.js-form-proccess, #rsvp-form, #da3wa-rsvp-form, form.rsvp-form')
        .forEach((form) => syncRsvpFormReferences(form));
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
      nativeElementOverrides:
        cfg.__nativeElementOverrides && typeof cfg.__nativeElementOverrides === 'object'
          ? cfg.__nativeElementOverrides
          : {},
      preview: false,
      ui: {
        showPromoBar: true,
      },
      locale: 'ar',
    };

    runtimeState.renderConfig = renderConfig;
    runtimeState.showPromoBar = renderConfig.ui?.showPromoBar !== false;
    runtimeState.invitationId = renderConfig.invitationId;
    runtimeState.invitationSlug = renderConfig.invitationSlug || null;
    applyRenderConfig(null, renderConfig);
  }

  function applyRenderConfig(manifest, renderConfig) {
    const fields = buildLegacyFields(renderConfig.fields || {});
    const bindings =
      (manifest && manifest.runtimeBindings && manifest.runtimeBindings.fieldBindings) || fallbackBindings;

    ensureSharedFontLibraryStyles();
    runtimeState.baseFields = fields;
    runtimeState.activeLocale = renderConfig.ui?.defaultLocale || renderConfig.locale || 'ar';
    runtimeState.activeDeviceMode = resolveRenderDeviceMode(renderConfig);

    window.__INVITE__ = {
      ...(window.__INVITE__ || {}),
      renderConfig,
      opening: renderConfig.opening || { slug: 'native-template', type: 'native-template', config: {} },
      config: {
        ...((window.__INVITE__ && window.__INVITE__.config) || {}),
        ...fields,
      },
    };

    applyLocalizedContent(bindings, fields, runtimeState.activeLocale);
    applyTheme(renderConfig.theme || {});
    applySections(manifest, renderConfig.sections || {});
    ensureLanguageToggle(renderConfig, bindings);
    ensureMusicControls(fields.musicUrl || '');
    applyOpening(renderConfig.opening || { slug: 'native-template', type: 'native-template', config: {} });
    mountEntryPassLauncher(renderConfig.ui?.entryPass || null);
    if (runtimeState.preview) {
      ensureEditorDock();
    }
    syncEditorDockState();
    
    attachStudioInlineEditors(bindings);
    applyCustomElements(renderConfig.customElements || []);
    
    // NEW: apply universal text overrides
    applyTextOverrides(renderConfig.textOverrides || []);
    applyTextStyleOverrides(renderConfig.ui?.textStyleOverrides || {});
    applyNativeElementOverrides(renderConfig.nativeElementOverrides || {});
    postStudioCatalogs(bindings);
    initUniversalTextEditor();
    ensurePreviewEditableBindingsObserver();

    if (runtimeState.deviceResizeHandler) {
      window.removeEventListener('resize', runtimeState.deviceResizeHandler);
    }

    runtimeState.deviceResizeHandler = () => {
      const nextMode = resolveRenderDeviceMode(runtimeState.renderConfig);
      if (nextMode === runtimeState.activeDeviceMode) {
        return;
      }

      runtimeState.activeDeviceMode = nextMode;
      applyCustomElements(runtimeState.renderConfig?.customElements || []);
      applyNativeElementOverrides(runtimeState.renderConfig?.nativeElementOverrides || {});
    };
    window.addEventListener('resize', runtimeState.deviceResizeHandler);
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
    if (!fields.openingNames && (fields.groomName || fields.brideName)) {
      const names = [fields.groomName, fields.brideName].filter(Boolean);
      if (names.length) {
        fields.openingNames = names.join(' & ');
      }
    }

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

  function buildLocalizedFields(sourceFields, locale) {
    const localized = { ...sourceFields };
    if (locale !== 'en') return localized;

    Object.keys(sourceFields).forEach((key) => {
      if (key.endsWith('__en') || key === '__uiConfig') return;
      const localizedKey = `${key}__en`;
      const localizedValue = sourceFields[localizedKey];
      if (localizedValue == null || localizedValue === '') return;
      localized[key] = localizedValue;
    });

    return localized;
  }

  function applyLocalizedContent(bindings, baseFields, locale) {
    const localizedFields = buildLocalizedFields(baseFields, locale);

    window.__INVITE__ = {
      ...(window.__INVITE__ || {}),
      config: {
        ...((window.__INVITE__ && window.__INVITE__.config) || {}),
        ...localizedFields,
      },
    };

    Object.keys(localizedFields).forEach((fieldKey) => {
      if (fieldKey.endsWith('__en') || fieldKey === '__uiConfig') return;
      const binding = bindings[fieldKey] || fallbackBindings[fieldKey];
      if (!binding) return;

      applyBinding(binding, localizedFields[fieldKey], localizedFields);
    });

    applyComputedDate(localizedFields.weddingDate, locale);
    applyFamilyPresentation(localizedFields);
    applyMediaVisibility(localizedFields);
    applyStaticLocaleTranslations(localizedFields, locale);
    mountDynamicSections(localizedFields, runtimeState.renderConfig?.sections || {});
  }

  function applyStaticLocaleTranslations(fields, locale) {
    Object.entries(STATIC_FIELD_TRANSLATIONS).forEach(([fieldKey, config]) => {
      const localizedValue = fields[fieldKey];
      if (localizedValue != null && localizedValue !== '') {
        setTranslatedText(config.selector, localizedValue);
        return;
      }

      if (locale === 'en' && config.en) {
        setTranslatedText(config.selector, config.en);
        return;
      }

      restoreTranslatedText(config.selector);
    });

    applyStaticTextDictionary(locale);
  }

  function applyStaticTextDictionary(locale) {
    const dictionary = STATIC_TEXT_TRANSLATIONS[locale];
    const candidates = queryAll(
      'h1, h2, h3, h4, h5, h6, p, span, div, a, button, small, strong, em, label'
    );

    candidates.forEach((node) => {
      if (!node || node.children.length > 0) return;

      const currentText = (node.textContent || '').trim();
      if (!currentText) return;

      if (!node.dataset.farhaOriginalText) {
        node.dataset.farhaOriginalText = currentText;
      }

      if (!dictionary) {
        if (node.dataset.farhaOriginalText) {
          node.textContent = node.dataset.farhaOriginalText;
        }
        return;
      }

      const originalText = node.dataset.farhaOriginalText || currentText;
      const translated = dictionary[originalText];
      if (translated) {
        node.textContent = translated;
      }
    });
  }

  function setTranslatedText(selector, value) {
    const safe = value == null ? '' : String(value);
    queryAll(selector).forEach((node) => {
      if (!node.dataset.farhaOriginalText) {
        node.dataset.farhaOriginalText = (node.textContent || '').trim();
      }
      node.textContent = safe;
    });
  }

  function restoreTranslatedText(selector) {
    queryAll(selector).forEach((node) => {
      if (node.dataset.farhaOriginalText) {
        node.textContent = node.dataset.farhaOriginalText;
      }
    });
  }

  function ensureLanguageToggle(renderConfig, bindings) {
    const bilingualEnabled = Boolean(renderConfig.ui?.bilingualEnabled);

    if (!bilingualEnabled) {
      if (runtimeState.languageToggle?.parentNode) {
        runtimeState.languageToggle.parentNode.removeChild(runtimeState.languageToggle);
      }
      runtimeState.languageToggle = null;
      return;
    }

    if (!runtimeState.languageToggle) {
      const button = document.createElement('button');
      button.id = 'farha-language-toggle';
      button.type = 'button';
      button.style.cssText = [
        'position:fixed',
        'top:14px',
        'left:50%',
        'transform:translateX(-50%)',
        'z-index:2147483646',
        'padding:8px 14px',
        'border-radius:999px',
        'border:1px solid rgba(0,0,0,.12)',
        'background:rgba(255,255,255,.92)',
        'backdrop-filter:blur(8px)',
        'font:700 13px Tajawal, system-ui, sans-serif',
        'color:#1f2937',
        'box-shadow:0 10px 30px rgba(0,0,0,.12)',
        'cursor:pointer',
      ].join(';');
      button.addEventListener('click', () => {
        runtimeState.activeLocale = runtimeState.activeLocale === 'ar' ? 'en' : 'ar';
        applyLocalizedContent(bindings, runtimeState.baseFields || {}, runtimeState.activeLocale);
        updateLanguageToggleLabel();
      });
      document.body.appendChild(button);
      runtimeState.languageToggle = button;
    }

    updateLanguageToggleLabel();
  }

  function updateLanguageToggleLabel() {
    if (!runtimeState.languageToggle) return;
    runtimeState.languageToggle.textContent = runtimeState.activeLocale === 'ar' ? 'EN' : 'AR';
    document.documentElement.lang = runtimeState.activeLocale === 'en' ? 'en' : 'ar';
    document.documentElement.dir = runtimeState.activeLocale === 'en' ? 'ltr' : 'rtl';
  }

  function applyBinding(binding, value, fields) {
    if (binding.skipIfEmpty && (value === '' || value == null)) {
      return;
    }

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

    if (fields.contactPhone) {
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
          if (tagName === 'audio') {
            node.querySelectorAll('source').forEach((sourceNode) => {
              sourceNode.setAttribute('src', safe);
            });
            node.loop = true;
            node.preload = 'auto';
          }
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

  function applyComputedDate(dateValue, locale = 'ar') {
    if (!dateValue) return;

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return;

    const targetLocale = locale === 'en' ? 'en-US' : 'ar-EG';

    const longDate = date.toLocaleDateString(targetLocale, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const shortTime = date.toLocaleTimeString(targetLocale, {
      hour: '2-digit',
      minute: '2-digit',
    });
    const monthYear = date.toLocaleDateString(targetLocale, { month: 'long', year: 'numeric' });
    const dayNum = date.toLocaleDateString(targetLocale, { day: 'numeric' });
    const weekDay = date.toLocaleDateString(targetLocale, { weekday: 'long' });

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
        img.alt = `Ã˜Â°Ã™Æ’Ã˜Â±Ã™â€° ${index + 1}`;
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

  function ensureDynamicSectionStyle() {
    if (document.getElementById('farha-dynamic-sections-style')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'farha-dynamic-sections-style';
    style.textContent = `
      .farha-dynamic-section {
        max-width: min(92vw, 760px);
        margin: 28px auto;
        padding: 26px 20px;
        border-radius: 28px;
        background: rgba(255, 250, 246, 0.96);
        border: 1px solid rgba(127, 42, 31, 0.12);
        box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
        direction: rtl;
        text-align: right;
        font-family: var(--font-body, "Tajawal", system-ui, sans-serif);
      }
      .farha-dynamic-section h2 {
        margin: 0 0 10px;
        font-size: clamp(22px, 3vw, 30px);
        color: var(--farha-primary, #7f2a1f);
        font-family: var(--font-display, "Aref Ruqaa", serif);
      }
      .farha-dynamic-section p {
        margin: 0;
        color: rgba(31, 41, 55, 0.82);
        line-height: 1.9;
      }
      .farha-dynamic-grid {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        margin-top: 18px;
      }
      .farha-dynamic-box {
        padding: 16px 10px;
        border-radius: 20px;
        background: rgba(127, 42, 31, 0.05);
        border: 1px solid rgba(127, 42, 31, 0.1);
        text-align: center;
      }
      .farha-dynamic-box strong {
        display: block;
        font-size: clamp(22px, 4vw, 32px);
        color: var(--farha-primary, #7f2a1f);
        font-family: var(--font-display, "Aref Ruqaa", serif);
      }
      .farha-dynamic-box span {
        display: block;
        margin-top: 6px;
        color: rgba(31, 41, 55, 0.7);
        font-size: 13px;
      }
      .farha-dynamic-list {
        display: grid;
        gap: 10px;
        margin-top: 16px;
      }
      .farha-dynamic-note {
        padding: 14px 16px;
        border-radius: 18px;
        background: rgba(127, 42, 31, 0.05);
        border: 1px solid rgba(127, 42, 31, 0.1);
        color: #1f2937;
      }
      .farha-dynamic-form {
        display: grid;
        gap: 12px;
        margin-top: 18px;
      }
      .farha-dynamic-form input,
      .farha-dynamic-form textarea,
      .farha-dynamic-form select {
        width: 100%;
        border-radius: 16px;
        border: 1px solid rgba(127, 42, 31, 0.14);
        background: #fff;
        color: #1f2937;
        padding: 12px 14px;
        font: 500 14px var(--font-body, "Tajawal", system-ui, sans-serif);
        box-sizing: border-box;
      }
      .farha-dynamic-form button {
        border: none;
        border-radius: 999px;
        padding: 13px 18px;
        background: linear-gradient(135deg, var(--farha-primary, #7f2a1f), var(--farha-accent, #c39a58));
        color: #fff;
        font: 800 15px var(--font-body, "Tajawal", system-ui, sans-serif);
        cursor: pointer;
      }
      .farha-dynamic-feedback {
        min-height: 20px;
        font-size: 13px;
        color: #7f2a1f;
      }
      @media (max-width: 640px) {
        .farha-dynamic-grid {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
      }
    `;
    document.head.appendChild(style);
  }

  function getDynamicSectionAnchor() {
    return (
      document.querySelector('#da3wa-rsvp, #rsvp-section, #program-section, #timeline, .program, #allrecords')
      || document.body
    );
  }

  function mountDynamicSectionPortal(id, title, bodyHtml, { afterSelector = '', appendToAnchor = false, hidden = false } = {}) {
    ensureDynamicSectionStyle();

    const existing = document.getElementById(id);
    const section = existing || document.createElement('section');
    section.id = id;
    section.className = 'farha-dynamic-section';
    section.style.display = hidden ? 'none' : '';
    section.innerHTML = `
      <h2>${title}</h2>
      ${bodyHtml}
    `;

    if (!existing) {
      const afterNode = afterSelector ? document.querySelector(afterSelector) : null;
      const anchor = getDynamicSectionAnchor();
      if (afterNode && afterNode.parentElement) {
        afterNode.insertAdjacentElement('afterend', section);
      } else if (appendToAnchor && anchor) {
        anchor.appendChild(section);
      } else if (anchor && anchor !== document.body) {
        anchor.insertAdjacentElement('afterend', section);
      } else {
        document.body.appendChild(section);
      }
    }

    return section;
  }

  function mountDynamicCountdown(fields, sections) {
    const hasNativeCountdown = Boolean(document.querySelector('#countdown-section, #countdown, .count, .when'));
    const dateValue = fields.weddingDate || fields.date || '';
    if (!dateValue || hasNativeCountdown) {
      document.getElementById('farha-dynamic-countdown')?.remove();
      return;
    }

    const hidden = sections?.countdown === false;
    const section = mountDynamicSectionPortal(
      'farha-dynamic-countdown',
      String(fields.titleCountdown || 'العد التنازلي'),
      `
        <p>باقي على موعد الحفل</p>
        <div class="farha-dynamic-grid" id="farha-dynamic-countdown-grid">
          <div class="farha-dynamic-box"><strong data-unit="days">00</strong><span>يوم</span></div>
          <div class="farha-dynamic-box"><strong data-unit="hours">00</strong><span>ساعة</span></div>
          <div class="farha-dynamic-box"><strong data-unit="minutes">00</strong><span>دقيقة</span></div>
          <div class="farha-dynamic-box"><strong data-unit="seconds">00</strong><span>ثانية</span></div>
        </div>
      `,
      { hidden },
    );

    const targetDate = new Date(dateValue);
    if (Number.isNaN(targetDate.getTime())) {
      return;
    }

    const tick = () => {
      const diff = Math.max(0, targetDate.getTime() - Date.now());
      const values = {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      };

      Object.entries(values).forEach(([unit, value]) => {
        const node = section.querySelector(`[data-unit="${unit}"]`);
        if (node) {
          node.textContent = String(value).padStart(2, '0');
        }
      });
    };

    tick();
    if (section._farhaCountdownTimer) {
      window.clearInterval(section._farhaCountdownTimer);
    }
    section._farhaCountdownTimer = window.setInterval(tick, 1000);
  }

  function mountDynamicNotes(fields, sections) {
    const hasNativeNotes = Boolean(document.querySelector('#notes-section, #notesList, .notes'));
    const notes = Array.isArray(fields.notes) ? fields.notes.filter(Boolean) : [];
    if (hasNativeNotes || !notes.length) {
      document.getElementById('farha-dynamic-notes')?.remove();
      return;
    }

    const hidden = sections?.notes === false;
    mountDynamicSectionPortal(
      'farha-dynamic-notes',
      String(fields.titleNotes || 'الأسئلة والملاحظات'),
      `
        <div class="farha-dynamic-list">
          ${notes.map((note) => `<div class="farha-dynamic-note">${String(note)}</div>`).join('')}
        </div>
      `,
      { hidden },
    );
  }

  function mountDynamicRsvp(fields, sections) {
    const hasNativeRsvp = Boolean(document.querySelector('#da3wa-rsvp, #rsvp-section, #rsvp-form, #da3wa-rsvp-form, form.rsvp-form, form.t-form, form.js-form-proccess'));
    if (hasNativeRsvp) {
      document.getElementById('farha-dynamic-rsvp')?.remove();
      return;
    }

    const hidden = sections?.rsvp === false;
    const section = mountDynamicSectionPortal(
      'farha-dynamic-rsvp',
      String(fields.contactLabel || 'تأكيد الحضور'),
      `
        <p>${String(fields.contactName || 'يمكنك تأكيد حضورك من خلال النموذج التالي.')}</p>
        <form class="farha-dynamic-form rsvp-form" id="farha-dynamic-rsvp-form">
          <input type="text" name="guestName" placeholder="اسم الضيف" />
          <input type="tel" name="phone" placeholder="رقم الجوال" />
          <select name="status">
            <option value="confirmed">سأحضر</option>
            <option value="declined">لن أتمكن من الحضور</option>
          </select>
          <input type="number" name="companions" min="0" step="1" placeholder="عدد المرافقين" />
          <textarea name="message" rows="3" placeholder="رسالة أو ملاحظة إضافية"></textarea>
          <button type="submit">إرسال التأكيد</button>
          <div class="farha-dynamic-feedback" id="farha-dynamic-rsvp-feedback"></div>
        </form>
      `,
      { hidden, appendToAnchor: true },
    );

    syncRsvpFormReferences(section.querySelector('form'));
    hijackRsvpForms(true);
  }

  function mountDynamicSections(fields, sections) {
    mountDynamicCountdown(fields, sections);
    mountDynamicNotes(fields, sections);
    mountDynamicRsvp(fields, sections);
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    const wrapFont = (fontName) => {
      if (!fontName) return '';
      return `"${String(fontName).replace(/"/g, '')}", serif`;
    };

    const wrapUiFont = (fontName) => {
      if (!fontName) return '';
      return `"${String(fontName).replace(/"/g, '')}", system-ui, sans-serif`;
    };

    if (theme.primaryColor) {
      root.style.setProperty('--farha-primary', theme.primaryColor);
      [
        '--wine',
        '--wood',
        '--wood-deep',
        '--wood-soft',
        '--ink',
        '--ink-soft',
        '--rose',
        '--rose-deep',
        '--rose-ink',
        '--mauve',
        '--taupe',
        '--night-2',
        '--night-3',
        '--night-4',
      ].forEach((token) => root.style.setProperty(token, theme.primaryColor));
    }

    if (theme.accentColor) {
      root.style.setProperty('--farha-accent', theme.accentColor);
      [
        '--gold',
        '--gold-2',
        '--gold-lt',
        '--gold-hi',
        '--gold-dp',
        '--lilac',
        '--lilac-2',
        '--lilac-deep',
        '--star-1',
        '--star-2',
        '--sun',
      ].forEach((token) => root.style.setProperty(token, theme.accentColor));
    }

    if (theme.surfaceColor) {
      root.style.setProperty('--farha-surface', theme.surfaceColor);
      [
        '--surface',
        '--cream',
        '--cream-1',
        '--cream-2',
        '--cream-hi',
        '--ivory',
        '--ivory-2',
        '--ivory-3',
        '--paper',
        '--paper-2',
        '--bg-soft',
      ].forEach((token) => root.style.setProperty(token, theme.surfaceColor));
    }

    if (theme.fontHeading) {
      const displayFont = wrapFont(theme.fontHeading);
      root.style.setProperty('--farha-font-heading', theme.fontHeading);
      [
        '--font-display',
        '--font-disp',
        '--ruqaa',
        '--flow',
        '--font-script',
        '--font-verse',
      ].forEach((token) => root.style.setProperty(token, displayFont));
    }

    if (theme.fontBody) {
      const bodyFont = wrapUiFont(theme.fontBody);
      root.style.setProperty('--farha-font-body', theme.fontBody);
      [
        '--font-body',
        '--font-ui',
        '--body',
        '--kufi',
        '--font-ar',
        '--font-en',
      ].forEach((token) => root.style.setProperty(token, bodyFont));
    }

    if (runtimeState.themeStyleTag?.parentNode) {
      runtimeState.themeStyleTag.parentNode.removeChild(runtimeState.themeStyleTag);
    }

    const themeCss = `
      body,
      .t-body,
      #allrecords,
      .card,
      .sheet,
      .wrap,
      .panel,
      .surface,
      .t396__artboard {
        ${theme.surfaceColor ? `background-color: ${theme.surfaceColor} !important;` : ''}
      }
      h1, h2, h3, h4,
      .section__title,
      .sec__title,
      .hero__name,
      .family__names,
      .venue__name,
      .hero__eyebrow,
      .closing__hashtag,
      .closing__note,
      .tn-atom {
        ${theme.primaryColor ? `color: ${theme.primaryColor} !important;` : ''}
        ${theme.fontHeading ? `font-family: ${wrapFont(theme.fontHeading)} !important;` : ''}
      }
      body, p, span, a, li, small, input, textarea, select, label,
      .hero__invite,
      .invitation__text,
      .when__date,
      .when__time,
      .venue__addr,
      .notes__list,
      .family__label {
        ${theme.fontBody ? `font-family: ${wrapUiFont(theme.fontBody)} !important;` : ''}
      }
      button,
      .btn,
      .hero__scroll,
      .venue__btn,
      .contact__link,
      #musicToggle {
        ${theme.accentColor ? `border-color: ${theme.accentColor} !important;` : ''}
      }
      #musicToggle,
      .venue__btn,
      .hero__scroll {
        ${theme.accentColor ? `background: ${theme.accentColor} !important;` : ''}
        ${theme.primaryColor ? `color: ${theme.primaryColor} !important;` : ''}
      }
    `;

    runtimeState.themeStyleTag = document.createElement('style');
    runtimeState.themeStyleTag.id = 'farha-runtime-theme-style';
    runtimeState.themeStyleTag.textContent = themeCss;
    document.head.appendChild(runtimeState.themeStyleTag);
  }

  function findPrimaryAudio() {
    return queryAll(MUSIC_SELECTORS).find((node) => (node.tagName || '').toLowerCase() === 'audio') || null;
  }

  function syncAudioToggleState(audio) {
    if (!audio || !runtimeState.audioToggle) return;
    runtimeState.audioToggle.textContent = audio.paused ? 'Ã˜ÂªÃ˜Â´Ã˜ÂºÃ™Å Ã™â€ž Ã˜Â§Ã™â€žÃ˜ÂµÃ™Ë†Ã˜Âª' : 'Ã™Æ’Ã˜ÂªÃ™â€¦ Ã˜Â§Ã™â€žÃ˜ÂµÃ™Ë†Ã˜Âª';
    runtimeState.audioToggle.setAttribute('aria-pressed', audio.paused ? 'false' : 'true');
  }

  function ensureRuntimeAudioToggle(audio) {
    if (!audio) return;

    if (!runtimeState.audioToggle) {
      const button = document.createElement('button');
      button.id = 'farha-runtime-audio-toggle';
      button.type = 'button';
      button.style.cssText = [
        'position:fixed',
        'right:18px',
        'bottom:18px',
        'z-index:2147483646',
        'border:1px solid rgba(0,0,0,.08)',
        'border-radius:999px',
        'padding:10px 16px',
        'font:600 14px Tajawal, system-ui, sans-serif',
        'box-shadow:0 10px 30px rgba(0,0,0,.16)',
        'cursor:pointer',
      ].join(';');
      button.addEventListener('click', () => {
        const currentAudio = findPrimaryAudio();
        if (!currentAudio) return;
        if (currentAudio.paused) {
          currentAudio.play?.().catch(() => {});
        } else {
          currentAudio.pause?.();
        }
        syncAudioToggleState(currentAudio);
      });
      document.body.appendChild(button);
      runtimeState.audioToggle = button;
    }

    if (runtimeState.audioSyncHandler) {
      audio.removeEventListener('play', runtimeState.audioSyncHandler);
      audio.removeEventListener('pause', runtimeState.audioSyncHandler);
      audio.removeEventListener('ended', runtimeState.audioSyncHandler);
    }

    runtimeState.audioSyncHandler = () => syncAudioToggleState(audio);
    audio.addEventListener('play', runtimeState.audioSyncHandler);
    audio.addEventListener('pause', runtimeState.audioSyncHandler);
    audio.addEventListener('ended', runtimeState.audioSyncHandler);
    syncAudioToggleState(audio);
  }

  function revealNativeAudioButtons() {
    queryAll(NATIVE_AUDIO_BUTTON_SELECTORS).forEach((button) => {
      button.hidden = false;
      button.style.display = '';
      button.style.visibility = 'visible';
      button.style.opacity = '1';
      button.classList?.remove('hidden');
    });
  }

  function ensureMusicControls(musicUrl) {
    if (!musicUrl) return;

    const audio = findPrimaryAudio();
    if (!audio) return;

    if (audio.getAttribute('src') !== musicUrl) {
      audio.setAttribute('src', musicUrl);
      audio.querySelectorAll('source').forEach((sourceNode) => {
        sourceNode.setAttribute('src', musicUrl);
      });
      audio.load?.();
    }

    revealNativeAudioButtons();
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
            countdown: ['#countdown-section', '#countdown', '.count', '.when'],
            timeline: ['#program-section', '#timeline', '.program'],
            rsvp: ['#rsvp-section', '#da3wa-rsvp'],
            notes: ['#notes-section', '#notesList', '.notes'],
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

    if (opening.slug === 'minimal-fade' || opening.type === 'shared-overlay') {
      hideNativeOpeningLayers();
      showInteractiveOpeningOverlay(opening.config || {});
    }
  }

  function hideNativeOpeningLayers() {
    queryAll('#envelope-screen, #intro-layer, #popup-overlay, #preloader, #opening-screen, #cover, #gate, #envelope, #env, #weiOverlay, #weiVideoWrap, #weiTapWrap, #weiVideo').forEach((node) => {
      node.style.display = 'none';
      node.classList?.add('hidden');
      node.classList?.add('fade-out');
      node.classList?.add('is-gone');
      node.classList?.add('is-done');
      node.classList?.add('is-open');
      node.classList?.add('is-revealed');
      node.classList?.add('is-arrived');
    });
    queryAll('#preloaderPoster, #preloaderVideo, #doorGlow, #preloaderWhite, #preloaderNight, #poster-container, #doorVid').forEach((node) => {
      node.style.display = 'none';
      node.classList?.add('hidden');
      node.classList?.add('fade-out');
    });
    queryAll('#invitation-container, #main-content, #invite, .invite').forEach((node) => {
      node.classList.remove('hidden', 'hidden-opacity');
      node.classList.add('visible', 'is-visible', 'is-ready');
      node.setAttribute?.('aria-hidden', 'false');
      node.hidden = false;
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.pointerEvents = 'auto';
      node.style.display = '';
    });
    queryAll('#site, .site, #allrecords, .stage, .card, .wrap, .sheet, .hero').forEach((node) => {
      node.classList?.add('visible');
      node.classList?.add('is-visible', 'is-ready', 'is-in', 'is-clear');
      node.classList?.remove('hidden', 'hidden-opacity', 'locked');
      node.hidden = false;
      node.style.opacity = '1';
      node.style.visibility = 'visible';
      node.style.pointerEvents = 'auto';
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
        <p class="fmo-text">Ã™â€žÃ˜Â­Ã˜Â¸Ã˜Â© Ã™Ë†Ã˜Â§Ã˜Â­Ã˜Â¯Ã˜Â©... Ã˜Â¯Ã˜Â¹Ã™Ë†Ã˜ÂªÃ™Æ’Ã™â€¦ Ã˜ÂªÃ™ÂÃ™ÂÃ˜ÂªÃ˜Â­ Ã˜Â§Ã™â€žÃ˜Â¢Ã™â€ </p>
        <button type="button" class="fmo-skip">Ã˜ÂªÃ˜Â®Ã˜Â·Ã™Å </button>
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

  function showInteractiveOpeningOverlay(config) {
    if (document.getElementById('farha-interactive-opening')) return;

    const fields = runtimeState.renderConfig?.fields || {};
    const theme = runtimeState.renderConfig?.theme || {};
    const interactionMode = String(config.interactionMode || (config.requiresUserInteraction ? 'tap-button' : 'auto'));
    const requiredKnocks = Math.max(Number(config.requiredKnocks || 3), 1);
    const title = String(fields.openingNames || fields.groomName || '').trim();
    const hint = String(fields.openingHint || config.interactionHint || 'اضغط لفتح الافتتاحية').trim();
    const kicker = String(fields.openingKicker || '').trim();
    const buttonLabel = String(fields.openButtonLabel || 'فتح الدعوة').trim();
    const videoUrl = String(fields.openingVideo || '').trim();
    const posterUrl = String(fields.openingPoster || fields.openingBackgroundImage || fields['images.background'] || '').trim();
    const primaryColor = String(theme.primaryColor || '#7f2a1f').trim();
    const accentColor = String(theme.accentColor || '#d9b26f').trim();

    const overlay = document.createElement('div');
    overlay.id = 'farha-interactive-opening';
    overlay.innerHTML = `
      ${videoUrl ? `<video class="fio-video" src="${videoUrl}" ${posterUrl ? `poster="${posterUrl}"` : ''} muted playsinline preload="auto"></video>` : ''}
      <div class="fio-scrim"></div>
      ${(interactionMode === 'knock' || interactionMode === 'tap-anywhere') ? '<button type="button" class="fio-hitarea" aria-label="التفاعل مع الافتتاحية"></button>' : ''}
      <div class="fio-card">
        ${kicker ? `<div class="fio-mark">${kicker}</div>` : ''}
        ${title ? `<h2 class="fio-title">${title}</h2>` : ''}
        <p class="fio-text">${hint}</p>
        ${interactionMode === 'knock'
          ? `<div class="fio-knocks">${Array.from({ length: requiredKnocks }).map(() => '<span class="fio-knock-dot"></span>').join('')}</div>`
          : ''}
        ${interactionMode === 'tap-button' ? `<button type="button" class="fio-action">${buttonLabel}</button>` : ''}
      </div>
    `;

    const style = document.createElement('style');
    style.id = 'farha-interactive-opening-style';
    style.textContent = `
      #farha-interactive-opening {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: grid;
        place-items: center;
        overflow: hidden;
        background: ${posterUrl
          ? `linear-gradient(180deg, rgba(21,12,11,.34), rgba(21,12,11,.76)), url("${posterUrl}") center/cover no-repeat`
          : 'radial-gradient(circle at top, rgba(195,154,88,.25), rgba(21,12,11,.92))'};
        color: #fffaf6;
      }
      #farha-interactive-opening .fio-video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0;
        transition: opacity .35s ease;
      }
      #farha-interactive-opening[data-video-playing="true"] .fio-video {
        opacity: 1;
      }
      #farha-interactive-opening .fio-scrim {
        position: absolute;
        inset: 0;
        background: radial-gradient(circle at top, rgba(255,255,255,.16), transparent 26%), linear-gradient(180deg, rgba(21,12,11,.2), rgba(21,12,11,.7));
      }
      #farha-interactive-opening .fio-hitarea {
        position: absolute;
        inset: 0;
        z-index: 2;
        border: none;
        background: transparent;
        cursor: pointer;
      }
      #farha-interactive-opening .fio-card {
        position: relative;
        z-index: 3;
        padding: 32px 28px;
        min-width: 280px;
        text-align: center;
        border-radius: 24px;
        background: rgba(255,255,255,.08);
        backdrop-filter: blur(18px);
        border: 1px solid rgba(255,255,255,.18);
        box-shadow: 0 24px 48px rgba(0,0,0,.25);
      }
      #farha-interactive-opening .fio-mark {
        font: 700 13px "Tajawal", sans-serif;
        color: rgba(255,255,255,.86);
      }
      #farha-interactive-opening .fio-title {
        margin: 12px 0 0;
        font: 800 34px "Tajawal", sans-serif;
      }
      #farha-interactive-opening .fio-text {
        margin: 14px 0 0;
        font: 600 15px "Tajawal", sans-serif;
      }
      #farha-interactive-opening .fio-knocks {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin-top: 16px;
      }
      #farha-interactive-opening .fio-knock-dot {
        width: 13px;
        height: 13px;
        border-radius: 999px;
        border: 1.6px solid rgba(253,247,231,.85);
        background: transparent;
        transition: background .2s ease, border-color .2s ease, transform .2s ease;
      }
      #farha-interactive-opening .fio-knock-dot.is-hit {
        background: ${accentColor};
        border-color: ${accentColor};
        transform: scale(1.18);
      }
      #farha-interactive-opening .fio-action {
        margin-top: 18px;
        padding: 10px 18px;
        border-radius: 999px;
        border: none;
        background: linear-gradient(135deg, ${primaryColor}, ${accentColor});
        color: #fff;
        font: inherit;
        font-weight: 800;
      }
      @keyframes farhaInteractiveFadeOut {
        to {
          opacity: 0;
          visibility: hidden;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(overlay);

    overlay.dataset.videoPlaying = 'false';
    let knocks = 0;
    const dots = Array.from(overlay.querySelectorAll('.fio-knock-dot'));
    const videoNode = overlay.querySelector('.fio-video');
    const dismiss = () => {
      overlay.remove();
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
    const finish = () => {
      overlay.style.animation = 'farhaInteractiveFadeOut 0.9s ease forwards';
      window.setTimeout(dismiss, 950);
    };
    const startVideoThenFinish = () => {
      if (!videoNode) {
        finish();
        return;
      }

      overlay.dataset.videoPlaying = 'true';
      try {
        videoNode.currentTime = 0;
      } catch {}
      const fallbackTimer = window.setTimeout(
        finish,
        Math.max(Number(config.overlayDurationMs || 2200), 3200),
      );
      videoNode.onended = () => {
        window.clearTimeout(fallbackTimer);
        finish();
      };
      const playPromise = videoNode.play?.();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          window.clearTimeout(fallbackTimer);
          finish();
        });
      }
    };
    const trigger = () => {
      if (interactionMode === 'knock') {
        knocks += 1;
        if (dots[knocks - 1]) {
          dots[knocks - 1].classList.add('is-hit');
        }
        if (knocks < requiredKnocks) {
          return;
        }
      }
      startVideoThenFinish();
    };

    overlay.querySelector('.fio-action')?.addEventListener('click', trigger);
    overlay.querySelector('.fio-hitarea')?.addEventListener('click', trigger);

    if (interactionMode === 'knock' || interactionMode === 'tap-anywhere' || interactionMode === 'tap-button') {
      return;
    }

    window.setTimeout(startVideoThenFinish, 600);
  }

  function hijackRsvpForms(forceRebind) {
    const forms = document.querySelectorAll('form.t-form, form.js-form-proccess, #rsvp-form, #da3wa-rsvp-form, form.rsvp-form');

    forms.forEach((form) => {
      if (form.dataset.farhaBound === 'true' && !forceRebind) return;

      syncRsvpFormReferences(form);
      form.dataset.farhaBound = 'true';
      form.removeAttribute('action');
      form.onsubmit = null;
      restorePersistedRsvpTicket(form);

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const data = collectRsvpPayload(form);
        const submitButton = form.querySelector('button[type="submit"], #submitBtn, .send');
        const feedback = findRsvpFeedbackTarget(form);
        const originalText = submitButton ? submitButton.textContent : '';

        if (!data.invitationId && !data.invitationSlug) {
          showFeedback(feedback, 'تعذر تحديد الدعوة الحالية. أعد تحميل الصفحة ثم حاول مرة أخرى.', false);
          return;
        }

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = runtimeState.preview ? 'Ã™â€¦Ã˜Â¹Ã˜Â§Ã™Å Ã™â€ Ã˜Â©...' : 'Ã˜Â¬Ã˜Â§Ã˜Â±Ã™Å  Ã˜Â§Ã™â€žÃ˜Â¥Ã˜Â±Ã˜Â³Ã˜Â§Ã™â€ž...';
        }

        try {
          if (runtimeState.preview) {
            showFeedback(feedback, 'Ã™â€¡Ã˜Â°Ã™â€¡ Ã™â€¦Ã˜Â¹Ã˜Â§Ã™Å Ã™â€ Ã˜Â© Ã™ÂÃ™â€šÃ˜Â·. Ã˜ÂªÃ™â€¦ Ã˜Â­Ã™ÂÃ˜Â¸ Ã˜Â§Ã™â€žÃ˜Â±Ã˜Â¯ Ã˜ÂªÃ˜Â¬Ã˜Â±Ã™Å Ã˜Â¨Ã™Å Ã™â€¹Ã˜Â§ Ã˜Â¯Ã˜Â§Ã˜Â®Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â§Ã™Å Ã™â€ Ã˜Â©.', true);
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
            throw new Error(result.error || 'Ã˜ÂªÃ˜Â¹Ã˜Â°Ã˜Â± Ã˜Â¥Ã˜Â±Ã˜Â³Ã˜Â§Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â±Ã˜Â¯');
          }

          showFeedback(feedback, result.message || 'Ã˜ÂªÃ™â€¦ Ã˜Â§Ã˜Â³Ã˜ÂªÃ™â€žÃ˜Â§Ã™â€¦ Ã˜Â±Ã˜Â¯Ã™Æ’Ã™â€¦ Ã˜Â¨Ã™â€ Ã˜Â¬Ã˜Â§Ã˜Â­.', true);
          renderRsvpQrTicket(form, result);
          form.reset();
        } catch (error) {
          console.error('RSVP submit failed:', error);
          showFeedback(feedback, error.message || 'Ã˜Â­Ã˜Â¯Ã˜Â« Ã˜Â®Ã˜Â·Ã˜Â£ Ã˜Â£Ã˜Â«Ã™â€ Ã˜Â§Ã˜Â¡ Ã˜Â¥Ã˜Â±Ã˜Â³Ã˜Â§Ã™â€ž Ã˜Â§Ã™â€žÃ˜Â±Ã˜Â¯.', false);
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = originalText || 'Ã˜Â¥Ã˜Â±Ã˜Â³Ã˜Â§Ã™â€ž';
          }
        }
      }, true);
    });
  }

  function collectRsvpPayload(form) {
    const routeSegments = window.location.pathname.split('/').filter(Boolean);
    const routeInviteSlug = routeSegments[0] === 'invite' ? (routeSegments[1] || '') : '';
    const rawData = new FormData(form);
    const payload = {
      invitationId:
        runtimeState.invitationId ||
        form.getAttribute('data-invitation-id') ||
        form.dataset.invitationId ||
        document.getElementById('da3wa-rsvp')?.getAttribute('data-inv') ||
        document.querySelector('[data-invitation-id]')?.getAttribute('data-invitation-id') ||
        window.__INVITE__?.config?.id ||
        '',
      invitationSlug:
        runtimeState.invitationSlug ||
        runtimeState.renderConfig?.invitationSlug ||
        form.getAttribute('data-invitation-slug') ||
        form.dataset.invitationSlug ||
        document.querySelector('[data-invitation-slug]')?.getAttribute('data-invitation-slug') ||
        window.__INVITE__?.renderConfig?.invitationSlug ||
        routeInviteSlug ||
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

  function syncRsvpFormReferences(form) {
    if (!form) return;

    const invitationId =
      runtimeState.invitationId ||
      runtimeState.renderConfig?.invitationId ||
      window.__INVITE__?.renderConfig?.invitationId ||
      window.__INVITE__?.config?.id ||
      '';
    const invitationSlug =
      runtimeState.invitationSlug ||
      runtimeState.renderConfig?.invitationSlug ||
      window.__INVITE__?.renderConfig?.invitationSlug ||
      '';

    if (invitationId) {
      form.setAttribute('data-invitation-id', invitationId);
      let hiddenIdInput = form.querySelector('input[name="invitationId"]');
      if (!hiddenIdInput) {
        hiddenIdInput = document.createElement('input');
        hiddenIdInput.type = 'hidden';
        hiddenIdInput.name = 'invitationId';
        form.appendChild(hiddenIdInput);
      }
      hiddenIdInput.value = invitationId;
    }

    if (invitationSlug) {
      form.setAttribute('data-invitation-slug', invitationSlug);
      let hiddenSlugInput = form.querySelector('input[name="invitationSlug"]');
      if (!hiddenSlugInput) {
        hiddenSlugInput = document.createElement('input');
        hiddenSlugInput.type = 'hidden';
        hiddenSlugInput.name = 'invitationSlug';
        form.appendChild(hiddenSlugInput);
      }
      hiddenSlugInput.value = invitationSlug;
    }
  }

  function findRsvpFeedbackTarget(form) {
    return (
      form.querySelector('#rsvpMsg, #da3wa-err, .js-successbox') ||
      form.parentElement?.querySelector('#rsvpMsg, #da3wa-err, .js-successbox')
    );
  }

  function localizeRsvpMessage(text) {
    const value = String(text || '').trim();
    if (!value) return value;

    const dictionary = new Map([
      ['Invitation reference is required.', 'تعذر تحديد الدعوة الحالية. أعد تحميل الصفحة ثم حاول مرة أخرى.'],
      ['Invitation reference is required', 'تعذر تحديد الدعوة الحالية. أعد تحميل الصفحة ثم حاول مرة أخرى.'],
      ['Invitation not found.', 'لم يتم العثور على الدعوة الحالية.'],
      ['Failed to submit RSVP.', 'تعذر إرسال تأكيد الحضور.'],
      ['Invalid RSVP payload.', 'بيانات تأكيد الحضور غير مكتملة.'],
      ['Too many RSVP attempts. Please try again later.', 'تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقًا.'],
      ['تم استلام ردكم بنجاح. نشكركم على التأكيد.', 'تم استلام تأكيد الحضور بنجاح.'],
      ['ØªÙ… Ø§Ø³ØªÙ„Ø§Ù… Ø±Ø¯ÙƒÙ… Ø¨Ù†Ø¬Ø§Ø­. Ù†Ø´ÙƒØ±ÙƒÙ… Ø¹Ù„Ù‰ Ø§Ù„ØªØ£ÙƒÙŠØ¯.', 'تم استلام تأكيد الحضور بنجاح.'],
      ['ØªØ¹Ø°Ø± ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø¯Ø¹ÙˆØ© Ø§Ù„Ø­Ø§Ù„ÙŠØ©. Ø£Ø¹Ø¯ ØªØ­Ù…ÙŠÙ„ Ø§Ù„ØµÙØ­Ø© Ø«Ù… Ø­Ø§ÙˆÙ„ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰.', 'تعذر تحديد الدعوة الحالية. أعد تحميل الصفحة ثم حاول مرة أخرى.'],
    ]);

    if (dictionary.has(value)) {
      return dictionary.get(value);
    }

    if (value.includes('Invitation reference is required')) {
      return 'تعذر تحديد الدعوة الحالية. أعد تحميل الصفحة ثم حاول مرة أخرى.';
    }

    if (/[ÃØÙ]/.test(value)) {
      return 'تم تنفيذ العملية، لكن النص الوارد من القالب قديم الترميز.';
    }

    return value;
  }

  function showFeedback(target, text, success) {
    if (!target) return;
    target.style.display = 'block';
    target.textContent = localizeRsvpMessage(text);
    target.style.color = success ? '#1f9d61' : '#d9475c';
  }

  function getRsvpTicketStorageKey() {
    const invitationKey =
      runtimeState.invitationId ||
      runtimeState.invitationSlug ||
      runtimeState.renderConfig?.invitationId ||
      runtimeState.renderConfig?.invitationSlug ||
      window.__INVITE__?.config?.id ||
      window.__INVITE__?.renderConfig?.invitationSlug ||
      window.location.pathname;

    return invitationKey ? `farha-rsvp-ticket:${invitationKey}` : null;
  }

  function persistRsvpTicket(result) {
    const storageKey = getRsvpTicketStorageKey();
    if (!storageKey || !result || !result.qrCodeDataUrl) return;

    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify({
          qrCodeDataUrl: result.qrCodeDataUrl,
          qrCodeViewUrl: result.qrCodeViewUrl || '',
          qrCodeDownloadUrl: result.qrCodeDownloadUrl || '',
          qrCodeDownloadName: result.qrCodeDownloadName || 'farha-rsvp-qr.png',
        }),
      );
    } catch (error) {
      console.warn('Failed to persist RSVP ticket', error);
    }
  }

  function restorePersistedRsvpTicket(form) {
    if (!form) return;
    const storageKey = getRsvpTicketStorageKey();
    if (!storageKey) return;

    try {
      const rawValue = window.localStorage.getItem(storageKey);
      if (!rawValue) return;
      const parsed = JSON.parse(rawValue);
      if (!parsed || !parsed.qrCodeDataUrl) return;
      renderRsvpQrTicket(form, parsed);
    } catch (error) {
      console.warn('Failed to restore RSVP ticket', error);
    }
  }

  function renderRsvpQrTicket(form, result) {
    if (!result || !result.qrCodeDataUrl) return;

    const feedback = findRsvpFeedbackTarget(form);
    let host = form.parentElement?.querySelector('.farha-rsvp-ticket') || feedback;
    if (!host) {
      host = document.createElement('div');
      host.className = 'farha-rsvp-ticket';
      form.insertAdjacentElement('afterend', host);
    } else {
      host.classList.add('farha-rsvp-ticket');
    }

    host.style.display = 'block';
    host.style.marginTop = '16px';
    host.style.padding = '18px';
    host.style.borderRadius = '18px';
    host.style.background = '#fff';
    host.style.border = '1px solid rgba(127,42,31,.18)';
    host.style.boxShadow = '0 18px 40px rgba(15,23,42,.08)';
    host.style.textAlign = 'center';
    host.style.minHeight = 'auto';
    host.style.color = '';

    host.innerHTML = `
      <div style="font-weight:800;color:#7f2a1f;font-size:16px;margin-bottom:10px;">QR Code الخاص بحضورك</div>
      <img
        src="${result.qrCodeDataUrl}"
        alt="RSVP QR Code"
        style="width:min(72vw,220px);height:auto;display:block;margin:0 auto 12px;background:#fff;padding:10px;border-radius:14px;box-shadow:0 8px 24px rgba(15,23,42,.08)"
      />
      <div style="font-size:13px;color:#6b7280;line-height:1.8;margin-bottom:12px;">
        هذا الكود فريد لهذا المستخدم فقط ويمكن تنزيله والاحتفاظ به.
      </div>
      <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
        <a
          href="${result.qrCodeDataUrl}"
          download="${result.qrCodeDownloadName || 'farha-rsvp-qr.png'}"
          style="display:inline-flex;align-items:center;justify-content:center;padding:10px 18px;border-radius:999px;background:#7f2a1f;color:#fff;text-decoration:none;font-weight:700;"
        >
          تحميل QR
        </a>
        <a
          href="${result.qrCodeViewUrl || '#'}"
          target="_blank"
          rel="noreferrer"
          style="display:inline-flex;align-items:center;justify-content:center;padding:10px 18px;border-radius:999px;background:#f6efe8;color:#7f2a1f;text-decoration:none;font-weight:700;border:1px solid rgba(127,42,31,.18);"
        >
          فتح الكود
        </a>
      </div>
    `;

    host.innerHTML = host.innerHTML
      .replace('QR Code Ø§Ù„Ø®Ø§Øµ Ø¨Ø­Ø¶ÙˆØ±Ùƒ', 'رمز QR الخاص بحضورك')
      .replace('Ù‡Ø°Ø§ Ø§Ù„ÙƒÙˆØ¯ ÙØ±ÙŠØ¯ Ù„Ù‡Ø°Ø§ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… ÙÙ‚Ø· ÙˆÙŠÙ…ÙƒÙ† ØªÙ†Ø²ÙŠÙ„Ù‡ ÙˆØ§Ù„Ø§Ø­ØªÙØ§Ø¸ Ø¨Ù‡.', 'هذا الرمز خاص بحضورك فقط، ويمكنك تنزيله والاحتفاظ به.')
      .replace('ØªØ­Ù…ÙŠÙ„ QR', 'تحميل QR')
      .replace('ÙØªØ­ Ø§Ù„ÙƒÙˆØ¯', 'فتح الكود');

    persistRsvpTicket(result);

    host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    const priceLabel = publicData.minPriceLabel ? `Ã˜ÂªÃ˜Â¨Ã˜Â¯Ã˜Â£ Ã™â€¦Ã™â€  ${publicData.minPriceLabel} - ` : '';
    const whatsappText = encodeURIComponent(
      `Ã™â€¦Ã˜Â±Ã˜Â­Ã˜Â¨Ã˜Â§Ã™â€¹Ã˜Å’ Ã˜Â£Ã˜Â¹Ã˜Â¬Ã˜Â¨Ã™â€ Ã™Å  Ã™â€šÃ˜Â§Ã™â€žÃ˜Â¨ Ã‚Â«${TEMPLATE_META[runtimeState.templateSlug].arabicName}Ã‚Â» Ã™Ë†Ã˜Â£Ã˜Â±Ã˜ÂºÃ˜Â¨ Ã™ÂÃ™Å  Ã˜Â·Ã™â€žÃ˜Â¨Ã™â€¡ Ã™â€¦Ã™â€  FARHA.`,
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
        <p class="ftb-title">Ã˜Â£Ã˜Â¹Ã˜Â¬Ã˜Â¨Ã™Æ’ Ã™â€šÃ˜Â§Ã™â€žÃ˜Â¨ Ã‚Â«${TEMPLATE_META[runtimeState.templateSlug].arabicName}Ã‚Â»Ã˜Å¸</p>
        <p class="ftb-sub">${priceLabel}Ã˜Â§Ã˜Â·Ã™â€žÃ˜Â¨Ã™â€¡ Ã˜Â§Ã™â€žÃ˜Â¢Ã™â€  Ã™â€¦Ã™â€  FARHA Ã™Ë†Ã™â€ Ã˜Â¬Ã™â€¡Ã˜Â²Ã™â€¡ Ã™â€žÃ™Å Ã˜ÂªÃ™â€ Ã˜Â§Ã˜Â³Ã˜Â¨ Ã™â€¦Ã˜Â¹ Ã™â€¦Ã™â€ Ã˜Â§Ã˜Â³Ã˜Â¨Ã˜ÂªÃ™Æ’Ã™â€¦</p>
        <p class="ftb-note">Ã™â€¡Ã˜Â°Ã˜Â§ Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Å Ã˜Â· Ã™â€žÃ™â€žÃ˜Â¹Ã˜Â±Ã˜Â¶ Ã™ÂÃ™â€šÃ˜Â· - Ã˜Â¯Ã˜Â¹Ã™Ë†Ã˜ÂªÃ™Æ’Ã™â€¦ Ã˜Â§Ã™â€žÃ™â€ Ã™â€¡Ã˜Â§Ã˜Â¦Ã™Å Ã˜Â© Ã˜ÂªÃ˜ÂµÃ™â€žÃ™Æ’Ã™â€¦ Ã™â€ Ã˜Â¸Ã™Å Ã™ÂÃ˜Â© Ã˜Â¨Ã˜Â¯Ã™Ë†Ã™â€ Ã™â€¡</p>
      </div>
      <div class="ftb-actions">
        <button class="ftb-close" type="button" aria-label="Ã˜Â¥Ã˜ÂºÃ™â€žÃ˜Â§Ã™â€š">Ãƒâ€”</button>
        <a class="ftb-wa" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" aria-label="Ã™Ë†Ã˜Â§Ã˜ÂªÃ˜Â³Ã˜Â§Ã˜Â¨">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
          </svg>
        </a>
        <a class="ftb-order" href="${orderUrl}">Ã˜Â§Ã˜Â·Ã™â€žÃ˜Â¨Ã™â€¡ Ã˜Â§Ã™â€žÃ˜Â¢Ã™â€ </a>
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
            const currencyLabel = cheapest.currency === 'EGP' ? 'Ã˜Â¬.Ã™â€¦' : cheapest.currency || '';
            defaults.minPriceLabel = `${cheapest.price} ${currencyLabel}`.trim();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load FARHA promo bar data:', error);
    }

    return defaults;
  }
  function attachStudioInlineEditors(bindings) {
    if (!runtimeState.preview) return;

    if (!document.getElementById('farha-studio-inline-style')) {
      const style = document.createElement('style');
      style.id = 'farha-studio-inline-style';
      style.textContent = `
        .farha-studio-editable {
          transition: all 0.2s ease-in-out;
          cursor: move !important;
          position: relative;
          user-select: none !important;
          -webkit-user-select: none !important;
          touch-action: none !important;
          -webkit-touch-callout: none !important;
        }
        .farha-studio-editable:hover {
          outline: 2px dashed #ff4d7d !important;
          outline-offset: 4px !important;
          opacity: 0.8 !important;
          z-index: 99999;
        }
        .farha-studio-editable[data-farha-selected="true"] {
          outline: 2px solid #7f2a1f !important;
          outline-offset: 4px !important;
          background: rgba(255, 255, 255, 0.14) !important;
          border-radius: 8px;
          z-index: 99999;
        }
        .farha-studio-editable[data-farha-locked="true"] {
          cursor: not-allowed !important;
          filter: saturate(0.86);
        }
        .farha-studio-editable::after {
          content: 'ØªØ¹Ø¯ÙŠÙ„';
          position: absolute;
          top: -24px;
          right: 0;
          background: #ff4d7d;
          color: #fff;
          font-size: 11px;
          font-family: Tajawal, sans-serif;
          padding: 2px 6px;
          border-radius: 4px;
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
          white-space: nowrap;
        }
        .farha-studio-editable:hover::after {
          opacity: 1;
        }
        .farha-studio-editable[data-farha-selected="true"]::after,
        .farha-studio-editable[data-farha-locked="true"]::after {
          opacity: 1;
        }
        .farha-studio-editable[data-farha-locked="true"]::after {
          content: 'مقفول';
          background: #7f2a1f;
        }
        .farha-studio-editable[contenteditable="true"]:focus {
          outline: 2px solid #7f2a1f !important;
          outline-offset: 4px !important;
          background: rgba(255,255,255,0.18) !important;
          border-radius: 8px;
        }
        .farha-studio-editable[contenteditable="true"],
        .farha-studio-editable[data-farha-editing="true"] {
          cursor: text !important;
          user-select: text !important;
          -webkit-user-select: text !important;
          touch-action: manipulation !important;
          -webkit-touch-callout: default !important;
        }
        .farha-studio-editing {
          outline: 2px solid #7f2a1f !important;
          outline-offset: 4px !important;
          border-radius: 8px;
        }
        .farha-studio-editing::after,
        .farha-studio-editable[data-farha-editing="true"]::after {
          opacity: 0 !important;
        }
      `;
      document.head.appendChild(style);
    }

    Object.keys(bindings).forEach((fieldKey) => {
      const binding = bindings[fieldKey];
      if (!binding || !binding.selector || binding.method !== 'text') return;
      
      const elements = queryAll(binding.selector);
      elements.forEach(el => {
        el.classList.add('farha-studio-editable');
        el.dataset.farhaStudioField = fieldKey;
        el.dataset.farhaInlineEditable = 'true';
        el.contentEditable = 'false';
        el.spellcheck = false;
        el.setAttribute('tabindex', '0');
        el.style.userSelect = 'none';
        el.style.webkitUserSelect = 'none';
        el.style.cursor = 'move';
        el.style.touchAction = 'manipulation';
        el.style.webkitTouchCallout = 'none';
        el.dataset.farhaLocked = isTextPathLocked(fieldKey) ? 'true' : 'false';

        if (!el.dataset.farhaInlineBound) {
          el.addEventListener('mousedown', (event) => {
            if (el.getAttribute('data-farha-editing') === 'true') {
              event.stopPropagation();
            }
          });
          el.addEventListener('touchstart', (event) => {
            if (el.getAttribute('data-farha-editing') === 'true') {
              event.stopPropagation();
            }
          }, { passive: true });
          const openTemplateTextEditor = (triggerEvent = null) => {
            selectTemplateText(fieldKey, {
              text: el.innerText || '',
              label: getStudioFieldLabel(fieldKey),
              preserveNativeSelection: true,
            });
            if (isTextPathLocked(fieldKey)) {
              return;
            }
            openFloatingTextEditor({
              target: el,
              initialValue: el.innerText || '',
              triggerEvent,
              onCommit: (nextValue) => {
                window.parent.postMessage({
                  type: 'FARHA_TEXT_OVERRIDE',
                  payload: {
                    path: fieldKey,
                    text: nextValue.trim(),
                    label: getStudioFieldLabel(fieldKey),
                    preserveNativeSelection: true,
                  },
                }, '*');
              },
            });
          };
          el.addEventListener('click', (event) => {
            event.stopPropagation();
            selectNativeElement(el, {
              label: getStudioFieldLabel(fieldKey),
              selector: binding.selector || buildNativeElementId(el),
              kind: 'text',
            });
            selectTemplateText(fieldKey, {
              text: el.innerText || '',
              label: getStudioFieldLabel(fieldKey),
              preserveNativeSelection: true,
            });
          });
          el.addEventListener('dblclick', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openTemplateTextEditor(event);
          });
          el.addEventListener('touchend', (event) => {
            event.stopPropagation();
            const now = Date.now();
            const lastTap = Number(el.dataset.farhaLastTapAt || 0);
            el.dataset.farhaLastTapAt = String(now);
            if (now - lastTap < 320) {
              event.preventDefault();
              openTemplateTextEditor(event);
            }
          }, { passive: false });
          el.dataset.farhaInlineBound = 'true';
        }
      });
    });
    syncTemplateTextSelection();
  }


  function initDragHandlers() {
    if (runtimeState.dragHandlersInitialized) return;
    runtimeState.dragHandlersInitialized = true;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const getPoint = (event) => {
      const point = event.touches?.[0] || event.changedTouches?.[0] || event;
      return { x: point.clientX, y: point.clientY };
    };
    const getTouchMetrics = (touches) => {
      if (!touches || touches.length < 2) {
        return null;
      }

      const first = touches[0];
      const second = touches[1];
      const dx = second.clientX - first.clientX;
      const dy = second.clientY - first.clientY;

      return {
        centerX: (first.clientX + second.clientX) / 2,
        centerY: (first.clientY + second.clientY) / 2,
        distance: Math.max(24, Math.hypot(dx, dy)),
        angle: (Math.atan2(dy, dx) * 180) / Math.PI,
      };
    };
    const getSnapThreshold = () => (window.innerWidth <= 768 ? 14 : 10);
    const isRootOverlayTarget = (target) => target === document.body || target === document.documentElement;
    const getSnapTargetRect = (target) => {
      if (!target || isRootOverlayTarget(target)) {
        return {
          left: 0,
          top: 0,
          width: window.innerWidth,
          height: window.innerHeight,
          right: window.innerWidth,
          bottom: window.innerHeight,
        };
      }

      const rect = target.getBoundingClientRect();
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
        right: rect.right,
        bottom: rect.bottom,
      };
    };
    const getScrollOffsetForTarget = (target) => {
      if (!target || isRootOverlayTarget(target)) {
        return { x: window.scrollX || 0, y: window.scrollY || 0 };
      }
      return {
        x: target.scrollLeft || 0,
        y: target.scrollTop || 0,
      };
    };
    const rangesOverlap = (startA, endA, startB, endB, tolerance = 24) => {
      return Math.min(endA, endB) + tolerance >= Math.max(startA, startB);
    };
    const isSnapPeerVisible = (node) => {
      if (!node || !node.isConnected) {
        return false;
      }

      const style = window.getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }

      const rect = node.getBoundingClientRect();
      return rect.width >= 8 && rect.height >= 8;
    };
    const ensureSnapGuideOverlay = () => {
      let overlay = document.getElementById('farha-snap-guides');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'farha-snap-guides';
        overlay.dataset.visible = 'false';
        overlay.innerHTML = `
          <div class="farha-snap-guides__line farha-snap-guides__line--v" data-farha-snap="v"></div>
          <div class="farha-snap-guides__line farha-snap-guides__line--h" data-farha-snap="h"></div>
          <div class="farha-snap-guides__segment farha-snap-guides__segment--h" data-farha-snap-segment="0"></div>
          <div class="farha-snap-guides__segment farha-snap-guides__segment--h" data-farha-snap-segment="1"></div>
        `;
        document.body.appendChild(overlay);
      }
      return overlay;
    };
    const hideSnapGuides = () => {
      const overlay = document.getElementById('farha-snap-guides');
      if (!overlay) {
        return;
      }
      overlay.dataset.visible = 'false';
      overlay.querySelectorAll('[data-farha-snap-segment]').forEach((segment) => {
        segment.style.display = 'none';
      });
    };
    const showSnapGuides = (guides, targetRect) => {
      const overlay = ensureSnapGuideOverlay();
      const vertical = overlay.querySelector('[data-farha-snap="v"]');
      const horizontal = overlay.querySelector('[data-farha-snap="h"]');
      const spacingSegments = Array.from(overlay.querySelectorAll('[data-farha-snap-segment]'));
      const hasVertical = Number.isFinite(guides?.vertical);
      const hasHorizontal = Number.isFinite(guides?.horizontal);
      const segments = Array.isArray(guides?.spacingSegments) ? guides.spacingSegments : [];
      const hasSegments = segments.length > 0;

      overlay.dataset.visible = hasVertical || hasHorizontal || hasSegments ? 'true' : 'false';

      if (vertical) {
        vertical.style.display = hasVertical ? 'block' : 'none';
        if (hasVertical) {
          vertical.style.left = `${guides.vertical}px`;
          vertical.style.top = `${targetRect.top}px`;
          vertical.style.height = `${targetRect.height}px`;
        }
      }

      if (horizontal) {
        horizontal.style.display = hasHorizontal ? 'block' : 'none';
        if (hasHorizontal) {
          horizontal.style.left = `${targetRect.left}px`;
          horizontal.style.top = `${guides.horizontal}px`;
          horizontal.style.width = `${targetRect.width}px`;
        }
      }

      spacingSegments.forEach((segmentNode, index) => {
        const segment = segments[index];
        if (!segment) {
          segmentNode.style.display = 'none';
          return;
        }

        segmentNode.style.display = 'block';
        segmentNode.className = `farha-snap-guides__segment farha-snap-guides__segment--${segment.orientation === 'v' ? 'v' : 'h'}`;
        if (segment.orientation === 'v') {
          segmentNode.style.left = `${segment.x}px`;
          segmentNode.style.top = `${segment.top}px`;
          segmentNode.style.height = `${segment.length}px`;
          segmentNode.style.width = '';
        } else {
          segmentNode.style.left = `${segment.left}px`;
          segmentNode.style.top = `${segment.y}px`;
          segmentNode.style.width = `${segment.length}px`;
          segmentNode.style.height = '';
        }
      });
    };
    const collectSnapPeerRects = ({ excludeNode } = {}) => {
      const peerRects = [];

      document.querySelectorAll('.farha-custom-element').forEach((wrapper) => {
        if (
          !isSnapPeerVisible(wrapper)
          || wrapper === excludeNode
          || (excludeNode && (wrapper.contains(excludeNode) || excludeNode.contains(wrapper)))
        ) {
          return;
        }

        peerRects.push(wrapper.getBoundingClientRect());
      });

      getAllNativeElementCandidates().forEach((node) => {
        if (
          !isSnapPeerVisible(node)
          || node === excludeNode
          || (excludeNode && (node.contains(excludeNode) || excludeNode.contains(node)))
        ) {
          return;
        }

        peerRects.push(node.getBoundingClientRect());
      });

      return peerRects;
    };
    const computeSnapAdjustments = ({ targetRect, elementRect, peerRects = [] }) => {
      const threshold = getSnapThreshold();
      const elementLeft = elementRect.left;
      const elementTop = elementRect.top;
      const elementRight = elementRect.right;
      const elementBottom = elementRect.bottom;
      const elementCenterX = elementLeft + (elementRect.width / 2);
      const elementCenterY = elementTop + (elementRect.height / 2);
      const targetCenterX = targetRect.left + (targetRect.width / 2);
      const targetCenterY = targetRect.top + (targetRect.height / 2);

      const xCandidates = [
        { guide: targetRect.left, delta: targetRect.left - elementLeft },
        { guide: targetCenterX, delta: targetCenterX - elementCenterX },
        { guide: targetRect.right, delta: targetRect.right - elementRight },
      ];
      const yCandidates = [
        { guide: targetRect.top, delta: targetRect.top - elementTop },
        { guide: targetCenterY, delta: targetCenterY - elementCenterY },
        { guide: targetRect.bottom, delta: targetRect.bottom - elementBottom },
      ];

      peerRects.forEach((peerRect) => {
        const peerCenterX = peerRect.left + (peerRect.width / 2);
        const peerCenterY = peerRect.top + (peerRect.height / 2);

        xCandidates.push(
          { guide: peerRect.left, delta: peerRect.left - elementLeft },
          { guide: peerCenterX, delta: peerCenterX - elementCenterX },
          { guide: peerRect.right, delta: peerRect.right - elementRight },
        );
        yCandidates.push(
          { guide: peerRect.top, delta: peerRect.top - elementTop },
          { guide: peerCenterY, delta: peerCenterY - elementCenterY },
          { guide: peerRect.bottom, delta: peerRect.bottom - elementBottom },
        );
      });

      let deltaX = 0;
      let deltaY = 0;
      let verticalGuide = null;
      let horizontalGuide = null;
      let spacingSegments = [];
      let bestSpacingGuideDistance = threshold + 1;
      let bestXDistance = threshold + 1;
      let bestYDistance = threshold + 1;

      xCandidates.forEach((candidate) => {
        const distance = Math.abs(candidate.delta);
        if (distance <= threshold && distance < bestXDistance) {
          bestXDistance = distance;
          deltaX = candidate.delta;
          verticalGuide = candidate.guide;
        }
      });

      yCandidates.forEach((candidate) => {
        const distance = Math.abs(candidate.delta);
        if (distance <= threshold && distance < bestYDistance) {
          bestYDistance = distance;
          deltaY = candidate.delta;
          horizontalGuide = candidate.guide;
        }
      });

      const horizontalSpacingPeers = peerRects
        .concat([
          {
            left: targetRect.left,
            right: targetRect.left,
            top: targetRect.top,
            bottom: targetRect.bottom,
            width: 0,
            height: targetRect.height,
          },
          {
            left: targetRect.right,
            right: targetRect.right,
            top: targetRect.top,
            bottom: targetRect.bottom,
            width: 0,
            height: targetRect.height,
          },
        ])
        .filter((peerRect) => {
          return rangesOverlap(peerRect.top, peerRect.bottom, elementTop, elementBottom, 28);
        })
        .sort((leftPeer, rightPeer) => leftPeer.left - rightPeer.left);

      for (let index = 0; index < horizontalSpacingPeers.length - 1; index += 1) {
        const leftPeer = horizontalSpacingPeers[index];
        const rightPeer = horizontalSpacingPeers[index + 1];
        const availableGap = rightPeer.left - leftPeer.right;
        if (availableGap <= 0 || availableGap < elementRect.width) {
          continue;
        }

        const candidateLeft = leftPeer.right + ((availableGap - elementRect.width) / 2);
        const distance = Math.abs(candidateLeft - elementLeft);
        if (distance > threshold || distance >= bestXDistance) {
          continue;
        }

        const overlapTop = Math.max(elementTop, leftPeer.top, rightPeer.top);
        const overlapBottom = Math.min(elementBottom, leftPeer.bottom, rightPeer.bottom);
        const segmentY = overlapBottom > overlapTop
          ? overlapTop + ((overlapBottom - overlapTop) / 2)
          : elementCenterY;
        const leftGapLength = Math.max(0, candidateLeft - leftPeer.right);
        const rightGapLength = Math.max(0, rightPeer.left - (candidateLeft + elementRect.width));
        const nextSegments = [
          {
            orientation: 'h',
            left: leftPeer.right,
            y: segmentY,
            length: leftGapLength,
          },
          {
            orientation: 'h',
            left: candidateLeft + elementRect.width,
            y: segmentY,
            length: rightGapLength,
          },
        ].filter((segment) => segment.length >= 8);

        bestXDistance = distance;
        deltaX = candidateLeft - elementLeft;
        verticalGuide = null;
        if (nextSegments.length === 2 && distance < bestSpacingGuideDistance) {
          bestSpacingGuideDistance = distance;
          spacingSegments = nextSegments;
        }
      }

      const verticalSpacingPeers = peerRects
        .concat([
          {
            left: targetRect.left,
            right: targetRect.right,
            top: targetRect.top,
            bottom: targetRect.top,
            width: targetRect.width,
            height: 0,
          },
          {
            left: targetRect.left,
            right: targetRect.right,
            top: targetRect.bottom,
            bottom: targetRect.bottom,
            width: targetRect.width,
            height: 0,
          },
        ])
        .filter((peerRect) => {
          return rangesOverlap(peerRect.left, peerRect.right, elementLeft, elementRight, 28);
        })
        .sort((topPeer, bottomPeer) => topPeer.top - bottomPeer.top);

      for (let index = 0; index < verticalSpacingPeers.length - 1; index += 1) {
        const topPeer = verticalSpacingPeers[index];
        const bottomPeer = verticalSpacingPeers[index + 1];
        const availableGap = bottomPeer.top - topPeer.bottom;
        if (availableGap <= 0 || availableGap < elementRect.height) {
          continue;
        }

        const candidateTop = topPeer.bottom + ((availableGap - elementRect.height) / 2);
        const distance = Math.abs(candidateTop - elementTop);
        if (distance > threshold || distance >= bestYDistance) {
          continue;
        }

        const overlapLeft = Math.max(elementLeft, topPeer.left, bottomPeer.left);
        const overlapRight = Math.min(elementRight, topPeer.right, bottomPeer.right);
        const segmentX = overlapRight > overlapLeft
          ? overlapLeft + ((overlapRight - overlapLeft) / 2)
          : elementCenterX;
        const topGapLength = Math.max(0, candidateTop - topPeer.bottom);
        const bottomGapLength = Math.max(0, bottomPeer.top - (candidateTop + elementRect.height));
        const nextSegments = [
          {
            orientation: 'v',
            x: segmentX,
            top: topPeer.bottom,
            length: topGapLength,
          },
          {
            orientation: 'v',
            x: segmentX,
            top: candidateTop + elementRect.height,
            length: bottomGapLength,
          },
        ].filter((segment) => segment.length >= 8);

        bestYDistance = distance;
        deltaY = candidateTop - elementTop;
        horizontalGuide = null;
        if (nextSegments.length === 2 && distance < bestSpacingGuideDistance) {
          bestSpacingGuideDistance = distance;
          spacingSegments = nextSegments;
        }
      }

      return {
        deltaX,
        deltaY,
        guides: {
          vertical: verticalGuide,
          horizontal: horizontalGuide,
          spacingSegments,
        },
      };
    };
    const toPxNumber = (value, fallback) => {
      const parsed = parseFloat(String(value || ''));
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    const persistUpdate = (id, updates) => {
      window.parent.postMessage({
        type: 'FARHA_CUSTOM_ELEMENT_UPDATE',
        payload: { id, updates, deviceMode: runtimeState.activeDeviceMode || resolveRenderDeviceMode(runtimeState.renderConfig) },
      }, '*');
    };
    const persistNativeUpdate = (id, node, updates) => {
      window.parent.postMessage({
        type: 'FARHA_NATIVE_ELEMENT_UPDATE',
        payload: {
          id,
          updates,
          label: getNativeElementLabel(node),
          selector: getNativeElementSelectorHint(node) || id,
          kind: getNativeElementKind(node),
          previewUrl: getNativeElementPreviewUrl(node),
          basePreviewUrl: getNativeElementBasePreviewUrl(node),
          aspectRatio: getNodeAspectRatio(node),
          ...getNativeElementSelectionMeta(node),
        },
      }, '*');
    };
    const applyLocalNativeOverride = (id, node, nextOverride) => {
      runtimeState.nativeElementOverrides = {
        ...(runtimeState.nativeElementOverrides || {}),
        [id]: nextOverride,
      };
      applyNativeOverrideToNode(node, nextOverride);
      queueNativeOverlaySync();
    };
    const getNudgeDelta = (direction, step) => {
      if (direction === 'nudge-right') return { dx: step, dy: 0 };
      if (direction === 'nudge-left') return { dx: -step, dy: 0 };
      if (direction === 'nudge-up') return { dx: 0, dy: -step };
      if (direction === 'nudge-down') return { dx: 0, dy: step };
      return null;
    };
    const nudgeNativeElement = (node, direction, step = 2) => {
      if (!node) {
        return false;
      }

      const id = buildNativeElementId(node);
      const currentOverride = runtimeState.nativeElementOverrides?.[id] || {};
      if (currentOverride.locked) {
        return false;
      }

      const delta = getNudgeDelta(direction, step);
      if (!delta) {
        return false;
      }

      const nextOverride = {
        ...currentOverride,
        label: currentOverride.label || getNativeElementLabel(node),
        selector: currentOverride.selector || getNativeElementSelectorHint(node) || id,
        kind: currentOverride.kind || getNativeElementKind(node),
        x: toPxNumber(currentOverride.x, 0) + delta.dx,
        y: toPxNumber(currentOverride.y, 0) + delta.dy,
      };
      applyLocalNativeOverride(id, node, nextOverride);
      persistNativeUpdate(id, node, nextOverride);
      selectNativeElement(node, {
        label: nextOverride.label,
        selector: nextOverride.selector,
        kind: nextOverride.kind,
        silent: true,
      });
      return true;
    };
    const nudgeCustomElement = (wrapper, direction, step = 2) => {
      if (!wrapper || wrapper.dataset.locked === 'true') {
        return false;
      }

      const delta = getNudgeDelta(direction, step);
      if (!delta) {
        return false;
      }

      const nextLeft = toPxNumber(wrapper.style.left, 0) + delta.dx;
      const nextTop = toPxNumber(wrapper.style.top, 0) + delta.dy;
      wrapper.style.left = `${nextLeft}px`;
      wrapper.style.top = `${nextTop}px`;
      persistUpdate(wrapper.dataset.id, {
        x: nextLeft,
        y: nextTop,
      });
      selectElement(wrapper.dataset.id);
      return true;
    };
    const openNativeTextEditor = (node, overrideMeta = {}) => {
      const textTarget = getNativeTextEditTarget(node);
      if (!textTarget) {
        return;
      }

      const textPath = getNativeTextPathForNode(node);
      openFloatingTextEditor({
        target: textTarget,
        initialValue: textTarget.innerText || textTarget.textContent || '',
        onCommit: (nextValue) => {
          const normalizedValue = nextValue.trim();
          if (textPath) {
            selectTemplateText(textPath, {
              text: normalizedValue,
              label: getStudioFieldLabel(textPath),
              preserveNativeSelection: true,
            });
            window.parent.postMessage({
              type: 'FARHA_TEXT_OVERRIDE',
              payload: {
                path: textPath,
                text: normalizedValue,
                label: getStudioFieldLabel(textPath),
                preserveNativeSelection: true,
              },
            }, '*');
            return;
          }

          const id = buildNativeElementId(node);
          const currentOverride = runtimeState.nativeElementOverrides?.[id] || {};
          const nextOverride = {
            ...currentOverride,
            ...overrideMeta,
            textContent: normalizedValue,
          };
          applyLocalNativeOverride(id, node, nextOverride);
          persistNativeUpdate(id, node, nextOverride);
        },
      });
    };

    let activeTransform = null;

    const selectElement = (id) => {
      runtimeState.selectedCustomElementId = id || null;
      if (id) {
        selectTemplateText(null);
        selectNativeElement(null, { silent: true });
      }
      const container = document.getElementById('farha-custom-elements');
      if (container) {
        Array.from(container.children).forEach((wrapper) => {
          const isSelected = String(wrapper.dataset.id) === String(runtimeState.selectedCustomElementId || '');
          wrapper.dataset.selected = isSelected ? 'true' : 'false';
          const controls = wrapper.querySelector('.farha-custom-element__controls');
          const resize = wrapper.querySelector('.farha-custom-element__resize');
          const deleteButton = wrapper.querySelector('.farha-custom-element__delete');
          if (controls) controls.style.display = isSelected ? 'flex' : 'none';
          if (resize) resize.style.display = isSelected && wrapper.dataset.locked !== 'true' ? 'block' : 'none';
          if (deleteButton) deleteButton.style.display = isSelected ? 'inline-flex' : 'none';
          wrapper.style.outline = isSelected ? '2px solid rgba(127, 42, 31, 0.92)' : 'none';
          wrapper.style.outlineOffset = isSelected ? '4px' : '0';
          wrapper.style.boxShadow = isSelected
            ? '0 0 0 2px rgba(255,255,255,0.95), 0 0 0 4px rgba(127, 42, 31, 0.45)'
            : 'none';
        });
      }

      window.parent.postMessage({
        type: 'FARHA_CUSTOM_ELEMENT_SELECT',
        payload: { id: id || null },
      }, '*');
    };

    const startTransform = (kind, wrapper, point) => {
      const contentNode = wrapper.querySelector('.farha-custom-element__content');
      const imageNode = wrapper.querySelector('.farha-custom-element__image');
      activeTransform = {
        kind,
        wrapper,
        id: wrapper.dataset.id,
        snapTarget: getEditorOverlayTarget(),
        snapPeers: collectSnapPeerRects({ excludeNode: wrapper }),
        startX: point.x,
        startY: point.y,
        startLeft: toPxNumber(wrapper.style.left, 0),
        startTop: toPxNumber(wrapper.style.top, 0),
        startWidth: toPxNumber(wrapper.style.width, wrapper.offsetWidth || 150),
        startHeight: toPxNumber(wrapper.style.height, wrapper.offsetHeight || 150),
        startFontSize: toPxNumber(contentNode?.style.fontSize || wrapper.dataset.fontSize, 24),
        startCropX: toPxNumber(wrapper.dataset.cropX, 50),
        startCropY: toPxNumber(wrapper.dataset.cropY, 50),
        imageNode,
        contentNode,
      };
      wrapper.style.opacity = '0.92';
      wrapper.style.zIndex = '99999';
      selectElement(activeTransform.id);
    };
    const startPendingCustomTransform = (kind, wrapper, point) => {
      startTransform(kind, wrapper, point);
    };

    const startNativeTransform = (node, point) => {
      const id = buildNativeElementId(node);
      const currentOverride = runtimeState.nativeElementOverrides?.[id] || {};
      ensureNativeElementBaseState(node);
      activeTransform = {
        scope: 'native',
        kind: 'move',
        node,
        id,
        snapTarget: getEditorOverlayTarget(),
        snapPeers: collectSnapPeerRects({ excludeNode: node }),
        label: currentOverride.label || getNativeElementLabel(node),
        selector: currentOverride.selector || getNativeElementSelectorHint(node) || id,
        nativeKind: currentOverride.kind || getNativeElementKind(node),
        startX: point.x,
        startY: point.y,
        startOffsetX: toPxNumber(currentOverride.x, 0),
        startOffsetY: toPxNumber(currentOverride.y, 0),
        startRect: node.getBoundingClientRect(),
      };
      node.style.cursor = 'grabbing';
      selectNativeElement(node, {
        label: activeTransform.label,
        selector: activeTransform.selector,
        kind: activeTransform.nativeKind,
        silent: true,
      });
    };
    const startPendingNativeTransform = (node, point) => {
      startNativeTransform(node, point);
    };
    const dispatchCanvasClick = (point) => {
      if (!point) {
        return;
      }

      const target = getEditorOverlayTarget();
      const rect = target.getBoundingClientRect();
      const pageX = point.x + window.scrollX;
      const pageY = point.y + window.scrollY;
      const targetPageLeft = rect.left + window.scrollX;
      const targetPageTop = rect.top + window.scrollY;
      const ownScrollX = target !== document.body && target !== document.documentElement ? (target.scrollLeft || 0) : 0;
      const ownScrollY = target !== document.body && target !== document.documentElement ? (target.scrollTop || 0) : 0;
      const x = pageX - targetPageLeft + ownScrollX;
      const y = pageY - targetPageTop + ownScrollY;
      const visualX = point.x - rect.left;
      const visualY = point.y - rect.top;

      window.parent.postMessage({
        type: 'FARHA_CANVAS_CLICK',
        payload: { x, y, visualX, visualY },
      }, '*');
    };
    const startNativeCropTransform = (node, point) => {
      const id = buildNativeElementId(node);
      const currentOverride = runtimeState.nativeElementOverrides?.[id] || {};
      ensureNativeElementBaseState(node);
      activeTransform = {
        scope: 'native',
        kind: 'crop',
        node,
        id,
        label: currentOverride.label || getNativeElementLabel(node),
        selector: currentOverride.selector || getNativeElementSelectorHint(node) || id,
        nativeKind: currentOverride.kind || getNativeElementKind(node),
        startX: point.x,
        startY: point.y,
        startCropX: toPxNumber(currentOverride.cropX, 50),
        startCropY: toPxNumber(currentOverride.cropY, 50),
        startRect: node.getBoundingClientRect(),
      };
      node.style.cursor = 'move';
      selectNativeElement(node, {
        label: activeTransform.label,
        selector: activeTransform.selector,
        kind: activeTransform.nativeKind,
        silent: true,
      });
    };

    const startNativeScaleTransform = (node, point) => {
      const id = buildNativeElementId(node);
      const currentOverride = runtimeState.nativeElementOverrides?.[id] || {};
      ensureNativeElementBaseState(node);
      const rect = node.getBoundingClientRect();
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);
      const startDistance = Math.max(40, Math.hypot(point.x - centerX, point.y - centerY));

      activeTransform = {
        scope: 'native',
        kind: 'scale',
        node,
        id,
        label: currentOverride.label || getNativeElementLabel(node),
        selector: currentOverride.selector || getNativeElementSelectorHint(node) || id,
        nativeKind: currentOverride.kind || getNativeElementKind(node),
        centerX,
        centerY,
        startDistance,
        startScale: Number.isFinite(Number(currentOverride.scale)) ? Number(currentOverride.scale) : 1,
      };
      node.style.cursor = 'nwse-resize';
      selectNativeElement(node, {
        label: activeTransform.label,
        selector: activeTransform.selector,
        kind: activeTransform.nativeKind,
        silent: true,
      });
    };

    const startNativeRotateTransform = (node, point) => {
      const id = buildNativeElementId(node);
      const currentOverride = runtimeState.nativeElementOverrides?.[id] || {};
      ensureNativeElementBaseState(node);
      const rect = node.getBoundingClientRect();
      const centerX = rect.left + (rect.width / 2);
      const centerY = rect.top + (rect.height / 2);
      const startAngle = (Math.atan2(point.y - centerY, point.x - centerX) * 180) / Math.PI;

      activeTransform = {
        scope: 'native',
        kind: 'rotate',
        node,
        id,
        label: currentOverride.label || getNativeElementLabel(node),
        selector: currentOverride.selector || getNativeElementSelectorHint(node) || id,
        nativeKind: currentOverride.kind || getNativeElementKind(node),
        centerX,
        centerY,
        startAngle,
        startRotation: Number.isFinite(Number(currentOverride.rotation)) ? Number(currentOverride.rotation) : 0,
      };
      node.style.cursor = 'grabbing';
      selectNativeElement(node, {
        label: activeTransform.label,
        selector: activeTransform.selector,
        kind: activeTransform.nativeKind,
        silent: true,
      });
    };

    const startNativeGestureTransform = (node, touches) => {
      const gesture = getTouchMetrics(touches);
      if (!gesture) {
        return;
      }

      const id = buildNativeElementId(node);
      const currentOverride = runtimeState.nativeElementOverrides?.[id] || {};
      ensureNativeElementBaseState(node);

      activeTransform = {
        scope: 'native',
        kind: 'gesture',
        node,
        id,
        label: currentOverride.label || getNativeElementLabel(node),
        selector: currentOverride.selector || getNativeElementSelectorHint(node) || id,
        nativeKind: currentOverride.kind || getNativeElementKind(node),
        startCenterX: gesture.centerX,
        startCenterY: gesture.centerY,
        startDistance: gesture.distance,
        startAngle: gesture.angle,
        startOffsetX: toPxNumber(currentOverride.x, 0),
        startOffsetY: toPxNumber(currentOverride.y, 0),
        startScale: Number.isFinite(Number(currentOverride.scale)) ? Number(currentOverride.scale) : 1,
        startRotation: Number.isFinite(Number(currentOverride.rotation)) ? Number(currentOverride.rotation) : 0,
      };
      node.style.cursor = 'grabbing';
      selectNativeElement(node, {
        label: activeTransform.label,
        selector: activeTransform.selector,
        kind: activeTransform.nativeKind,
        silent: true,
      });
    };

    const handleStart = (event) => {
      if (!runtimeState.preview) return;
      const target = event.target;
      if (target && !target.closest('#farha-editor-dock')) {
        window.parent.postMessage({
          type: 'FARHA_CANVAS_DISMISS_MENU',
        }, '*');
      }
      const nativeActionNode = target.closest('[data-farha-native-action]');
      const nativeControlNode = target.closest('[data-farha-native-control]');
      const actionNode = target.closest('[data-farha-action]');
      const wrapper = target.closest('.farha-custom-element');
      const point = getPoint(event);
      const touchCount = event.touches?.length || 0;
      const addModeActive = Boolean(runtimeState.editorAddMode);
      const canvasSurface = !wrapper && isCanvasBackgroundTarget(target);

      if (nativeControlNode) {
        event.stopPropagation();
        return;
      }

      if (
        point
        && (addModeActive || canvasSurface)
        && !target.closest('.farha-custom-element, .farha-floating-text-editor, #farha-native-overlay, #farha-editor-dock')
      ) {
        event.preventDefault();
        event.stopPropagation();
        selectElement(null);
        selectTemplateText(null);
        selectNativeElement(null, { silent: true });
        hideSnapGuides();
        dispatchCanvasClick(point);
        return;
      }

      if (nativeActionNode) {
        const selectedId = runtimeState.selectedNativeElementId;
        const selectedNode = findNativeElementById(selectedId);
        if (!selectedId || !selectedNode) {
          return;
        }

        const action = nativeActionNode.dataset.farhaNativeAction;
        const currentOverride = runtimeState.nativeElementOverrides?.[selectedId] || {};
        const baseOverride = {
          ...currentOverride,
          label: currentOverride.label || getNativeElementLabel(selectedNode),
          selector: currentOverride.selector || getNativeElementSelectorHint(selectedNode) || selectedId,
          kind: currentOverride.kind || getNativeElementKind(selectedNode),
        };

        event.preventDefault();
        event.stopPropagation();

        if ((action === 'scale' || action === 'rotate' || action === 'move') && point && !baseOverride.locked) {
          if (action === 'scale') {
            startNativeScaleTransform(selectedNode, point);
          } else if (action === 'rotate') {
            startNativeRotateTransform(selectedNode, point);
          } else {
            startNativeTransform(selectedNode, point);
          }
          return;
        }

        if (action.startsWith('nudge-')) {
          nudgeNativeElement(selectedNode, action, event.shiftKey ? 10 : 2);
          return;
        }

        if (action === 'edit') {
          if (!isNativeTextEditableNode(selectedNode) || baseOverride.locked) {
            return;
          }
          openNativeTextEditor(selectedNode, baseOverride);
          return;
        }

        if (action === 'lock') {
          const nextOverride = {
            ...baseOverride,
            locked: !baseOverride.locked,
          };
          applyLocalNativeOverride(selectedId, selectedNode, nextOverride);
          persistNativeUpdate(selectedId, selectedNode, nextOverride);
          return;
        }

        if (action === 'replace') {
          if (!isNativeReplaceableImageNode(selectedNode)) {
            return;
          }

          window.parent.postMessage({
            type: 'FARHA_MEDIA_REPLACE_REQUEST',
            payload: {
              scope: 'native',
              id: selectedId,
              label: baseOverride.label,
            },
          }, '*');
          return;
        }

        if (action === 'copy') {
          window.parent.postMessage({
            type: 'FARHA_ELEMENT_COPY_REQUEST',
            payload: {
              scope: 'native',
              id: selectedId,
              label: baseOverride.label,
              clipboard: buildNativeClipboardPayload(selectedNode, baseOverride),
            },
          }, '*');
          return;
        }

        if (action === 'duplicate') {
          window.parent.postMessage({
            type: 'FARHA_ELEMENT_DUPLICATE_REQUEST',
            payload: {
              scope: 'native',
              id: selectedId,
              label: baseOverride.label,
              clipboard: buildNativeClipboardPayload(selectedNode, baseOverride),
              position: getCanvasPlacementFromNode(selectedNode, 24, 24),
            },
          }, '*');
          return;
        }

        if (action === 'paste') {
          window.parent.postMessage({
            type: 'FARHA_ELEMENT_PASTE_REQUEST',
            payload: {
              position: getCanvasPlacementFromNode(selectedNode, 24, 24),
            },
          }, '*');
          return;
        }

        if (action === 'hide') {
          const nextOverride = {
            ...baseOverride,
            hidden: true,
          };
          applyLocalNativeOverride(selectedId, selectedNode, nextOverride);
          persistNativeUpdate(selectedId, selectedNode, nextOverride);
          selectNativeElement(null);
          return;
        }

        if (action === 'crop-toggle') {
          if (!isNativeReplaceableImageNode(selectedNode)) {
            return;
          }

          window.parent.postMessage({
            type: 'FARHA_MEDIA_CROP_REQUEST',
            payload: {
              scope: 'native',
              id: selectedId,
              label: baseOverride.label,
              previewUrl: getNativeElementPreviewUrl(selectedNode),
              basePreviewUrl: getNativeElementBasePreviewUrl(selectedNode),
              persistedUrl: baseOverride.mediaUrl == null ? '' : String(baseOverride.mediaUrl).trim(),
              cropX: Number.isFinite(Number(baseOverride.cropX)) ? Number(baseOverride.cropX) : 50,
              cropY: Number.isFinite(Number(baseOverride.cropY)) ? Number(baseOverride.cropY) : 50,
              aspectRatio: getNodeAspectRatio(selectedNode),
            },
          }, '*');
          return;
        }

        if (action === 'reset') {
          const nextOverrides = {
            ...(runtimeState.nativeElementOverrides || {}),
          };
          delete nextOverrides[selectedId];
          runtimeState.nativeElementOverrides = nextOverrides;
          applyNativeElementOverrides(nextOverrides);
          window.parent.postMessage({
            type: 'FARHA_NATIVE_ELEMENT_RESET',
            payload: {
              id: selectedId,
              label: baseOverride.label,
              basePreviewUrl: getNativeElementBasePreviewUrl(selectedNode),
              aspectRatio: getNodeAspectRatio(selectedNode),
              ...getNativeElementSelectionMeta(selectedNode),
            },
          }, '*');
          return;
        }

        if (action === 'delete') {
          const nextOverride = {
            ...baseOverride,
            hidden: true,
          };
          applyLocalNativeOverride(selectedId, selectedNode, nextOverride);
          persistNativeUpdate(selectedId, selectedNode, nextOverride);
          selectNativeElement(null);
        }
        return;
      }

      if (!wrapper) {
        const nativeTarget = resolveNativeElementTarget(target);
        if (nativeTarget && point) {
          const nativeId = buildNativeElementId(nativeTarget);
          const nativeOverride = runtimeState.nativeElementOverrides?.[nativeId] || {};
          const nativeMeta = {
            label: nativeOverride.label || getNativeElementLabel(nativeTarget),
            selector: nativeOverride.selector || getNativeElementSelectorHint(nativeTarget) || nativeId,
            kind: nativeOverride.kind || getNativeElementKind(nativeTarget),
          };
          selectElement(null);

          if (touchCount >= 2) {
            if (nativeOverride.locked) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            startNativeGestureTransform(nativeTarget, event.touches);
            return;
          }

          if (target.closest('.farha-studio-editable')) {
            event.preventDefault();
            event.stopPropagation();
            if (nativeOverride.locked) {
              selectNativeElement(nativeTarget, nativeMeta);
              return;
            }
            selectNativeElement(nativeTarget, nativeMeta);
            selectTemplateText(nativeTarget.dataset.farhaStudioField || getNativeTextPathForNode(nativeTarget), {
              text: nativeTarget.innerText || nativeTarget.textContent || '',
              label: getStudioFieldLabel(nativeTarget.dataset.farhaStudioField || getNativeTextPathForNode(nativeTarget)),
              preserveNativeSelection: true,
            });
            startPendingNativeTransform(nativeTarget, point);
            return;
          }

          if (String(runtimeState.selectedNativeElementId || '') !== String(nativeId)) {
            event.preventDefault();
            event.stopPropagation();
            if (nativeOverride.locked) {
              selectNativeElement(nativeTarget, nativeMeta);
              return;
            }
            startPendingNativeTransform(nativeTarget, point);
            return;
          }

          if (nativeOverride.locked) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }

          event.preventDefault();
          event.stopPropagation();
          if (nativeTarget.dataset.farhaCropMode === 'true' && isNativeReplaceableImageNode(nativeTarget)) {
            startNativeCropTransform(nativeTarget, point);
            return;
          }
          startNativeTransform(nativeTarget, point);
          return;
        }

        if (!target.closest('.farha-studio-editable')) {
          selectElement(null);
          selectTemplateText(null);
          selectNativeElement(null, { silent: true });
        }
        hideSnapGuides();
        return;
      }

      if (!point) return;

      const wrapperId = wrapper.dataset.id;
      const isWrapperSelected = String(runtimeState.selectedCustomElementId || '') === String(wrapperId);
      const action = actionNode?.dataset?.farhaAction || '';
      selectElement(wrapperId);
      if (
        wrapper.dataset.locked === 'true'
        && !['delete', 'lock', 'copy', 'duplicate', 'paste', 'hide'].includes(action)
      ) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (action === 'delete') {
        event.preventDefault();
        event.stopPropagation();
        window.parent.postMessage({
          type: 'FARHA_CUSTOM_ELEMENT_DELETE',
          payload: { id: wrapper.dataset.id },
        }, '*');
        return;
      }

      if (action === 'hide') {
        event.preventDefault();
        event.stopPropagation();
        window.parent.postMessage({
          type: 'FARHA_CUSTOM_ELEMENT_UPDATE',
          payload: {
            id: wrapper.dataset.id,
            updates: {
              hidden: true,
            },
          },
        }, '*');
        selectElement(null);
        return;
      }

      if (action === 'lock') {
        event.preventDefault();
        event.stopPropagation();
        window.parent.postMessage({
          type: 'FARHA_CUSTOM_ELEMENT_UPDATE',
          payload: {
            id: wrapper.dataset.id,
            updates: {
              locked: wrapper.dataset.locked !== 'true',
            },
          },
        }, '*');
        return;
      }

      if (action.startsWith('nudge-')) {
        event.preventDefault();
        event.stopPropagation();
        nudgeCustomElement(wrapper, action, event.shiftKey ? 10 : 2);
        return;
      }

      if (action === 'copy') {
        event.preventDefault();
        event.stopPropagation();
        window.parent.postMessage({
          type: 'FARHA_ELEMENT_COPY_REQUEST',
          payload: {
            scope: 'custom',
            id: wrapper.dataset.id,
          },
        }, '*');
        return;
      }

      if (action === 'duplicate') {
        event.preventDefault();
        event.stopPropagation();
        window.parent.postMessage({
          type: 'FARHA_ELEMENT_DUPLICATE_REQUEST',
          payload: {
            scope: 'custom',
            id: wrapper.dataset.id,
          },
        }, '*');
        return;
      }

      if (action === 'paste') {
        event.preventDefault();
        event.stopPropagation();
        window.parent.postMessage({
          type: 'FARHA_ELEMENT_PASTE_REQUEST',
          payload: {
            position: getCanvasPlacementFromNode(wrapper, 24, 24),
          },
        }, '*');
        return;
      }

      if (action === 'edit' && wrapper.dataset.type === 'text') {
        const customTextNode = wrapper.querySelector('.farha-custom-element__text');
        if (customTextNode) {
          event.preventDefault();
          event.stopPropagation();
          openFloatingTextEditor({
            target: customTextNode,
            initialValue: customTextNode.innerText || '',
            triggerEvent: event,
            onCommit: (nextValue) => {
              customTextNode.style.boxShadow = 'none';
              persistUpdate(wrapper.dataset.id, { content: nextValue });
            },
          });
        }
        return;
      }

      if (action === 'replace' && wrapper.dataset.type === 'image') {
        event.preventDefault();
        event.stopPropagation();
        window.parent.postMessage({
          type: 'FARHA_MEDIA_REPLACE_REQUEST',
          payload: {
            scope: 'custom',
            id: wrapper.dataset.id,
            label: wrapper.dataset.name || 'صورة حرة',
          },
        }, '*');
        return;
      }

      if (action === 'crop-toggle') {
        event.preventDefault();
        event.stopPropagation();
        const customImageNode = wrapper.querySelector('.farha-custom-element__image');
        window.parent.postMessage({
          type: 'FARHA_MEDIA_CROP_REQUEST',
          payload: {
            scope: 'custom',
            id: wrapper.dataset.id,
            label: wrapper.dataset.name || 'صورة حرة',
            previewUrl: customImageNode?.currentSrc || customImageNode?.src || '',
            basePreviewUrl: customImageNode?.currentSrc || customImageNode?.src || '',
            cropX: toPxNumber(wrapper.dataset.cropX, 50),
            cropY: toPxNumber(wrapper.dataset.cropY, 50),
            aspectRatio: Math.max((wrapper.offsetWidth || 150) / Math.max(wrapper.offsetHeight || 150, 1), 0.35),
          },
        }, '*');
        return;
      }

      const isEditableTarget =
        target?.isContentEditable ||
        target?.closest?.('[contenteditable="true"], input, textarea, select') ||
        wrapper?.classList?.contains('farha-studio-editing');
      if (isEditableTarget && !action) {
        return;
      }

      const actionKind =
        action === 'resize'
          ? 'resize'
          : wrapper.dataset.cropMode === 'true' && target.closest('.farha-custom-element__image')
            ? 'crop'
            : 'move';

      if (!actionNode && !isWrapperSelected) {
        event.preventDefault();
        event.stopPropagation();
        hideSnapGuides();
        startPendingCustomTransform(actionKind, wrapper, point);
        return;
      }

      if (!action) {
        event.preventDefault();
        event.stopPropagation();
        hideSnapGuides();
        startTransform(actionKind, wrapper, point);
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      hideSnapGuides();
      startTransform(actionKind, wrapper, point);
    };

    const handleMove = (event) => {
      if (!activeTransform) return;
      const point = getPoint(event);
      if (!point) return;

      if (activeTransform.pending) {
        const travelX = point.x - activeTransform.startX;
        const travelY = point.y - activeTransform.startY;
        if (Math.hypot(travelX, travelY) < 6) {
          return;
        }
        activeTransform.pending = false;
        if (activeTransform.scope === 'native') {
          activeTransform.node.style.cursor = 'grabbing';
        } else if (activeTransform.wrapper) {
          activeTransform.wrapper.style.opacity = '0.92';
          activeTransform.wrapper.style.zIndex = '99999';
        }
      }

      event.preventDefault();

      if (activeTransform.scope === 'native') {
        if (activeTransform.kind === 'gesture') {
          const gesture = getTouchMetrics(event.touches);
          if (!gesture) {
            return;
          }

          hideSnapGuides();

          const nextScale = clamp((activeTransform.startScale * gesture.distance) / activeTransform.startDistance, 0.15, 5);
          let nextRotation = activeTransform.startRotation + (gesture.angle - activeTransform.startAngle);
          while (nextRotation > 180) nextRotation -= 360;
          while (nextRotation < -180) nextRotation += 360;

          const nextOverride = {
            ...(runtimeState.nativeElementOverrides?.[activeTransform.id] || {}),
            label: activeTransform.label,
            selector: activeTransform.selector,
            kind: activeTransform.nativeKind,
            x: activeTransform.startOffsetX + (gesture.centerX - activeTransform.startCenterX),
            y: activeTransform.startOffsetY + (gesture.centerY - activeTransform.startCenterY),
            scale: nextScale,
            rotation: nextRotation,
          };
          applyLocalNativeOverride(activeTransform.id, activeTransform.node, nextOverride);
          return;
        }

        if (activeTransform.kind === 'move') {
          const dx = point.x - activeTransform.startX;
          const dy = point.y - activeTransform.startY;
          const targetRect = getSnapTargetRect(activeTransform.snapTarget);
          const elementRect = {
            left: activeTransform.startRect.left + dx,
            top: activeTransform.startRect.top + dy,
            width: activeTransform.startRect.width,
            height: activeTransform.startRect.height,
            right: activeTransform.startRect.left + dx + activeTransform.startRect.width,
            bottom: activeTransform.startRect.top + dy + activeTransform.startRect.height,
          };
          const snap = computeSnapAdjustments({
            targetRect,
            elementRect,
            peerRects: activeTransform.snapPeers || [],
          });
          const nextOverride = {
            ...(runtimeState.nativeElementOverrides?.[activeTransform.id] || {}),
            label: activeTransform.label,
            selector: activeTransform.selector,
            kind: activeTransform.nativeKind,
            x: activeTransform.startOffsetX + dx + snap.deltaX,
            y: activeTransform.startOffsetY + dy + snap.deltaY,
          };
          applyLocalNativeOverride(activeTransform.id, activeTransform.node, nextOverride);
          showSnapGuides(snap.guides, targetRect);
          return;
        }

        if (activeTransform.kind === 'crop') {
          hideSnapGuides();
          const dx = point.x - activeTransform.startX;
          const dy = point.y - activeTransform.startY;
          const width = Math.max(activeTransform.startRect.width, 1);
          const height = Math.max(activeTransform.startRect.height, 1);
          const nextCropX = clamp(activeTransform.startCropX - ((dx / width) * 100), 0, 100);
          const nextCropY = clamp(activeTransform.startCropY - ((dy / height) * 100), 0, 100);
          const nextOverride = {
            ...(runtimeState.nativeElementOverrides?.[activeTransform.id] || {}),
            label: activeTransform.label,
            selector: activeTransform.selector,
            kind: activeTransform.nativeKind,
            cropX: nextCropX,
            cropY: nextCropY,
          };
          applyLocalNativeOverride(activeTransform.id, activeTransform.node, nextOverride);
          return;
        }

        if (activeTransform.kind === 'scale') {
          hideSnapGuides();
          const currentDistance = Math.max(24, Math.hypot(point.x - activeTransform.centerX, point.y - activeTransform.centerY));
          const nextScale = clamp((activeTransform.startScale * currentDistance) / activeTransform.startDistance, 0.15, 5);
          const nextOverride = {
            ...(runtimeState.nativeElementOverrides?.[activeTransform.id] || {}),
            label: activeTransform.label,
            selector: activeTransform.selector,
            kind: activeTransform.nativeKind,
            scale: nextScale,
          };
          applyLocalNativeOverride(activeTransform.id, activeTransform.node, nextOverride);
          return;
        }

        if (activeTransform.kind === 'rotate') {
          hideSnapGuides();
          const currentAngle = (Math.atan2(point.y - activeTransform.centerY, point.x - activeTransform.centerX) * 180) / Math.PI;
          let nextRotation = activeTransform.startRotation + (currentAngle - activeTransform.startAngle);
          while (nextRotation > 180) nextRotation -= 360;
          while (nextRotation < -180) nextRotation += 360;
          const nextOverride = {
            ...(runtimeState.nativeElementOverrides?.[activeTransform.id] || {}),
            label: activeTransform.label,
            selector: activeTransform.selector,
            kind: activeTransform.nativeKind,
            rotation: nextRotation,
          };
          applyLocalNativeOverride(activeTransform.id, activeTransform.node, nextOverride);
        }
        return;
      }

      const dx = point.x - activeTransform.startX;
      const dy = point.y - activeTransform.startY;
      const { wrapper, kind, imageNode, contentNode } = activeTransform;

      if (kind === 'move') {
        const targetRect = getSnapTargetRect(activeTransform.snapTarget);
        const scrollOffset = getScrollOffsetForTarget(activeTransform.snapTarget);
        const nextLeft = activeTransform.startLeft + dx;
        const nextTop = activeTransform.startTop + dy;
        const elementRect = isRootOverlayTarget(activeTransform.snapTarget)
          ? {
              left: nextLeft - scrollOffset.x,
              top: nextTop - scrollOffset.y,
              width: wrapper.offsetWidth || 0,
              height: wrapper.offsetHeight || 0,
              right: nextLeft - scrollOffset.x + (wrapper.offsetWidth || 0),
              bottom: nextTop - scrollOffset.y + (wrapper.offsetHeight || 0),
            }
          : {
              left: targetRect.left - scrollOffset.x + nextLeft,
              top: targetRect.top - scrollOffset.y + nextTop,
              width: wrapper.offsetWidth || 0,
              height: wrapper.offsetHeight || 0,
              right: targetRect.left - scrollOffset.x + nextLeft + (wrapper.offsetWidth || 0),
              bottom: targetRect.top - scrollOffset.y + nextTop + (wrapper.offsetHeight || 0),
            };
        const snap = computeSnapAdjustments({
          targetRect,
          elementRect,
          peerRects: activeTransform.snapPeers || [],
        });
        wrapper.style.left = `${nextLeft + snap.deltaX}px`;
        wrapper.style.top = `${nextTop + snap.deltaY}px`;
        showSnapGuides(snap.guides, targetRect);
        return;
      }

      if (kind === 'resize') {
        hideSnapGuides();
        if (wrapper.dataset.type === 'text') {
          const nextFontSize = clamp(activeTransform.startFontSize + ((dx + dy) * 0.08), 12, 120);
          wrapper.dataset.fontSize = `${nextFontSize}px`;
          if (contentNode) {
            contentNode.style.fontSize = `${nextFontSize}px`;
          }
        } else {
          const nextWidth = clamp(activeTransform.startWidth + dx, 60, 900);
          const nextHeight = clamp(activeTransform.startHeight + dy, 60, 900);
          wrapper.style.width = `${nextWidth}px`;
          wrapper.style.height = `${nextHeight}px`;
        }
        return;
      }

      if (kind === 'crop' && imageNode) {
        hideSnapGuides();
        const width = Math.max(activeTransform.startWidth, 1);
        const height = Math.max(activeTransform.startHeight, 1);
        const nextCropX = clamp(activeTransform.startCropX - ((dx / width) * 100), 0, 100);
        const nextCropY = clamp(activeTransform.startCropY - ((dy / height) * 100), 0, 100);
        wrapper.dataset.cropX = String(nextCropX);
        wrapper.dataset.cropY = String(nextCropY);
        imageNode.style.objectPosition = `${nextCropX}% ${nextCropY}%`;
      }
    };

    const handleEnd = () => {
      if (!activeTransform) return;
      hideSnapGuides();

      if (activeTransform.pending) {
        activeTransform = null;
        return;
      }

      if (activeTransform.scope === 'native') {
        const { id, node } = activeTransform;
        const currentOverride = runtimeState.nativeElementOverrides?.[id] || {};
        node.style.cursor = '';
        persistNativeUpdate(id, node, {
          x: toPxNumber(currentOverride.x, 0),
          y: toPxNumber(currentOverride.y, 0),
          mediaUrl: currentOverride.mediaUrl == null ? '' : String(currentOverride.mediaUrl).trim(),
          cropX: Number.isFinite(Number(currentOverride.cropX)) ? Number(currentOverride.cropX) : 50,
          cropY: Number.isFinite(Number(currentOverride.cropY)) ? Number(currentOverride.cropY) : 50,
          scale: Number.isFinite(Number(currentOverride.scale)) ? Number(currentOverride.scale) : 1,
          rotation: Number.isFinite(Number(currentOverride.rotation)) ? Number(currentOverride.rotation) : 0,
          opacity: Number.isFinite(Number(currentOverride.opacity)) ? Number(currentOverride.opacity) : 1,
          hidden: Boolean(currentOverride.hidden),
          locked: Boolean(currentOverride.locked),
        });
        activeTransform = null;
        return;
      }

      const { wrapper, id, kind, imageNode, contentNode } = activeTransform;
      wrapper.style.opacity = '1';
      wrapper.style.zIndex = '';

      if (kind === 'move') {
        persistUpdate(id, {
          x: toPxNumber(wrapper.style.left, 0),
          y: toPxNumber(wrapper.style.top, 0),
        });
      } else if (kind === 'resize') {
        if (wrapper.dataset.type === 'text') {
          persistUpdate(id, {
            fontSize: contentNode?.style.fontSize || wrapper.dataset.fontSize || '24px',
          });
        } else {
          persistUpdate(id, {
            width: wrapper.style.width || `${wrapper.offsetWidth}px`,
            height: wrapper.style.height || `${wrapper.offsetHeight}px`,
          });
        }
      } else if (kind === 'crop' && imageNode) {
        persistUpdate(id, {
          cropX: toPxNumber(wrapper.dataset.cropX, 50),
          cropY: toPxNumber(wrapper.dataset.cropY, 50),
        });
      }

      activeTransform = null;
    };

    document.addEventListener('mousedown', handleStart);
    document.addEventListener('touchstart', handleStart, { passive: false });
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
    document.addEventListener('touchcancel', handleEnd);
    document.addEventListener('keydown', (event) => {
      if (!runtimeState.preview || activeTransform || runtimeState.activeTextEditor) {
        return;
      }

      const target = event.target;
      if (
        target?.isContentEditable
        || target?.closest?.('[contenteditable="true"], input, textarea, select, option')
      ) {
        return;
      }

      const directionMap = {
        ArrowRight: 'nudge-right',
        ArrowLeft: 'nudge-left',
        ArrowUp: 'nudge-up',
        ArrowDown: 'nudge-down',
      };
      const direction = directionMap[event.key];
      if (!direction) {
        return;
      }

      const step = event.shiftKey ? 10 : 2;
      let handled = false;
      const selectedNativeId = runtimeState.selectedNativeElementId;
      if (selectedNativeId) {
        handled = nudgeNativeElement(findNativeElementById(selectedNativeId), direction, step);
      } else if (runtimeState.selectedCustomElementId) {
        const selectedWrapper = document.querySelector(`.farha-custom-element[data-id="${runtimeState.selectedCustomElementId}"]`);
        handled = nudgeCustomElement(selectedWrapper, direction, step);
      }

      if (handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  }

  function applyCustomElements(elements) {
    if (runtimeState.preview) {
      initDragHandlers();
    }

    let container = document.getElementById('farha-custom-elements');
    const target = getEditorOverlayTarget();
      if (window.getComputedStyle(target).position === 'static' && target !== document.body) {
        target.style.position = 'relative';
      }
      if (!container) {
      container = document.createElement('div');
      container.id = 'farha-custom-elements';
      container.style.position = 'absolute';
      container.style.top = '0';
      container.style.left = '0';
      container.style.right = '0';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '99998';
    }
    if (window.getComputedStyle(target).position === 'static') {
      target.style.position = 'relative';
    }
    if (container.parentElement !== target) {
      target.appendChild(container);
    }
    container.style.width = `${Math.max(target.scrollWidth || 0, target.clientWidth || 0, target.offsetWidth || 0)}px`;
    container.style.height = `${Math.max(target.scrollHeight || 0, target.clientHeight || 0, target.offsetHeight || 0)}px`;

    runtimeState.activeDeviceMode = resolveRenderDeviceMode(runtimeState.renderConfig);
    const resolvedElements = elements.map((element) => resolveCustomElementForDevice(element, runtimeState.activeDeviceMode));
    const sortedElements = [...resolvedElements].sort((left, right) => toPxNumber(left?.zIndex, 0) - toPxNumber(right?.zIndex, 0));
    const existingWrappers = Array.from(container.children);
    const newIds = sortedElements.map((el) => String(el.id));

    existingWrappers.forEach(wrapper => {
      if (!newIds.includes(String(wrapper.dataset.id))) {
        wrapper.remove();
      }
    });

    if (runtimeState.canvasClickHandler) {
      document.body.removeEventListener('click', runtimeState.canvasClickHandler);
    }

    if (runtimeState.preview) {
      runtimeState.canvasClickHandler = (e) => {
        const clickTarget = e.target?.nodeType === 1 ? e.target : e.target?.parentElement;
        const addModeActive = Boolean(runtimeState.editorAddMode);
        if (!clickTarget) {
          return;
        }

        if (
          clickTarget.closest('.farha-custom-element, .farha-floating-text-editor, #farha-native-overlay, #farha-editor-dock')
        ) return;

        const shouldTreatAsCanvasClick =
          addModeActive
          || isCanvasBackgroundTarget(clickTarget)
          || !resolveNativeElementTarget(clickTarget);
        if (!shouldTreatAsCanvasClick) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        runtimeState.selectedCustomElementId = null;
        selectNativeElement(null, { silent: true });
        const rect = target.getBoundingClientRect();
        const pageX = e.clientX + window.scrollX;
        const pageY = e.clientY + window.scrollY;
        const targetPageLeft = rect.left + window.scrollX;
        const targetPageTop = rect.top + window.scrollY;
        const ownScrollX = target !== document.body && target !== document.documentElement ? (target.scrollLeft || 0) : 0;
        const ownScrollY = target !== document.body && target !== document.documentElement ? (target.scrollTop || 0) : 0;
        const x = pageX - targetPageLeft + ownScrollX;
        const y = pageY - targetPageTop + ownScrollY;
        const visualX = e.clientX - rect.left;
        const visualY = e.clientY - rect.top;

        window.parent.postMessage({
          type: 'FARHA_CANVAS_CLICK',
          payload: { x, y, visualX, visualY }
        }, '*');
      };
      document.body.addEventListener('click', runtimeState.canvasClickHandler);
    }

    sortedElements.forEach((el, index) => {
      let wrapper = container.querySelector(`[data-id="${el.id}"]`);
      if (!wrapper) {
        wrapper = document.createElement('div');
        wrapper.className = 'farha-custom-element';
        wrapper.dataset.id = el.id;
        wrapper.style.position = 'absolute';
        container.appendChild(wrapper);
      }
      container.appendChild(wrapper);

      wrapper.dataset.type = el.type;
      wrapper.dataset.name = el.name || '';
      wrapper.dataset.cropX = String(Number.isFinite(parseFloat(el.cropX)) ? parseFloat(el.cropX) : 50);
      wrapper.dataset.cropY = String(Number.isFinite(parseFloat(el.cropY)) ? parseFloat(el.cropY) : 50);
      wrapper.dataset.cropMode = wrapper.dataset.cropMode || 'false';
      wrapper.dataset.locked = el.locked ? 'true' : 'false';
      wrapper.dataset.hidden = el.hidden ? 'true' : 'false';
      wrapper.style.left = `${el.x || 0}px`;
      wrapper.style.top = `${el.y || 0}px`;
      wrapper.style.display = el.hidden ? 'none' : 'block';
      wrapper.style.pointerEvents = el.hidden ? 'none' : 'auto';
      wrapper.style.touchAction = el.type === 'text' ? 'none' : 'none';
      wrapper.style.userSelect = runtimeState.preview ? 'none' : (el.type === 'text' ? 'text' : 'none');
      wrapper.style.webkitUserSelect = runtimeState.preview ? 'none' : (el.type === 'text' ? 'text' : 'none');
      wrapper.style.cursor = runtimeState.preview ? (el.locked ? 'not-allowed' : 'default') : 'inherit';
      wrapper.style.maxWidth = 'calc(100% - 12px)';
      wrapper.style.opacity = String(clamp(toPxNumber(el.opacity, 1), 0.05, 1));
      wrapper.style.zIndex = String(toPxNumber(el.zIndex, index + 1));

      if (el.type === 'image') {
        const nextWidth = el.width || '150px';
        const nextHeight = el.height && el.height !== 'auto' ? el.height : nextWidth;
        wrapper.style.width = nextWidth;
        wrapper.style.height = nextHeight;
        wrapper.style.borderRadius = '18px';
        wrapper.style.overflow = 'hidden';
        wrapper.style.background = 'rgba(255,255,255,0.14)';
      } else {
        wrapper.style.width = 'fit-content';
        wrapper.style.height = 'auto';
        wrapper.style.borderRadius = '14px';
        wrapper.style.overflow = 'visible';
        wrapper.dataset.fontSize = el.fontSize || wrapper.dataset.fontSize || '24px';
      }

      let contentRoot = wrapper.querySelector('.farha-custom-element__content');
      if (!contentRoot) {
        contentRoot = document.createElement('div');
        contentRoot.className = 'farha-custom-element__content';
        wrapper.appendChild(contentRoot);
      }
      contentRoot.style.transform = `rotate(${toPxNumber(el.rotation, 0)}deg)`;
      contentRoot.style.transformOrigin = 'center center';

      let controlsRoot = wrapper.querySelector('.farha-custom-element__controls');
      if (!controlsRoot) {
        controlsRoot = document.createElement('div');
        controlsRoot.className = 'farha-custom-element__controls';
        wrapper.appendChild(controlsRoot);
      }
      controlsRoot.classList.add('farha-native-overlay__toolbar');

      let resizeHandle = wrapper.querySelector('.farha-custom-element__resize');
      if (!resizeHandle) {
        resizeHandle = document.createElement('button');
        resizeHandle.type = 'button';
        resizeHandle.className = 'farha-custom-element__resize';
        resizeHandle.dataset.farhaAction = 'resize';
        resizeHandle.textContent = '+';
        wrapper.appendChild(resizeHandle);
      }
      resizeHandle.classList.add('farha-native-overlay__handle');

      let deleteCorner = wrapper.querySelector('.farha-custom-element__delete');
      if (!deleteCorner) {
        deleteCorner = document.createElement('button');
        deleteCorner.type = 'button';
        deleteCorner.className = 'farha-custom-element__delete farha-native-overlay__corner-delete';
        deleteCorner.dataset.farhaAction = 'delete';
        deleteCorner.setAttribute('aria-label', 'حذف العنصر');
        deleteCorner.textContent = 'X';
        wrapper.appendChild(deleteCorner);
      }

      if (el.type === 'text') {
        let inner = contentRoot.querySelector('.farha-custom-element__text');
        if (!inner) {
          inner = document.createElement('div');
          inner.className = 'farha-custom-element__text';
          contentRoot.appendChild(inner);
        }
        if (document.activeElement !== inner) {
          inner.innerHTML = String(el.content || '').replace(/\n/g, '<br>');
        }
        inner.style.fontSize = el.fontSize || wrapper.dataset.fontSize || '24px';
        inner.style.color = el.color || '#111827';
        inner.style.fontFamily = el.fontFamily || '';
        inner.style.lineHeight = '1.35';
        inner.style.whiteSpace = 'pre-wrap';
        inner.style.minWidth = '56px';
        inner.style.minHeight = '28px';
        inner.style.padding = '6px 8px';
        inner.style.background = 'rgba(255,255,255,0.14)';
        inner.style.borderRadius = '12px';
        inner.style.cursor = runtimeState.preview ? (el.locked ? 'not-allowed' : 'grab') : 'text';
        inner.style.outline = 'none';
        inner.style.userSelect = runtimeState.preview ? 'none' : 'text';
        inner.style.webkitUserSelect = runtimeState.preview ? 'none' : 'text';
        inner.style.touchAction = runtimeState.preview ? 'none' : 'manipulation';
        inner.style.webkitTouchCallout = runtimeState.preview ? 'none' : 'default';

        if (runtimeState.preview) {
          inner.contentEditable = 'false';
          inner.setAttribute('tabindex', '0');
          if (!inner.dataset.farhaInlineBound) {
            inner.addEventListener('mousedown', (e) => {
              if (inner.getAttribute('data-farha-editing') === 'true') {
                e.stopPropagation();
              }
            });
            inner.addEventListener('touchstart', (e) => {
              if (inner.getAttribute('data-farha-editing') === 'true') {
                e.stopPropagation();
              }
            }, { passive: true });
            const openCustomTextEditor = (triggerEvent = null) => {
              if (el.locked) {
                return;
              }
              openFloatingTextEditor({
                target: inner,
                initialValue: inner.innerText || '',
                triggerEvent,
                onCommit: (nextValue) => {
                  inner.style.boxShadow = 'none';
                  window.parent.postMessage({
                    type: 'FARHA_CUSTOM_ELEMENT_UPDATE',
                    payload: { id: el.id, updates: { content: nextValue } }
                  }, '*');
                },
              });
            };
            inner.addEventListener('click', (e) => {
              e.stopPropagation();
              selectElement(el.id);
            });
            inner.addEventListener('dblclick', (e) => {
              e.preventDefault();
              e.stopPropagation();
              selectElement(el.id);
              openCustomTextEditor(e);
            });
            inner.addEventListener('touchend', (e) => {
              e.stopPropagation();
              const now = Date.now();
              const lastTap = Number(inner.dataset.farhaLastTapAt || 0);
              inner.dataset.farhaLastTapAt = String(now);
              if (now - lastTap < 320) {
                e.preventDefault();
                selectElement(el.id);
                openCustomTextEditor(e);
              }
            }, { passive: false });
            inner.dataset.farhaInlineBound = 'true';
          }
        } else {
          inner.removeAttribute('contenteditable');
        }
      } else {
        let frame = contentRoot.querySelector('.farha-custom-element__image-frame');
        if (!frame) {
          frame = document.createElement('div');
          frame.className = 'farha-custom-element__image-frame';
          contentRoot.appendChild(frame);
        }
        frame.style.width = '100%';
        frame.style.height = '100%';
        frame.style.overflow = 'hidden';
        frame.style.borderRadius = 'inherit';
        frame.style.background = 'rgba(255,255,255,0.08)';

        let inner = frame.querySelector('.farha-custom-element__image');
        if (!inner) {
          inner = document.createElement('img');
          inner.className = 'farha-custom-element__image';
          inner.draggable = false;
          frame.appendChild(inner);
        }
        inner.src = el.content;
        inner.style.display = 'block';
        inner.style.width = '100%';
        inner.style.height = '100%';
        inner.style.objectFit = 'cover';
        inner.style.objectPosition = `${wrapper.dataset.cropX}% ${wrapper.dataset.cropY}%`;
        inner.style.userSelect = 'none';
        inner.style.pointerEvents = 'auto';
      }

      if (runtimeState.preview) {
        const isSelected = String(runtimeState.selectedCustomElementId || '') === String(el.id);
        const wrapperRect = wrapper.getBoundingClientRect();
        controlsRoot.innerHTML = '';
        controlsRoot.style.position = 'absolute';
        controlsRoot.style.top = '0';
        controlsRoot.style.right = '0';
        controlsRoot.style.left = 'auto';
        controlsRoot.style.display = isSelected ? 'flex' : 'none';
        controlsRoot.style.gap = '';
        controlsRoot.style.flexWrap = '';
        controlsRoot.style.maxWidth = 'min(92vw, 640px)';
        controlsRoot.style.pointerEvents = 'auto';
        controlsRoot.style.zIndex = '3';
        controlsRoot.style.opacity = el.locked ? '0.8' : '1';
        controlsRoot.style.direction = 'rtl';
        controlsRoot.dataset.inside = wrapperRect.top < 88 ? 'true' : 'false';

        if (!controlsRoot.dataset.farhaControlBound) {
          const handleCustomControlChange = (event) => {
            const control = event.target?.closest?.('[data-farha-custom-control]');
            if (!control) {
              return;
            }

            const owner = controlsRoot.closest('.farha-custom-element');
            if (!owner || owner.dataset.type !== 'text') {
              return;
            }

            const textNode = owner.querySelector('.farha-custom-element__text');
            if (!textNode) {
              return;
            }

            event.stopPropagation();

            const controlName = control.dataset.farhaCustomControl;
            if (controlName === 'color') {
              const nextColor = String(control.value || '').trim() || '#111827';
              textNode.style.color = nextColor;
              persistUpdate(owner.dataset.id, { color: nextColor });
              return;
            }

            if (controlName === 'fontFamily') {
              const nextFontFamily = String(control.value || '').trim();
              textNode.style.fontFamily = nextFontFamily;
              persistUpdate(owner.dataset.id, { fontFamily: nextFontFamily });
            }
          };

          controlsRoot.addEventListener('input', handleCustomControlChange, true);
          controlsRoot.addEventListener('change', handleCustomControlChange, true);
          controlsRoot.dataset.farhaControlBound = 'true';
        }

        const makeActionButton = ({ label, action, wide = true, danger = false, active = false, ariaLabel = '' }) => {
          const button = document.createElement('button');
          button.type = 'button';
          button.dataset.farhaAction = action;
          button.className = `farha-native-overlay__btn${wide ? ' farha-native-overlay__btn--wide' : ''}${danger ? ' farha-native-overlay__btn--danger' : ''}`;
          button.textContent = label;
          button.setAttribute('aria-label', ariaLabel || label);
          button.dataset.active = active ? 'true' : 'false';
          return button;
        };

        const meta = document.createElement('div');
        meta.className = 'farha-native-overlay__meta';

        const label = document.createElement('span');
        label.className = 'farha-native-overlay__label';
        label.textContent = wrapper.dataset.name || (el.type === 'text' ? 'نص حر' : 'صورة حرة');
        label.title = wrapper.dataset.name || '';
        meta.appendChild(label);

        const hint = document.createElement('span');
        hint.className = 'farha-native-overlay__hint';
        hint.textContent = el.type === 'text' ? 'عنصر حر قابل للتحرير المباشر' : 'عنصر حر قابل للاستبدال والتحريك';
        meta.appendChild(hint);
        controlsRoot.appendChild(meta);

        const appendTextField = (fieldLabel, controlName, node) => {
          const field = document.createElement('label');
          field.className = 'farha-native-overlay__field';
          field.dataset.visible = 'true';

          const fieldLabelNode = document.createElement('span');
          fieldLabelNode.className = 'farha-native-overlay__field-label';
          fieldLabelNode.textContent = fieldLabel;
          field.appendChild(fieldLabelNode);
          field.appendChild(node);
          controlsRoot.appendChild(field);
        };

        controlsRoot.style.alignItems = 'center';
        controlsRoot.style.justifyContent = 'flex-start';
        controlsRoot.appendChild(makeActionButton({ label: 'تحريك', action: 'move', ariaLabel: 'تحريك العنصر الحر' }));
        controlsRoot.appendChild(makeActionButton({ label: '→', action: 'nudge-right', wide: false, ariaLabel: 'تحريك يمين' }));
        controlsRoot.appendChild(makeActionButton({ label: '←', action: 'nudge-left', wide: false, ariaLabel: 'تحريك يسار' }));
        controlsRoot.appendChild(makeActionButton({ label: '↑', action: 'nudge-up', wide: false, ariaLabel: 'تحريك أعلى' }));
        controlsRoot.appendChild(makeActionButton({ label: '↓', action: 'nudge-down', wide: false, ariaLabel: 'تحريك أسفل' }));

        if (el.type === 'text') {
          controlsRoot.appendChild(makeActionButton({ label: 'تحرير', action: 'edit', ariaLabel: 'تحرير النص' }));

          const colorInput = document.createElement('input');
          colorInput.type = 'color';
          colorInput.className = 'farha-native-overlay__color';
          colorInput.dataset.farhaCustomControl = 'color';
          colorInput.setAttribute('aria-label', 'لون النص');
          colorInput.value = cssColorToHex(el.color || '#111827');
          appendTextField('لون', 'color', colorInput);

          const fontSelect = document.createElement('select');
          fontSelect.className = 'farha-native-overlay__select';
          fontSelect.dataset.farhaCustomControl = 'fontFamily';
          fontSelect.setAttribute('aria-label', 'نوع الخط');
          populateNativeOverlayFontSelect(fontSelect, el.fontFamily || '');
          appendTextField('خط', 'fontFamily', fontSelect);
        }

        if (el.type === 'image') {
          controlsRoot.appendChild(makeActionButton({ label: 'استبدال', action: 'replace', ariaLabel: 'استبدال الصورة' }));
          controlsRoot.appendChild(makeActionButton({
            label: 'قص',
            action: 'crop-toggle',
            active: wrapper.dataset.cropMode === 'true',
            ariaLabel: 'قص الصورة',
          }));
        }

        controlsRoot.appendChild(makeActionButton({ label: 'تكرار', action: 'duplicate', ariaLabel: 'تكرار العنصر' }));
        controlsRoot.appendChild(makeActionButton({ label: 'نسخ', action: 'copy', ariaLabel: 'نسخ العنصر' }));
        controlsRoot.appendChild(makeActionButton({ label: 'لصق', action: 'paste', ariaLabel: 'لصق عنصر' }));
        controlsRoot.appendChild(makeActionButton({ label: 'إخفاء', action: 'hide', ariaLabel: 'إخفاء العنصر' }));
        controlsRoot.appendChild(makeActionButton({
          label: el.locked ? 'فتح' : 'قفل',
          action: 'lock',
          active: el.locked,
          ariaLabel: el.locked ? 'فتح قفل العنصر' : 'قفل العنصر',
        }));
        controlsRoot.appendChild(makeActionButton({
          label: 'حذف',
          action: 'delete',
          danger: true,
          ariaLabel: 'حذف العنصر',
        }));

        resizeHandle.style.position = 'absolute';
        resizeHandle.style.bottom = '-16px';
        resizeHandle.style.right = '-16px';
        resizeHandle.style.left = 'auto';
        resizeHandle.style.cursor = 'nwse-resize';
        resizeHandle.style.display = isSelected && !el.locked ? 'block' : 'none';
        deleteCorner.style.display = isSelected ? 'inline-flex' : 'none';
      } else {
        controlsRoot.style.display = 'none';
        resizeHandle.style.display = 'none';
        deleteCorner.style.display = 'none';
      }
    });
  }
  function hijackRsvpForms(forceRebind) {
    const forms = document.querySelectorAll('form.t-form, form.js-form-proccess, #rsvp-form, #da3wa-rsvp-form, form.rsvp-form');

    forms.forEach((form) => {
      if (form.dataset.farhaBound === 'true' && !forceRebind) return;

      syncRsvpFormReferences(form);
      form.dataset.farhaBound = 'true';
      form.removeAttribute('action');
      form.onsubmit = null;
      restorePersistedRsvpTicket(form);

      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        const data = collectRsvpPayload(form);
        const submitButton = form.querySelector('button[type="submit"], #submitBtn, .send');
        const feedback = findRsvpFeedbackTarget(form);
        const originalText = submitButton ? submitButton.textContent : '';

        if (!data.invitationId && !data.invitationSlug) {
          showFeedback(feedback, 'تعذر تحديد الدعوة الحالية. أعد تحميل الصفحة ثم حاول مرة أخرى.', false);
          return;
        }

        if (submitButton) {
          submitButton.disabled = true;
          submitButton.textContent = runtimeState.preview ? 'معاينة فقط...' : 'جارٍ الإرسال...';
        }

        try {
          if (runtimeState.preview) {
            showFeedback(feedback, 'هذه معاينة فقط. تم حفظ الرد تجريبيًا داخل وضع المعاينة.', true);
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
          renderRsvpQrTicket(form, result);
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
      }, true);
    });
  }

  function localizeRsvpMessage(text) {
    const value = String(text || '').trim();
    if (!value) return value;

    const dictionary = new Map([
      ['Invitation reference is required.', 'تعذر تحديد الدعوة الحالية. أعد تحميل الصفحة ثم حاول مرة أخرى.'],
      ['Invitation reference is required', 'تعذر تحديد الدعوة الحالية. أعد تحميل الصفحة ثم حاول مرة أخرى.'],
      ['Invitation not found.', 'لم يتم العثور على الدعوة الحالية.'],
      ['Failed to submit RSVP.', 'تعذر إرسال تأكيد الحضور.'],
      ['Invalid RSVP payload.', 'بيانات تأكيد الحضور غير مكتملة.'],
      ['Too many RSVP attempts. Please try again later.', 'تم تجاوز عدد المحاولات المسموح. حاول مرة أخرى لاحقًا.'],
      ['Invitation is not accepting RSVP responses right now.', 'هذه الدعوة لا تستقبل تأكيدات حضور الآن.'],
      ['تم استلام تأكيد الحضور بنجاح.', 'تم استلام تأكيد الحضور بنجاح.'],
      ['تم استلام ردكم بنجاح.', 'تم استلام ردكم بنجاح.'],
      ['This RSVP does not have an active entry pass.', 'لا توجد بطاقة دخول نشطة لهذا الرد.'],
    ]);

    if (dictionary.has(value)) {
      return dictionary.get(value);
    }

    if (value.includes('Invitation reference is required')) {
      return 'تعذر تحديد الدعوة الحالية. أعد تحميل الصفحة ثم حاول مرة أخرى.';
    }

    if (value.includes('Invitation not found')) {
      return 'لم يتم العثور على الدعوة الحالية.';
    }

    if (/[ÃØÙ]/.test(value)) {
      return 'تمت العملية بنجاح، لكن النص القديم في القالب كان بترميز غير صحيح.';
    }

    return value;
  }

  function renderRsvpQrTicket(form, result) {
    if (!result || !result.qrCodeDataUrl) return;

    const feedback = findRsvpFeedbackTarget(form);
    let host = form.parentElement?.querySelector('.farha-rsvp-ticket') || feedback;
    if (!host) {
      host = document.createElement('div');
      host.className = 'farha-rsvp-ticket';
      form.insertAdjacentElement('afterend', host);
    } else {
      host.classList.add('farha-rsvp-ticket');
    }

    const entryPass = result.entryPass || null;
    const remainingEntries = entryPass ? Number(entryPass.remainingEntries || 0) : null;

    host.style.display = 'block';
    host.style.marginTop = '16px';
    host.style.padding = '18px';
    host.style.borderRadius = '18px';
    host.style.background = '#fff';
    host.style.border = '1px solid rgba(127,42,31,.18)';
    host.style.boxShadow = '0 18px 40px rgba(15,23,42,.08)';
    host.style.textAlign = 'center';
    host.style.minHeight = 'auto';
    host.style.color = '';

    host.innerHTML = `
      <div style="font-weight:800;color:#7f2a1f;font-size:16px;margin-bottom:10px;">رمز QR الخاص بالدخول</div>
      <img
        src="${result.qrCodeDataUrl}"
        alt="Entry QR Code"
        style="width:min(72vw,220px);height:auto;display:block;margin:0 auto 12px;background:#fff;padding:10px;border-radius:14px;box-shadow:0 8px 24px rgba(15,23,42,.08)"
      />
      <div style="font-size:13px;color:#6b7280;line-height:1.8;margin-bottom:12px;">
        ${entryPass ? `الكود: ${entryPass.passCode || '-'}${remainingEntries != null ? ` • المتبقي: ${remainingEntries}` : ''}` : 'هذا الرمز خاص بحضورك فقط، ويمكنك تنزيله والاحتفاظ به.'}
      </div>
      <div style="display:flex;justify-content:center;gap:10px;flex-wrap:wrap;">
        <a
          href="${result.qrCodeDataUrl}"
          download="${result.qrCodeDownloadName || 'farha-entry-pass.png'}"
          style="display:inline-flex;align-items:center;justify-content:center;padding:10px 18px;border-radius:999px;background:#7f2a1f;color:#fff;text-decoration:none;font-weight:700;"
        >
          تحميل QR
        </a>
        ${result.qrCodeViewUrl ? `
          <a
            href="${result.qrCodeViewUrl}"
            target="_blank"
            rel="noreferrer"
            style="display:inline-flex;align-items:center;justify-content:center;padding:10px 18px;border-radius:999px;background:#f6efe8;color:#7f2a1f;text-decoration:none;font-weight:700;border:1px solid rgba(127,42,31,.18);"
          >
            فتح الكود
          </a>
        ` : ''}
        ${entryPass?.publicLink ? `
          <a
            href="${entryPass.publicLink}"
            target="_blank"
            rel="noreferrer"
            style="display:inline-flex;align-items:center;justify-content:center;padding:10px 18px;border-radius:999px;background:#ecfdf5;color:#065f46;text-decoration:none;font-weight:700;border:1px solid rgba(6,95,70,.18);"
          >
            الرابط الفردي
          </a>
        ` : ''}
      </div>
    `;

    persistRsvpTicket(result);
    host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function mountEntryPassLauncher(entryPass) {
    runtimeState.entryPassUi = entryPass || null;

    const existing = document.getElementById('farha-entry-pass-portal');
    const existingStyle = document.getElementById('farha-entry-pass-style');
    if (!entryPass || !entryPass.qrCodeDataUrl || runtimeState.preview) {
      existing?.remove();
      existingStyle?.remove();
      return;
    }

    if (!existingStyle) {
      const style = document.createElement('style');
      style.id = 'farha-entry-pass-style';
      style.textContent = `
        #farha-entry-pass-portal{margin:18px auto 0;max-width:420px;padding:18px;border-radius:20px;background:rgba(255,255,255,.96);border:1px solid rgba(127,42,31,.14);box-shadow:0 18px 40px rgba(15,23,42,.08);text-align:center;direction:rtl;font-family:"Tajawal",system-ui,sans-serif}
        #farha-entry-pass-portal .farha-entry-pass-open{display:inline-flex;align-items:center;justify-content:center;padding:12px 18px;border-radius:999px;background:#7f2a1f;color:#fff;border:none;font:700 14px "Tajawal",system-ui,sans-serif;cursor:pointer}
        #farha-entry-pass-portal .farha-entry-pass-title{font-weight:800;color:#111827;font-size:18px;margin:0 0 6px}
        #farha-entry-pass-portal .farha-entry-pass-sub{color:#6b7280;font-size:13px;line-height:1.8;margin:0 0 14px}
        #farha-entry-pass-modal{position:fixed;inset:0;background:rgba(15,23,42,.5);z-index:10001;display:flex;align-items:center;justify-content:center;padding:20px}
        #farha-entry-pass-modal .sheet{width:min(92vw,420px);background:#fff;border-radius:24px;padding:20px;box-shadow:0 22px 60px rgba(15,23,42,.2);direction:rtl;text-align:center;font-family:"Tajawal",system-ui,sans-serif}
        #farha-entry-pass-modal .close{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:999px;border:none;background:#f8fafc;color:#7f2a1f;font-size:22px;cursor:pointer}
      `;
      document.head.appendChild(style);
    }

    const portal = existing || document.createElement('section');
    portal.id = 'farha-entry-pass-portal';
    portal.innerHTML = `
      <h3 class="farha-entry-pass-title">بطاقة الدخول</h3>
      <p class="farha-entry-pass-sub">
        ${entryPass.guestName ? `هذه البطاقة مخصصة لـ ${entryPass.guestName}. ` : ''}
        ${entryPass.remainingEntries != null ? `المتبقي: ${entryPass.remainingEntries} من ${entryPass.allowedEntries}.` : ''}
      </p>
      <button type="button" class="farha-entry-pass-open">إظهار QR الدخول</button>
    `;

    const anchor = document.querySelector('#da3wa-rsvp, #rsvp-section, form.rsvp-form, #da3wa-rsvp-form');
    if (!existing) {
      if (anchor && anchor.parentElement) {
        if (anchor.tagName === 'FORM') {
          anchor.insertAdjacentElement('afterend', portal);
        } else {
          anchor.appendChild(portal);
        }
      } else {
        portal.style.position = 'fixed';
        portal.style.left = '16px';
        portal.style.bottom = '16px';
        portal.style.zIndex = '9999';
        portal.style.maxWidth = '320px';
        document.body.appendChild(portal);
      }
    }

    const openButton = portal.querySelector('.farha-entry-pass-open');
    openButton?.addEventListener('click', () => {
      document.getElementById('farha-entry-pass-modal')?.remove();
      const modal = document.createElement('div');
      modal.id = 'farha-entry-pass-modal';
      modal.innerHTML = `
        <div class="sheet">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:14px">
            <div style="text-align:right">
              <div style="font-weight:800;color:#111827;font-size:20px">QR الدخول</div>
              <div style="color:#6b7280;font-size:13px">${entryPass.passCode || ''}</div>
            </div>
            <button type="button" class="close" aria-label="إغلاق">×</button>
          </div>
          <img src="${entryPass.qrCodeDataUrl}" alt="Entry QR Code" style="width:min(74vw,240px);height:auto;display:block;margin:0 auto 14px;background:#fff;padding:10px;border-radius:16px;box-shadow:0 8px 24px rgba(15,23,42,.08)" />
          <div style="font-size:14px;color:#374151;line-height:1.9;margin-bottom:14px">
            ${entryPass.guestName ? `<div><strong>الاسم:</strong> ${entryPass.guestName}</div>` : ''}
            <div><strong>المسموح:</strong> ${entryPass.allowedEntries || 0}</div>
            <div><strong>المتبقي:</strong> ${entryPass.remainingEntries || 0}</div>
            ${entryPass.tableNumber ? `<div><strong>الطاولة:</strong> ${entryPass.tableNumber}</div>` : ''}
          </div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
            <a href="${entryPass.qrCodeDownloadUrl || entryPass.qrCodeViewUrl || '#'}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;justify-content:center;padding:10px 18px;border-radius:999px;background:#7f2a1f;color:#fff;text-decoration:none;font-weight:700">فتح / تحميل QR</a>
            ${entryPass.publicLink ? `<a href="${entryPass.publicLink}" target="_blank" rel="noreferrer" style="display:inline-flex;align-items:center;justify-content:center;padding:10px 18px;border-radius:999px;background:#f6efe8;color:#7f2a1f;text-decoration:none;font-weight:700;border:1px solid rgba(127,42,31,.18)">الرابط الفردي</a>` : ''}
          </div>
        </div>
      `;

      const closeModal = () => modal.remove();
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          closeModal();
        }
      });
      modal.querySelector('.close')?.addEventListener('click', closeModal);
      document.body.appendChild(modal);
    });
  }
})();


