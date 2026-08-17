window.renderFarhaTemplate = function() {
    // 1. Data Injection from window.__INVITE__.config
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

    // 2. Form Hijacking
    if (window.farhaFormsHijacked) return;
    window.farhaFormsHijacked = true;
    const forms = document.querySelectorAll('form.t-form, form.js-form-proccess');
    forms.forEach(form => {
        // Remove native action
        form.removeAttribute('action');
        
        // Find Tilda success box to show success messages natively
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
                        // Sometimes the value is a string like "1 person", "2 persons", "Just me"
                        const match = v.match(/\\d+/);
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
                data.message = extraMessages.join('\\n');
            }
            
            // Add template slug
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            if (pathParts.length > 0) {
                 data.templateId = pathParts[0];
            } else {
                 data.templateId = 'unknown';
            }

            // Provide visual feedback
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
};
document.addEventListener('DOMContentLoaded', window.renderFarhaTemplate);
window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    if (event.data && event.data.type === 'FARHA_RENDER_CONFIG') {
        setTimeout(window.renderFarhaTemplate, 60);
    }
});
