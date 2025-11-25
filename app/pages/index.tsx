import React from 'react';
import { ArcadeLayout } from '@/_components/home/ArcadeLayout';
import { GameCarousel } from '@/_components/home/GameCarousel';
import { AudioController } from '@/_components/home/AudioController';

const HomePage = () => {
    return (
        <>
            <AudioController />
            <ArcadeLayout>
                <GameCarousel />
            </ArcadeLayout>
        </>
    );
};

export default HomePage;
