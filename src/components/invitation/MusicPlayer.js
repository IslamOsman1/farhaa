'use client';

import { useState, useRef, useEffect } from 'react';

export default function MusicPlayer({ musicUrl }) {
  const [isPlaying, setIsPlaying] = useState(true); // Attempt auto-play when revealed
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Auto-play was blocked
        setIsPlaying(false);
      });
    }
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className={`music-player ${isPlaying ? 'playing' : ''}`} onClick={togglePlay}>
      <audio ref={audioRef} src={musicUrl} loop />
      <div className="sound-waves">
        <div className="sound-wave"></div>
        <div className="sound-wave"></div>
        <div className="sound-wave"></div>
      </div>
    </div>
  );
}
