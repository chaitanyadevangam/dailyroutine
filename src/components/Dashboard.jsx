import React, { useState, useEffect } from 'react';
import BentoBox from './BentoBox';
import CircularProgress from './CircularProgress';
import TaskButton from './TaskButton';
import AnalyticsView from './AnalyticsView';
import './Dashboard.css';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Fetch tasks on load
        fetch('/api/tasks')
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTasks(data);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Failed to load tasks", err);
                setIsLoading(false);
            });
    }, []);

    const updateTaskInDb = async (id, payload) => {
        try {
            const res = await fetch('/api/tasks', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, ...payload })
            });
            if (!res.ok) throw new Error('Failed to update task');
            return await res.json();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCompleteTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task || task.status !== 'pending') return;

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done', streak: t.streak + 1 } : t));
        await updateTaskInDb(id, { status: 'done', streak: task.streak + 1 });
    };

    const handleMissTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task || task.status !== 'pending') return;

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'missed', streak: 0 } : t));
        await updateTaskInDb(id, { status: 'missed', streak: 0 });
    };

    const handleDeleteTask = async (id) => {
        setTasks(prev => prev.filter(t => t.id !== id));
        fetch(`/api/tasks?id=${id}`, { method: 'DELETE' }).catch(console.error);
    };

    const handleEditTask = async (id, newName) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, name: newName } : t));
        await updateTaskInDb(id, { name: newName });
    };

    const handleUndoTask = async (id) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const streakOffset = task.status === 'done' ? -1 : 0;
        const newStreak = Math.max(0, task.streak + streakOffset);

        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'pending', streak: newStreak } : t));
        await updateTaskInDb(id, { status: 'pending', streak: newStreak });
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskName.trim()) return;

        const name = newTaskName;
        setNewTaskName('');

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color: 'var(--accent-pink)' })
            });
            if (res.ok) {
                const createdTask = await res.json();
                setTasks(prev => [...prev, createdTask]);
            }
        } catch (err) {
            console.error("Failed to create task", err);
        }
    };

    const completedCount = tasks.filter(t => t.status === 'done').length;
    const totalCount = tasks.length;
    const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

    // Calculate top streak for the side bento box
    const topStreak = tasks.length ? Math.max(...tasks.map(t => t.streak), 0) : 0;
    const topStreakTask = tasks.find(t => t.streak === topStreak)?.name || 'Any Routine';

    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const halfwayIndex = Math.ceil(tasks.length / 2);
    const firstHalfTasks = tasks.slice(0, halfwayIndex);
    const secondHalfTasks = tasks.slice(halfwayIndex);

    return (
        <div className="dashboard-container">
            <header className="dashboard-header flex-between">
                <div className="header-left">
                    <h1 className="text-gradient" style={{ fontSize: '2rem', lineHeight: '1.2' }}>Welcome Chaitanya!... Try to be better than yesterday!</h1>
                    <p className="subtitle" style={{ fontSize: '1.2rem', marginTop: '0.5rem', color: 'rgba(255,255,255,0.8)' }}>what have you done today ?</p>
                </div>
                <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="streak-badge glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px' }}>
                        <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center' }}>🔥</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#f59e0b' }}>Top Streak: {topStreak}</span>
                    </div>
                    <div className="dynamic-date glass-panel" style={{ display: 'inline-block', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', color: 'var(--accent-cyan)', fontWeight: '500', letterSpacing: '0.05em' }}>
                        {currentDate}
                    </div>
                </div>
            </header>

            {/* Horizontal Daily Completion Bar */}
            <BentoBox glowColor="var(--accent-cyan)" className="bento-span-3" style={{ padding: '1.5rem' }}>
                <div className="flex-between" style={{ marginBottom: '1rem' }}>
                    <h2 className="bento-title" style={{ margin: 0 }}>Daily Completion Status</h2>
                    <span className="bento-desc">{completedCount} of {totalCount} routines done ({completionRate}%)</span>
                </div>
                <div style={{ width: '100%', height: '16px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                    <div
                        style={{
                            height: '100%',
                            width: `${completionRate}%`,
                            background: 'linear-gradient(90deg, var(--accent-cyan), var(--accent-violet))',
                            transition: 'width 1s ease-out',
                            borderRadius: '8px'
                        }}
                    />
                </div>
            </BentoBox>

            <div className="grid-bento" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {/* First Half of Tasks */}
                <BentoBox glowColor="var(--accent-violet)" className="bento-span-1">
                    <div className="flex-between" style={{ marginBottom: '1rem' }}>
                        <h2 className="bento-title">what can you do today?</h2>
                    </div>

                    <form className="add-task-form flex-between glass-panel" onSubmit={handleAddTask} style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '8px', display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            value={newTaskName}
                            onChange={e => setNewTaskName(e.target.value)}
                            placeholder="Add a new task..."
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', flex: 1, outline: 'none', padding: '0.5rem', fontSize: '1rem' }}
                        />
                        <button type="submit" className="glass-panel hover-grow" style={{ padding: '0.5rem 1rem', background: 'var(--accent-pink)', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                            Add
                        </button>
                    </form>

                    <div className="task-list">
                        {firstHalfTasks.map(task => (
                            <TaskButton
                                key={task.id}
                                taskName={task.name}
                                history={task.history}
                                color={task.color}
                                status={task.status}
                                streak={task.streak}
                                onComplete={() => handleCompleteTask(task.id)}
                                onMiss={() => handleMissTask(task.id)}
                                onDelete={() => handleDeleteTask(task.id)}
                                onEdit={(newName) => handleEditTask(task.id, newName)}
                                onUndo={() => handleUndoTask(task.id)}
                            />
                        ))}
                    </div>
                </BentoBox>

                {/* Second Half of Tasks */}
                <BentoBox glowColor="var(--accent-cyan)" className="bento-span-1">
                    <div className="flex-between" style={{ marginBottom: '1rem', display: 'none' }}>
                        {/* Hidden Title to align top padding evenly, or just removed */}
                    </div>

                    <div className="task-list mt-8">
                        {secondHalfTasks.map(task => (
                            <TaskButton
                                key={task.id}
                                taskName={task.name}
                                history={task.history}
                                color={task.color}
                                status={task.status}
                                streak={task.streak}
                                onComplete={() => handleCompleteTask(task.id)}
                                onMiss={() => handleMissTask(task.id)}
                                onDelete={() => handleDeleteTask(task.id)}
                                onEdit={(newName) => handleEditTask(task.id, newName)}
                                onUndo={() => handleUndoTask(task.id)}
                            />
                        ))}
                    </div>
                </BentoBox>
            </div>

            <AnalyticsView tasks={tasks} />
        </div>
    );
};

export default Dashboard;
