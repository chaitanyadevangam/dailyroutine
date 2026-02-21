import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
    const sql = neon(process.env.DATABASE_URL);

    if (req.method === 'GET') {
        try {
            const { date } = req.query;
            if (!date) return res.status(400).json({ error: 'Date is required' });

            const records = await sql`SELECT * FROM notes WHERE date = ${date}`;
            return res.status(200).json(records.length ? records[0] : { date, content: '' });
        } catch (error) {
            console.error('Notes GET Error:', error);
            return res.status(500).json({ error: 'Failed to fetch notes' });
        }
    }

    if (req.method === 'POST') {
        try {
            const { date, content } = req.body;
            if (!date) return res.status(400).json({ error: 'Date is required' });

            const updatedNote = await sql`
                INSERT INTO notes (date, content)
                VALUES (${date}, ${content})
                ON CONFLICT (date)
                DO UPDATE SET content = EXCLUDED.content, created_at = CURRENT_TIMESTAMP
                RETURNING *
            `;

            return res.status(200).json(updatedNote[0]);
        } catch (error) {
            console.error('Notes POST Error:', error);
            return res.status(500).json({ error: 'Failed to sync notes' });
        }
    }

    res.status(405).json({ error: 'Method not allowed' });
}
