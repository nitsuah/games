import React from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { GameCarousel } from '@/_components/home/GameCarousel';
import { AudioController } from '@/_components/home/AudioController';

const HomePage = () => {
    return (
        <>
            <AudioController />
            <ArcadeLayout>
                <p style={{ textAlign: 'center', margin: '0 12px 18px', fontSize: 15, lineHeight: 1.5 }}>
                    Nine free browser games. No sign-up, no coins. Pick a cabinet to play.
                </p>
                <GameCarousel />
                <p style={{ textAlign: 'center', margin: '18px 0 0', fontSize: 12 }}>
                    <a href="https://github.com/nitsuah/games" style={{ color: '#8be9ff', textDecoration: 'underline' }}>
                        Source on GitHub
                    </a>
                </p>
            </ArcadeLayout>
        </>
    );
};

export default HomePage;
