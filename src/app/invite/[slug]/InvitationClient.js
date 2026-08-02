'use client';

import { useState, useEffect } from 'react';
import OpeningScreen from '@/components/invitation/OpeningScreen';
import MusicPlayer from '@/components/invitation/MusicPlayer';
import Countdown from '@/components/invitation/Countdown';
import EventDetails from '@/components/invitation/EventDetails';
import EventTimeline from '@/components/invitation/EventTimeline';
import Gallery from '@/components/invitation/Gallery';
import RSVPForm from '@/components/invitation/RSVPForm';
import AddToCalendar from '@/components/invitation/AddToCalendar';
import ShareSection from '@/components/invitation/ShareSection';
import WelcomeSection from '@/components/invitation/WelcomeSection';

export default function InvitationClient({ invitation }) {
  const [isOpened, setIsOpened] = useState(false);

  useEffect(() => {
    // Track visit when opened
    if (isOpened) {
      fetch(`/api/invitations/${invitation.id}/visits`, { method: 'POST' }).catch(console.error);
    }
  }, [isOpened, invitation.id]);

  const sections = invitation.sections || {};

  return (
    <>
      <OpeningScreen 
        invitation={invitation} 
        isOpened={isOpened} 
        onOpen={() => setIsOpened(true)} 
      />

      {isOpened && (
        <div style={{ animation: 'slideUpFade 1s ease forwards' }}>
          {invitation.musicUrl && <MusicPlayer musicUrl={invitation.musicUrl} />}
          
          {sections.welcome !== false && (
            <WelcomeSection invitation={invitation} />
          )}

          {sections.countdown !== false && invitation.date && (
            <Countdown targetDate={invitation.date} />
          )}

          {sections.details !== false && (
            <EventDetails invitation={invitation} />
          )}

          {sections.schedule !== false && invitation.schedule?.length > 0 && (
            <EventTimeline schedule={invitation.schedule} />
          )}

          {sections.gallery !== false && invitation.gallery?.length > 0 && (
            <Gallery images={invitation.gallery} />
          )}

          <div className="inv-section" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <AddToCalendar invitation={invitation} />
          </div>

          {sections.rsvp !== false && (
            <RSVPForm invitationId={invitation.id} />
          )}

          <ShareSection invitation={invitation} />
        </div>
      )}
    </>
  );
}
