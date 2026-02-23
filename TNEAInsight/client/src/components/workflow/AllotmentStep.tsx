/**
 * Step 5: Seat Allotment
 * View predicted and actual allotment
 */

import { Award, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface AllotmentStepProps {
  onContinue: () => void;
}

export default function AllotmentStep({ onContinue }: AllotmentStepProps) {
  const { language } = useLanguage();

  return (
    <div className="space-y-8">
      {/* Status */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-600">
        <div className="flex items-center gap-3 mb-2">
          <Award className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">
            {language === "en" ? "Seat Allotment Status" : "இருக்கை ஒதுக்கீடு நிலை"}
          </h3>
        </div>
        <p className="text-gray-600">
          {language === "en"
            ? "Based on TNEA calculations and your preferences"
            : "TNEA கணக்கீடு மற்றும் உங்கள் விருப்பங்களின் அடிப்படையில்"}
        </p>
      </div>

      {/* Predicted Allotment */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          {language === "en" ? "Your Predicted Allotment" : "உங்கள் முன்னறிவிப்பு ஒதுக்கீடு"}
        </h3>
        <div className="bg-white rounded-lg p-6 border-2 border-green-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {language === "en" ? "College Name" : "கல்லூரி பெயர்"}
              </p>
              <p className="text-2xl font-bold text-gray-900">IIT Madras</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {language === "en" ? "Branch" : "கிளை"}
              </p>
              <p className="text-2xl font-bold text-gray-900">Computer Science</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {language === "en" ? "Seat Category" : "இருக்கை வகை"}
              </p>
              <p className="text-2xl font-bold text-gray-900">General (AI)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {language === "en" ? "Confidence" : "நம்பிக்கை"}
              </p>
              <p className="text-2xl font-bold text-green-600">95%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alternative Options */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {language === "en" ? "Alternative Allotments" : "பாற்பு ஒதுக்கீடுகள்"}
        </h3>
        <div className="space-y-3">
          {[
            { college: "NIT Trichy", branch: "MECH", confidence: "88%" },
            { college: "Anna University", branch: "ECE", confidence: "80%" },
          ].map((option, idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{option.college}</p>
                  <p className="text-sm text-gray-600">{option.branch}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{option.confidence}</p>
                  <p className="text-xs text-gray-600">chance</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Important Info */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800">
          {language === "en"
            ? "Note: This is a prediction based on current data. Official allotment will be released by TNEA."
            : "குறிப்பு: இது தற்போதைய தரவின் அடிப்படையிலான முன்னறிவிப்பு. அதिकૃત ஒதுக்கீடு TNEA மூலம் வெளியிடப்படும்."}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">
          {language === "en" ? "Download Report" : "அறிக்கையைப் பதிவிறக்கவும்"}
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          {language === "en" ? "Share with Advisor" : "ஆலோசகர்களுடன் பகிரவும்"}
        </Button>
      </div>
    </div>
  );
}
