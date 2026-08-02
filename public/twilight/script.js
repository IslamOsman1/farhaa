document.addEventListener('DOMContentLoaded', () => {
    
    // --- Data Binding ---
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
        setEl('closingGroom', c.groomName);
        setEl('closingBride', c.brideName);
        
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
                mapBtn.style.display = 'inline-flex';
            } else {
                mapBtn.style.display = 'none';
            }
        }
        
        setEl('closingNote', c.closingNote);
        setEl('closingHashtag', c.closingHashtag);
        setEl('closingFamilies', c.closingFamilies);
        
        const music = document.getElementById('bgMusic');
        if (music) {
            music.src = c.musicUrl || './music.mp3';
        }
    }

    window.buildTimeline = function(arr) {
        const wrap = document.getElementById('timeline');
        const sec = document.getElementById('program-section');
        if(!wrap || !sec) return;
        if(!arr || !arr.length) { sec.style.display = 'none'; return; }
        sec.style.display = 'block';
        wrap.innerHTML = arr.map(i => `
            <div class="flex flex-col items-center w-full">
                <div class="text-center py-2 reveal-on-scroll">
                    <h3 class="text-xl md:text-2xl text-foreground mb-1 font-medium">${i.time}</h3>
                    <p class="text-foreground/80 text-lg">${i.activity}</p>
                </div>
                <div class="w-px bg-foreground/30 h-10 md:h-14 my-2"></div>
            </div>
        `).join('');
        setupScrollReveal(); // Re-bind observer for new elements
    };

    window.buildNotes = function(arr) {
        const wrap = document.getElementById('notesList');
        const sec = document.getElementById('notes-section');
        if(!wrap || !sec) return;
        if(!arr || !arr.length) { sec.style.display = 'none'; return; }
        sec.style.display = 'block';
        wrap.innerHTML = arr.map(n => `<p>• ${n}</p>`).join('');
    };

    const renderGallery = () => {
        const sec = document.getElementById('gallery-section');
        const grid = document.getElementById('galleryGrid');
        
        let images = window.__INVITE__?.config?.galleryImages;
        
        // Fallback to default AI generated images if not provided
        if (!images || !images.length) {
            images = [
                './gallery1.jpg',
                './gallery2.jpg'
            ];
        }

        if (sec) sec.style.display = 'block';
        if (grid) {
            grid.innerHTML = images.map(src => `<img src="${src}" alt="Memory" class="w-full h-48 md:h-64 object-cover rounded-md shadow-sm reveal-on-scroll" loading="lazy">`).join('');
            setupScrollReveal();
        }
    };

    // Scroll reveal logic
    function setupScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            observer.observe(el);
        });
    }

    populateData();
    if(window.__INVITE__ && window.__INVITE__.config) {
        if(window.__INVITE__.config.program) window.buildTimeline(window.__INVITE__.config.program);
        if(window.__INVITE__.config.notes) window.buildNotes(window.__INVITE__.config.notes);
        renderGallery();
    }
    setupScrollReveal();

    // --- Envelope Animation ---
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
                // Hide poster, show video
                posterContainer.classList.add('hidden-opacity');
                introVideo.classList.remove('opacity-0');
                introVideo.play().catch(e => console.log('Video play prevented', e));
                
                if (music && music.src) {
                    music.play().then(() => {
                        isPlaying = true;
                        musicToggle.classList.remove('hidden');
                    }).catch(e => console.log('Music play prevented', e));
                }

                // Wait for video to finish opening effect, then transition
                setTimeout(() => {
                    introLayer.classList.add('hidden-opacity');
                    mainContent.classList.remove('opacity-0');
                    setTimeout(() => {
                        introLayer.style.display = 'none';
                    }, 1000);
                }, 3000); // 3 seconds matching the intro video length approx
            } else {
                // Fallback if no video
                introLayer.classList.add('hidden-opacity');
                mainContent.classList.remove('opacity-0');
                setTimeout(() => {
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
                music.play();
                musicToggle.style.opacity = '1';
            }
            isPlaying = !isPlaying;
        });
    }

    // --- RSVP Logic ---
    const pills = document.querySelectorAll('.pill');
    const statusInput = document.getElementById('statusInput');
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active', 'bg-foreground', 'text-white'));
            pill.classList.add('active', 'bg-foreground', 'text-white');
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

    const rsvpForm = document.getElementById('rsvp-form');
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('submitBtn');
            const msgEl = document.getElementById('rsvpMsg');
            btn.disabled = true;
            btn.innerText = 'جاري الإرسال...';
            msgEl.className = 'mt-4 text-center font-bold';
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
                    msgEl.classList.add('text-green-700');
                    msgEl.innerText = 'تم تأكيد حضورك بنجاح. شكراً لك!';
                    rsvpForm.reset();
                    pills.forEach(p => p.classList.remove('active', 'bg-foreground', 'text-white'));
                    pills[0].classList.add('active', 'bg-foreground', 'text-white');
                    statusInput.value = 'confirmed';
                    comp = 0;
                    compCount.innerText = '0';
                    compInput.value = '0';
                } else {
                    msgEl.classList.add('text-red-700');
                    msgEl.innerText = j.error || 'حدث خطأ. يرجى المحاولة لاحقاً.';
                }
            } catch (error) {
                msgEl.classList.add('text-red-700');
                msgEl.innerText = 'خطأ في الاتصال.';
            }
            btn.disabled = false;
            btn.innerText = 'إرسال التأكيد';
        });
    }
});
