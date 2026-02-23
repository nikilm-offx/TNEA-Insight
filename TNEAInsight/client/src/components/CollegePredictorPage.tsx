/**
 * College Predictor Page - Interactive AI prediction tool
 */
import { useState } from "react";
import { Brain, TrendingUp, CheckCircle, AlertCircle, Star, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import LoginModal from "./LoginModal";

interface PredictionResult {
    college: string;
    branch: string;
    cutoff: number;
    probability: number;
    category: "safe" | "target" | "dream";
}

const mockColleges: PredictionResult[] = [
    { college: "College of Engineering, Guindy (CEG)", branch: "Computer Science & Engg", cutoff: 196.5, probability: 92, category: "safe" },
    { college: "PSG College of Technology", branch: "Computer Science & Engg", cutoff: 193.2, probability: 75, category: "target" },
    { college: "Thiagarajar College of Engineering", branch: "IT", cutoff: 191.0, probability: 68, category: "target" },
    { college: "Anna University - MIT Campus", branch: "Computer Science & Engg", cutoff: 197.8, probability: 35, category: "dream" },
    { college: "PRIST University", branch: "Computer Science & Engg", cutoff: 180.5, probability: 98, category: "safe" },
    { college: "KCT Coimbatore", branch: "Electronics & Communication", cutoff: 188.3, probability: 55, category: "target" },
];

const categoryConfig = {
    safe: { label: "Safe", labelTa: "பாதுகாப்பு", color: "bg-green-100 text-green-800 border-green-200", bar: "bg-green-500", icon: CheckCircle },
    target: { label: "Target", labelTa: "இலக்கு", color: "bg-yellow-100 text-yellow-800 border-yellow-200", bar: "bg-yellow-500", icon: AlertCircle },
    dream: { label: "Dream", labelTa: "கனவு", color: "bg-purple-100 text-purple-800 border-purple-200", bar: "bg-purple-500", icon: Star },
};

export default function CollegePredictorPage() {
    const { language } = useLanguage();
    const { isAuthenticated } = useAuth();
    const [, setLocation] = useLocation();
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [marks, setMarks] = useState("");
    const [maths, setMaths] = useState("");
    const [physics, setPhysics] = useState("");
    const [chemistry, setChemistry] = useState("");
    const [category, setCategory] = useState("OC");
    const [results, setResults] = useState<PredictionResult[] | null>(null);
    const [loading, setLoading] = useState(false);
    const en = language === "en";

    const handlePredict = async () => {
        if (!marks && !(maths && physics && chemistry)) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 1200));
        const cutoff = marks ? parseFloat(marks) : (parseFloat(physics) / 2 + parseFloat(chemistry) / 2 + parseFloat(maths));
        const filtered = mockColleges.filter(c => Math.abs(c.cutoff - cutoff) <= 20).sort((a, b) => b.probability - a.probability);
        setResults(filtered.length > 0 ? filtered : mockColleges.slice(0, 3));
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-16 px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6">
                    <Brain className="w-4 h-4" />
                    {en ? "AI-Powered • Free to Use" : "AI-உதவியுடன் • பயன்பாடு இலவசம்"}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    {en ? "College Predictor" : "கல்லூரி கணிப்பி"}
                </h1>
                <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                    {en
                        ? "Enter your marks to get instant Safe, Target & Dream college predictions powered by 5 years of TNEA data."
                        : "5 ஆண்டு TNEA தரவை அடிப்படையாகக் கொண்டு உடனடி பாதுகாப்பு, இலக்கு & கனவு கல்லூரி கணிப்புகளுக்கு உங்கள் மதிப்பெண்களை உள்ளிடுங்கள்."}
                </p>
            </section>

            {/* Predictor Form */}
            <section className="max-w-4xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">
                        {en ? "Enter Your Marks" : "உங்கள் மதிப்பெண்களை உள்ளிடுங்கள்"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {en ? "Cutoff Mark (Direct)" : "வெட்டு மதிப்பு (நேரடி)"}
                            </label>
                            <input
                                type="number" min="0" max="200" step="0.5"
                                value={marks} onChange={e => { setMarks(e.target.value); setMaths(""); setPhysics(""); setChemistry(""); }}
                                placeholder={en ? "e.g. 189.5" : "எ.கா. 189.5"}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg font-semibold"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                {en ? "Category" : "வகை"}
                            </label>
                            <select
                                value={category} onChange={e => setCategory(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
                            >
                                {["OC", "BC", "BCM", "MBC", "SC", "SCA", "ST"].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="text-center text-gray-400 text-sm mb-6">{en ? "— OR enter subject marks —" : "— அல்லது பாட மதிப்பெண்களை உள்ளிடவும் —"}</div>
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { label: en ? "Physics" : "இயற்பியல்", val: physics, set: (v: string) => { setPhysics(v); setMarks(""); } },
                            { label: en ? "Chemistry" : "வேதியியல்", val: chemistry, set: (v: string) => { setChemistry(v); setMarks(""); } },
                            { label: en ? "Mathematics" : "கணிதம்", val: maths, set: (v: string) => { setMaths(v); setMarks(""); } },
                        ].map((sub, i) => (
                            <div key={i}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">{sub.label}</label>
                                <input type="number" min="0" max="100" value={sub.val} onChange={e => sub.set(e.target.value)}
                                    placeholder="0-100"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-center font-semibold"
                                />
                            </div>
                        ))}
                    </div>
                    <Button
                        onClick={handlePredict}
                        disabled={loading || (!marks && !(maths && physics && chemistry))}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-base"
                    >
                        {loading ? (en ? "Predicting..." : "கணிக்கிறது...") : (<>{en ? "Predict My Colleges" : "என் கல்லூரிகளை கணிக்கவும்"} <TrendingUp className="ml-2 w-5 h-5" /></>)}
                    </Button>
                </div>

                {/* Results */}
                {results && (
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
                            {en ? "Your Predicted Colleges" : "உங்கள் கணிக்கப்பட்ட கல்லூரிகள்"}
                        </h2>
                        <div className="space-y-4">
                            {results.map((r, idx) => {
                                const cat = categoryConfig[r.category];
                                const CatIcon = cat.icon;
                                return (
                                    <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${cat.color}`}>
                                                        <CatIcon className="w-3 h-3" />
                                                        {en ? cat.label : cat.labelTa}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{en ? "Cutoff" : "வெட்டு"}: {r.cutoff}</span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-lg">{r.college}</h3>
                                                <p className="text-gray-500 text-sm">{r.branch}</p>
                                            </div>
                                            <div className="flex-shrink-0 text-center md:text-right">
                                                <div className="text-3xl font-extrabold text-gray-900">{r.probability}%</div>
                                                <div className="text-xs text-gray-400 mb-2">{en ? "Probability" : "நிகழ்தகவு"}</div>
                                                <div className="w-32 h-2 bg-gray-100 rounded-full">
                                                    <div className={`h-2 rounded-full ${cat.bar}`} style={{ width: `${r.probability}%` }} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Upsell for login */}
                        {!isAuthenticated && (
                            <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
                                <Lock className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {en ? "Unlock Full College Predictor" : "முழு கல்லூரி கணிப்பியை திறக்கவும்"}
                                </h3>
                                <p className="text-gray-600 text-sm mb-6">
                                    {en ? "Login to see personalized predictions, AI choice filling, and complete counselling guidance." : "தனிப்பயனாக்கப்பட்ட கணிப்புகள், AI தேர்வு நிரப்புதல் மற்றும் முழுமையான ஆலோசனை வழிகாட்டலைப் பாருங்கள்."}
                                </p>
                                <Button onClick={() => setLoginModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8">
                                    {en ? "Login to Continue" : "தொடர உள்நுழைக"} <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </section>

            {loginModalOpen && <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />}
        </div>
    );
}
