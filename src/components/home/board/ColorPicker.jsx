import React from 'react';
import { HiColorSwatch } from 'react-icons/hi';
import './ColorPicker.scss';

const COLORS = [
    { bg: 'var(--note-yellow)', name: 'Yellow' },
    { bg: 'var(--note-pink)', name: 'Pink' },
    { bg: 'var(--note-mint)', name: 'Mint' },
    { bg: 'var(--note-blue)', name: 'Blue' },
    { bg: 'var(--note-brown)', name: 'Brown' },
    { bg: 'var(--note-purple)', name: 'Purple' },
    { bg: 'var(--note-green)', name: 'Green' },
    { bg: 'var(--note-orange)', name: 'Orange' }
];

export default function ColorPicker({ onColorChange }) {
    return (
        <div className="color-picker-dropdown">
            <button className="color-picker-trigger">
                <HiColorSwatch />
            </button>
            <div className="color-swatches">
                {COLORS.map(color => (
                    <button
                        key={color.name}
                        className="color-swatch"
                        style={{ backgroundColor: color.bg }}
                        onClick={() => onColorChange(color.bg)}
                        title={color.name}
                    />
                ))}
            </div>
        </div>
    );
} 