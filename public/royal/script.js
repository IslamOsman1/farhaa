window.renderFarhaTemplate = function() {
    
    // --- ربط البيانات (Data Binding) ---
    function populateData() {
        if (!window.__INVITE__ || !window.__INVITE__.config) return;
        const c = window.__INVITE__.config;
        
        const setEl = (id, text) => {
            const el = document.getElementById(id);
            if (el) {
                if (text) {
                    el.innerText = text;
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
            }
        };

        setEl('env-guest-name', c.guestName || 'ضيفنا العزيز');
        setEl('heroInvite', c.welcomeMessage);
        setEl('groomName', c.groomName);
        setEl('brideName', c.brideName);
        
        // تنسيق التاريخ
        let dStr = '';
        if (c.weddingDate) {
            const d = new Date(c.weddingDate);
            dStr = d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
            const tStr = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
            setEl('weddingDate', dStr);
            setEl('weddingTime', tStr);
        }
        setEl('heroDate', dStr);
        
        setEl('verseText', c.verseText);
        setEl('invitationText', c.invitationText);
        setEl('groomParentsLabel', c.groomParentsLabel);
        setEl('groomParents', c.groomParents);
        setEl('brideParentsLabel', c.brideParentsLabel);
        setEl('brideParents', c.brideParents);
        
        setEl('venueName', c.venueName);
        setEl('venueAddr', c.venueAddress);
        
        const mapBtn = document.getElementById('mapBtn');
        if (mapBtn) {
            if (c.locationLink) {
                mapBtn.href = c.locationLink;
                mapBtn.style.display = 'inline-block';
            } else {
                mapBtn.style.display = 'none';
            }
        }
        
        setEl('closingNote', c.closingNote);
        setEl('closingHashtag', c.closingHashtag);
        setEl('closingFamilies', c.closingFamilies);
        
        const music = document.getElementById('bgMusic');
        if (music && c.musicUrl) {
            music.src = c.musicUrl;
        }
    }

    // --- واجهات البناء الديناميكي (Global functions for Editor compatibility) ---
    window.buildTimeline = function(arr) {
        const wrap = document.getElementById('timeline');
        const sec = document.getElementById('program-section');
        if(!wrap || !sec) return;
        if(!arr || !arr.length) { sec.style.display = 'none'; return; }
        sec.style.display = 'block';
        wrap.innerHTML = arr.map(i => `
            <div class="timeline-item">
                <span class="time-badge">${i.time}</span>
                <span class="act-text">${i.activity}</span>
            </div>
        `).join('');
    };

    window.buildNotes = function(arr) {
        const wrap = document.getElementById('notesList');
        const sec = document.getElementById('notes-section');
        if(!wrap || !sec) return;
        if(!arr || !arr.length) { sec.style.display = 'none'; return; }
        sec.style.display = 'block';
        wrap.innerHTML = arr.map(n => `<p>• ${n}</p>`).join('');
    };

    // معرض الصور يُبنى مباشرة إذا لم يكن من خلال دالة Editor
    const renderGallery = () => {
        if (!window.__INVITE__) return;
        const sec = document.getElementById('gallery-section');
        const grid = document.getElementById('galleryGrid');
        const images = window.__INVITE__.config.galleryImages;
        if (!images || !images.length) {
            if (sec) sec.style.display = 'none';
            return;
        }
        if (sec) sec.style.display = 'block';
        if (grid) {
            grid.innerHTML = images.map(src => `<img src="${src}" alt="Memory" loading="lazy">`).join('');
        }
    };

    // تشغيل تهيئة البيانات
    populateData();
    if(window.__INVITE__ && window.__INVITE__.config) {
        if(window.__INVITE__.config.program) window.buildTimeline(window.__INVITE__.config.program);
        if(window.__INVITE__.config.notes) window.buildNotes(window.__INVITE__.config.notes);
        renderGallery();
    }

    // --- المظروف المتحرك ---
    const envWrapper = document.getElementById('envelope');
    const envScreen = document.getElementById('envelope-screen');
    const invContainer = document.getElementById('invitation-container');
    const music = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    let isPlaying = false;

    if (envWrapper) {
        envWrapper.addEventListener('click', () => {
            // فتح الغطاء
            envWrapper.classList.add('open');
            
            // تشغيل الموسيقى
            if (music && music.src) {
                music.play().then(() => {
                    isPlaying = true;
                    musicToggle.classList.remove('hidden');
                }).catch(e => console.log('Autoplay prevented', e));
            }

            // إخفاء المظروف وإظهار الدعوة بعد ثانية
            setTimeout(() => {
                envScreen.classList.add('hide');
                invContainer.classList.remove('hidden');
                // نطلب من المتصفح إعادة رسم الصفحة لتطبيق الحركات
                void invContainer.offsetWidth;
                invContainer.classList.add('visible');
            }, 800);
            
            setTimeout(() => {
                envScreen.style.display = 'none';
            }, 1800);
        });
    }

    // زر التحكم بالموسيقى
    if (musicToggle && music) {
        musicToggle.addEventListener('click', () => {
            if (isPlaying) {
                music.pause();
                musicToggle.style.opacity = '0.5';
            } else {
                music.play();
                musicToggle.style.opacity = '1';
            }
            isPlaying = !isPlaying;
        });
    }

    // --- تأكيد الحضور (RSVP) ---
    const pills = document.querySelectorAll('.pill');
    const statusInput = document.getElementById('statusInput');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            statusInput.value = pill.getAttribute('data-val');
        });
    });

    const compMinus = document.getElementById('comp-minus');
    const compPlus = document.getElementById('comp-plus');
    const compCount = document.getElementById('comp-count');
    const compInput = document.getElementById('compInput');
    let comp = 0;
    
    if (compMinus && compPlus) {
        compMinus.addEventListener('click', () => {
            if (comp > 0) comp--;
            compCount.innerText = comp;
            compInput.value = comp;
        });
        compPlus.addEventListener('click', () => {
            if (comp < 10) comp++;
            compCount.innerText = comp;
            compInput.value = comp;
        });
    }

    if (window.farhaFormsHijacked) return;
    window.farhaFormsHijacked = true;
    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const msgEl = document.getElementById('rsvpMsg');
            btn.disabled = true;
            btn.innerText = 'جاري الإرسال...';
            msgEl.className = 'form-msg';
            msgEl.innerText = '';

            const fd = new FormData(rsvpForm);
            const data = {
                invitationId: window.__INVITE__?.config?.id,
                guestName: fd.get('guestName'),
                status: fd.get('status'),
                companions: parseInt(fd.get('companions')),
                message: fd.get('message')
            };

            try {
                const res = await fetch('/api/rsvp', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                const j = await res.json();
                
                if (res.ok) {
                    msgEl.classList.add('success');
                    msgEl.innerText = 'تم تأكيد حضورك بنجاح. شكراً لك!';
                    rsvpForm.reset();
                    pills.forEach(p => p.classList.remove('active'));
                    pills[0].classList.add('active');
                    statusInput.value = 'confirmed';
                    comp = 0;
                    compCount.innerText = '0';
                    compInput.value = '0';
                } else {
                    msgEl.classList.add('error');
                    msgEl.innerText = j.error || 'حدث خطأ. يرجى المحاولة لاحقاً.';
                }
            } catch (error) {
                msgEl.classList.add('error');
                msgEl.innerText = 'خطأ في الاتصال.';
            }
            btn.disabled = false;
            btn.innerText = 'إرسال التأكيد';
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
