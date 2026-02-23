/**
 * Counselling Guide Page - Complete TNEA guidance
 */
import { useState } from "react";
import { BookOpen, ChevronDown, ChevronUp, FileText, Calendar, Phone, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const sections = [
    {
        icon: Calendar, title: "Important Dates", titleTa: "முக்கியமான தேதிகள்",
        content: [
            { item: "Online Registration", itemTa: "ஆன்லைன் பதிவு", detail: "April 15 – May 10, 2025", detailTa: "ஏப்ரல் 15 – மே 10, 2025" },
            { item: "Document Verification", itemTa: "ஆவண சரிபார்ப்பு", detail: "May 15 – June 5, 2025", detailTa: "மே 15 – ஜூன் 5, 2025" },
            { item: "Choice Filling Window", itemTa: "விருப்பு நிரப்பும் காலம்", detail: "June 10 – June 20, 2025", detailTa: "ஜூன் 10 – ஜூன் 20, 2025" },
            { item: "Round 1 Allotment", itemTa: "சுற்று 1 ஒதுக்கீடு", detail: "June 28, 2025", detailTa: "ஜூன் 28, 2025" },
            { item: "Confirmation / Fee Payment", itemTa: "உறுதிப்படுத்தல் / கட்டணம்", detail: "June 28 – July 5, 2025", detailTa: "ஜூன் 28 – ஜூலை 5, 2025" },
        ],
    },
    {
        icon: FileText, title: "Required Documents", titleTa: "தேவையான ஆவணங்கள்",
        content: [
            { item: "10th Mark Sheet & Certificate", itemTa: "10-ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்", detail: "Original + 2 photocopies", detailTa: "அசல் + 2 நகல்கள்" },
            { item: "12th Mark Sheet & Certificate", itemTa: "12-ஆம் வகுப்பு மதிப்பெண் சான்றிதழ்", detail: "Original + 3 photocopies", detailTa: "அசல் + 3 நகல்கள்" },
            { item: "Community / Caste Certificate", itemTa: "சமூக / சாதி சான்றிதழ்", detail: "Issued by Tahsildar, original", detailTa: "வட்டாட்சியரால் வழங்கப்பட்டது, அசல்" },
            { item: "Nativity Certificate", itemTa: "பூர்வீக சான்றிதழ்", detail: "For Tamil Nadu nativity proof", detailTa: "தமிழ்நாடு பூர்வீக சான்றுக்கு" },
            { item: "Income Certificate (if applicable)", itemTa: "வருமான சான்றிதழ் (பொருத்தமான)", detail: "For fee concession categories", detailTa: "கட்டண சலுகை வகைகளுக்கு" },
            { item: "Passport Photograph", itemTa: "பாஸ்போர்ட் புகைப்படம்", detail: "4 recent passport-size photos", detailTa: "4 சமீபத்திய பாஸ்போர்ட் புகைப்படங்கள்" },
            { item: "Aadhaar Card", itemTa: "ஆதார் அட்டை", detail: "Original + photocopy", detailTa: "அசல் + நகல்" },
        ],
    },
    {
        icon: AlertCircle, title: "Category Types & Reservations", titleTa: "வகைகள் மற்றும் இட ஒதுக்கீடு",
        content: [
            { item: "OC (Open Category)", itemTa: "OC (திறந்த வகை)", detail: "No reservation benefit", detailTa: "இட ஒதுக்கீடு இல்லை" },
            { item: "BC (Backward Class)", itemTa: "BC (பிற்படுத்தப்பட்ட வகுப்பு)", detail: "26.5% reservation", detailTa: "26.5% இட ஒதுக்கீடு" },
            { item: "BCM (BC Muslim)", itemTa: "BCM", detail: "3.5% reservation", detailTa: "3.5% இட ஒதுக்கீடு" },
            { item: "MBC (Most Backward Class)", itemTa: "MBC (மிகவும் பிற்படுத்தப்பட்ட)", detail: "20% reservation", detailTa: "20% இட ஒதுக்கீடு" },
            { item: "SC (Scheduled Caste)", itemTa: "SC (பட்டியல் சாதி)", detail: "15% reservation", detailTa: "15% இட ஒதுக்கீடு" },
            { item: "SCA (Scheduled Caste Arunthathiyar)", itemTa: "SCA", detail: "3% of SC quota", detailTa: "SC ஒதுக்கீட்டில் 3%" },
            { item: "ST (Scheduled Tribe)", itemTa: "ST (பட்டியல் பழங்குடியினர்)", detail: "1% reservation", detailTa: "1% இட ஒதுக்கீடு" },
        ],
    },
    {
        icon: Phone, title: "Help & Support", titleTa: "உதவி & ஆதரவு",
        content: [
            { item: "Anna University Helpline", itemTa: "அண்ணா பல்கலைக்கழக உதவி எண்", detail: "044-2235-7004 (Mon-Sat, 9AM-5PM)", detailTa: "044-2235-7004 (திங்கள்-சனி, காலை 9 – மாலை 5)" },
            { item: "TNEA Email Support", itemTa: "TNEA மின்னஞ்சல் ஆதரவு", detail: "tnea@annauniv.edu", detailTa: "tnea@annauniv.edu" },
            { item: "TNEA Insight Chatbot", itemTa: "TNEA Insight சாட்போட்", detail: "Bottom-right floating chat — 24/7 support in Tamil & English", detailTa: "கீழ்-வலது மூலையில் மிதக்கும் சாட்போட் — 24/7 ஆதரவு" },
        ],
    },
];

export default function CounsellingGuidePage() {
    const { language } = useLanguage();
    const [openSection, setOpenSection] = useState<number | null>(0);
    const en = language === "en";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-slate-900 to-green-900 text-white py-16 px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-green-200 mb-6">
                    <BookOpen className="w-4 h-4" />
                    {en ? "Bilingual • Tamil & English" : "இருமொழி • தமிழ் & ஆங்கிலம்"}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    {en ? "TNEA Counselling Guide" : "TNEA ஆலோசனை வழிகாட்டி"}
                </h1>
                <p className="text-green-200 text-lg max-w-2xl mx-auto">
                    {en ? "Everything you need to know about Tamil Nadu Engineering Admissions counselling process." : "தமிழ்நாடு பொறியியல் சேர்க்கை ஆலோசனை பற்றி தெரிய வேண்டியது அனைத்தும்."}
                </p>
            </section>

            {/* Sections */}
            <section className="max-w-4xl mx-auto px-4 py-16">
                <div className="space-y-4">
                    {sections.map((section, idx) => {
                        const Icon = section.icon;
                        const isOpen = openSection === idx;
                        return (
                            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <button
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                                    onClick={() => setOpenSection(isOpen ? null : idx)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Icon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <span className="font-bold text-gray-900 text-lg">{en ? section.title : section.titleTa}</span>
                                    </div>
                                    {isOpen ? <ChevronUp className="w-5 h-5 text-blue-500" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </button>
                                {isOpen && (
                                    <div className="border-t border-gray-100 overflow-hidden">
                                        {section.content.map((row, ridx) => (
                                            <div key={ridx} className={`flex flex-col md:flex-row md:items-center justify-between p-4 px-6 gap-2 ${ridx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                                <div className="font-medium text-gray-900">{en ? row.item : row.itemTa}</div>
                                                <div className="text-sm text-gray-500 md:text-right">{en ? row.detail : row.detailTa}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
