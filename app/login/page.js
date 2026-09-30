"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                router.push("/");
                router.refresh();
            } else {
                setError(data.error || "Invalid credentials");
            }
        } catch (err) {
            setError("Authentication service unavailable");
        }
        setLoading(false);
    };

    return (
        <div className="flex h-screen w-full bg-[#0b132b] items-center justify-center font-sans">
            <div className="bg-[#1c2541] border border-[#3a506b] p-8 rounded-xl w-[400px] shadow-2xl">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-extrabold text-blue-500 mb-1">⚡ DevSecOps Portal</h1>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Enterprise Identity Login</p>
                </div>

                {error && (
                    <div className="bg-red-950/80 border border-red-500 text-red-300 text-xs p-3 rounded mb-4 text-center font-semibold">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs text-slate-400 font-bold mb-1">Email Address</label>
                        <input 
                            type="email" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@wm.com" 
                            className="w-full bg-[#0b132b] border border-[#3a506b] p-3 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-slate-400 font-bold mb-1">Password</label>
                        <input 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••" 
                            className="w-full bg-[#0b132b] border border-[#3a506b] p-3 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 font-bold py-3 rounded text-sm text-white transition-all shadow-lg mt-2"
                    >
                        {loading ? "Authenticating..." : "Sign In to Governance Portal"}
                    </button>
                </form>
            </div>
        </div>
    );
}
