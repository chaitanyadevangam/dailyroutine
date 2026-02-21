import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function setup() {
    try {
        const sql = neon(process.env.DATABASE_URL);

        await sql`
            CREATE TABLE IF NOT EXISTS tasks (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'pending',
                streak INTEGER DEFAULT 0,
                color VARCHAR(50) DEFAULT 'var(--accent-cyan)',
                history TEXT DEFAULT '[0,0,0,0,0,0,0]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Table tasks created/verified successfully.');

        await sql`
            CREATE TABLE IF NOT EXISTS notes (
                id SERIAL PRIMARY KEY,
                date VARCHAR(20) UNIQUE NOT NULL,
                content TEXT DEFAULT '',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `;
        console.log('✅ Table notes created/verified successfully.');

        // Check if empty, and maybe seed it with the default tasks for a good start
        const count = await sql`SELECT COUNT(*) FROM tasks`;
        if (parseInt(count[0].count) === 0) {
            console.log('Seeding initial tasks...');
            const defaultTasks = [
                { name: 'Wake up 7:30 AM', color: 'var(--accent-cyan)' },
                { name: 'Ayurvedic water', color: 'var(--accent-cyan)' },
                { name: 'Sunlight', color: '#fcd34d' },
                { name: 'Bath and Devotion', color: 'var(--accent-violet)' },
                { name: 'Meditation', color: 'var(--accent-cyan)' },
                { name: 'Book for self improvement(Bagavadgita)', color: 'var(--accent-pink)' },
                { name: 'Muesli', color: 'var(--accent-cyan)' }
            ];
            for (let t of defaultTasks) {
                await sql`INSERT INTO tasks (name, color, status, streak, history) VALUES (${t.name}, ${t.color}, 'pending', 0, '[0,0,0,0,0,0,0]')`;
            }
            console.log('✅ Initial seed data inserted.');
        }

    } catch (error) {
        console.error('❌ DB Setup Error:', error);
    }
}

setup();
