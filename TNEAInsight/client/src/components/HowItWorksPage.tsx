/**
 * How It Works Page - Detailed TNEA counselling process guide
 */
import { useLocation } from "wouter";
import { User, FileCheck, BarChart3, BookOpen, Award, CreditCard, GraduationCap, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const steps = [
    {
        num: "01", icon: User, color: "bg-blue-600", lightColor: "bg-blue-50", textColor: "text-blue-600",
        title: "Online Registration", titleTa: "ஆன்லைன் பதிவு",
        desc: "Create your TNEA Insight account and fill in your student profile including personal details, academic marks (10th, 12th), category, and nativity information.",
        descTa: "உங்கள் TNEA Insight கணக்கை உருவாக்கி தனிப்பட்ட விவரங்கள், கல்வி மதிப்பெண்கள் (10, 12), வகை மற்றும் பூர்வீக தகவல்களை நிரப்புங்கள்.",
        bullets: ["Student profile form", "Academic details (10th, 12th marks)", "Category & nativity input", "Application fee payment"],
        bulletsTa: ["மாணவர் சுயவிவர படிவம்", "கல்வி விவரங்கள் (10, 12 மதிப்பெண்கள்)", "வகை மற்றும் பூர்வீக உள்ளீடு", "விண்ணப்பக் கட்டணம்"],
    },
    {
        num: "02", icon: FileCheck, color: "bg-indigo-600", lightColor: "bg-indigo-50", textColor: "text-indigo-600",
        title: "Document Verification", titleTa: "ஆவண சரிபார்ப்பு",
        desc: "Upload your certificates manually or use DigiLocker for instant government-verified document authentication. Get real-time verification status and mismatch alerts.",
        descTa: "உங்கள் சான்றிதழ்களை கைமுறையாக பதிவேற்றவோ அல்லது டிஜிலாக்கர் மூலம் உடனடி சரிபார்ப்பு பெறவும். நிஜநேர சரிபார்ப்பு நிலை மற்றும் முரண்பாடு எச்சரிக்கைகள் பெறுங்கள்.",
        bullets: ["Upload 10th, 12th, Community certificates", "DigiLocker instant verification", "Nativity & transfer certificates", "Real-time status badge"],
        bulletsTa: ["10, 12, சமூக சான்றிதழ்கள் பதிவேற்றம்", "டிஜிலாக்கர் உடனடி சரிபார்ப்பு", "பூர்வீக மற்றும் இடமாற்று சான்றிதழ்கள்", "நிஜநேர நிலை பேட்ஜ்"],
    },
    {
        num: "03", icon: BarChart3, color: "bg-violet-600", lightColor: "bg-violet-50", textColor: "text-violet-600",
        title: "Rank & Cutoff Analysis", titleTa: "தரம் & வெட்டு பகுப்பாய்வு",
        desc: "View your calculated cutoff mark, category rank, and historical comparison. AI classifies your college options into Safe, Target, and Dream categories.",
        descTa: "உங்கள் கணக்கிடப்பட்ட வெட்டு மதிப்பு, வகை தரம் மற்றும் வரலாற்று ஒப்பீட்டை பாருங்கள். AI உங்கள் கல்லூரி விருப்பங்களை பாதுகாப்பு, இலக்கு, கனவு என வகைப்படுத்தும்.",
        bullets: ["Calculated cutoff & category rank", "Historical cutoff comparison charts", "AI probability prediction (94% accuracy)", "Safe / Target / Dream college classification"],
        bulletsTa: ["கணக்கிடப்பட்ட வெட்டு & வகை தரம்", "வரலாற்று வெட்டு ஒப்பீடு விளக்கப்படங்கள்", "AI நிகழ்தகவு கணிப்பு (94% துல்லியம்)", "பாதுகாப்பு / இலக்கு / கனவு வகைப்பாடு"],
    },
    {
        num: "04", icon: BookOpen, color: "bg-purple-600", lightColor: "bg-purple-50", textColor: "text-purple-600",
        title: "Choice Filling", titleTa: "விருப்ப முறை நிரப்புதல்",
        desc: "Use our searchable college database with filters for district, branch, fees, and accreditation. Drag-and-drop to order preferences with AI suggestions and probability bars.",
        descTa: "மாவட்டம், கிளை, கட்டணம் மற்றும் அங்கீகாரத்திற்கான வடிகட்டிகளுடன் தேடக்கூடிய கல்லூரி தரவுத்தளத்தை பயன்படுத்துங்கள்.",
        bullets: ["Searchable database of 542+ colleges", "Filter by district, branch, fees, rank", "Drag-and-drop preference ordering", "AI suggestion highlights & probability bars"],
        bulletsTa: ["542+ கல்லூரிகளின் தேடக்கூடிய தரவுத்தளம்", "மாவட்டம், கிளை, கட்டணம், தரம் வடிகட்டல்", "இழுத்து-விடு விருப்பு வரிசை", "AI பரிந்துரை மற்றும் நிகழ்தகவு பட்டைகள்"],
    },
    {
        num: "05", icon: Award, color: "bg-pink-600", lightColor: "bg-pink-50", textColor: "text-pink-600",
        title: "Seat Allotment", titleTa: "இருக்கை ஒதுக்கீடு",
        desc: "Before official results, see your predicted allotment probability. After the official result, compare your predicted vs actual allotment with clear highlights.",
        descTa: "அதிகாரப்பூர்வ முடிவுகளுக்கு முன், உங்கள் கணிக்கப்பட்ட ஒதுக்கீடு நிகழ்தகவை பாருங்கள்.",
        bullets: ["Pre-result allotment probability", "Expected college based on rank", "Official result display", "Predicted vs actual comparison"],
        bulletsTa: ["முடிவுக்கு முந்திய ஒதுக்கீடு நிகழ்தகவு", "தரம் அடிப்படையில் எதிர்பார்க்கப்படும் கல்லூரி", "அதிகாரப்பூர்வ முடிவு காட்சி", "கணிக்கப்பட்டதுடன் ஒப்பீடு"],
    },
    {
        num: "06", icon: CreditCard, color: "bg-rose-600", lightColor: "bg-rose-50", textColor: "text-rose-600",
        title: "Seat Confirmation", titleTa: "இருக்கை உறுதிப்படுத்தல்",
        desc: "Choose from four options: Accept & Join, Accept & Apply for Upward Move, Decline & Participate Again, or Exit Counselling. Complete fee payment online.",
        descTa: "நான்கு விருப்பங்களிலிருந்து தேர்வு செய்யுங்கள்: ஏற்று சேருங்கள், மேல்நோக்கி முயல்வும், மறுத்து மீண்டும் பங்கேற்கவும், அல்லது ஆலோசனையிலிருந்து வெளியேறவும்.",
        bullets: ["Accept & Join college", "Accept & Apply for Upward Move", "Decline & Participate in next round", "Exit Counselling with fee refund info"],
        bulletsTa: ["ஏற்று கல்லூரியில் சேருங்கள்", "ஏற்று மேல்நோக்கி விண்ணப்பிக்கவும்", "மறுத்து அடுத்த சுற்றில் பங்கேற்கவும்", "கட்டண திரும்பப்பெறும் தகவலுடன் வெளியேறவும்"],
    },
    {
        num: "07", icon: GraduationCap, color: "bg-orange-600", lightColor: "bg-orange-50", textColor: "text-orange-600",
        title: "College Admission", titleTa: "கல்லூரி சேர்க்கை",
        desc: "Get your reporting date, required documents checklist, college contact info, and map directions. Download your provisional allotment letter directly.",
        descTa: "உங்கள் அறிக்கை தேதி, தேவையான ஆவணங்கள் சரிபட்டியல், கல்லூரி தொடர்பு தகவல் மற்றும் வரைபட திசைகளைப் பெறுங்கள்.",
        bullets: ["Reporting date & time", "Required documents checklist (20+ items)", "College contact info & location map", "Download provisional allotment letter"],
        bulletsTa: ["அறிக்கை தேதி மற்றும் நேரம்", "தேவையான ஆவணங்கள் சரிபட்டியல் (20+ பொருட்கள்)", "கல்லூரி தொடர்பு மற்றும் இடம் வரைபடம்", "தற்காலிக ஒதுக்கீடு கடிதம் பதிவிறக்கம்"],
    },
];

export default function HowItWorksPage() {
    const { language } = useLanguage();
    const [, setLocation] = useLocation();
    const en = language === "en";

    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-20 px-4 text-center">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    {en ? "How TNEA Insight Works" : "TNEA Insight எப்படி செயல்படுகிறது"}
                </h1>
                <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                    {en ? "A complete 7-step counselling journey — from registration to college admission, all in one platform." : "பதிவிலிருந்து சேர்க்கை வரை ஒரே தளத்தில் 7-படி முழுமையான ஆலோசனை பயணம்."}
                </p>
            </section>

            {/* Steps */}
            <section className="py-20 max-w-5xl mx-auto px-4">
                <div className="space-y-12">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div key={idx} className={`flex flex-col md:flex-row gap-8 ${idx % 2 === 1 ? "md:flex-row-reverse" : ""}`}>
                                {/* Icon Column */}
                                <div className="flex-shrink-0 flex flex-col items-center">
                                    <div className={`w-16 h-16 ${step.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    {idx < steps.length - 1 && <div className="w-0.5 h-12 bg-gray-200 mt-4" />}
                                </div>

                                {/* Content */}
                                <div className={`flex-1 ${step.lightColor} rounded-2xl p-8 border border-gray-100`}>
                                    <div className={`text-xs font-bold uppercase tracking-widest ${step.textColor} mb-2`}>
                                        {en ? `Step ${step.num}` : `படி ${step.num}`}
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
                                        {en ? step.title : step.titleTa}
                                    </h3>
                                    <p className="text-gray-600 mb-5 leading-relaxed">
                                        {en ? step.desc : step.descTa}
                                    </p>
                                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {(en ? step.bullets : step.bulletsTa).map((b, i) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                                                <CheckCircle className={`w-4 h-4 ${step.textColor} flex-shrink-0`} />
                                                {b}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* CTA */}
            <section className="bg-blue-600 text-white py-16 text-center">
                <h2 className="text-3xl font-extrabold mb-4">
                    {en ? "Ready to Begin?" : "தொடங்க தயாரா?"}
                </h2>
                <p className="text-blue-100 mb-8">
                    {en ? "Start your TNEA counselling journey with AI guidance." : "AI வழிகாட்டலுடன் உங்கள் TNEA ஆலோசனை பயணத்தை தொடங்குங்கள்."}
                </p>
                <Button onClick={() => setLocation("/")} className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8">
                    {en ? "Get Started" : "தொடங்குங்கள்"} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
            </section>
        </div>
    );
}
