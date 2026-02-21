import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const sql = neon(process.env.DATABASE_URL);

        // Ensure table exists
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

        return res.status(200).json({ message: 'Table tasks ensured successfully.' });
    } catch (error) {
        console.error('DB Setup Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
