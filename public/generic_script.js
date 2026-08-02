document.addEventListener('DOMContentLoaded', () => {
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

    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const templateSlug = pathParts[0] || '';

    if (TEMPLATE_META[templateSlug]) {
        mountFarhaTemplateBar(templateSlug, TEMPLATE_META[templateSlug]);
    }

    if (window.__INVITE__ && window.__INVITE__.config) {
        const config = window.__INVITE__.config;

        const updateEl = (id, val) => {
            if (val) {
                const els = document.querySelectorAll('#' + id);
                els.forEach(el => el.innerHTML = val);
            }
        };

        updateEl('groomName', config.groomName);
        updateEl('brideName', config.brideName);
        if (config.groomName && config.brideName) {
             updateEl('groomFullName', config.groomName);
             updateEl('brideFullName', config.brideName);
             updateEl('closingGroom', config.groomName);
             updateEl('closingBride', config.brideName);
        }

        updateEl('heroDate', config.date);
        updateEl('eventDate', config.date);
        updateEl('heroVenue', config.venueName);
        updateEl('venueName', config.venueName);
        updateEl('venueAddr', config.venueAddress);
        updateEl('invitationText', config.invitationText);
    }

    const forms = document.querySelectorAll('form.t-form, form.js-form-proccess');
    forms.forEach(form => {
        form.removeAttribute('action');

        const successBox = form.querySelector('.js-successbox') || form.parentElement.querySelector('.js-successbox');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            const formData = new FormData(form);
            const data = {
                guestName: 'Guest',
                status: 'confirmed',
                companions: 0,
                message: ''
            };

            const extraMessages = [];

            for (const [key, val] of formData.entries()) {
                const k = key.toLowerCase();
                const v = val.toString().toLowerCase();

                if (k.includes('name') || k.includes('nom')) {
                    data.guestName = val;
                }
                else if (k.includes('attend') || k.includes('come') || k.includes('presence') || k.includes('viens')) {
                    if (v.includes('yes') || v.includes('accept') || v.includes('oui') || v.includes('pleasure') || v.includes('will')) {
                        data.status = 'confirmed';
                    } else if (v.includes('no') || v.includes('decline') || v.includes('non') || v.includes('regret') || v.includes('not')) {
                        data.status = 'declined';
                    }
                }
                else if (k.includes('guest') || k.includes('companion') || k.includes('person') || k.includes('number') || k.includes('combien')) {
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed)) {
                        data.companions = parsed;
                    } else {
                        const match = v.match(/\d+/);
                        if (match) data.companions = parseInt(match[0], 10);
                    }
                }
                else {
                    if (val) {
                        extraMessages.push(`${key}: ${val}`);
                    }
                }
            }

            if (extraMessages.length > 0) {
                data.message = extraMessages.join('\n');
            }

            if (pathParts.length > 0) {
                 data.templateId = pathParts[0];
            } else {
                 data.templateId = 'unknown';
            }

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
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (successBox) {
                    successBox.style.display = 'block';
                    successBox.innerHTML = result.message || 'RSVP sent successfully!';
                    successBox.style.color = '#2ecc71';
                }
                form.reset();
            } catch (err) {
                console.error('RSVP error:', err);
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

async function mountFarhaTemplateBar(templateSlug, templateMeta) {
    const existing = document.getElementById('farha-template-bar');
    if (existing) return;

    hideLegacyTemplateBars();

    const publicData = await loadPublicTemplateBarData();
    const whatsappNumber = publicData.whatsapp || '201001473345';
    const priceLabel = publicData.minPriceLabel ? `تبدأ من ${publicData.minPriceLabel} — ` : '';
    const whatsappText = encodeURIComponent(`مرحباً، أعجبني قالب «${templateMeta.arabicName}» وأرغب في طلبه من FARHA.`);
    const orderUrl = `/order?tpl=${templateSlug}`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${whatsappText}`;

    const style = document.createElement('style');
    style.id = 'farha-template-bar-style';
    style.textContent = `
      #farha-template-bar{
        position:fixed;bottom:0;left:0;right:0;z-index:9999;direction:rtl;
        display:flex;align-items:center;gap:12px;justify-content:space-between;
        padding:12px 18px calc(12px + env(safe-area-inset-bottom,0px));
        background:rgba(255,252,249,.96);
        border-top:1px solid rgba(127,42,31,.1);
        box-shadow:0 -14px 34px rgba(83,38,31,.08);
        backdrop-filter:blur(14px);
        font-family:"Tajawal",system-ui,sans-serif;
        animation:farhaBarIn .45s ease both;
      }
      #farha-template-bar .ftb-copy{flex:1;min-width:0;text-align:right}
      #farha-template-bar .ftb-title{margin:0;color:#2f2430;font-size:1.35rem;font-weight:900}
      #farha-template-bar .ftb-sub{margin:6px 0 0;color:#756774;font-size:1rem;line-height:1.65}
      #farha-template-bar .ftb-note{margin:5px 0 0;color:#8f7f78;font-size:.86rem;line-height:1.6}
      #farha-template-bar .ftb-actions{display:flex;align-items:center;gap:12px;flex-shrink:0}
      #farha-template-bar .ftb-order{
        display:inline-flex;align-items:center;justify-content:center;height:56px;padding:0 28px;border-radius:999px;
        background:linear-gradient(135deg,#ff4d7d,#ff6f8f);color:#fff;text-decoration:none;font-size:1.05rem;font-weight:900;
        box-shadow:0 16px 30px rgba(255,77,125,.24);white-space:nowrap;
      }
      #farha-template-bar .ftb-wa{
        width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#25d366,#128c43);
        color:#fff;text-decoration:none;box-shadow:0 14px 28px rgba(18,140,67,.24);flex-shrink:0;
      }
      #farha-template-bar .ftb-close{
        width:38px;height:38px;border:none;background:transparent;color:#a396aa;font-size:28px;line-height:1;border-radius:999px;
        display:grid;place-items:center;cursor:pointer;flex-shrink:0;
      }
      body{padding-bottom:110px !important;box-sizing:border-box}
      @keyframes farhaBarIn{
        from{opacity:0;transform:translateY(16px)}
        to{opacity:1;transform:translateY(0)}
      }
      @media (max-width: 820px){
        #farha-template-bar{padding:10px 12px calc(10px + env(safe-area-inset-bottom,0px));gap:10px}
        #farha-template-bar .ftb-title{font-size:1.04rem}
        #farha-template-bar .ftb-sub{font-size:.85rem}
        #farha-template-bar .ftb-note{font-size:.72rem}
        #farha-template-bar .ftb-order{height:50px;padding:0 20px;font-size:.94rem}
        #farha-template-bar .ftb-wa{width:48px;height:48px}
        body{padding-bottom:126px !important}
      }
      @media (max-width: 620px){
        #farha-template-bar{flex-wrap:wrap}
        #farha-template-bar .ftb-copy{order:2;width:100%}
        #farha-template-bar .ftb-actions{order:1;width:100%;justify-content:flex-start}
        #farha-template-bar .ftb-close{margin-inline-end:auto}
        body{padding-bottom:164px !important}
      }
    `;
    document.head.appendChild(style);

    const bar = document.createElement('div');
    bar.id = 'farha-template-bar';
    bar.innerHTML = `
      <div class="ftb-copy">
        <p class="ftb-title">أعجبك قالب «${templateMeta.arabicName}»؟</p>
        <p class="ftb-sub">${priceLabel}اطلبه الآن من FARHA ونجهزه ليتناسب مع مناسبتكم</p>
        <p class="ftb-note">هذا الشريط للعرض فقط — دعوتكم النهائية تصلكم نظيفة بدونه</p>
      </div>
      <div class="ftb-actions">
        <button class="ftb-close" type="button" aria-label="إغلاق الشريط">×</button>
        <a class="ftb-wa" href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" aria-label="اطلب عبر واتساب">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </a>
        <a class="ftb-order" href="${orderUrl}">اطلبه 🎉</a>
      </div>
    `;

    const closeButton = bar.querySelector('.ftb-close');
    closeButton.addEventListener('click', () => {
        bar.remove();
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
        document.body.style.paddingBottom = '0px';
    });

    document.body.appendChild(bar);
}

function hideLegacyTemplateBars() {
    ['da3wa-democta', 'farha-democta'].forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
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
            if (settings?.whatsapp) {
                defaults.whatsapp = String(settings.whatsapp).replace(/[^0-9]/g, '') || defaults.whatsapp;
            }
        }

        if (packagesRes.ok) {
            const packages = await packagesRes.json();
            if (Array.isArray(packages) && packages.length > 0) {
                const prices = packages
                    .filter((pkg) => typeof pkg.price === 'number' && !Number.isNaN(pkg.price))
                    .sort((a, b) => a.price - b.price);

                if (prices.length > 0) {
                    const cheapest = prices[0];
                    const currencyLabel = cheapest.currency === 'EGP' ? 'ج.م' : (cheapest.currency || '');
                    defaults.minPriceLabel = `${cheapest.price} ${currencyLabel}`.trim();
                }
            }
        }
    } catch (error) {
        console.error('Failed to load FARHA template bar data:', error);
    }

    return defaults;
}
