'use client';

export default function WelcomeSection({ invitation }) {
  return (
    <section className="inv-section">
      <h1 className="inv-names" style={{ fontSize: '3rem', color: 'var(--inv-primary)', marginBottom: '1rem' }}>
        {invitation.coupleNames || 'فرحة العمر'}
      </h1>
      
      {invitation.story && (
        <div className="inv-story" style={{ lineHeight: '1.8', margin: '2rem 0' }}>
          <p>{invitation.story}</p>
        </div>
      )}

      {invitation.welcomeMessage && (
        <p className="inv-subtitle" style={{ fontStyle: 'italic' }}>
          "{invitation.welcomeMessage}"
        </p>
      )}
    </section>
  );
}
