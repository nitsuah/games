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
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const getOrCreateAudio = () => {
        if (audioRef.current) {
            return audioRef.current;
        }

        // Lazy-create and lazy-fetch the audio asset only after explicit user intent.
        try {
            const audio = new Audio('/sounds/arcade.mp3');
            audio.loop = true;
            audio.volume = 0.3;
            audio.preload = 'none';
            audio.addEventListener('error', (e) => {
                console.error('Failed to load audio file:', e);
            });
            audioRef.current = audio;
            return audio;
        } catch (error) {
            console.error('Failed to create Audio element:', error);
            return null;
        }
    };

    const toggleMute = () => {
        const audio = getOrCreateAudio();
        if (!audio) {
            return;
        }

        if (muted) {
            audio.play().catch(e => {
                console.error(
                    `Audio playback failed: ${e?.name ? e.name + ': ' : ''}${e?.message ?? e}. This may be due to browser autoplay restrictions, unsupported audio format, or lack of user interaction.`
                );
            });
        } else {
            audio.pause();
        }

        setMuted(!muted);
    };

    return (
        <MuteButton onClick={toggleMute} $muted={muted} title={muted ? 'Unmute Music' : 'Mute Music'}>
            {muted ? '🔇' : '🔊'}
        </MuteButton>
    );
};
