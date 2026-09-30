import { Pool } from "pg";
import { NextResponse } from "next/server";

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function GET() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT * FROM users ORDER BY id ASC;");
        client.release();
        return NextResponse.json({ success: true, users: res.rows });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, name, role = "READ" } = body;

        if (!email || !name) {
            return NextResponse.json({ success: false, error: "Email and Name required" }, { status: 400 });
        }

        const client = await pool.connect();
        await client.query(`
            INSERT INTO users (email, name, role) VALUES ($1, $2, $3)
            ON CONFLICT (email) DO UPDATE SET role = $3, name = $2;
        `, [email, name, role]);
        client.release();

        return NextResponse.json({ success: true, message: `Access granted to ${email} as ${role}!` });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ success: false, error: "Email query param required" }, { status: 400 });
        }

        const client = await pool.connect();
        await client.query("DELETE FROM users WHERE email = $1;", [email]);
        client.release();

        return NextResponse.json({ success: true, message: `User ${email} access revoked!` });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
