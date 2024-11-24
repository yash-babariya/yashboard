import React from 'react';
import Board from './board';
import './home.scss';

export default function Home() {
    return (
        <div className="home-container">
            <div className="main-content">
                <Board />
            </div>
        </div>
    );
}
