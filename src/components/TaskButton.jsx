import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Check, X, Flame, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Sparkline from './Sparkline';
import './TaskButton.css';

const TaskButton = ({
    taskName,
    history = [0, 0, 0, 0, 0, 0, 0],
    color = 'var(--accent-violet)',
    status = 'pending',
    streak = 0,
    onComplete,
    onMiss,
    onEdit,
    onDelete,
    onUndo
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(taskName);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveEdit = () => {
        if (editValue.trim() && editValue !== taskName) {
            onEdit?.(editValue.trim());
        } else {
            setEditValue(taskName);
        }
        setIsEditing(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSaveEdit();
        if (e.key === 'Escape') {
            setEditValue(taskName);
            setIsEditing(false);
        }
    };
    const handleComplete = (e) => {
        e.stopPropagation();
        if (status !== 'pending') return;

        confetti({
            particleCount: 50,
            spread: 60,
            colors: ['#8B5CF6', '#06B6D4', '#22C55E'],
            origin: { y: 0.7 },
            disableForReducedMotion: true
        });

        if (onComplete) onComplete();
    };

    const handleMiss = (e) => {
        e.stopPropagation();
        if (status !== 'pending') return;
        if (onMiss) onMiss();
    };

    return (
        <div className="task-button-wrapper" style={{ zIndex: showMenu ? 50 : 1 }}>
            <div
                className={`task-button glass-panel ${status === 'done' ? 'completed shadow-glow' : ''} ${status === 'missed' ? 'missed-task' : ''}`}
                style={{ '--task-color': color }}
            >
                <div className="task-content">
                    <div className="task-info">
                        <span className="task-icon" style={{ backgroundColor: `rgba(245, 158, 11, 0.15)`, color: '#f59e0b' }}>
                            <Flame size={18} />
                            <span className="streak-count">{streak}</span>
                        </span>
                        {isEditing ? (
                            <input
                                type="text"
                                className="edit-task-input"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onBlur={handleSaveEdit}
                                onKeyDown={handleKeyDown}
                                autoFocus
                            />
                        ) : (
                            <span className={`task-name ${status !== 'pending' ? 'text-dim' : ''}`}>
                                {taskName}
                            </span>
                        )}
                    </div>

                    <div className="task-right-section">
                        {status === 'pending' && <Sparkline data={history} color={color} />}

                        <div className="task-actions" style={{ position: 'relative' }}>
                            {status === 'pending' ? (
                                <>
                                    <motion.button
                                        className="action-btn action-tick rounded-full"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleComplete}
                                    >
                                        <Check size={20} />
                                    </motion.button>
                                    <motion.button
                                        className="action-btn action-cross rounded-full"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={handleMiss}
                                    >
                                        <X size={20} />
                                    </motion.button>
                                </>
                            ) : (
                                <span className={`status-badge ${status === 'done' ? 'badge-done' : 'badge-missed'}`}>
                                    {status === 'done' ? 'Completed' : 'Missed'}
                                </span>
                            )}

                            <div className="context-menu-container" ref={menuRef} style={{ marginLeft: '0.5rem' }}>
                                <motion.button
                                    className="action-btn action-more rounded-full"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                                    style={{ color: 'var(--text-muted)' }}
                                >
                                    <MoreVertical size={20} />
                                </motion.button>

                                <AnimatePresence>
                                    {showMenu && (
                                        <motion.div
                                            className="context-menu-dropdown glass-panel"
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        >
                                            <button
                                                className="menu-item"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setIsEditing(true);
                                                    setShowMenu(false);
                                                }}
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            {status !== 'pending' && onUndo && (
                                                <button
                                                    className="menu-item"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onUndo();
                                                        setShowMenu(false);
                                                    }}
                                                >
                                                    <X size={14} /> Undo status
                                                </button>
                                            )}
                                            <button
                                                className="menu-item menu-item-danger"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (onDelete) onDelete();
                                                    setShowMenu(false);
                                                }}
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskButton;
