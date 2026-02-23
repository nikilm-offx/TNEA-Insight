/**
 * Step 1: Registration
 * Student profile and academic details
 */

import { Mail, User, Calendar, MapPin, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface RegistrationStepProps {
  onContinue: () => void;
}

export default function RegistrationStep({ onContinue }: RegistrationStepProps) {
  const { language } = useLanguage();

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            {language === "en" ? "Personal Information" : "ஆளுயர் தகவல்"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Full Name" : "முழு பெயர்"}
              </label>
              <input
                type="text"
                placeholder={language === "en" ? "John Doe" : "ஜான் டோ"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Date of Birth" : "பிறந்த தேதி"}
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Email" : "மின்னஞ்சல்"}
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Phone" : "தொலைபேசி"}
              </label>
              <input
                type="tel"
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Academic Details */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            {language === "en" ? "Academic Details" : "கல்வி விபரங்கள்"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "12th Marks" : "12ம் வகுப்பு மதிப்பெண்கள்"}
              </label>
              <input
                type="number"
                placeholder="90"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Stream" : "விளக்கம்"}
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option>{language === "en" ? "Select" : "தேர்ந்தெடுக்கவும்"}</option>
                <option>{language === "en" ? "Science" : "அறிவியல்"}</option>
                <option>{language === "en" ? "Commerce" : "வணிகம்"}</option>
                <option>{language === "en" ? "Arts" : "கலைகள்"}</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Category" : "வகை"}
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
                <option>{language === "en" ? "Select Category" : "வகையை தேர்ந்தெடுக்கவும்"}</option>
                <option>{language === "en" ? "General" : "பொதுவ"}</option>
                <option>{language === "en" ? "SC" : "SC"}</option>
                <option>{language === "en" ? "ST" : "ST"}</option>
                <option>{language === "en" ? "OBC" : "OBC"}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            {language === "en" ? "Location" : "இருப்பிடம்"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "District" : "மாவட்டம்"}
              </label>
              <input
                type="text"
                placeholder={language === "en" ? "Chennai" : "சென்னை"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "State" : "மாநிலம்"}
              </label>
              <input
                type="text"
                placeholder={language === "en" ? "Tamil Nadu" : "தமிழ் நாடு"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Auto-save Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          {language === "en"
            ? "✓ Your information is auto-saved as you fill the form"
            : "✓ நீங்கள் படிவத்தை நிரப்புவதால் உங்கள் தகவல் தானாகவே சேமிக்கப்படுதல்"}
        </p>
      </div>
    </div>
  );
}
