/**
 * Student Dashboard - Redesigned with workflow progress, quick actions, AI predictions
 */
import { useState } from "react";
import { useLocation } from "wouter";
import {
  BarChart3, GraduationCap, TrendingUp, Calendar,
  ArrowRight, CheckCircle, Clock, AlertCircle,
  FileCheck, BookOpen, Award, Target, Star, Zap,
  Bell, ChevronRight, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const steps = [
  { id: 1, label: "Registration", labelTa: "பதிவு", status: "completed" },
  { id: 2, label: "Verification", labelTa: "சரிபார்ப்பு", status: "current" },
  { id: 3, label: "Rank & Cutoff", labelTa: "தரம் & வெட்டு", status: "upcoming" },
  { id: 4, label: "Choice Filling", labelTa: "விருப்ப முறை", status: "upcoming" },
  { id: 5, label: "Allotment", labelTa: "ஒதுக்கீடு", status: "upcoming" },
  { id: 6, label: "Confirmation", labelTa: "உறுதிப்படுத்தல்", status: "upcoming" },
  { id: 7, label: "Admission", labelTa: "சேர்க்கை", status: "upcoming" },
];

const mockStats = [
  { label: "Total Colleges", labelTa: "மொத்த கல்லூரிகள்", value: "542", icon: GraduationCap, color: "bg-blue-50 text-blue-600" },
  { label: "Total Students", labelTa: "மொத்த மாணவர்கள்", value: "1,25,000", icon: User, color: "bg-indigo-50 text-indigo-600" },
  { label: "Avg Cutoff", labelTa: "சராசரி வெட்டு", value: "180.5", icon: BarChart3, color: "bg-violet-50 text-violet-600" },
  { label: "Placement Rate", labelTa: "வேலை வாய்ப்பு", value: "89%", icon: TrendingUp, color: "bg-green-50 text-green-600" },
];

const aiPredictions = [
  { type: "safe", label: "Safe", labelTa: "பாதுகாப்பு", college: "GCE Salem – CSE", prob: 92, color: "border-l-green-500  bg-green-50", badge: "bg-green-100 text-green-700", icon: CheckCircle },
  { type: "target", label: "Target", labelTa: "இலக்கு", college: "PSG CoT – CSE", prob: 71, color: "border-l-yellow-500 bg-yellow-50", badge: "bg-yellow-100 text-yellow-700", icon: Target },
  { type: "dream", label: "Dream", labelTa: "கனவு", college: "CEG Anna University – CSE", prob: 38, color: "border-l-purple-500 bg-purple-50", badge: "bg-purple-100 text-purple-700", icon: Star },
];

const deadlines = [
  { event: "Document Verification Deadline", eventTa: "ஆவண சரிபார்ப்பு கடைசி நாள்", date: "Mar 15, 2025", urgent: true },
  { event: "Choice Filling Window Opens", eventTa: "விருப்பு நிரப்பும் காலம் தொடங்கும்", date: "Mar 20, 2025", urgent: false },
  { event: "Round 1 Allotment", eventTa: "சுற்று 1 ஒதுக்கீடு", date: "Apr 5, 2025", urgent: false },
];

export default function StudentDashboard() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const en = language === "en";
  const currentStep = 2;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <p className="text-blue-200 text-sm font-medium mb-1">
                  {en ? "Welcome back," : "மீண்டும் வரவேற்கிறோம்,"}
                </p>
                <h1 className="text-3xl font-extrabold mb-2" data-testid="text-dashboard-title">
                  {user?.username || (en ? "Student" : "மாணவர்")} 👋
                </h1>
                <div className="flex items-center gap-3 text-blue-200 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full font-medium">
                    {en ? "App ID: TN-2025-0042891" : "விண்ணப்ப எண்: TN-2025-0042891"}
                  </span>
                  <span className="bg-yellow-400/20 text-yellow-200 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {en ? "Step 2 In Progress" : "படி 2 நடப்பில்"}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => setLocation("/workflow")}
                className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-6 py-3 rounded-xl flex-shrink-0"
              >
                {en ? "Continue Application" : "விண்ணப்பத்தை தொடர்க"} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>

            {/* Workflow Progress */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-blue-200">
                  {en ? "Application Progress" : "விண்ணப்ப முன்னேற்றம்"}
                </span>
                <span className="text-sm font-bold text-white">{Math.round((currentStep / 7) * 100)}%</span>
              </div>
              <div className="relative">
                <div className="h-2 bg-white/20 rounded-full">
                  <div className="h-2 bg-white rounded-full transition-all duration-700"
                    style={{ width: `${(currentStep / 7) * 100}%` }} />
                </div>
                <div className="flex justify-between mt-3">
                  {steps.map((step) => (
                    <div key={step.id} className="flex-1 flex flex-col items-center">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors
                        ${step.status === "completed" ? "bg-white border-white text-blue-700" :
                          step.status === "current" ? "bg-blue-400 border-white text-white" :
                            "bg-transparent border-white/40 text-white/40"}`}>
                        {step.status === "completed" ? "✓" : step.id}
                      </div>
                      <span className="hidden md:block text-xs mt-1 text-blue-300 text-center leading-tight max-w-[60px]">
                        {en ? step.label : step.labelTa}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {mockStats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-extrabold text-gray-900" data-testid={`text-stat-${idx}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{en ? stat.label : stat.labelTa}</div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Predictions */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                {en ? "AI College Predictions" : "AI கல்லூரி கணிப்புகள்"}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setLocation("/college-predictor")}
                className="text-blue-600 text-xs font-semibold">
                {en ? "View All" : "அனைத்தும்"} <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
            <div className="space-y-3">
              {aiPredictions.map((pred: any, idx: number) => {
                const Icon = pred.icon;
                return (
                  <div key={idx} className={`border-l-4 rounded-xl p-4 flex items-center justify-between ${pred.color}`}>
                    <div className="flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${pred.badge}`}>
                        <Icon className="w-3 h-3" />
                        {en ? pred.label : pred.labelTa}
                      </span>
                      <span className="font-semibold text-gray-900 text-sm">{pred.college}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-gray-900">{pred.prob}%</div>
                        <div className="text-xs text-gray-400">{en ? "Chance" : "வாய்ப்பு"}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 border border-blue-100">
              ⚡ {en ? "Based on your cutoff of 189.5 (OC category). Complete Step 2 to refine predictions." : "உங்கள் வெட்டு 189.5 (OC வகை) அடிப்படையில். கணிப்புகளை மேம்படுத்த படி 2 முடிக்கவும்."}
            </div>
          </div>

          {/* Deadlines & Quick Actions */}
          <div className="space-y-4">
            {/* Deadlines */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-orange-500" />
                {en ? "Upcoming Deadlines" : "வரவிருக்கும் கடைசி தேதிகள்"}
              </h2>
              <div className="space-y-3">
                {deadlines.map((d, idx) => (
                  <div key={idx} className={`flex items-start gap-3 p-3 rounded-xl ${d.urgent ? "bg-red-50 border border-red-100" : "bg-gray-50"}`}>
                    <div className={`flex-shrink-0 mt-0.5 ${d.urgent ? "text-red-500" : "text-gray-400"}`}>
                      {d.urgent ? <AlertCircle className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold ${d.urgent ? "text-red-700" : "text-gray-700"}`}>
                        {en ? d.event : d.eventTa}
                      </p>
                      <p className={`text-xs ${d.urgent ? "text-red-500 font-bold" : "text-gray-400"}`}>{d.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-extrabold text-gray-900 mb-4">
                {en ? "Quick Actions" : "விரைவு செயல்கள்"}
              </h2>
              <div className="space-y-2">
                {[
                  { icon: FileCheck, label: en ? "Upload Documents" : "ஆவணங்கள் பதிவேற்றவும்", route: "/workflow", color: "text-blue-600 bg-blue-50" },
                  { icon: BarChart3, label: en ? "Check My Rank" : "என் தரத்தை சரிபார்க்கவும்", route: "/workflow", color: "text-indigo-600 bg-indigo-50" },
                  { icon: BookOpen, label: en ? "Browse Colleges" : "கல்லூரிகளை உலாவுங்கள்", route: "/suggestions", color: "text-violet-600 bg-violet-50" },
                  { icon: Award, label: en ? "View Counselling Guide" : "ஆலோசனை வழிகாட்டி", route: "/guide", color: "text-green-600 bg-green-50" },
                ].map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button key={idx} onClick={() => setLocation(action.route)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left">
                      <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{action.label}</span>
                      <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}