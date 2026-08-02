'use client';

export default function OpeningScreen({ invitation, isOpened, onOpen }) {
  return (
    <div className={`opening-screen ${isOpened ? 'closed' : ''}`}>
      <div className="opening-content">
        <h1 className="opening-names">{invitation.coupleNames || 'فرحة العمر'}</h1>
        {invitation.welcomeMessage && (
          <p className="inv-subtitle">{invitation.welcomeMessage}</p>
        )}
        <button className="inv-btn" onClick={onOpen} style={{ marginTop: '2rem' }}>
          افتح الدعوة
        </button>
      </div>
    </div>
  );
}
