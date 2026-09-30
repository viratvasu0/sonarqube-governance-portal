import { Pool } from "pg";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export async function GET() {
    try {
        const client = await pool.connect();
        const res = await client.query("SELECT id, email, name, role, created_at FROM users ORDER BY id ASC;");
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

        // Default password = email username prefix (e.g. viratvasu0 for viratvasu0@gmail.com)
        const defaultPassword = email.split('@')[0];
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);

        const client = await pool.connect();
        await client.query(`
            INSERT INTO users (email, name, role, password_hash) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO UPDATE SET role = $3, name = $2;
        `, [email.trim(), name.trim(), role, hashedPassword]);
        client.release();

        return NextResponse.json({ 
            success: true, 
            message: `User ${email} created! Default password is set to '${defaultPassword}'.` 
        });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ success: false, error: "Email required" }, { status: 400 });
        }

        const client = await pool.connect();
        await client.query("DELETE FROM users WHERE email = $1;", [email]);
        client.release();

        return NextResponse.json({ success: true, message: `User ${email} access revoked!` });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
