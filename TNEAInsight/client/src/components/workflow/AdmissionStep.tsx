/**
 * Step 7: Final Admission
 * Completion, reporting requirements, and next steps
 */

import { CheckCircle, MapPin, Calendar, FileText, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdmissionStepProps {}

export default function AdmissionStep({}: AdmissionStepProps) {
  const { language } = useLanguage();

  const requirements = [
    {
      title: "10th Certificate",
      titleTamil: "10ம் சான்றிதழ்",
      required: true,
    },
    {
      title: "12th Certificate",
      titleTamil: "12ம் சான்றிதழ்",
      required: true,
    },
    {
      title: "Conduct Certificate",
      titleTamil: "நடத்தை சான்றிதழ்",
      required: true,
    },
    {
      title: "Medical Certificate",
      titleTamil: "மருத்துவ சான்றிதழ்",
      required: false,
    },
    {
      title: "Aadhar Card",
      titleTamil: "ஆதார் கார்டு",
      required: true,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Success Message */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8 border-l-4 border-green-600 text-center">
        <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {language === "en" ? "Congratulations!" : "வாழ்த்துக்கள்!"}
        </h2>
        <p className="text-gray-600 mb-2">
          {language === "en"
            ? "You have successfully confirmed your seat"
            : "நீங்கள் வெற்றிகரமாக உங்கள் இருக்கையை உறுதிப்படுத்தினீர்கள்"}
        </p>
        <p className="text-lg font-bold text-green-600">
          {language === "en" ? "IIT Madras • Computer Science" : "IIT மாதிரை • கணினி அறிவியல்"}
        </p>
      </div>

      {/* Reporting Details */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {language === "en" ? "Reporting Details" : "প্রতিবেদন বিবরণ"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg p-6 border-l-4 border-blue-600">
            <div className="flex items-start gap-3 mb-2">
              <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">
                  {language === "en" ? "Reporting Date" : "প্রতিবেদন তারিখ"}
                </p>
                <p className="text-2xl font-bold text-gray-900">1 June 2025</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 border-l-4 border-purple-600">
            <div className="flex items-start gap-3 mb-2">
              <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-600">
                  {language === "en" ? "Reporting Location" : "প্রতিবেদন অবস্থান"}
                </p>
                <p className="text-2xl font-bold text-gray-900">Main Campus</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Required Documents Checklist */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          {language === "en" ? "Required Documents at Reporting" : "প্রতিবেদনে প্রয়োজনীয় ডকুমেন্ট"}
        </h3>
        <div className="space-y-2">
          {requirements.map((req, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
              <input type="checkbox" className="w-5 h-5" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{req.title}</p>
                <p className="text-sm text-gray-600">{req.titleTamil}</p>
              </div>
              {req.required && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                  {language === "en" ? "Required" : "প্রয়োজনীয়"}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          {language === "en" ? "Contact Information" : "যোগাযোগ তথ্য"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">
              {language === "en" ? "Admissions Office" : "ভর্তি অফিস"}
            </p>
            <p className="font-medium text-gray-900">+91 44 2257 8200</p>
            <p className="text-sm text-gray-600">admissions@iitm.ac.in</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">
              {language === "en" ? "Principal's Office" : "প্রধানের অফিস"}
            </p>
            <p className="font-medium text-gray-900">+91 44 2257 8100</p>
            <p className="text-sm text-gray-600">principal@iitm.ac.in</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button variant="outline" className="">
          {language === "en" ? "Download Details" : "বিবরণ ডাউনলোড করুন"}
        </Button>
        <Button variant="outline" className="">
          {language === "en" ? "View Campus Map" : "ক্যাম্পাস ম্যাপ দেখুন"}
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white">
          {language === "en" ? "Go to Dashboard" : "ড্যাশবোর্ডে যান"}
        </Button>
      </div>
    </div>
  );
}
