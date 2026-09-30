"use client";
import { useState, useEffect } from "react";

export default function GovernancePortal() {
    const [activeTab, setActiveTab] = useState("dashboard");
    const [repositories, setRepositories] = useState([]);
    const [logs, setLogs] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [currentUser, setCurrentUser] = useState({ name: "Vasu Addanki", email: "vasu.addanki@wm.com", role: "ADMIN" });
    
    // User Access Form State
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserName, setNewUserName] = useState("");
    const [newUserRole, setNewUserRole] = useState("READ");

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
        } catch (err) { console.error(err); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/users");
            const data = await res.json();
            if (data.success && data.users) {
                setUsersList(data.users);
            }
        } catch (err) { console.error(err); }
    };

    useEffect(() => { 
        fetchPortalData();
        fetchUsers();
    }, []);

    const handleAddUser = async () => {
        if (currentUser.role !== "ADMIN") {
            alert("Permission Denied: Only ADMINs can manage access.");
            return;
        }
        if (!newUserEmail || !newUserName) return;

        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: newUserEmail, name: newUserName, role: newUserRole })
        });
        const data = await res.json();
        alert(data.message);
        setNewUserEmail("");
        setNewUserName("");
        fetchUsers();
    };

    const handleRemoveUser = async (email) => {
        if (currentUser.role !== "ADMIN") {
            alert("Permission Denied: Only ADMINs can remove users.");
            return;
        }
        const res = await fetch(`/api/users?email=${encodeURIComponent(email)}`, { method: "DELETE" });
        const data = await res.json();
        alert(data.message);
        fetchUsers();
    };

    const handleOnboard = async () => {
        if (currentUser.role === "READ") {
            alert("Permission Denied: READ-only users cannot onboard repositories.");
            return;
        }
        if (!onboardRepo.trim()) return;
        setLoading(true);

        const res = await fetch("/api/repositories", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repoName: onboardRepo, primaryBranch: "main" })
        });
        const data = await res.json();
        alert(data.message);
        setOnboardRepo("");
        setIsModalOpen(false);
        fetchPortalData();
        setLoading(false);
    };

    const handleRemediate = async (repoName) => {
        if (currentUser.role === "READ") {
            alert("Permission Denied: READ-only users cannot execute auto-remediation.");
            return;
        }
        setLoading(true);
        const res = await fetch("/api/remediate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ repoName })
        });
        const data = await res.json();
        alert(data.message);
        fetchPortalData();
        setLoading(false);
    };

    const filteredRepos = repositories.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="flex h-screen bg-[#0b132b] text-[#edf2f4] overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <div className="w-[270px] bg-[#070d1f] border-r border-[#3a506b] flex flex-col justify-between">
                <div>
                    <div className="p-6 text-xl font-extrabold text-blue-500 border-b border-[#3a506b]">
                        ⚡ DevSecOps Portal
                    </div>
                    <ul className="py-4">
                        <li className={`px-6 py-3.5 cursor-pointer font-semibold ${activeTab === "dashboard" ? "bg-[#1c2541] border-l-4 border-blue-500 text-white" : "text-slate-400"}`} onClick={() => setActiveTab("dashboard")}>
                            📊 Audit Dashboard
                        </li>
                        {currentUser.role !== "READ" && (
                            <li className={`px-6 py-3.5 cursor-pointer font-semibold ${activeTab === "onboard" ? "bg-[#1c2541] border-l-4 border-blue-500 text-white" : "text-slate-400"}`} onClick={() => setActiveTab("onboard")}>
                                🚀 Repo Onboarding
                            </li>
                        )}
                        {currentUser.role === "ADMIN" && (
                            <li className={`px-6 py-3.5 cursor-pointer font-semibold ${activeTab === "users" ? "bg-[#1c2541] border-l-4 border-blue-500 text-white" : "text-slate-400"}`} onClick={() => setActiveTab("users")}>
                                👥 Access Management
                            </li>
                        )}
                    </ul>
                </div>

                {/* Role Simulation Switcher */}
                <div className="p-4 bg-[#050a17] text-xs border-t border-[#3a506b]">
                    <div className="text-slate-400 mb-1 font-bold">ACTIVE IDENTITY SIMULATION</div>
                    <select 
                        value={currentUser.role}
                        onChange={(e) => setCurrentUser({ ...currentUser, role: e.target.value })}
                        className="w-full bg-[#0b132b] border border-[#3a506b] p-2 rounded text-emerald-400 font-bold mb-2"
                    >
                        <option value="ADMIN">ADMIN (Full Control)</option>
                        <option value="WRITE">WRITE (Onboard/Remediate)</option>
                        <option value="READ">READ (View Only)</option>
                    </select>
                    <span className="text-slate-400">Role Privilege: <strong className="text-white">{currentUser.role}</strong></span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-y-auto">
                <div className="bg-[#1c2541] border-b border-[#3a506b] p-4 px-8 flex justify-between items-center">
                    <input 
                        type="text" 
                        placeholder="Search repositories..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-[#0b132b] border border-[#3a506b] px-4 py-2 rounded text-sm w-[340px] text-white"
                    />
                    {currentUser.role !== "READ" && (
                        <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 hover:bg-emerald-500 font-bold px-4 py-2 rounded text-sm">+ Onboard Repo</button>
                    )}
                </div>

                <div className="p-8">
                    {/* Module 1: Dashboard */}
                    {activeTab === "dashboard" && (
                        <div className="bg-[#1c2541] border border-[#3a506b] rounded p-6">
                            <h3 className="font-bold text-lg mb-4">Compliance Status ({currentUser.role} Access)</h3>
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-[#3a506b] text-slate-400 bg-[#0b132b]">
                                        <th className="p-3">REPOSITORY NAME</th>
                                        <th className="p-3">STATUS</th>
                                        <th className="p-3">SONAR PROJECT KEY</th>
                                        <th className="p-3">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredRepos.map((repo) => (
                                        <tr key={repo.id} className="border-b border-[#3a506b]">
                                            <td className="p-3 font-bold">{repo.name}</td>
                                            <td className="p-3"><span className="px-2 py-1 rounded text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-500">{repo.status}</span></td>
                                            <td className="p-3"><code className="text-xs">{repo.sonar_project_key}</code></td>
                                            <td className="p-3">
                                                {currentUser.role !== "READ" && repo.status === 'FAILED' ? (
                                                    <button onClick={() => handleRemediate(repo.name)} className="bg-emerald-600 px-3 py-1 rounded text-xs font-bold">Auto-Remediate</button>
                                                ) : (
                                                    <span className="text-xs text-slate-400">{currentUser.role === 'READ' ? 'Read-Only' : 'Verified'}</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Module 2: User Access Management (ADMIN Only) */}
                    {activeTab === "users" && currentUser.role === "ADMIN" && (
                        <div className="bg-[#1c2541] border border-[#3a506b] p-6 rounded max-w-4xl">
                            <h2 className="text-xl font-bold mb-2">User Access Management</h2>
                            <p className="text-slate-400 text-sm mb-6">Grant or revoke READ, WRITE, and ADMIN privileges across team members.</p>
                            
                            <div className="grid grid-cols-3 gap-3 mb-6 bg-[#0b132b] p-4 rounded border border-[#3a506b]">
                                <input type="text" placeholder="Full Name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="bg-[#1c2541] border border-[#3a506b] p-2 rounded text-sm text-white" />
                                <input type="email" placeholder="User Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="bg-[#1c2541] border border-[#3a506b] p-2 rounded text-sm text-white" />
                                <div className="flex gap-2">
                                    <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="bg-[#1c2541] border border-[#3a506b] p-2 rounded text-sm text-emerald-400 font-bold flex-1">
                                        <option value="READ">READ</option>
                                        <option value="WRITE">WRITE</option>
                                        <option value="ADMIN">ADMIN</option>
                                    </select>
                                    <button onClick={handleAddUser} className="bg-blue-600 hover:bg-blue-500 font-bold px-4 py-2 rounded text-sm text-white">Add</button>
                                </div>
                            </div>

                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-[#3a506b] text-slate-400 bg-[#0b132b]">
                                        <th className="p-3">NAME</th>
                                        <th className="p-3">EMAIL</th>
                                        <th className="p-3">ROLE PERMISSION</th>
                                        <th className="p-3">ACTION</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usersList.map((user) => (
                                        <tr key={user.id} className="border-b border-[#3a506b]">
                                            <td className="p-3 font-bold">{user.name}</td>
                                            <td className="p-3">{user.email}</td>
                                            <td className="p-3"><span className="px-2 py-1 rounded text-xs font-bold bg-blue-950 text-blue-400 border border-blue-500">{user.role}</span></td>
                                            <td className="p-3">
                                                <button onClick={() => handleRemoveUser(user.email)} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Revoke</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-[#1c2541] border border-[#3a506b] p-6 rounded-lg w-[450px]">
                        <h3 className="text-lg font-bold mb-4">Onboard Repository</h3>
                        <input type="text" value={onboardRepo} onChange={(e) => setOnboardRepo(e.target.value)} placeholder="Repository name..." className="w-full bg-[#0b132b] border border-[#3a506b] p-2.5 rounded text-white mb-4 text-sm" />
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="bg-slate-700 px-4 py-2 rounded text-sm">Cancel</button>
                            <button onClick={handleOnboard} className="bg-emerald-600 px-4 py-2 rounded text-sm font-bold">Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
