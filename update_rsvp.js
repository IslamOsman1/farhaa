const fs = require('fs');
const templates = ['blush', 'classic', 'minimal'];

const rsvpCode = `
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.rsvp-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if(btn) btn.innerText = 'جاري الإرسال...';
      
      const formData = new FormData(form);
      const data = {
        invitationId: window.__INVITE__?.config?.id,
        guestName: formData.get('guestName') || '',
        phone: formData.get('phone') || '',
        status: formData.get('status') || 'confirmed',
        companions: formData.get('companions') || '0',
        message: formData.get('message') || ''
      };

      try {
        const res = await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (res.ok) {
          alert('تم إرسال الرد بنجاح. شكراً لك!');
          form.reset();
        } else {
          alert('حدث خطأ. يرجى المحاولة لاحقاً.');
        }
      } catch(err) {
        alert('حدث خطأ في الاتصال.');
      }
      if(btn) btn.innerText = 'تأكيد الحضور';
    });
  }
});
`;

templates.forEach(t => {
  const p = 'public/' + t + '/script.js';
  if(fs.existsSync(p)) {
    let js = fs.readFileSync(p, 'utf8');
    if(!js.includes('/api/rsvp')) {
      js += '\n' + rsvpCode;
      fs.writeFileSync(p, js);
    }
  }
});
console.log('RSVP code injected successfully.');
