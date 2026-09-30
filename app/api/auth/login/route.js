import { Pool } from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || "devsecops_governance_secret_key_2026";

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ success: false, error: "Email and password required" }, { status: 400 });
        }

        const client = await pool.connect();
        const res = await client.query("SELECT * FROM users WHERE email = $1;", [email]);
        client.release();

        if (res.rows.length === 0) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 401 });
        }

        const user = res.rows[0];
        
        // For testing/mocking initial password verification if hash isn't set yet:
        const isValidPassword = user.password_hash 
            ? await bcrypt.compare(password, user.password_hash) 
            : (password === "Admin@123" || password === "password123");

        if (!isValidPassword) {
            return NextResponse.json({ success: false, error: "Invalid password" }, { status: 401 });
        }

        // Generate JWT Token with user identity and role
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role },
            JWT_SECRET,
            { expiresIn: "8h" }
        );

        const response = NextResponse.json({ success: true, message: "Login successful", user: { name: user.name, email: user.email, role: user.role } });
        
        // Set secure HTTP-only Cookie
        response.cookies.set("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 8, // 8 hours
            path: "/"
        });

        return response;
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
