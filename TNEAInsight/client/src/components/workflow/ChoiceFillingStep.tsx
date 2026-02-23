/**
 * Step 4: Choice Filling
 * Drag-and-drop college selection with AI guidance
 */

import { Search, Zap, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChoiceFillingStepProps {
  onContinue: () => void;
}

export default function ChoiceFillingStep({ onContinue }: ChoiceFillingStepProps) {
  const { language } = useLanguage();

  const availableColleges = [
    {
      name: "IIT Madras",
      district: "Chennai",
      branch: "Computer Science",
      fees: "2,50,000",
      probability: "95%",
    },
    {
      name: "NIT Trichy",
      district: "Tiruchirappalli",
      branch: "Mechanical",
      fees: "1,90,000",
      probability: "88%",
    },
    {
      name: "Anna University",
      district: "Chennai",
      branch: "Electronics",
      fees: "1,50,000",
      probability: "92%",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {language === "en" ? "Search Colleges" : "கல்லூரிகளுக்கு தேடுங்கள்"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={language === "en" ? "College name..." : "கல்லூரி பெயர்..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
            <option>{language === "en" ? "All Districts" : "அனைத்து மாவட்டங்கள்"}</option>
            <option>Chennai</option>
            <option>Coimbatore</option>
            <option>Madurai</option>
          </select>
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600">
            <option>{language === "en" ? "All Branches" : "அனைத்து அணுகுமுறைகள்"}</option>
            <option>Computer Science</option>
            <option>Mechanical</option>
            <option>Electronics</option>
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            {language === "en" ? "Search" : "தேடுங்கள்"}
          </Button>
        </div>
      </div>

      {/* Available Colleges */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {language === "en" ? "Your Match Colleges" : "உங்கள் பொரும் கல்லூரிகள்"}
        </h3>
        <div className="space-y-3">
          {availableColleges.map((college, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-600 hover:shadow-md transition cursor-move"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-gray-900">{college.name}</h4>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {college.district}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-green-600 font-bold flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    {college.probability}
                  </div>
                  <p className="text-xs text-gray-600">Admission chance</p>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">{college.branch}</p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <DollarSign className="w-4 h-4" /> ₹{college.fees}
                  </p>
                </div>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                  {language === "en" ? "Add" : "சேர்க்கவும்"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          {language === "en"
            ? "💡 Tip: Colleges are sorted by your admission probability. You can drag to reorder your preferences."
            : "💡 குறிப்பு: கல்லூரிகள் உங்கள் சேர்க்கை நிகழ்தகவால் வகைப்படுத்தப்படுகின்றன. உங்கள் விருப்பங்களை மீண்டும் வரிசை செய்ய நீங்கள் இழுக்க இருக்கலாம்."}
        </p>
      </div>
    </div>
  );
}
