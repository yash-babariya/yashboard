import React from 'react';
import { BiZoomIn, BiZoomOut } from 'react-icons/bi';
import { MdOutlineCenterFocusStrong } from 'react-icons/md';
import './ZoomControls.scss';

export default function ZoomControls({ scale, setScale, resetView }) {
    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 3));
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.1));

    return (
        <div className="zoom-controls">
            <button onClick={handleZoomOut} title="Zoom Out">
                <BiZoomOut />
            </button>
            <div className="zoom-level">{Math.round(scale * 100)}%</div>
            <button onClick={handleZoomIn} title="Zoom In">
                <BiZoomIn />
            </button>
            <button onClick={resetView} title="Reset View">
                <MdOutlineCenterFocusStrong />
            </button>
        </div>
    );
} 