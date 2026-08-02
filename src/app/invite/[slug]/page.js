import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function InvitationPage({ params }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const invitation = await prisma.invitation.findUnique({
    where: { slug },
    include: { template: true }
  });

  if (!invitation) {
    return notFound();
  }

  // Parse extra fields and sections
  let extraFields = {};
  let sections = { gallery: true, timeline: true, rsvp: true, calendar: true };
  
  try {
    if (invitation.coupleStory) extraFields = JSON.parse(invitation.coupleStory);
    if (invitation.sections) sections = { ...sections, ...JSON.parse(invitation.sections) };
  } catch (e) {}

  const mergedData = { ...invitation, ...extraFields };

  // Format date
  let dateStr = '—';
  let timeStr = '—';
  let monthYear = 'تشرين الثاني 2026';
  let dayNum = '20';
  let weekdayName = 'الجمعة';
  let timeStrCal = 'الساعة السابعة مساءً';
  
  if (mergedData.weddingDate) {
    const d = new Date(mergedData.weddingDate);
    dateStr = d.toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    timeStr = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    
    monthYear = d.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
    dayNum = d.toLocaleDateString('ar-EG', { day: 'numeric' });
    weekdayName = d.toLocaleDateString('ar-EG', { weekday: 'long' });
    timeStrCal = timeStr;
  }

  // Load the static HTML template
  const templatePath = path.join(process.cwd(), 'public', invitation.template.slug, 'index.html');
  
  let html = '';
  try {
    html = fs.readFileSync(templatePath, 'utf-8');
  } catch (err) {
    console.error('Template not found', err);
    return notFound();
  }

  // Inject the script block so that script.js reads our exact data
  const inviteConfig = {
    id: invitation.id,
    groom: mergedData.groomName || 'اسم العريس',
    bride: mergedData.brideName || 'اسم العروس',
    date: mergedData.weddingDate || '2026-12-18T19:00:00', // Important for countdown
    dateText: dateStr,
    timeText: timeStr,
    heroSub: mergedData.welcomeMessage || '',
    verse: mergedData.verseText || '',
    invitationText: mergedData.invitationText || '',
    groomParents: mergedData.groomParents || '',
    brideParents: mergedData.brideParents || '',
    venueName: mergedData.venueName || '',
    venueAddr: mergedData.venueAddress || '',
    mapUrl: mergedData.locationLink || '',
    closingNote: mergedData.closingNote || '',
    hashtag: mergedData.closingHashtag || '',
    closingFamilies: mergedData.closingFamilies || '',
    program: mergedData.program || [],
    notes: mergedData.notes || [],
    contactLabel: mergedData.contactLabel || 'للاستفسار والتأكيد',
    contactName: mergedData.contactName || '',
    contactPhone: mergedData.contactPhone || '',
    images: { 
      venue: mergedData.venueImage || `/${invitation.template.slug}/assets/venue.jpg`, 
      background: "" 
    }
  };

  const scriptInjection = `<script>window.__INVITE__ = { config: ${JSON.stringify(inviteConfig)} };</script>`;
  html = html.replace('<head>', `<head>${scriptInjection}`);

  // Replace family labels 
  const groomLabel = mergedData.groomParentsLabel || 'والدا العريس';
  const brideLabel = mergedData.brideParentsLabel || 'والدا العروس';
  html = html.replace(/>والدا العريس</g, `>${groomLabel}<`);
  html = html.replace(/>والدا العروس</g, `>${brideLabel}<`);

  // Replace Calendar Dates
  html = html.replace(/>تشرين الثاني 2026</g, `>${monthYear}<`);
  html = html.replace(/>الجمعة</g, `>${weekdayName}<`);
  html = html.replace(/>20</g, `>${dayNum}<`);
  html = html.replace(/<div class="cal-time">.*?<\/div>/, `<div class="cal-time">${timeStrCal}</div>`);

  // Replace Gallery Images
  const gallery = mergedData.galleryImages || [
    'https://da3wa.co/media/gallery/1.jpg',
    'https://da3wa.co/media/gallery/2.jpg',
    'https://da3wa.co/media/gallery/3.jpg',
    'https://da3wa.co/media/gallery/4.jpg'
  ];
  if (gallery && gallery.length > 0) {
    const galleryHtml = `<div class="mem-grid n${Math.min(gallery.length, 4)}">` + 
      gallery.map(img => `<figure class="mem-cell"><img src="${img}" loading="lazy" decoding="async" /></figure>`).join('') + 
      `</div>`;
    html = html.replace(/<div class="mem-grid[\s\S]*?<\/div>/, galleryHtml);
  }

  // Fix asset paths
  html = html.replace(/(href|src)="assets\//g, `$1="/${invitation.template.slug}/assets/`);
  html = html.replace(/(href|src)="styles\.css"/g, `$1="/${invitation.template.slug}/styles.css"`);
  html = html.replace(/(href|src)="app\.js"/g, `$1="/${invitation.template.slug}/app.js"`);
  html = html.replace(/(href|src)="script\.js"/g, `$1="/${invitation.template.slug}/script.js"`);
  
  // Inject CSS for disabled sections
  let css = '';
  if (!sections.gallery) css += '#da3wa-mem { display: none !important; }\n';
  if (!sections.timeline) css += '.program, #timeline { display: none !important; }\n';
  if (!sections.rsvp) css += '#da3wa-rsvp { display: none !important; }\n';
  if (!sections.calendar) css += '#da3wa-cal { display: none !important; }\n';

  // Hide demo CTA and watermark footer
  css += '#farha-democta, #da3wa-democta, #da3wa-credit { display: none !important; }\n';

  if (css) {
    html = html.replace('</head>', `<style>${css}</style></head>`);
  }

  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <iframe 
        srcDoc={html} 
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Invitation"
      ></iframe>
    </div>
  );
}
