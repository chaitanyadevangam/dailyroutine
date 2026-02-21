import React, { useState } from 'react';
import { BarChart, Calendar, MessageSquare, Clock } from 'lucide-react';
import BentoBox from './BentoBox';
import Sparkline from './Sparkline';
import './AnalyticsView.css';

const AnalyticsView = ({ tasks }) => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // YYYY-MM-DD
    const [viewMode, setViewMode] = useState('date'); // 'date', 'week', 'year'
    const [historicalNote, setHistoricalNote] = useState('');
    const [isLoadingNote, setIsLoadingNote] = useState(false);

    useEffect(() => {
        if (viewMode !== 'date' || !selectedDate) return;

        setIsLoadingNote(true);
        fetch(`/api/notes?date=${selectedDate}`)
            .then(res => res.json())
            .then(data => {
                setHistoricalNote(data?.content || '');
            })
            .catch(err => {
                console.error("Failed to load historical note", err);
                setHistoricalNote('');
            })
            .finally(() => setIsLoadingNote(false));
    }, [selectedDate, viewMode]);

    // Mock weekly data
    const weeklyData = [
        { week: 'Week 1', completion: 65 },
        { week: 'Week 2', completion: 82 },
        { week: 'Week 3', completion: 70 },
        { week: 'Week 4', completion: 90 },
    ];

    // Mock graph data matching the selected date
    const mockGraphData = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));

    // Calculate daily completion for boxes based on passed tasks array (assuming today for visual demo)
    const dailyBoxes = tasks.map(t => ({ id: t.id, name: t.name, done: t.status === 'done' }));

    const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const mockWeekCompletion = [100, 80, 50, 90, 0, 0, 0]; // arbitrary %

    const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const mockYearCompletion = [85, 90, 78, 92, 60, 55, 100, 80, 40, 20, 0, 0]; // arbitrary %

    return (
        <div className="analytics-container mt-8">
            <h2 className="text-gradient mb-4 flex-align-center" style={{ fontSize: '1.5rem', gap: '0.5rem' }}>
                <BarChart /> Performance Explorer
            </h2>

            {/* Date Explorer Browser */}
            <BentoBox glowColor="var(--accent-pink)" className="mb-4">
                <div className="explorer-header flex-between flex-wrap" style={{ gap: '1rem', marginBottom: '1rem' }}>
                    <div className="view-mode-toggles flex-align-center glass-panel" style={{ padding: '0.25rem', borderRadius: '8px', gap: '0.25rem' }}>
                        {['date', 'week', 'year'].map(mode => (
                            <button
                                key={mode}
                                className={`mode-btn ${viewMode === mode ? 'active' : ''}`}
                                onClick={() => setViewMode(mode)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: viewMode === mode ? 'rgba(255,255,255,0.1)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '6px',
                                    color: viewMode === mode ? '#fff' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>

                    <div className="date-selector flex-align-center glass-panel" style={{ padding: '0.5rem 1rem', borderRadius: '8px', gap: '0.5rem' }}>
                        <Calendar size={18} color="var(--accent-cyan)" />
                        {viewMode === 'date' && (
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="glass-select"
                                style={{ colorAdjust: 'exact', filter: 'invert(1) hue-rotate(180deg)' }}
                            />
                        )}
                        {viewMode === 'week' && (
                            <input
                                type="week"
                                value={`${selectedDate.substring(0, 4)}-W${Math.ceil(new Date(selectedDate).getDate() / 7)}`}
                                onChange={(e) => {
                                    // Handle simple week conversion back to date for mock display
                                    const year = e.target.value.substring(0, 4);
                                    setSelectedDate(`${year}-01-01`);
                                }}
                                className="glass-select"
                                style={{ filter: 'invert(1) hue-rotate(180deg)' }}
                            />
                        )}
                        {viewMode === 'year' && (
                            <select className="glass-select" value={selectedDate.substring(0, 4)} onChange={(e) => setSelectedDate(`${e.target.value}-01-01`)}>
                                {['2024', '2025', '2026', '2027'].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                {/* Graph specific to chosen date/period */}
                <div className="explorer-graph">
                    <h3 className="bento-title mb-2 flex-align-center" style={{ gap: '0.5rem', fontSize: '0.9rem' }}>
                        <Clock size={16} color="var(--accent-pink)" />
                        Activity Graph for {viewMode === 'date' ? selectedDate : viewMode === 'week' ? 'Selected Week' : selectedDate.substring(0, 4)}
                    </h3>
                    <div className="timeline-container" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', minHeight: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                        {viewMode === 'date' && (
                            <div className="premium-day-view flex-align-center" style={{ gap: '2rem', width: '100%', justifyContent: 'space-around' }}>
                                <div className="day-chart-container" style={{ position: 'relative', width: '120px', height: '120px' }}>
                                    <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="url(#gradient)" strokeWidth="8"
                                            strokeDasharray={`${2 * Math.PI * 45}`}
                                            strokeDashoffset={`${2 * Math.PI * 45 * (1 - (dailyBoxes.filter(b => b.done).length / (dailyBoxes.length || 1)))}`}
                                            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                <stop offset="0%" stopColor="#8B5CF6" />
                                                <stop offset="100%" stopColor="#06B6D4" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <div className="absolute-center flex-center-col" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                                        <span className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                                            {Math.round((dailyBoxes.filter(b => b.done).length / (dailyBoxes.length || 1)) * 100)}%
                                        </span>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Done</span>
                                    </div>
                                </div>
                                <div className="day-stats flex-col" style={{ gap: '0.5rem', flex: 1 }}>
                                    <div className="stat-pill glass-panel flex-between" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                        <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>Completed</span>
                                        <span style={{ color: '#22c55e', fontWeight: 'bold' }}>{dailyBoxes.filter(b => b.done).length}</span>
                                    </div>
                                    <div className="stat-pill glass-panel flex-between" style={{ padding: '0.5rem 1rem', borderRadius: '8px' }}>
                                        <span style={{ color: 'var(--text-color)', fontSize: '0.9rem' }}>Pending</span>
                                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>{dailyBoxes.filter(b => !b.done).length}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {viewMode === 'week' && (
                            <div className="premium-week-view" style={{ display: 'flex', gap: '1rem', height: '120px', alignItems: 'flex-end', width: '100%', justifyContent: 'space-between', padding: '0 1rem' }}>
                                {mockWeekCompletion.map((completion, idx) => (
                                    <div key={idx} className="week-bar-group flex-col" style={{ alignItems: 'center', gap: '0.5rem', flex: 1 }}>
                                        <div className="bar-bg" style={{ width: '100%', maxWidth: '30px', height: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                                            <div className="bar-fill" style={{
                                                position: 'absolute', bottom: 0, left: 0, width: '100%',
                                                height: `${completion}%`,
                                                background: 'linear-gradient(0deg, var(--accent-cyan), var(--accent-violet))',
                                                transition: 'height 1s ease-out',
                                                borderRadius: '6px'
                                            }} />
                                        </div>
                                        <span style={{ fontSize: '0.8rem', color: completion > 0 ? 'var(--text-color)' : 'var(--text-muted)', fontWeight: completion > 0 ? 'bold' : 'normal' }}>
                                            {weekLabels[idx]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {viewMode === 'year' && (
                            <div className="premium-year-view" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', width: '100%' }}>
                                {mockYearCompletion.map((completion, idx) => (
                                    <div key={idx} className="month-card glass-panel flex-col" style={{ padding: '0.5rem', borderRadius: '8px', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div className="flex-between">
                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: completion > 0 ? 'var(--text-color)' : 'var(--text-muted)' }}>{monthLabels[idx]}</span>
                                            <span style={{ fontSize: '0.7rem', color: 'var(--accent-pink)' }}>{completion}%</span>
                                        </div>
                                        <div className="mini-progress-bg" style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${completion}%`, background: 'var(--accent-pink)', transition: 'width 1s' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </BentoBox>

            <div className="grid-bento">
                {/* Task Wise Analytics */}
                <BentoBox glowColor="var(--accent-cyan)" className="bento-span-2">
                    <h3 className="bento-title mb-4">Task Consistency</h3>
                    <div className="task-analytics-list">
                        {tasks.map(task => {
                            // Calculate real consistency based on history array
                            const historyData = Array.isArray(task.history) ? task.history : [0, 0, 0, 0, 0, 0, 0];
                            const completedDays = historyData.filter(d => d > 0).length;
                            // Add current day status to calculation
                            const totalHits = completedDays + (task.status === 'done' ? 1 : 0);
                            const consistencyScore = Math.round((totalHits / 8) * 100);

                            return (
                                <div key={task.id} className="task-analytic-row">
                                    <span className="task-analytic-name">{task.name}</span>
                                    <div className="task-analytic-chart">
                                        <Sparkline data={[...historyData, task.status === 'done' ? 10 : 0]} color={task.color || 'var(--accent-cyan)'} />
                                    </div>
                                    <span className="task-analytic-score">{consistencyScore}%</span>
                                </div>
                            );
                        })}
                    </div>
                </BentoBox>

                {/* Weekly Analytics & Comments */}
                <div className="flex-col" style={{ gap: '1rem', gridColumn: 'span 1' }}>
                    <BentoBox glowColor="var(--accent-pink)">
                        <h3 className="bento-title mb-4">Weekly Overview</h3>
                        <div className="weekly-bars">
                            {weeklyData.map(data => (
                                <div key={data.week} className="weekly-bar-row">
                                    <span className="week-label">{data.week}</span>
                                    <div className="bar-track">
                                        <div
                                            className="bar-fill"
                                            style={{
                                                width: `${data.completion}%`,
                                                background: `linear-gradient(90deg, var(--accent-violet), var(--accent-pink))`
                                            }}
                                        />
                                    </div>
                                    <span className="week-percent">{data.completion}%</span>
                                </div>
                            ))}
                        </div>
                    </BentoBox>

                    <BentoBox glowColor="var(--accent-yellow)">
                        <h3 className="bento-title mb-2 flex-align-center" style={{ gap: '0.5rem' }}>
                            <MessageSquare size={16} /> Reflections for {selectedDate}
                        </h3>
                        {isLoadingNote ? (
                            <div style={{ color: 'var(--text-muted)', padding: '1rem', fontStyle: 'italic', textAlign: 'center' }}>Loading note...</div>
                        ) : historicalNote ? (
                            <div className="glass-panel text-dim" style={{
                                width: '100%',
                                minHeight: '100px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px',
                                padding: '1rem',
                                color: 'var(--text-color)',
                                whiteSpace: 'pre-wrap'
                            }}>
                                {historicalNote}
                            </div>
                        ) : (
                            <div style={{ color: 'var(--text-muted)', padding: '1rem', fontStyle: 'italic', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
                                No notes saved for this date.
                            </div>
                        )}
                    </BentoBox>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsView;
