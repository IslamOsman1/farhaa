'use client';

// Assuming generateICS is in @/lib/utils, we'll create a simple fallback if not
const generateICSFallback = (invitation) => {
  const dateStr = new Date(invitation.date).toISOString().replace(/-|:|\.\d+/g, '');
  const endStr = new Date(new Date(invitation.date).getTime() + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d+/g, ''); // +4 hours
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `DTSTART:${dateStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:زفاف ${invitation.coupleNames || 'فرحة العمر'}`,
    `LOCATION:${invitation.venueName || ''} ${invitation.venueAddress || ''}`,
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');
};

export default function AddToCalendar({ invitation }) {
  const handleDownload = async () => {
    let icsContent = '';
    try {
      // Try to import from lib/utils, fallback if not available
      const utils = await import('@/lib/utils');
      if (utils.generateICS) {
        icsContent = utils.generateICS(invitation);
      } else {
        icsContent = generateICSFallback(invitation);
      }
    } catch {
      icsContent = generateICSFallback(invitation);
    }

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', 'wedding-invitation.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button className="inv-btn" onClick={handleDownload} style={{ width: 'fit-content' }}>
      إضافة للتقويم
    </button>
  );
}
