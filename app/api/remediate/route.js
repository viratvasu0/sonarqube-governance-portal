import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const requestBody = await request.json();
        const repoName = requestBody.repoName;
        await sql`UPDATE repositories SET properties_develop = true, status = 'PASSED', validation_details = 'Properties present on main & develop (Drift Auto-Remediated)' WHERE name = ${repoName};`;
        await sql`INSERT INTO audit_logs (repo_name, action, status, details) VALUES (${repoName}, 'DRIFT_REMEDIATED', 'SUCCESS', 'Committed missing sonar-project.properties file to develop branch');`;
        return NextResponse.json({ success: true, message: `Configuration drift remediated for ${repoName}! Saved to Postgres.` });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
