/**
 * Step 3: Rank and Cutoff Analysis
 * Display rank, cutoff predictions and classifications
 */

import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface RankAnalysisStepProps {
  onContinue: () => void;
}

export default function RankAnalysisStep({ onContinue }: RankAnalysisStepProps) {
  const { language } = useLanguage();

  const safeTargetDream = [
    {
      category: "Safe",
      categoryTamil: "பாதுகாப்பு",
      description: "90%+ chance of getting seat",
      descriptionTamil: "இருக்கை பெறுவதற்கான 90%+ வாய்ப்பு",
      color: "bg-green-100",
      borderColor: "border-green-500",
    },
    {
      category: "Target",
      categoryTamil: "लक्ष्य",
      description: "50-90% chance of getting seat",
      descriptionTamil: "இருக்கை பெறுவதற்கான 50-90% வாய்ப்பு",
      color: "bg-blue-100",
      borderColor: "border-blue-500",
    },
    {
      category: "Dream",
      categoryTamil: "கனவு",
      description: "Below 50% chance of getting seat",
      descriptionTamil: "இருக்கை பெறுவதற்கான 50% க்குக் கீழ் வாய்ப்பு",
      color: "bg-purple-100",
      borderColor: "border-purple-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Rank Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border-l-4 border-blue-600">
          <p className="text-sm text-blue-700 mb-1 uppercase font-medium">
            {language === "en" ? "Your Rank" : "உங்கள் தர"}
          </p>
          <div className="text-4xl font-bold text-blue-900">2,456</div>
          <p className="text-sm text-blue-600 mt-2">
            {language === "en" ? "Out of 15,000 students" : "15,000 மாணவர்களில் இருந்து"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border-l-4 border-green-600">
          <p className="text-sm text-green-700 mb-1 uppercase font-medium">
            {language === "en" ? "Your Marks" : "உங்கள் மதிப்பெண்கள்"}
          </p>
          <div className="text-4xl font-bold text-green-900">187/200</div>
          <p className="text-sm text-green-600 mt-2">
            {language === "en" ? "Percentile: 93.5%" : "சதவீத: 93.5%"}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border-l-4 border-purple-600">
          <p className="text-sm text-purple-700 mb-1 uppercase font-medium">
            {language === "en" ? "Cutoff Score" : "வெட்டு மதிப்பு"}
          </p>
          <div className="text-4xl font-bold text-purple-900">165</div>
          <p className="text-sm text-purple-600 mt-2">
            {language === "en" ? "For selected category" : "தேர்ந்தெடுக்கப்பட்ட வகையின் கீழ்"}
          </p>
        </div>
      </div>

      {/* Safe Target Dream Classification */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          {language === "en" ? "College Classification" : "கல்லூரி வகைப்பாடு"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {safeTargetDream.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-lg p-6 border-l-4 ${item.color} ${item.borderColor} cursor-pointer hover:shadow-lg transition`}
            >
              <h4 className="text-lg font-bold text-gray-900 mb-2">{item.category}</h4>
              <p className="text-sm text-gray-600 mb-3">
                {language === "en" ? item.description : item.descriptionTamil}
              </p>
              <div className="text-2xl font-bold text-gray-900">42</div>
              <p className="text-xs text-gray-600 mt-1 uppercase">
                {language === "en" ? "Colleges" : "கல்லூரிகள்"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Historical Trend */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          {language === "en" ? "Historical Cutoff Trends" : "வரலாற்று வெட்டு போக்கு"}
        </h3>
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="text-center text-gray-600">
            <p>{language === "en" ? "Chart visualization" : "விளக்கத் திட்டம்"}</p>
            <p className="text-sm mt-2">
              {language === "en"
                ? "Historical data showing cutoff trends over 3 years"
                : "3 ஆண்டுகளில் வெட்டு போக்குகளைக் காட்டும் வரலாற்று தரவு"}
            </p>
          </div>
        </div>
      </div>

      {/* Important Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-800">
          {language === "en"
            ? "Important: These predictions are based on previous years data and statistical analysis. Actual results may vary."
            : "முக்கியமாக: இந்த முன்னறிவிப்புகள் முந்தைய ஆண்டுகளின் தரவு மற்றும் புள்ளிவிவர பகுப்பாய்வின் அடிப்படையில் உள்ளது. உண்மையான ফலங்கள் மாறுபடலாம்."}
          </p>
      </div>
    </div>
  );
}
