'use client';

export default function EventDetails({ invitation }) {
  // Format date elegantly
  const dateObj = new Date(invitation.date);
  const formattedDate = dateObj.toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const formattedTime = dateObj.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <section className="inv-section">
      <h2 className="inv-title">تفاصيل الزفاف</h2>
      
      <div style={{ marginBottom: '2rem' }}>
        <p className="inv-subtitle">{formattedDate}</p>
        <p className="inv-subtitle">الساعة {formattedTime}</p>
        {invitation.venueName && (
          <p className="inv-subtitle" style={{ fontWeight: 'bold' }}>{invitation.venueName}</p>
        )}
        {invitation.venueAddress && (
          <p>{invitation.venueAddress}</p>
        )}
      </div>

      {invitation.venueLat && invitation.venueLng && (
        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '2px solid var(--inv-primary)' }}>
          <iframe 
            width="100%" 
            height="300" 
            frameBorder="0" 
            scrolling="no" 
            marginHeight="0" 
            marginWidth="0" 
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${invitation.venueLng - 0.01}%2C${invitation.venueLat - 0.01}%2C${invitation.venueLng + 0.01}%2C${invitation.venueLat + 0.01}&layer=mapnik&marker=${invitation.venueLat}%2C${invitation.venueLng}`}
          ></iframe>
        </div>
      )}
    </section>
  );
}
