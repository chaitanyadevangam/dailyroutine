import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            let tasks = await sql`SELECT * FROM tasks ORDER BY created_at ASC`;

            // Daily Reset Logic
            const resetPromises = tasks.map(async (t) => {
                let currentHistory = JSON.parse(t.history || '[0,0,0,0,0,0,0]');

                if (t.last_reset !== todayStr) {
                    const wasDone = t.status === 'done';

                    // Shift history array (remove oldest day, push yesterday's result)
                    currentHistory.shift();
                    currentHistory.push(wasDone ? 10 : 0);

                    // Reset status to pending, reset streak if missed
                    const newStatus = 'pending';
                    const newStreak = wasDone ? t.streak : 0;

                    // Update task in DB
                    await sql`
                        UPDATE tasks 
                        SET status = ${newStatus}, streak = ${newStreak}, history = ${JSON.stringify(currentHistory)}, last_reset = ${todayStr} 
                        WHERE id = ${t.id}
                    `;

                    // Mutate the local object for the immediate response
                    t.status = newStatus;
                    t.streak = newStreak;
                    t.history = currentHistory;
                    t.last_reset = todayStr;
                } else {
                    t.history = currentHistory; // Just parse it
                }

                return t;
            });

            const formattedTasks = await Promise.all(resetPromises);

            return res.status(200).json(formattedTasks);
        } catch (error) {
            console.error('GET Error:', error);
            return res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { name, color } = req.body;
            const newTask = await sql`
                INSERT INTO tasks (name, color, status, streak, history, last_reset)
                VALUES (${name}, ${color || 'var(--accent-pink)'}, 'pending', 0, '[0,0,0,0,0,0,0]', ${new Date().toISOString().split('T')[0]})
                RETURNING *
            `;

            const task = newTask[0];
            task.history = JSON.parse(task.history);

            return res.status(201).json(task);
        } catch (error) {
            console.error('POST Error:', error);
            return res.status(500).json({ error: 'Failed to create task' });
        }
    }

    if (req.method === 'PUT') {
        try {
            const { id, name, status, streak } = req.body;

            let query;
            if (name !== undefined) {
                query = sql`UPDATE tasks SET name = ${name} WHERE id = ${id} RETURNING *`;
            } else if (status !== undefined && streak !== undefined) {
                query = sql`UPDATE tasks SET status = ${status}, streak = ${streak} WHERE id = ${id} RETURNING *`;
            } else {
                return res.status(400).json({ error: 'Invalid update payload' });
            }

            const updatedTask = await query;
            const task = updatedTask[0];
            if (task) task.history = JSON.parse(task.history);

            return res.status(200).json(task);
        } catch (error) {
            console.error('PUT Error:', error);
            return res.status(500).json({ error: 'Failed to update task' });
        }
    }

    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Task ID required' });

            await sql`DELETE FROM tasks WHERE id = ${id}`;
            return res.status(200).json({ message: 'Task deleted successfully' });
        } catch (error) {
            console.error('DELETE Error:', error);
            return res.status(500).json({ error: 'Failed to delete task' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
