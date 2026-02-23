/**
 * Landing Page Component - Premium Government-Grade Design
 * Public-facing interface showcasing TNEA Insight
 */

import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  ArrowRight, Brain, CheckCircle, BarChart3, MessageSquare, Zap,
  GraduationCap, Shield, Users, TrendingUp, Star, ChevronDown,
  ChevronUp, MapPin, Clock, Award, BookOpen, FileCheck, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import LoginModal from "./LoginModal";

/* ─────────── counters ─────────── */
function useCountUp(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStarted(true); }, { threshold: 0.4 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(t);
  }, [started, target, duration]);
  return { count, ref };
}

function StatCounter({ value, label, suffix = "" }: { value: number; label: string; suffix?: string }) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold text-white">{count.toLocaleString()}{suffix}</div>
      <div className="text-blue-200 mt-1 text-sm font-medium">{label}</div>
    </div>
  );
}

/* ─────────── data ─────────── */
const features = [
  { icon: Brain, title: "AI-Powered College Prediction", titleTa: "AI கல்லூரி கணிப்பு", desc: "Advanced ML algorithms predict your admission chances with 94% accuracy.", descTa: "94% துல்லியத்துடன் உங்கள் சேர்க்கை வாய்ப்புகளை AI கணிக்கும்." },
  { icon: CheckCircle, title: "DigiLocker Verification", titleTa: "டிஜிலாக்கர் சரிபார்ப்பு", desc: "Instant, secure certificate verification with government DigiLocker integration.", descTa: "அரசு டிஜிலாக்கருடன் உடனடி சான்றிதழ் சரிபார்ப்பு." },
  { icon: BarChart3, title: "Cutoff & Rank Analysis", titleTa: "வெட்டு மதிப்பு பகுப்பாய்வு", desc: "Historical cutoff trends and real-time rank comparison across all TNEA branches.", descTa: "அனைத்து கிளைகளிலும் வரலாற்று வெட்டு போக்குகள் மற்றும் நிஜநேர ஒப்பீடு." },
  { icon: Search, title: "Smart Choice Filling", titleTa: "ஸ்மார்ட் தேர்வு நிரப்புதல்", desc: "Drag-and-drop preference ordering with AI suggestions and probability indicators.", descTa: "AI பரிந்துரைகள் மற்றும் நிகழ்தகவு காட்டிகளுடன் இழுத்து-விடு வரிசை." },
  { icon: Shield, title: "Secure & Private", titleTa: "பாதுகாப்பான & தனியுரிமை", desc: "JWT-secured sessions, end-to-end encryption, and TANCA compliance.", descTa: "JWT-பாதுகாப்பு, முழு குறியாக்கம் மற்றும் TANCA இணக்கம்." },
  { icon: MessageSquare, title: "24/7 AI Chatbot", titleTa: "24/7 AI சாட்போட்", desc: "Context-aware chatbot guidance in Tamil & English throughout your counselling journey.", descTa: "தமிழ் மற்றும் ஆங்கிலத்தில் சூழல்-விழிப்புணர்வு சாட்போட் வழிகாட்டல்." },
];

const steps = [
  { num: "01", icon: Users, title: "Registration", titleTa: "பதிவு", desc: "Profile, academics, category & fee payment", descTa: "சுயவிவரம், கல்வி, வகை மற்றும் கட்டணம்", color: "from-blue-500 to-blue-700" },
  { num: "02", icon: FileCheck, title: "Doc Verification", titleTa: "ஆவண சரிபார்ப்பு", desc: "Upload or verify via DigiLocker with real-time status", descTa: "டிஜிலாக்கர் மூலம் நிஜநேர நிலை சரிபார்ப்பு", color: "from-indigo-500 to-indigo-700" },
  { num: "03", icon: BarChart3, title: "Rank & Cutoff", titleTa: "தரம் & வெட்டு", desc: "See your rank, Safe/Target/Dream classifications", descTa: "தரம், பாதுகாப்பு/இலக்கு/கனவு வகைப்பாடு", color: "from-violet-500 to-violet-700" },
  { num: "04", icon: BookOpen, title: "Choice Filling", titleTa: "விருப்ப முறை", desc: "AI-guided drag-drop college preference ordering", descTa: "AI-வழிகாட்டிய கல்லூரி விருப்பு வரிசை", color: "from-purple-500 to-purple-700" },
  { num: "05", icon: Award, title: "Seat Allotment", titleTa: "இருக்கை ஒதுக்கீடு", desc: "Predicted & official allotment with comparison", descTa: "கணிக்கப்பட்ட மற்றும் அதிகாரப்பூர்வ ஒதுக்கீடு", color: "from-pink-500 to-pink-700" },
  { num: "06", icon: CheckCircle, title: "Confirmation", titleTa: "உறுதிப்படுத்தல்", desc: "Accept, upward move, decline or exit with fee payment", descTa: "ஏற்பு, மேல்நோக்கி, நிராகரணம் அல்லது வெளியேறு", color: "from-rose-500 to-rose-700" },
  { num: "07", icon: GraduationCap, title: "Admission", titleTa: "சேர்க்கை", desc: "Reporting date, documents checklist & college map", descTa: "அறிக்கை தேதி, ஆவணங்கள் சரிபட்டியல் & வரைபடம்", color: "from-orange-500 to-orange-700" },
];

const faqs = [
  { q: "What is TNEA?", qTa: "TNEA என்றால் என்ன?", a: "Tamil Nadu Engineering Admissions (TNEA) is the state-level counselling process for engineering college admissions in Tamil Nadu, conducted by Anna University.", aTa: "TNEA என்பது தமிழ்நாட்டில் பொறியியல் கல்லூரி சேர்க்கைக்கான மாநில அளவிலான ஆலோசனை செயல்முறை." },
  { q: "Is TNEA Insight free?", qTa: "TNEA Insight இலவசமா?", a: "Yes, all public features including the college predictor and cutoff analysis are completely free. Advanced features are available after registration.", aTa: "ஆம், கல்லூரி கணிப்பி மற்றும் வெட்டு பகுப்பாய்வு உட்பட அனைத்து பொது சேவைகளும் முற்றிலும் இலவசம்." },
  { q: "How accurate is the AI prediction?", qTa: "AI கணிப்பு எவ்வளவு துல்லியமானது?", a: "Our AI model is trained on 5 years of historical TNEA data achieving 94% accuracy in seat allotment prediction based on cutoff and rank data.", aTa: "எங்கள் AI மாதிரி 5 ஆண்டு வரலாற்று TNEA தரவில் பயிற்றுவிக்கப்பட்டு 94% துல்லியம் அடைகிறது." },
  { q: "What is DigiLocker verification?", qTa: "டிஜிலாக்கர் சரிபார்ப்பு என்றால் என்ன?", a: "DigiLocker is India's official digital document wallet. TNEA Insight integrates with it so you can verify your certificates instantly without physical submission.", aTa: "டிஜிலாக்கர் இந்தியாவின் அதிகாரப்பூர்வ டிஜிட்டல் ஆவண பணப்பை. இதன் மூலம் சான்றிதழ்களை உடனடியாக சரிபார்க்கலாம்." },
  { q: "Can I use it in Tamil?", qTa: "தமிழில் பயன்படுத்தலாமா?", a: "Yes! TNEA Insight is fully bilingual. Toggle between Tamil and English at any time using the language button in the top navigation bar.", aTa: "ஆம்! TNEA Insight முழுமையாக இருமொழியில் உள்ளது. மேல் வழிசாரல் பட்டியில் பொத்தானை கிளிக் செய்து மாற்றவும்." },
];

/* ─────────── main component ─────────── */
export default function LandingPage() {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const en = language === "en";

  const handleGetStarted = () => {
    if (isAuthenticated) setLocation("/dashboard");
    else setLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-24 md:py-36 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 text-sm font-medium text-blue-200 mb-8 backdrop-blur">
            <Shield className="w-4 h-4" />
            {en ? "Official TNEA Counselling Partner" : "அதிகாரப்பூர்வ TNEA ஆலோசனை பங்காளி"}
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            {en ? (
              <>TNEA <span className="text-blue-400">Insight</span></>
            ) : (
              <>TNEA <span className="text-blue-400">கண்ணோட்டம்</span></>
            )}
          </h1>

          <p className="text-xl md:text-2xl text-blue-200 max-w-3xl mx-auto mb-4 font-medium">
            {en
              ? "Intelligent College Counselling for Tamil Nadu Engineering Admissions"
              : "தமிழ்நாடு பொறியியல் சேர்க்கைக்கான அறிவுள்ள கல்லூரி ஆலோசனை"}
          </p>
          <p className="text-base text-blue-300 max-w-2xl mx-auto mb-12">
            {en
              ? "AI predictions · DigiLocker verification · Smart choice filling · Real-time allotment tracking"
              : "AI கணிப்புகள் · டிஜிலாக்கர் சரிபார்ப்பு · ஸ்மார்ட் தேர்வு நிரப்புதல் · நிஜநேர ஒதுக்கீடு"}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-blue-800 hover:bg-blue-50 font-bold px-8 py-4 text-base rounded-xl shadow-xl hover:shadow-2xl transition-all duration-200 hover:-translate-y-0.5"
            >
              {en ? "Start Your TNEA Journey" : "உங்கள் TNEA பயணத்தை தொடங்குங்கள்"} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/how-it-works")}
              className="border-2 border-white/40 text-white hover:bg-white/10 font-medium px-8 py-4 text-base rounded-xl backdrop-blur transition-all duration-200"
            >
              {en ? "How It Works" : "எப்படி செயல்படுகிறது"}
            </Button>
          </div>

          {/* Trust bar */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-blue-300">
            {[
              { icon: Shield, text: en ? "TANCA Compliant" : "TANCA இணக்கம்" },
              { icon: GraduationCap, text: en ? "542+ Colleges" : "542+ கல்லூரிகள்" },
              { icon: Users, text: en ? "1.25L+ Students" : "1.25 லட்சம்+ மாணவர்கள்" },
              { icon: Star, text: en ? "94% AI Accuracy" : "94% AI துல்லியம்" },
            ].map(({ icon: Icon, text }: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-blue-400" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gradient-to-r from-blue-700 to-blue-900 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            <StatCounter value={542} suffix="+" label={en ? "Participating Colleges" : "கல்லூரிகள்"} />
            <StatCounter value={125000} suffix="+" label={en ? "Students Counselled" : "மாணவர்கள்"} />
            <StatCounter value={94} suffix="%" label={en ? "AI Accuracy" : "AI துல்லியம்"} />
            <StatCounter value={7} suffix="" label={en ? "Step Journey" : "படி பயணம்"} />
          </div>
        </div>
      </section>

      {/* ── 7-STEP JOURNEY ── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              {en ? "The Complete Journey" : "முழுமையான பயணம்"}
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900">
              {en ? "7-Step TNEA Counselling Workflow" : "7-படி TNEA ஆலோசனை பணியோட்டம்"}
            </h2>
            <p className="text-gray-500 mt-4 max-w-xl mx-auto">
              {en ? "Every step guided by AI — from registration to college admission." : "பதிவிலிருந்து சேர்க்கை வரை ஒவ்வொரு படியும் AI-வழிகாட்டல்."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            {steps.map((step: any, idx: number) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative group">
                  <div className={`bg-gradient-to-br ${step.color} rounded-2xl p-5 text-white flex flex-col gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer min-h-[200px]`}>
                    <div className="flex items-start justify-between">
                      <span className="text-3xl font-black opacity-30">{step.num}</span>
                      <div className="bg-white/20 rounded-xl p-2">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-base leading-tight">{en ? step.title : step.titleTa}</h3>
                      <p className="text-white/75 text-xs mt-1 leading-relaxed">{en ? step.desc : step.descTa}</p>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="hidden xl:block absolute top-1/2 -right-2 w-4 h-0.5 bg-gray-300 z-10" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center mt-12">
            <Button
              onClick={() => setLocation("/how-it-works")}
              variant="outline"
              className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-semibold"
            >
              {en ? "Explore Full Process" : "முழு செயல்முறையை ஆராயுங்கள்"} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-block bg-green-100 text-green-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
              {en ? "Why TNEA Insight" : "TNEA Insight ஏன்?"}
            </div>
            <h2 className="text-4xl font-extrabold text-gray-900">
              {en ? "Everything You Need to Succeed" : "வெற்றிக்கு தேவையான அனைத்தும்"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f: any, idx: number) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="group bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-600 transition-colors">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{en ? f.title : f.titleTa}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{en ? f.desc : f.descTa}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── COLLEGE PREDICTOR TEASER ── */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-block bg-white/10 border border-white/20 text-blue-200 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur">
            {en ? "Try it for free — no login required" : "இலவசமாக முயற்சிக்கவும் — உள்நுழைவு தேவையில்லை"}
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            {en ? "Check Your College Chances" : "உங்கள் கல்லூரி வாய்ப்புகளை சரிபார்க்கவும்"}
          </h2>
          <p className="text-blue-200 text-lg mb-10 max-w-2xl mx-auto">
            {en
              ? "Enter your marks and category to instantly get Safe, Target & Dream college predictions powered by AI."
              : "உங்கள் மதிப்பெண்கள் மற்றும் வகையை உள்ளிட்டு AI-உதவியுடன் உடனடியாக பாதுகாப்பு, இலக்கு மற்றும் கனவு கல்லூரி கணிப்புகளைப் பெறுங்கள்."}
          </p>
          <Button
            size="lg"
            onClick={() => setLocation("/college-predictor")}
            className="bg-white text-blue-800 hover:bg-blue-50 font-bold px-10 py-4 text-base rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
          >
            {en ? "Try College Predictor" : "கல்லூரி கணிப்பியை முயற்சிக்கவும்"} <TrendingUp className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900">
              {en ? "Frequently Asked Questions" : "அடிக்கடி கேட்கப்படும் கேள்விகள்"}
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 flex justify-between items-center font-semibold text-gray-900 hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span>{en ? faq.q : faq.qTa}</span>
                  {openFaq === idx ? <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-3">
                    {en ? faq.a : faq.aTa}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            {en ? "Ready to Start Your TNEA Journey?" : "TNEA பயணத்தை தொடங்க தயாரா?"}
          </h2>
          <p className="text-blue-200 text-lg mb-10">
            {en
              ? "Join 1.25 lakh+ students who navigated TNEA counselling with confidence."
              : "நம்பிக்கையுடன் TNEA ஆலோசனையை கடந்த 1.25 லட்சம்+ மாணவர்களுடன் சேரவும்."}
          </p>
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-10 py-4 text-base rounded-xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
          >
            {en ? "Get Started — It's Free" : "தொடங்குங்கள் — இலவசம்"} <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-950 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold">TNEA Insight</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                {en
                  ? "Government-grade AI platform for TNEA counselling. Helping Tamil Nadu students since 2024."
                  : "TNEA ஆலோசனைக்கான அரசு தர AI தளம். 2024 முதல் தமிழ்நாடு மாணவர்களுக்கு உதவுகிறது."}
              </p>
              <div className="flex items-center gap-3 mt-6 text-sm text-gray-400">
                <MapPin className="w-4 h-4" />
                <span>Anna University, Chennai, Tamil Nadu</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{en ? "Support: 9 AM – 6 PM (Mon–Sat)" : "ஆதரவு: காலை 9 – மாலை 6 (திங்கள்–சனி)"}</span>
              </div>
            </div>

            {[
              { heading: en ? "Process" : "செயல்முறை", links: [en ? "How It Works" : "எப்படி செயல்படுகிறது", en ? "Step Guide" : "படி வழிகாட்டி", en ? "Timeline" : "காலவரிசை"] },
              { heading: en ? "Tools" : "கருவிகள்", links: [en ? "College Predictor" : "கல்லூரி கணிப்பி", en ? "Cutoff Analysis" : "வெட்டு பகுப்பாய்வு", en ? "Rank Calculator" : "தரம் கணிப்பாளர்"] },
              { heading: en ? "Support" : "உதவி", links: [en ? "Counselling Guide" : "ஆலோசனை வழிகாட்டி", en ? "FAQ" : "FAQ", en ? "Contact Us" : "தொடர்பு கொள்ளுங்கள்"] },
            ].map((col: any, i: number) => (
              <div key={i}>
                <h4 className="font-semibold text-white mb-4">{col.heading}</h4>
                <ul className="space-y-2">
                  {col.links.map((link: string, j: number) => (
                    <li key={j} className="text-gray-400 hover:text-white cursor-pointer text-sm transition-colors">{link}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <p>© 2026 TNEA Insight. {en ? "All rights reserved." : "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."}</p>
            <div className="flex gap-6">
              <span className="hover:text-white cursor-pointer">{en ? "Privacy Policy" : "தனியுரிமை கொள்கை"}</span>
              <span className="hover:text-white cursor-pointer">{en ? "Terms of Service" : "சேவை விதிமுறைகள்"}</span>
              <span className="hover:text-white cursor-pointer">{en ? "Accessibility" : "அணுகல்"}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      {loginModalOpen && <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />}
    </div>
  );
}
