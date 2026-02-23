/**
 * Contact Page
 */
import { useState } from "react";
import { Phone, Mail, MapPin, MessageSquare, Clock, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
    const { language } = useLanguage();
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);
    const en = language === "en";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await new Promise(r => setTimeout(r, 800));
        setSubmitted(true);
    };

    const contactItems = [
        { icon: Phone, title: en ? "Phone Support" : "தொலைபேசி ஆதரவு", info: "044-2235-7004", sub: en ? "Mon–Sat, 9 AM – 6 PM" : "திங்கள்–சனி, காலை 9 – மாலை 6" },
        { icon: Mail, title: en ? "Email Support" : "மின்னஞ்சல் ஆதரவு", info: "support@tneainsight.edu.in", sub: en ? "Response within 24 hours" : "24 மணி நேரத்தில் பதில்" },
        { icon: MapPin, title: en ? "Office Address" : "அலுவலக முகவரி", info: "Anna University, Sardar Patel Road", sub: en ? "Chennai, Tamil Nadu 600025" : "சென்னை, தமிழ்நாடு 600025" },
        { icon: Clock, title: en ? "TNEA Helpline" : "TNEA உதவி எண்", info: "1800-425-5566 (Toll Free)", sub: en ? "During counselling season only" : "ஆலோசனை காலத்தில் மட்டும்" },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="bg-gradient-to-br from-slate-900 to-blue-900 text-white py-16 px-4 text-center">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm text-blue-200 mb-6">
                    <MessageSquare className="w-4 h-4" />
                    {en ? "We're here to help" : "நாங்கள் உதவ இங்கே இருக்கிறோம்"}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    {en ? "Contact Us" : "தொடர்பு கொள்ளுங்கள்"}
                </h1>
                <p className="text-blue-200 text-lg max-w-2xl mx-auto">
                    {en ? "Have questions about TNEA counselling or TNEA Insight? Our team is ready to help." : "TNEA ஆலோசனை அல்லது TNEA Insight பற்றி கேள்விகள் இருக்கிறதா? எங்கள் குழு உதவ தயாராக உள்ளது."}
                </p>
            </section>

            <section className="max-w-6xl mx-auto px-4 py-16">
                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-8">
                            {en ? "Get in Touch" : "தொடர்பு கொள்ளுங்கள்"}
                        </h2>
                        <div className="space-y-5">
                            {contactItems.map((item, idx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={idx} className="flex items-start gap-4 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                            <p className="text-blue-700 font-medium text-sm">{item.info}</p>
                                            <p className="text-gray-400 text-xs mt-0.5">{item.sub}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        {submitted ? (
                            <div className="text-center py-12">
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                <h3 className="text-2xl font-extrabold text-gray-900 mb-2">
                                    {en ? "Message Sent!" : "செய்தி அனுப்பப்பட்டது!"}
                                </h3>
                                <p className="text-gray-500">
                                    {en ? "We'll get back to you within 24 hours." : "24 மணி நேரத்தில் பதிலளிப்போம்."}
                                </p>
                                <Button className="mt-6" onClick={() => setSubmitted(false)}>
                                    {en ? "Send Another" : "மற்றொன்று அனுப்பவும்"}
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <h2 className="text-xl font-bold text-gray-900 mb-2">{en ? "Send a Message" : "செய்தி அனுப்புங்கள்"}</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{en ? "Full Name" : "முழு பெயர்"}</label>
                                        <input required type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                                            value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{en ? "Email" : "மின்னஞ்சல்"}</label>
                                        <input required type="email" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                                            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{en ? "Subject" : "பொருள்"}</label>
                                    <input required type="text" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm"
                                        value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{en ? "Message" : "செய்தி"}</label>
                                    <textarea required rows={5} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-sm resize-none"
                                        value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                                </div>
                                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">
                                    {en ? "Send Message" : "செய்தி அனுப்புங்கள்"} <Send className="ml-2 w-4 h-4" />
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
