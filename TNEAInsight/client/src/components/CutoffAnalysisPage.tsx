/**
 * Cutoff Analysis Page - Historical TNEA cutoff data
 */
import { useState } from "react";
import { BarChart3, TrendingDown, TrendingUp, Filter, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const cutoffData = [
    { college: "CEG - Anna University", branch: "CSE", district: "Chennai", oc: 196.5, bc: 192.3, mbc: 188.1, sc: 180.2, trend: "up" },
    { college: "CEG - Anna University", branch: "IT", district: "Chennai", oc: 194.2, bc: 190.1, mbc: 185.5, sc: 177.8, trend: "stable" },
    { college: "PSG College of Technology", branch: "CSE", district: "Coimbatore", oc: 193.2, bc: 189.0, mbc: 184.3, sc: 175.6, trend: "up" },
    { college: "KCT", branch: "ECE", district: "Coimbatore", oc: 188.3, bc: 183.1, mbc: 178.0, sc: 168.5, trend: "down" },
    { college: "Thiagarajar College", branch: "IT", district: "Madurai", oc: 191.0, bc: 186.5, mbc: 181.2, sc: 172.0, trend: "stable" },
    { college: "GCE Salem", branch: "CSE", district: "Salem", oc: 187.5, bc: 182.0, mbc: 176.8, sc: 166.3, trend: "up" },
    { college: "Bannari Amman IT", branch: "ECE", district: "Erode", oc: 183.0, bc: 178.2, mbc: 172.5, sc: 161.0, trend: "stable" },
];

const districts = ["All", "Chennai", "Coimbatore", "Madurai", "Salem", "Erode"];
const branches = ["All", "CSE", "IT", "ECE", "EEE", "Mechanical", "Civil"];

export default function CutoffAnalysisPage() {
    const { language } = useLanguage();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("All");
    const [selectedBranch, setSelectedBranch] = useState("All");
    const en = language === "en";

    const filtered = cutoffData.filter(row => {
        const matchSearch = row.college.toLowerCase().includes(searchQuery.toLowerCase()) || row.branch.toLowerCase().includes(searchQuery.toLowerCase());
        const matchDistrict = selectedDistrict === "All" || row.district === selectedDistrict;
        const matchBranch = selectedBranch === "All" || row.branch === selectedBranch;
        return matchSearch && matchDistrict && matchBranch;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-slate-900 to-violet-900 text-white py-16 px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-violet-200 mb-6">
                    <BarChart3 className="w-4 h-4" />
                    {en ? "Based on 5 Years of TNEA Data" : "5 ஆண்டு TNEA தரவை அடிப்படையாகக் கொண்டது"}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    {en ? "Cutoff Analysis" : "வெட்டு மதிப்பு பகுப்பாய்வு"}
                </h1>
                <p className="text-violet-200 text-lg max-w-2xl mx-auto">
                    {en ? "Historical TNEA cutoff marks by college, branch, and category. Filter to find what you need." : "கல்லூரி, கிளை மற்றும் வகையால் வரலாற்று TNEA வெட்டு மதிப்புகள்."}
                </p>
            </section>

            {/* Filters & Table */}
            <section className="max-w-7xl mx-auto px-4 py-12">
                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder={en ? "Search college or branch..." : "கல்லூரி அல்லது கிளை தேடுங்கள்..."}
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <select value={selectedDistrict} onChange={e => setSelectedDistrict(e.target.value)}
                                className="px-3 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-sm"
                            >
                                {districts.map(d => <option key={d}>{d === "All" ? (en ? "All Districts" : "அனைத்து மாவட்டங்கள்") : d}</option>)}
                            </select>
                            <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
                                className="px-3 py-2.5 border border-gray-200 rounded-xl focus:border-violet-500 focus:outline-none text-sm"
                            >
                                {branches.map(b => <option key={b}>{b === "All" ? (en ? "All Branches" : "அனைத்து கிளைகள்") : b}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left p-4 font-semibold text-gray-700">{en ? "College" : "கல்லூரி"}</th>
                                    <th className="text-left p-4 font-semibold text-gray-700">{en ? "Branch" : "கிளை"}</th>
                                    <th className="text-center p-4 font-semibold text-gray-700">OC</th>
                                    <th className="text-center p-4 font-semibold text-gray-700">BC</th>
                                    <th className="text-center p-4 font-semibold text-gray-700">MBC</th>
                                    <th className="text-center p-4 font-semibold text-gray-700">SC/ST</th>
                                    <th className="text-center p-4 font-semibold text-gray-700">{en ? "Trend" : "போக்கு"}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((row, idx) => (
                                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-medium text-gray-900">{row.college}</td>
                                        <td className="p-4 text-gray-600">{row.branch}</td>
                                        <td className="p-4 text-center font-semibold text-blue-700">{row.oc}</td>
                                        <td className="p-4 text-center text-gray-700">{row.bc}</td>
                                        <td className="p-4 text-center text-gray-700">{row.mbc}</td>
                                        <td className="p-4 text-center text-gray-700">{row.sc}</td>
                                        <td className="p-4 text-center">
                                            {row.trend === "up" && <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-semibold"><TrendingUp className="w-3 h-3" />Up</span>}
                                            {row.trend === "down" && <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-semibold"><TrendingDown className="w-3 h-3" />Down</span>}
                                            {row.trend === "stable" && <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-semibold">≈ Stable</span>}
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">{en ? "No results found" : "முடிவுகள் இல்லை"}</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 text-xs text-gray-400 border-t border-gray-100">
                        {en ? "Data shown is for TNEA 2024. Cutoff marks are based on category rank allocation." : "காட்டப்படும் தரவு TNEA 2024க்கானது. வெட்டு மதிப்புகள் வகை தர ஒதுக்கீட்டை அடிப்படையாகக் கொண்டது."}
                    </div>
                </div>
            </section>
        </div>
    );
}
