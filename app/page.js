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
            if (data.success) {
                setRepositories(data.repositories);
                setLogs(data.logs);
            }
        } catch (err) {
            console.error("Failed to load database content", err);
        }
    };

    useEffect(() => { fetchPortalData(); }, []);

    const handleOnboard = async () => {
        if (!onboardRepo.trim()) return;
        setLoading(true);

        const res = await fetch("/api/repositories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repoName: onboardRepo, primaryBranch: "main" })
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            alert(data.message);
            setOnboardRepo("");
            setIsModalOpen(false);
            fetchPortalData();
        } else {
            alert(`Error: ${data.error}`);
        }
    };

    const handleRemediate = async (repoName) => {
        setLoading(true);
        const res = await fetch("/api/remediate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repoName })
        });
        const data = await res.json();
        setLoading(false);

        if (data.success) {
            alert(data.message);
            fetchPortalData();
        }
    };

    const filteredRepos = repositories.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const cntPassed = repositories.filter(r => r.status === "PASSED").length;
    const cntFailed = repositories.filter(r => r.status === "FAILED").length;
    const cntAction = repositories.filter(r => r.status === "ACTION_REQUIRED").length;

    return (
        <div className="flex h-screen bg-[#0b132b] text-[#edf2f4] overflow-hidden">
            <div className="w-[270px] bg-[#070d1f] border-r border-[#3a506b] flex flex-col justify-between">
                <div>
                    <div className="p-6 text-xl font-bold text-blue-500 border-b border-[#3a506b]">⚡ DevSecOps Portal</div>
                    <ul className="py-4">
                        <li className={`px-6 py-3.5 cursor-pointer font-semibold ${activeTab === "dashboard" ? "bg-[#1c2541] border-l-4 border-blue-500 text-white" : "text-slate-400"}`} onClick={() => setActiveTab("dashboard")}>📊 Audit Dashboard</li>
                        <li className={`px-6 py-3.5 cursor-pointer font-semibold ${activeTab === "onboard" ? "bg-[#1c2541] border-l-4 border-blue-500 text-white" : "text-slate-400"}`} onClick={() => setActiveTab("onboard")}>🚀 Repo Onboarding</li>
                    </ul>
                </div>
                <div className="p-4 bg-[#050a17] text-xs text-slate-400 border-t border-[#3a506b]">
                    User: <strong>Vasu Addanki</strong><br />
                    Database: <strong>Vercel Postgres (Neon)</strong>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="bg-[#1c2541] border-b border-[#3a506b] p-4 px-8 flex justify-between items-center">
                    <input 
                        type="text" 
                        placeholder="Filter repositories..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#0b132b] border border-[#3a506b] px-4 py-2 rounded text-sm w-[340px] text-white"
                    />
                    <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 font-bold px-4 py-2 rounded text-sm">+ Onboard Repo</button>
                </div>

                <div className="p-8">
                    {activeTab === "dashboard" && (
                        <>
                            <div className="grid grid-cols-4 gap-5 mb-6">
                                <div className="bg-[#1c2541] border border-[#3a506b] p-5 rounded">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Total Target Repos</div>
                                    <div className="text-3xl font-extrabold my-2">{repositories.length}</div>
                                </div>
                                <div className="bg-[#1c2541] border border-[#3a506b] p-5 rounded">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Fully Compliant</div>
                                    <div className="text-3xl font-extrabold my-2 text-emerald-400">{cntPassed}</div>
                                </div>
                                <div className="bg-[#1c2541] border border-[#3a506b] p-5 rounded">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Action Required</div>
                                    <div className="text-3xl font-extrabold my-2 text-amber-400">{cntAction}</div>
                                </div>
                                <div className="bg-[#1c2541] border border-[#3a506b] p-5 rounded">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Non-Compliant</div>
                                    <div className="text-3xl font-extrabold my-2 text-red-400">{cntFailed}</div>
                                </div>
                            </div>

                            <div className="bg-[#1c2541] border border-[#3a506b] rounded p-6 mb-6">
                                <h3 className="font-bold mb-4">Organization Health Status (Vercel Postgres Live Sync)</h3>
                                <table className="w-full text-left text-sm border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#3a506b] text-slate-400">
                                            <th className="p-3">REPOSITORY NAME</th>
                                            <th className="p-3">STATUS</th>
                                            <th className="p-3">SONAR PROJECT KEY</th>
                                            <th className="p-3">AUTOMATION ACTIONS</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRepos.map((repo) => (
                                            <tr key={repo.id} className="border-b border-[#3a506b] hover:bg-[#273552]">
                                                <td className="p-3 font-bold">{repo.name}</td>
                                                <td className="p-3">
                                                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                                                        repo.status === 'PASSED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500' :
                                                        repo.status === 'ACTION_REQUIRED' ? 'bg-amber-950 text-amber-400 border border-amber-500' :
                                                        'bg-red-950 text-red-400 border border-red-500'
                                                    }`}>
                                                        {repo.status}
                                                    </span>
                                                </td>
                                                <td className="p-3"><code className="text-xs text-slate-300">{repo.sonar_project_key}</code></td>
                                                <td className="p-3">
                                                    {repo.status === 'FAILED' ? (
                                                        <button onClick={() => handleRemediate(repo.name)} className="bg-emerald-600 hover:bg-emerald-500 px-3 py-1 rounded text-xs font-bold">Auto-Remediate</button>
                                                    ) : (
                                                        <span className="text-xs text-slate-400">Verified</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-[#050a14] border border-[#3a506b] p-4 rounded font-mono text-xs text-sky-400 h-40 overflow-y-auto">
                                [SYSTEM] DevSecOps Control Center Active.<br />
                                [DATABASE] Connected to Vercel Postgres Pool.<br />
                                {logs.map((log) => (
                                    <div key={log.id}>[{new Date(log.created_at).toLocaleTimeString()}] {log.action}: {log.details}</div>
                                ))}
                            </div>
                        </>
                    )}

                    {activeTab === "onboard" && (
                        <div className="bg-[#1c2541] border border-[#3a506b] p-6 rounded max-w-xl">
                            <h2 className="text-xl font-bold mb-2">Self-Service Onboarding</h2>
                            <div className="mb-4">
                                <label className="block text-xs text-slate-400 mb-1">Target Repository Name</label>
                                <input 
                                    type="text" 
                                    value={onboardRepo}
                                    onChange={(e) => setOnboardRepo(e.target.value)}
                                    placeholder="e.g. ocs-rolloff-route-api" 
                                    className="w-full bg-[#0b132b] border border-[#3a506b] p-2.5 rounded text-white text-sm"
                                />
                            </div>
                            <button onClick={handleOnboard} disabled={loading} className="bg-emerald-600 font-bold px-4 py-2 rounded text-sm">
                                {loading ? 'Saving...' : '🚀 Execute Onboarding'}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
                    <div className="bg-[#1c2541] border border-[#3a506b] p-6 rounded w-[450px]">
                        <h3 className="text-lg font-bold mb-4">Onboard New Repository</h3>
                        <input 
                            type="text" 
                            value={onboardRepo}
                            onChange={(e) => setOnboardRepo(e.target.value)}
                            placeholder="Repository name..." 
                            className="w-full bg-[#0b132b] border border-[#3a506b] p-2.5 rounded text-white mb-4 text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="bg-slate-700 px-4 py-2 rounded text-sm">Cancel</button>
                            <button onClick={handleOnboard} className="bg-emerald-600 px-4 py-2 rounded text-sm font-bold">Save to Database</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
