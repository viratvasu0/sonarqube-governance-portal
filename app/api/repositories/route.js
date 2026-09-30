import { Pool } from "pg";
import { NextResponse } from "next/server";

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function GET() {
    try {
        const client = await pool.connect();
        const reposRes = await client.query("SELECT * FROM repositories ORDER BY id DESC;");
        const logsRes = await client.query("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 15;");
        client.release();

        return NextResponse.json({ 
            success: true, 
            total: reposRes.rows.length, 
            repositories: reposRes.rows, 
            logs: logsRes.rows 
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { repoName, primaryBranch = "main" } = body;
        const projectKey = `wm-operations-sustainability_${repoName}`;

        if (!repoName) {
            return NextResponse.json({ success: false, error: "Repository name required" }, { status: 400 });
        }

        const client = await pool.connect();

        await client.query(`
            INSERT INTO repositories (name, status, properties_main, properties_develop, sonar_project_key, primary_branch, main_scanned, validation_details)
            VALUES ($1, 'PASSED', true, true, $2, $3, true, 'Onboarded & Saved persistently via DevSecOps Portal')
            ON CONFLICT (name) DO UPDATE 
            SET status = 'PASSED', properties_main = true, properties_develop = true, sonar_project_key = $2, updated_at = NOW();
        `, [repoName, projectKey, primaryBranch]);

        await client.query(`
            INSERT INTO audit_logs (repo_name, action, status, details)
            VALUES ($1, 'ONBOARD_REPOSITORY', 'SUCCESS', $2);
        `, [repoName, `Onboarded project key: ${projectKey}`]);

        client.release();

        return NextResponse.json({ 
            success: true, 
            message: `Repository '${repoName}' permanently saved to Prisma Postgres!`, 
            projectKey 
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
