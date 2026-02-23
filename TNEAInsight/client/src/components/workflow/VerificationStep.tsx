/**
 * Step 2: Document Verification
 * DigiLocker integration and manual uploads
 */

import { FileCheck, Upload, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface VerificationStepProps {
  onContinue: () => void;
}

export default function VerificationStep({ onContinue }: VerificationStepProps) {
  const { language } = useLanguage();

  const documents = [
    { name: "10th Marksheet", nameTamil: "10ம் வகுப்பு மாற்றுச்சான்று", required: true },
    { name: "12th Marksheet", nameTamil: "12ம் வகுப்பு மாற்றுச்சான்று", required: true },
    { name: "Community Certificate", nameTamil: "சமூக சான்றிதழ்", required: true },
    { name: "Nativity Certificate", nameTamil: "பூர்வாங்கம் சான்றிதழ்", required: true },
    { name: "Income Certificate", nameTamil: "வருமான சான்றிதழ்", required: true },
  ];

  return (
    <div className="space-y-8">
      {/* Verification Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* DigiLocker Option */}
        <div className="border-2 border-blue-300 rounded-lg p-6 bg-blue-50 cursor-pointer hover:border-blue-600 transition">
          <div className="flex items-center gap-3 mb-3">
            <FileCheck className="w-8 h-8 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">
              {language === "en" ? "DigiLocker" : "டிஜிலாக்கர்"}
            </h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            {language === "en"
              ? "Secure & instant verification using your DigiLocker account"
              : "உங்கள் டிஜிலாக்கர் கணக்கைப் பயன்படுத்தி பாதுகாப்பான முறையான உடனடி சரிபார்ப்பு"}
          </p>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            {language === "en" ? "Verify with DigiLocker" : "டிஜிலாக்கர் மூலம் சரிபார்க்கவும்"}
          </Button>
        </div>

        {/* Manual Upload Option */}
        <div className="border-2 border-gray-300 rounded-lg p-6 hover:border-gray-400 transition">
          <div className="flex items-center gap-3 mb-3">
            <Upload className="w-8 h-8 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">
              {language === "en" ? "Manual Upload" : "கைமுறை பதிவேற்றம்"}
            </h3>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            {language === "en"
              ? "Upload your documents manually"
              : "உங்கள் ஆவணங்களை கைமுறையாக பதிவேற்றவும்"}
          </p>
          <Button variant="outline" className="w-full border-gray-300">
            {language === "en" ? "Upload Documents" : "ஆவணங்களை பதிவேற்றவும்"}
          </Button>
        </div>
      </div>

      {/* Documents List */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {language === "en" ? "Required Documents" : "தேவையான ஆவணங்கள்"}
        </h3>
        <div className="space-y-2">
          {documents.map((doc, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{doc.name}</p>
                <p className="text-sm text-gray-600">{doc.nameTamil}</p>
              </div>
              <div className="flex items-center gap-2">
                {doc.required && (
                  <span className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1 rounded-full">
                    {language === "en" ? "Required" : "தேவைப்பட்டது"}
                  </span>
                )}
                <CheckCircle className="w-5 h-5 text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <p className="text-sm text-green-800">
          {language === "en"
            ? "🔒 Your documents are encrypted and securely stored"
            : "🔒 உங்கள் ஆவணங்கள் குறிப்பிடப்பட்டு பாதுகாப்பாக சேமிக்கப்பட்டுள்ளது"}
        </p>
      </div>
    </div>
  );
}
