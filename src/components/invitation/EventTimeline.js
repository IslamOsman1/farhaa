'use client';

export default function EventTimeline({ schedule }) {
  if (!schedule || schedule.length === 0) return null;

  return (
    <section className="inv-section">
      <h2 className="inv-title">برنامج الحفل</h2>
      <div className="timeline">
        {schedule.map((item, index) => {
          const timeObj = new Date(`1970-01-01T${item.time}`);
          const timeStr = timeObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={index} className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-time">{timeStr}</div>
              <div className="timeline-title" style={{ fontWeight: 'bold' }}>{item.title}</div>
              {item.description && (
                <div className="timeline-desc" style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>
                  {item.description}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
