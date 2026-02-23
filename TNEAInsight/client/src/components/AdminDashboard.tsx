/**
 * Admin Dashboard - Redesigned with verification queue, charts, and management tools
 */
import { useState } from "react";
import {
  Shield, Users, FileCheck, AlertTriangle, CheckCircle, Clock, BarChart3,
  Upload, Download, RefreshCw, Search, Filter, Eye, ThumbsUp, ThumbsDown,
  Flag, Settings, Activity, TrendingUp, TrendingDown, Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const stats = [
  { label: "Total Applications", labelTa: "மொத்த விண்ணப்பங்கள்", value: "1,25,000", icon: Users, color: "bg-blue-50  text-blue-600", trend: "+12%", up: true },
  { label: "Verified", labelTa: "நிரூபிக்கப்பட்டது", value: "98,500", icon: CheckCircle, color: "bg-green-50 text-green-600", trend: "+8%", up: true },
  { label: "Pending Verification", labelTa: "நிலுவையில்", value: "26,500", icon: Clock, color: "bg-yellow-50 text-yellow-600", trend: "-5%", up: false },
  { label: "Flagged / Rejected", labelTa: "கொடியிட்டது / நிராகரிக்கப்பட்டது", value: "1,200", icon: AlertTriangle, color: "bg-red-50 text-red-600", trend: "-2%", up: false },
];

const mockApplications = [
  { id: "TN2025-001234", name: "Arun Kumar", category: "OC", date: "2025-02-20", status: "pending", docs: ["10th", "12th", "Community"], flag: null },
  { id: "TN2025-001235", name: "Priya Sharma", category: "BC", date: "2025-02-19", status: "verified", docs: ["10th", "12th", "Community", "Income"], flag: null },
  { id: "TN2025-001236", name: "Mohammed Ali", category: "BCM", date: "2025-02-20", status: "flagged", docs: ["10th", "12th"], flag: "Mismatched DOB in community certificate" },
  { id: "TN2025-001237", name: "Deepika Raj", category: "MBC", date: "2025-02-21", status: "pending", docs: ["10th", "12th", "Community", "Nativity"], flag: null },
  { id: "TN2025-001238", name: "Suresh Babu", category: "SC", date: "2025-02-18", status: "verified", docs: ["10th", "12th", "Community", "Income", "Nativity"], flag: null },
  { id: "TN2025-001239", name: "Kavitha Devi", category: "SCA", date: "2025-02-21", status: "pending", docs: ["10th", "12th"], flag: null },
];

const counsellingPhases = [
  { phase: "Phase 1: Registration", phaseTa: "கட்டம் 1: பதிவு", active: false, completed: true },
  { phase: "Phase 2: Verification", phaseTa: "கட்டம் 2: சரிபார்ப்பு", active: true, completed: false },
  { phase: "Phase 3: Choice Filling", phaseTa: "கட்டம் 3: விருப்பு நிரப்பல்", active: false, completed: false },
  { phase: "Phase 4: Allotment", phaseTa: "கட்டம் 4: ஒதுக்கீடு", active: false, completed: false },
  { phase: "Phase 5: Confirmation", phaseTa: "கட்டம் 5: உறுதிப்படுத்தல்", active: false, completed: false },
];

const auditLog = [
  { action: "Approved verification for TN2025-001235", time: "5 min ago", admin: "Admin-01" },
  { action: "Flagged TN2025-001236 — DOB mismatch", time: "12 min ago", admin: "Admin-02" },
  { action: "Updated counselling phase to Verification", time: "1 hr ago", admin: "Admin-01" },
  { action: "Downloaded verification report (Feb 21)", time: "2 hr ago", admin: "Admin-03" },
  { action: "Approved bulk upload — 450 records", time: "4 hr ago", admin: "Admin-01" },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    verified: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    flagged: "bg-red-100 text-red-800",
    rejected: "bg-gray-100 text-gray-600",
  };
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${map[status] || ""}`}>{status.toUpperCase()}</span>;
};

export default function AdminDashboard() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("overview");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const en = language === "en";

  const tabs = [
    { id: "overview", label: en ? "Overview" : "கண்ணோட்டம்", icon: BarChart3 },
    { id: "verification", label: en ? "Verification" : "சரிபார்ப்பு", icon: FileCheck },
    { id: "flagged", label: en ? "Flagged" : "கொடியிட்டது", icon: Flag },
    { id: "phases", label: en ? "Phases" : "கட்டங்கள்", icon: Settings },
    { id: "audit", label: en ? "Audit Log" : "தணிக்கை பதிவு", icon: Activity },
  ];

  const filteredApps = mockApplications.filter(app => {
    const matchSearch = app.name.toLowerCase().includes(search.toLowerCase()) || app.id.includes(search);
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900" data-testid="text-admin-title">
                {en ? "Admin Dashboard" : "நிர்வாக பலகம்"}
              </h1>
              <p className="text-gray-500 text-sm">{en ? "TNEA 2025 Counselling Management" : "TNEA 2025 ஆலோசனை நிர்வாகம்"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
              <RefreshCw className="w-4 h-4" /> {en ? "Refresh" : "புதுப்பி"}
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700">
              <Download className="w-4 h-4" /> {en ? "Export Report" : "அறிக்கை ஏற்றுமதி"}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s: any, idx: number) => {
            const Icon = s.icon;
            const TrendIcon = s.up ? TrendingUp : TrendingDown;
            return (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900" data-testid={`text-stat-${idx}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{en ? s.label : s.labelTa}</div>
                <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${s.up ? "text-green-600" : "text-red-500"}`}>
                  <TrendIcon className="w-3 h-3" />{s.trend} {en ? "vs last week" : "கடந்த வாரம்"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Verification Rate Bar */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-900">{en ? "Overall Verification Rate" : "மொத்த சரிபார்ப்பு விகிதம்"}</span>
            <span className="text-2xl font-extrabold text-blue-700">78.8%</span>
          </div>
          <Progress value={78.8} className="h-3" />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {tabs.map((tab: any) => {
              const TabIcon = tab.icon;
              return (
                <button key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}>
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-4">
                  {en ? "Recent Applications" : "சமீபத்திய விண்ணப்பங்கள்"}
                </h2>
                <div className="space-y-3">
                  {mockApplications.slice(0, 5).map((app: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl" data-testid={`application-${app.id}`}>
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-gray-900">{app.name}</span>
                          <Badge variant="outline" className="text-xs">{app.id}</Badge>
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-600">{app.category}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {en ? "Documents" : "ஆவணங்கள்"}: {app.docs.join(", ")}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">{app.date}</span>
                        {statusBadge(app.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VERIFICATION QUEUE */}
            {activeTab === "verification" && (
              <div>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                      placeholder={en ? "Search by name or ID..." : "பெயர் அல்லது ID-ஆல் தேடவும்..."}
                      className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm" />
                  </div>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:outline-none">
                    <option value="all">{en ? "All Status" : "அனைத்து நிலை"}</option>
                    <option value="pending">{en ? "Pending" : "நிலுவையில்"}</option>
                    <option value="verified">{en ? "Verified" : "சரிபார்க்கப்பட்டது"}</option>
                    <option value="flagged">{en ? "Flagged" : "கொடியிட்டது"}</option>
                  </select>
                </div>

                <div className="space-y-3" data-testid="button-upload-documents">
                  {filteredApps.map((app: any, idx: number) => (
                    <div key={idx} className={`border rounded-2xl p-5 ${app.status === "flagged" ? "border-red-200 bg-red-50" : "border-gray-100 bg-white"}`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-bold text-gray-900">{app.name}</span>
                            <Badge variant="outline" className="text-xs">{app.id}</Badge>
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{app.category}</span>
                            {statusBadge(app.status)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            📄 {app.docs.join(" · ")}
                          </div>
                          {app.flag && (
                            <div className="mt-2 text-xs text-red-700 bg-red-100 px-3 py-1.5 rounded-lg inline-flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {app.flag}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 text-xs font-medium">
                            <Eye className="w-3 h-3" /> {en ? "View" : "காண்க"}
                          </button>
                          {app.status === "pending" && (
                            <>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 hover:bg-green-200 rounded-lg text-green-700 text-xs font-bold">
                                <ThumbsUp className="w-3 h-3" /> {en ? "Approve" : "அங்கீகரி"}
                              </button>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 rounded-lg text-red-700 text-xs font-bold">
                                <ThumbsDown className="w-3 h-3" /> {en ? "Reject" : "நிராகரி"}
                              </button>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-yellow-700 text-xs font-bold">
                                <Flag className="w-3 h-3" /> {en ? "Flag" : "கொடி"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FLAGGED */}
            {activeTab === "flagged" && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  {en ? "Flagged Applications" : "கொடியிட்ட விண்ணப்பங்கள்"}
                </h2>
                <div className="space-y-3">
                  {mockApplications.filter(a => a.flag || a.status === "flagged").map((app: any, idx: number) => (
                    <div key={idx} className="border border-red-200 bg-red-50 rounded-2xl p-5">
                      <div className="flex justify-between">
                        <div>
                          <span className="font-bold text-gray-900">{app.name}</span>
                          <Badge variant="outline" className="ml-2 text-xs">{app.id}</Badge>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-xs font-bold">
                            {en ? "Resolve" : "தீர்"}
                          </button>
                          <button className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold">
                            {en ? "Reject" : "நிராகரி"}
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-red-700 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {app.flag || (en ? "Flagged for review" : "மறுஆய்வுக்கு கொடியிட்டது")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* COUNSELLING PHASES */}
            {activeTab === "phases" && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-6">
                  {en ? "Counselling Phase Management" : "ஆலோசனை கட்ட நிர்வாகம்"}
                </h2>
                <div className="space-y-4">
                  {counsellingPhases.map((phase: any, idx: number) => (
                    <div key={idx} className={`flex items-center justify-between p-5 rounded-2xl border ${phase.active ? "border-blue-300 bg-blue-50" : phase.completed ? "border-green-200 bg-green-50" : "border-gray-200 bg-gray-50"}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${phase.active ? "bg-blue-600 text-white" : phase.completed ? "bg-green-600 text-white" : "bg-gray-300 text-white"}`}>
                          {phase.completed ? "✓" : idx + 1}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900">{en ? phase.phase : phase.phaseTa}</span>
                          {phase.active && <Badge className="ml-2 bg-blue-100 text-blue-700 text-xs">{en ? "Active" : "செயலில்"}</Badge>}
                        </div>
                      </div>
                      {!phase.completed && (
                        <button className={`px-4 py-2 rounded-xl text-sm font-bold ${phase.active ? "bg-red-100 hover:bg-red-200 text-red-700" : "bg-blue-100 hover:bg-blue-200 text-blue-700"}`}>
                          {phase.active ? (en ? "Deactivate" : "நிறுத்து") : (en ? "Activate" : "செயல்படுத்து")}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIT LOG */}
            {activeTab === "audit" && (
              <div>
                <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  {en ? "Audit Log" : "தணிக்கை பதிவு"}
                </h2>
                <div className="space-y-3">
                  {auditLog.map((log: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Calendar className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 font-medium">{log.action}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-400">{log.time}</span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{log.admin}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}