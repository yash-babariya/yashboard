import React, { useState, useRef, useEffect, useMemo } from 'react';
import './board.scss';
import { MdDragIndicator, MdDelete } from 'react-icons/md';
import { FiEdit2 } from 'react-icons/fi';
import Toolbar from './Toolbar';
import ZoomControls from './ZoomControls';
import ColorPicker from './ColorPicker';

const ITEM_TYPES = {
    NOTE: 'note',
    TEXT: 'text'
};

export default function Board() {
    const [items, setItems] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const [activeItem, setActiveItem] = useState(null);
    const boardRef = useRef(null);
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });
    const [resizeItem, setResizeItem] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState({ x: 0, y: 0 });
    const [selectionEnd, setSelectionEnd] = useState({ x: 0, y: 0 });
    const [selectedItems, setSelectedItems] = useState([]);
    const [bgOffset, setBgOffset] = useState({ x: 0, y: 0 });

    const handleDragStart = (e, itemId) => {
        if (e.target.classList.contains('item-textarea') ||
            e.target.closest('.item-actions') ||
            e.target.closest('.resize-handle')) return;

        setIsDragging(true);
        setActiveItem(itemId);

        const rect = e.currentTarget.getBoundingClientRect();
        const boardRect = boardRef.current.getBoundingClientRect();

        setDragPosition({
            x: (e.clientX - rect.left) / scale,
            y: (e.clientY - rect.top) / scale
        });

        e.currentTarget.classList.add('dragging');
        e.preventDefault();
    };

    const handleMouseMove = (e) => {
        if (isDragging && activeItem) {
            const boardRect = boardRef.current.getBoundingClientRect();
            const x = ((e.clientX - boardRect.left) / scale) - dragPosition.x;
            const y = ((e.clientY - boardRect.top) / scale) - dragPosition.y;

            requestAnimationFrame(() => {
                setItems(prevItems => prevItems.map(item =>
                    item.id === activeItem
                        ? {
                            ...item,
                            position: {
                                x: snapToGrid(Math.round(x)),
                                y: snapToGrid(Math.round(y))
                            }
                        }
                        : item
                ));
            });
        }
    };

    const handleDragEnd = () => {
        if (activeItem) {
            const element = document.querySelector(`.board-item[data-id="${activeItem}"]`);
            if (element) {
                element.classList.remove('dragging');
            }
        }
        setIsDragging(false);
        setActiveItem(null);
    };

    const handleWheel = (e) => {
        if (e.ctrlKey) {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            const mouseX = (e.clientX - offset.x) / scale;
            const mouseY = (e.clientY - offset.y) / scale;

            const newScale = Math.min(Math.max(0.1, scale + delta), 3);

            setScale(newScale);
            setOffset(prev => ({
                x: e.clientX - mouseX * newScale,
                y: e.clientY - mouseY * newScale
            }));
        }
    };

    const handleAddItem = (type) => {
        const boardRect = boardRef.current.getBoundingClientRect();
        const centerX = ((boardRect.width / 2) - offset.x) / scale;
        const centerY = ((boardRect.height / 2) - offset.y) / scale;

        const newItem = {
            id: Date.now(),
            type,
            position: { x: centerX, y: centerY },
            content: '',
            width: type === ITEM_TYPES.NOTE ? 200 : 300,
            height: type === ITEM_TYPES.NOTE ? 150 : 100,
            color: type === ITEM_TYPES.NOTE ? 'var(--note-yellow)' : 'var(--bg-primary)'
        };
        setItems(prevItems => [...prevItems, newItem]);
    };

    const handleDeleteItem = (itemId) => {
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };

    const handlePanStart = (e) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            e.preventDefault();
            setIsPanning(true);
            setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
        }
    };

    const checkBoundaries = (newOffset) => {
        const minX = -10000;
        const minY = -10000;
        const maxX = 10000;
        const maxY = 10000;

        return {
            x: Math.min(Math.max(newOffset.x, minX), maxX),
            y: Math.min(Math.max(newOffset.y, minY), maxY)
        };
    };

    const handlePanMove = (e) => {
        if (isPanning) {
            const newOffset = checkBoundaries({
                x: e.clientX - panStart.x,
                y: e.clientY - panStart.y
            });

            requestAnimationFrame(() => {
                setOffset(newOffset);
                setBgOffset({
                    x: -((newOffset.x % 100) / scale),
                    y: -((newOffset.y % 100) / scale)
                });
            });
        }
    };

    const handlePanEnd = () => {
        setIsPanning(false);
    };

    const handleContentChange = (itemId, newContent) => {
        setItems(prevItems => prevItems.map(item =>
            item.id === itemId
                ? { ...item, content: newContent }
                : item
        ));
    };

    const handleResizeStart = (e, itemId) => {
        e.stopPropagation();
        setIsResizing(true);
        setResizeItem(itemId);
        setResizeStart({ x: e.clientX, y: e.clientY });
    };

    const handleResizeMove = (e) => {
        if (isResizing && resizeItem) {
            const deltaX = (e.clientX - resizeStart.x) / scale;
            const deltaY = (e.clientY - resizeStart.y) / scale;

            requestAnimationFrame(() => {
                setItems(prevItems => prevItems.map(item =>
                    item.id === resizeItem
                        ? {
                            ...item,
                            width: Math.max(200, item.width + deltaX),
                            height: Math.max(100, item.height + deltaY)
                        }
                        : item
                ));
            });

            setResizeStart({ x: e.clientX, y: e.clientY });
        }
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
        setResizeItem(null);
    };

    const renderItemContent = (item) => {
        switch (item.type) {
            case ITEM_TYPES.NOTE:
            case ITEM_TYPES.TEXT:
                return (
                    <textarea
                        className="item-textarea"
                        value={item.content}
                        onChange={(e) => handleContentChange(item.id, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Type something..."
                    />
                );
            default:
                return null;
        }
    };

    const renderItems = () => {
        return items.map((item) => (
            <div
                key={item.id}
                data-id={item.id}
                className={`board-item board-item-${item.type} ${activeItem === item.id ? 'dragging' : ''}`}
                style={{
                    transform: `translate3d(${item.position.x}px, ${item.position.y}px, 0)`,
                    width: item.width + 'px',
                    height: item.height + 'px',
                    cursor: isDragging && activeItem === item.id ? 'grabbing' : 'grab'
                }}
                onMouseDown={(e) => handleDragStart(e, item.id)}
            >
                <div className="item-drag-handle">
                    <MdDragIndicator />
                </div>
                <div className="item-content">
                    {renderItemContent(item)}
                </div>
                <div className="item-actions">
                    <button className="edit-btn">
                        <FiEdit2 />
                    </button>
                    <button
                        className="delete-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteItem(item.id);
                        }}
                    >
                        <MdDelete />
                    </button>
                </div>
                <div
                    className="resize-handle"
                    onMouseDown={(e) => handleResizeStart(e, item.id)}
                />
            </div>
        ));
    };

    const handleColorChange = (itemId, newColor) => {
        setItems(prevItems => prevItems.map(item =>
            item.id === itemId
                ? { ...item, color: newColor }
                : item
        ));
    };

    const memoizedItems = useMemo(() => items.map(item => (
        <div
            key={item.id}
            className={`board-item board-item-${item.type} ${selectedItems.includes(item) ? 'selected' : ''}`}
            style={{
                transform: `translate(${item.position.x}px, ${item.position.y}px)`,
                width: item.width + 'px',
                height: item.height + 'px',
                backgroundColor: item.color
            }}
            onMouseDown={(e) => handleDragStart(e, item.id)}
        >
            <div className="item-drag-handle">
                <MdDragIndicator size={20} />
            </div>
            <div className="item-actions">
                <ColorPicker onColorChange={(color) => handleColorChange(item.id, color)} />
                <button className="delete-btn" onClick={() => handleDeleteItem(item.id)}>
                    <MdDelete size={20} />
                </button>
            </div>
            <div className="item-content">
                <textarea
                    className="item-textarea"
                    value={item.content}
                    onChange={(e) => handleContentChange(item.id, e.target.value)}
                    placeholder="Type something..."
                />
            </div>
            <div
                className="resize-handle"
                onMouseDown={(e) => handleResizeStart(e, item.id)}
            />
        </div>
    )), [items, selectedItems, handleColorChange]);

    useEffect(() => {
        const handleKeyboard = (e) => {
            if (e.ctrlKey && e.key === '=') {
                e.preventDefault();
                setScale(prev => Math.min(prev + 0.1, 3));
            }
            if (e.ctrlKey && e.key === '-') {
                e.preventDefault();
                setScale(prev => Math.max(prev - 0.1, 0.1));
            }
            if (e.ctrlKey && e.key === '0') {
                e.preventDefault();
                setScale(1);
                setOffset({ x: 0, y: 0 });
            }
        };

        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, []);

    const handleMouseMoveEvent = (e) => {
        if (isPanning) {
            handlePanMove(e);
        } else if (isDragging) {
            handleMouseMove(e);
        } else if (isResizing) {
            handleResizeMove(e);
        } else if (isSelecting) {
            handleSelectionMove(e);
        }
    };

    const handleMouseDownEvent = (e) => {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            handlePanStart(e);
        } else if (e.button === 0 && !e.target.closest('.board-item')) {
            handleSelectionStart(e);
        }
    };

    useEffect(() => {
        const handleMouseUpOutside = () => {
            if (isPanning) {
                handlePanEnd();
            }
            if (isDragging) {
                handleDragEnd();
            }
        };

        window.addEventListener('mouseup', handleMouseUpOutside);
        return () => window.removeEventListener('mouseup', handleMouseUpOutside);
    }, [isPanning, isDragging]);

    const snapToGrid = (value, gridSize = 20) => {
        return Math.round(value / gridSize) * gridSize;
    };

    const handleSelectionStart = (e) => {
        if (e.button === 0 && !e.target.closest('.board-item')) {
            const boardRect = boardRef.current.getBoundingClientRect();
            const x = (e.clientX - boardRect.left) / scale;
            const y = (e.clientY - boardRect.top) / scale;

            setIsSelecting(true);
            setSelectionStart({ x, y });
            setSelectionEnd({ x, y });
        }
    };

    const handleSelectionMove = (e) => {
        if (isSelecting) {
            const boardRect = boardRef.current.getBoundingClientRect();
            const x = (e.clientX - boardRect.left) / scale;
            const y = (e.clientY - boardRect.top) / scale;

            setSelectionEnd({ x, y });

            // Calculate selected items
            const selectionRect = {
                left: Math.min(selectionStart.x, x),
                right: Math.max(selectionStart.x, x),
                top: Math.min(selectionStart.y, y),
                bottom: Math.max(selectionStart.y, y)
            };

            const selected = items.filter(item => {
                return item.position.x >= selectionRect.left &&
                    item.position.x <= selectionRect.right &&
                    item.position.y >= selectionRect.top &&
                    item.position.y <= selectionRect.bottom;
            });

            setSelectedItems(selected);
        }
    };

    const handleSelectionEnd = () => {
        if (isSelecting) {
            setIsSelecting(false);

            // Only update selection if actually dragged
            if (selectionStart.x !== selectionEnd.x || selectionStart.y !== selectionEnd.y) {
                // Keep selected items
            } else {
                setSelectedItems([]);
            }
        }
    };

    const handleMouseUpEvent = (e) => {
        if (isPanning) {
            handlePanEnd(e);
        } else if (isDragging) {
            handleDragEnd(e);
        } else if (isResizing) {
            handleResizeEnd(e);
        } else if (isSelecting) {
            handleSelectionEnd(e);
        }
    };

    const resetView = () => {
        setScale(1);
        setOffset({ x: 0, y: 0 });
    };

    return (
        <div className="board-container">
            <Toolbar
                onAddItem={handleAddItem}
                scale={scale}
                setScale={setScale}
                setOffset={setOffset}
            />
            <div
                ref={boardRef}
                className="board-canvas"
                onMouseMove={handleMouseMoveEvent}
                onMouseUp={handleMouseUpEvent}
                onWheel={handleWheel}
                onMouseDown={handlePanStart}
            >
                <div
                    className="board-content"
                    style={{
                        transform: `scale(${scale}) translate(${offset.x}px, ${offset.y}px)`,
                        '--bg-offset-x': `${bgOffset.x}px`,
                        '--bg-offset-y': `${bgOffset.y}px`
                    }}
                >
                    {memoizedItems}
                    {isSelecting && (
                        <div
                            className="selection-rectangle"
                            style={{
                                left: Math.min(selectionStart.x, selectionEnd.x) + 'px',
                                top: Math.min(selectionStart.y, selectionEnd.y) + 'px',
                                width: Math.abs(selectionEnd.x - selectionStart.x) + 'px',
                                height: Math.abs(selectionEnd.y - selectionStart.y) + 'px'
                            }}
                        />
                    )}
                </div>
            </div>
            <ZoomControls
                scale={scale}
                setScale={setScale}
                resetView={resetView}
            />
        </div>
    );
}
