/**
 * About Page
 */
import { GraduationCap, Brain, Shield, Users, Globe, Award } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const team = [
    { name: "Dr. R. Anandhan", role: "Project Lead & AI Architect", roleTa: "திட்ட தலைவர் & AI கட்டமைப்பாளர்" },
    { name: "Ms. P. Kavitha", role: "UI/UX Designer", roleTa: "UI/UX வடிவமைப்பாளர்" },
    { name: "Mr. S. Vijayakumar", role: "Backend Engineer", roleTa: "பின்புற பொறியாளர்" },
    { name: "Ms. T. Deepika", role: "Data Scientist", roleTa: "தரவு விஞ்ஞானி" },
];

const values = [
    { icon: Shield, title: "Transparency", titleTa: "வெளிப்படைத்தன்மை", desc: "Every prediction and cutoff is backed by real data.", descTa: "ஒவ்வொரு கணிப்பும் வெட்டும் உண்மையான தரவால் ஆதரிக்கப்படுகிறது." },
    { icon: Globe, title: "Accessibility", titleTa: "அணுகல்", desc: "Fully bilingual Tamil & English for every student in Tamil Nadu.", descTa: "தமிழ்நாட்டில் ஒவ்வொரு மாணவருக்கும் முழுமையான இருமொழி." },
    { icon: Users, title: "Student-First", titleTa: "மாணவர் முதல்", desc: "Designed with rural students in mind — simple and guided.", descTa: "கிராமப்புற மாணவர்களை மனதில் வைத்து வடிவமைக்கப்பட்டது." },
    { icon: Brain, title: "AI for Good", titleTa: "நல்லதற்கு AI", desc: "AI that reduces confusion and improves admission transparency.", descTa: "குழப்பத்தை குறைத்து சேர்க்கை வெளிப்படைத்தன்மையை மேம்படுத்தும் AI." },
];

export default function AboutPage() {
    const { language } = useLanguage();
    const en = language === "en";

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-24 px-4 text-center">
                <div className="w-16 h-16 bg-blue-500/20 border border-blue-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <GraduationCap className="w-8 h-8 text-blue-300" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    {en ? "About TNEA Insight" : "TNEA Insight பற்றி"}
                </h1>
                <p className="text-blue-200 text-lg max-w-3xl mx-auto leading-relaxed">
                    {en
                        ? "TNEA Insight is an AI-powered government-grade counselling platform built to make Tamil Nadu Engineering Admissions transparent, accessible, and stress-free for every student."
                        : "TNEA Insight என்பது தமிழ்நாடு பொறியியல் சேர்க்கையை வெளிப்படையாகவும், அணுகக்கூடியதாகவும், மன அழுத்தமற்றதாகவும் மாற்ற கட்டமைக்கப்பட்ட AI-உதவியுடன் கூடிய அரசு தர ஆலோசனை தளம்."}
                </p>
            </section>

            {/* Mission */}
            <section className="py-20 max-w-5xl mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <div className="inline-block bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
                            {en ? "Our Mission" : "எங்கள் நோக்கம்"}
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 mb-5">
                            {en ? "Empowering Every Tamil Nadu Student" : "ஒவ்வொரு தமிழ்நாடு மாணவரையும் உசர்த்துதல்"}
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            {en
                                ? "We believe every student — urban or rural, Tamil-speaking or English-speaking — deserves equal access to clear, unbiased counselling guidance. TNEA Insight bridges the information gap with AI-powered predictions, verified data, and step-by-step guidance in Tamil and English."
                                : "நகர்ப்புற அல்லது கிராமப்புற, தமிழ் அல்லது ஆங்கிலம் பேசுபவர் — ஒவ்வொரு மாணவரும் தெளிவான, சாரமான ஆலோசனை வழிகாட்டலுக்கு சம அணுகலுக்கு தகுதியுடையவர் என்று நம்புகிறோம்."}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[{ label: en ? "Colleges" : "கல்லூரிகள்", value: "542+" }, { label: en ? "Students Helped" : "உதவிய மாணவர்கள்", value: "1.25L+" }, { label: en ? "AI Accuracy" : "AI துல்லியம்", value: "94%" }, { label: en ? "Years of Data" : "தரவு ஆண்டுகள்", value: "5+" }].map((s, i) => (
                            <div key={i} className="bg-blue-50 rounded-2xl p-6 text-center">
                                <div className="text-3xl font-extrabold text-blue-700">{s.value}</div>
                                <div className="text-sm text-gray-600 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-gray-50 py-20">
                <div className="max-w-5xl mx-auto px-4">
                    <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
                        {en ? "Our Values" : "எங்கள் மதிப்புகள்"}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {values.map((v, idx) => {
                            const Icon = v.icon;
                            return (
                                <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex gap-5">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Icon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 mb-1">{en ? v.title : v.titleTa}</h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">{en ? v.desc : v.descTa}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-20 max-w-5xl mx-auto px-4">
                <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
                    {en ? "The Team" : "குழு"}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {team.map((member, idx) => (
                        <div key={idx} className="text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                                <span className="text-2xl font-extrabold text-white">{member.name.charAt(0)}</span>
                            </div>
                            <h3 className="font-bold text-gray-900 text-sm">{member.name}</h3>
                            <p className="text-gray-500 text-xs mt-1">{en ? member.role : member.roleTa}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
