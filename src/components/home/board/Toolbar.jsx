import React, { useState } from 'react';
import { BiNote, BiText, BiSun, BiMoon } from 'react-icons/bi';
import './Toolbar.scss';
import { useTheme } from '../../ThemeProvider';

export default function Toolbar({ onAddItem, scale, setScale, setOffset }) {
    const tools = [
        {
            id: 'note',
            icon: <BiNote size={20} />,
            label: 'Add Note',
            type: 'note'
        },
        {
            id: 'text',
            icon: <BiText size={20} />,
            label: 'Add Text',
            type: 'text'
        }
    ];

    const { theme, toggleTheme } = useTheme();

    return (
        <div className="board-toolbar">
            {tools.map(tool => (
                <button
                    key={tool.id}
                    className="toolbar-btn"
                    onClick={() => onAddItem(tool.type)}
                    title={tool.label}
                >
                    {tool.icon}
                    <span>{tool.label}</span>
                </button>
            ))}
            <button
                className="toolbar-btn theme-toggle"
                onClick={toggleTheme}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
                {theme === 'light' ? <BiMoon size={20} /> : <BiSun size={20} />}
            </button>
        </div>
    );
} 