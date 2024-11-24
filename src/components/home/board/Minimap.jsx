import React from 'react';
import './Minimap.scss';

export default function Minimap({ items, scale, offset }) {
    const mapScale = 0.05;  // Scale of the minimap

    return (
        <div className="minimap">
            <div
                className="minimap-content"
                style={{
                    transform: `scale(${mapScale}) translate(${-offset.x}px, ${-offset.y}px)`
                }}
            >
                {items.map(item => (
                    <div
                        key={item.id}
                        className="minimap-item"
                        style={{
                            left: item.position.x + 'px',
                            top: item.position.y + 'px',
                            width: item.width + 'px',
                            height: item.height + 'px'
                        }}
                    />
                ))}
            </div>
            <div
                className="viewport-indicator"
                style={{
                    width: (window.innerWidth * mapScale) + 'px',
                    height: (window.innerHeight * mapScale) + 'px',
                    transform: `translate(${offset.x * mapScale}px, ${offset.y * mapScale}px)`
                }}
            />
        </div>
    );
} 