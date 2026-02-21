import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function testReset() {
    try {
        const sql = neon(process.env.DATABASE_URL);

        // Let's set one task to 'done' and another to 'missed' to test the logic
        // Set all tasks so their last_reset is yesterday
        await sql`
            UPDATE tasks 
            SET last_reset = '2026-02-20', status = 'done', streak = 5 
            WHERE id = (SELECT id FROM tasks LIMIT 1)
        `;

        await sql`
            UPDATE tasks 
            SET last_reset = '2026-02-20', status = 'pending', streak = 3 
            WHERE id != (SELECT id FROM tasks LIMIT 1)
        `;

        console.log('✅ Force updated all tasks to simulate yesterday.');
    } catch (error) {
        console.error('❌ DB Update Error:', error);
    }
}

testReset();
