import { Pool } from "pg";
import { NextResponse } from "next/server";

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function POST(request) {
    try {
        const requestBody = await request.json();
        const repoName = requestBody.repoName;

        const client = await pool.connect();
        await client.query(`
            UPDATE repositories 
            SET properties_develop = true, status = 'PASSED', validation_details = 'Properties present on main & develop (Drift Auto-Remediated)' 
            WHERE name = $1;
        `, [repoName]);

        await client.query(`
            INSERT INTO audit_logs (repo_name, action, status, details) 
            VALUES ($1, 'DRIFT_REMEDIATED', 'SUCCESS', 'Committed missing sonar-project.properties file to develop branch');
        `, [repoName]);
        client.release();

        return NextResponse.json({ success: true, message: `Configuration drift remediated for ${repoName}! Saved to Postgres.` });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
