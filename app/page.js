"use client";
import { useState, useEffect } from "react";

export default function GovernancePortal() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [repositories, setRepositories] = useState([]);
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [onboardRepo, setOnboardRepo] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const fetchPortalData = async () => {
        try {
            const res = await fetch("/api/repositories");
            const data = await res.json();
            if (data.success && data.repositories) {
                setRepositories(data.repositories);
                setLogs(data.logs || []);
            }
        } catch (err) {
            console.error("Database connection error:", err);
        }
    };

    useEffect(() => { fetchPortalData(); }, []);

    const handleOnboard = async () => {
        if (!onboardRepo.trim()) return;
        setLoading(true);

        try {
            const res = await fetch("/api/repositories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoName: onboardRepo, primaryBranch: "main" })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.message);
                setOnboardRepo("");
                setIsModalOpen(false);
                await fetchPortalData();
            } else {
                alert(`Error saving to DB: ${data.error}`);
            }
        } catch (e) {
            alert(`Network or Server error: ${e.message}`);
        }
        setLoading(false);
    };

    const handleRemediate = async (repoName) => {
        setLoading(true);
        try {
            const res = await fetch("/api/remediate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoName })
            });
            const data = await res.json();
            alert(data.message || `Drift remediated for ${repoName}!`);
            await fetchPortalData();
        } catch (e) {
            alert(`Failed to remediate: ${e.message}`);
        }
        setLoading(false);
    };

    const filteredRepos = repositories.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const totalCount = repositories.length;
    const cntPassed = repositories.filter(r => r.status === "PASSED").length;
    const cntFailed = repositories.filter(r => r.status === "FAILED").length;
    const cntAction = repositories.filter(r => r.status === "ACTION_REQUIRED").length;

    return (
        <div className="flex h-screen bg-[#0b132b] text-[#edf2f4] overflow-hidden font-sans">
            <div className="w-[270px] bg-[#070d1f] border-r border-[#3a506b] flex flex-col justify-between">
                <div>
                    <div className="p-6 text-xl font-extrabold text-blue-500 border-b border-[#3a506b] flex items-center gap-2">
                        ⚡ DevSecOps Governance
                    </div>
                    <ul className="py-4">
                        <li className={`px-6 py-3.5 cursor-pointer font-semibold flex items-center gap-3 transition-all ${activeTab === "dashboard" ? "bg-[#1c2541] border-l-4 border-blue-500 text-white" : "text-slate-400 hover:bg-[#1c2541]/50"}`} onClick={() => setActiveTab("dashboard")}>
                            📊 Audit Dashboard
                        </li>
                        <li className={`px-6 py-3.5 cursor-pointer font-semibold flex items-center gap-3 transition-all ${activeTab === "onboard" ? "bg-[#1c2541] border-l-4 border-blue-500 text-white" : "text-slate-400 hover:bg-[#1c2541]/50"}`} onClick={() => setActiveTab("onboard")}>
                            🚀 Repo Onboarding
                        </li>
                    </ul>
                </div>
                <div className="p-4 bg-[#050a17] text-xs text-slate-400 border-t border-[#3a506b]">
                    Logged in as: <strong className="text-white">Vasu Addanki</strong><br />
                    Database: <strong className="text-sky-400">Prisma Postgres (Live)</strong>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="bg-[#1c2541] border-b border-[#3a506b] p-4 px-8 flex justify-between items-center">
                    <input 
                        type="text" 
                        placeholder="Search repositories (e.g. ocs-rmda)..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#0b132b] border border-[#3a506b] px-4 py-2 rounded text-sm w-[340px] text-white focus:outline-none focus:border-blue-500"
                    />
                    <div className="flex gap-3">
                        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded text-sm transition-all">+ Onboard New Project</button>
                    </div>
                </div>

                <div className="p-8">
                    {activeTab === "dashboard" && (
                        <>
                            <div className="grid grid-cols-4 gap-5 mb-6">
                                <div className="bg-[#1c2541] border border-[#3a506b] p-5 rounded">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Total Target Repos</div>
                                    <div className="text-3xl font-extrabold my-2">{totalCount}</div>
                                    <span className="text-xs text-slate-400">Prisma Postgres Live Sync</span>
                                </div>
                                <div className="bg-[#1c2541] border border-[#3a506b] p-5 rounded">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Fully Compliant</div>
                                    <div className="text-3xl font-extrabold my-2 text-emerald-400">{cntPassed}</div>
                                    <span className="text-xs text-emerald-400">Validated & Scanned</span>
                                </div>
                                <div className="bg-[#1c2541] border border-[#3a506b] p-5 rounded">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Action Required</div>
                                    <div className="text-3xl font-extrabold my-2 text-amber-400">{cntAction}</div>
                                    <span className="text-xs text-amber-400">Missing Initial Scan</span>
                                </div>
                                <div className="bg-[#1c2541] border border-[#3a506b] p-5 rounded">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Non-Compliant / Failed</div>
                                    <div className="text-3xl font-extrabold my-2 text-red-400">{cntFailed}</div>
                                    <span className="text-xs text-red-400">Drift / Property Errors</span>
                                </div>
                            </div>

                            <div className="bg-[#1c2541] border border-[#3a506b] rounded p-6 mb-6">
                                <h3 className="font-bold text-lg mb-4">Organization Health Status (Prisma Postgres Live Stream)</h3>
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#3a506b] text-slate-400 bg-[#0b132b]">
                                            <th className="p-3">REPOSITORY NAME</th>
                                            <th className="p-3">STATUS</th>
                                            <th className="p-3">PROPERTIES (MAIN/DEV)</th>
                                            <th className="p-3">SONAR PROJECT KEY</th>
                                            <th className="p-3">AUTOMATION ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRepos.map((repo) => (
                                            <tr key={repo.id} className="border-b border-[#3a506b] hover:bg-[#273552]">
                                                <td className="p-3 font-bold">{repo.name}</td>
                                                <td className="p-3">
                                                    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${
                                                        repo.status === 'PASSED' ? 'bg-emerald-950 text-emerald-400 border-emerald-500' :
                                                        repo.status === 'ACTION_REQUIRED' ? 'bg-amber-950 text-amber-400 border-amber-500' :
                                                        'bg-red-950 text-red-400 border-red-500'
                                                    }`}>
                                                        {repo.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 font-semibold">
                                                    {repo.properties_develop ? (
                                                        <span className="text-emerald-400">TRUE / TRUE</span>
                                                    ) : (
                                                        <span className="text-red-400">TRUE / FALSE</span>
                                                    )}
                                                </td>
                                                <td className="p-3"><code className="text-xs text-slate-300">{repo.sonar_project_key}</code></td>
                                                <td className="p-3">
                                                    {repo.status === 'FAILED' ? (
                                                        <button onClick={() => handleRemediate(repo.name)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs font-bold">Auto-Remediate</button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Verified</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <h3 className="font-bold mb-2">Audit Console Logs (Postgres)</h3>
                            <div className="bg-[#050a14] border border-[#3a506b] p-4 rounded font-mono text-xs text-sky-400 h-40 overflow-y-auto">
                                <div>[SYSTEM] Connected to Prisma Postgres Database Pool.</div>
                                {logs.map((log) => (
                                    <div key={log.id}>[{new Date(log.created_at).toLocaleTimeString()}] {log.action}: {log.details}</div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === "onboard" && (
                        <div className="bg-[#1c2541] border border-[#3a506b] p-6 rounded max-w-2xl">
                            <h2 className="text-xl font-bold mb-1">Self-Service Repository Onboarding</h2>
                            <p className="text-slate-400 text-sm mb-6">Persistently onboard repositories directly to Prisma Postgres.</p>
                            
                            <div className="mb-4">
                                <label className="block text-xs text-slate-400 font-bold mb-1">Target Repository Name</label>
                                <input 
                                    type="text" 
                                    value={onboardRepo}
                                    onChange={(e) => setOnboardRepo(e.target.value)}
                                    placeholder="e.g. abc" 
                                    className="w-full bg-[#0b132b] border border-[#3a506b] p-2.5 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button onClick={handleOnboard} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 font-bold px-5 py-2.5 rounded text-sm text-white">
                                {loading ? 'Saving to Database...' : '🚀 Execute Onboarding & Persist'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#1c2541] border border-[#3a506b] p-6 rounded-lg w-[480px]">
                        <h3 className="text-lg font-bold mb-4">Onboard Repository</h3>
                        <div className="mb-4">
                            <input 
                                type="text" 
                                value={onboardRepo}
                                onChange={(e) => setOnboardRepo(e.target.value)}
                                placeholder="Repository name (e.g. abc)" 
                                className="w-full bg-[#0b132b] border border-[#3a506b] p-2.5 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setIsModalOpen(false)} className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded text-sm font-semibold">Cancel</button>
                            <button onClick={handleOnboard} disabled={loading} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded text-sm font-bold">
                                {loading ? 'Saving...' : 'Save to Database'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
