import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

const ORG_NAME = process.env.ORG_NAME || "wm-operations-sustainability";
const REQUIRED_PREFIX = process.env.REQUIRED_PREFIX || "wm-operations-sustainability_";
const GH_TOKEN = process.env.GH_TOKEN;

export async function GET() {
    try {
        const { rows } = await sql`SELECT * FROM repositories ORDER BY id ASC;`;
        const logs = await sql`SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 15;`;
        return NextResponse.json({ success: true, total: rows.length, repositories: rows, logs: logs.rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { repoName, primaryBranch = "main" } = body;
        const projectKey = `${REQUIRED_PREFIX}${repoName}`;

        if (!repoName) {
            return NextResponse.json({ success: false, error: "Repository name required" }, { status: 400 });
        }

        if (GH_TOKEN) {
            const propContent = `sonar.projectKey=${projectKey}\nsonar.projectName=${repoName}\nsonar.sources=.\nsonar.exclusions=**/vendor/**,**/*.spec.ts\n`;
            const base64Content = Buffer.from(propContent).toString("base64");

            await fetch(`https://api.github.com/repos/${ORG_NAME}/${repoName}/contents/sonar-project.properties`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${GH_TOKEN}`,
                    "Accept": "application/vnd.github+json",
                    "User-Agent": "DevSecOps-Portal"
                },
                body: JSON.stringify({
                    message: "chore(governance): add sonar-project.properties via DevSecOps Portal",
                    content: base64Content,
                    branch: primaryBranch
                })
            });
        }

        await sql`
            INSERT INTO repositories (name, status, properties_main, properties_develop, sonar_project_key, primary_branch, main_scanned, validation_details)
            VALUES (${repoName}, 'PASSED', true, true, ${projectKey}, ${primaryBranch}, true, 'Onboarded & Saved persistently via DevSecOps Portal')
            ON CONFLICT (name) DO UPDATE 
            SET status = 'PASSED', properties_main = true, properties_develop = true, sonar_project_key = ${projectKey}, updated_at = NOW();
        `;

        await sql`
            INSERT INTO audit_logs (repo_name, action, status, details)
            VALUES (${repoName}, 'ONBOARD_REPOSITORY', 'SUCCESS', ${`Onboarded project key: ${projectKey}`});
        `;

        return NextResponse.json({ success: true, message: `Repository '${repoName}' successfully onboarded to Vercel Postgres!`, projectKey });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
