import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const MuteButton = styled.button<{ $muted: boolean }>`
  position: fixed;
  top: 20px;
  left: 20px;
  width: 50px;
  height: 50px;
  background: rgba(20, 0, 40, 0.9);
  border: 2px solid ${props => props.$muted ? '#888' : '#ffff00'};
  border-radius: 50%;
  color: ${props => props.$muted ? '#888' : '#ffff00'};
  font-size: 24px;
  cursor: pointer;
  z-index: 1000;
  box-shadow: 0 0 20px ${props => props.$muted ? 'rgba(136, 136, 136, 0.3)' : 'rgba(255, 255, 0, 0.6)'};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 30px ${props => props.$muted ? 'rgba(136, 136, 136, 0.5)' : 'rgba(255, 255, 0, 0.8)'};
  }

  &:active {
    transform: scale(0.95);
  }
`;

export const AudioController = () => {
    const [muted, setMuted] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio element with error handling
        // Note: Audio file path is hardcoded. File existence is verified during build.
        // If file is missing, error handler logs gracefully without breaking user experience.
        try {
            audioRef.current = new Audio('/sounds/arcade.mp3');
            audioRef.current.loop = true;
            audioRef.current.volume = 0.3;

            // Handle audio loading errors
            audioRef.current.addEventListener('error', (e) => {
                console.error('Failed to load audio file:', e);
            });
        } catch (error) {
            console.error('Failed to create Audio element:', error);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const toggleMute = () => {
        if (audioRef.current) {
            if (muted) {
                audioRef.current.play().catch(e => {
                    console.error(
                        `Audio playback failed: ${e?.name ? e.name + ': ' : ''}${e?.message ?? e}. This may be due to browser autoplay restrictions, unsupported audio format, or lack of user interaction.`
                    );
                });
            } else {
                audioRef.current.pause();
            }
            setMuted(!muted);
        }
    };

    return (
        <MuteButton onClick={toggleMute} $muted={muted} title={muted ? 'Unmute Music' : 'Mute Music'}>
            {muted ? '🔇' : '🔊'}
        </MuteButton>
    );
};
