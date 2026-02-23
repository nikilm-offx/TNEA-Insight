/**
 * Step 6: Seat Confirmation
 * Accept/decline allotment and pay fees
 */

import { CreditCard, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";

interface ConfirmationStepProps {
  onContinue: () => void;
}

export default function ConfirmationStep({ onContinue }: ConfirmationStepProps) {
  const { language } = useLanguage();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    {
      id: "accept",
      title: "Accept & Join",
      titleTamil: "ஏற்று & சேரவும்",
      description: "Accept the current allotment and join this college",
      descriptionTamil: "தற்போதைய ஒதுக்கீட்டை ஏற்து இந்த கல்லூரியில் சேரவும்",
      color: "bg-green-50",
      borderColor: "border-green-500",
    },
    {
      id: "upward",
      title: "Accept & Upward Move",
      titleTamil: "ஏற்று & மேல்நோக்கி நகரவும்",
      description: "Accept current seat but participate in upward movement round",
      descriptionTamil: "தற்போதைய இருக்கையை ஏற்று மேல்நோக்கி இயக்க சுற்றில் பங்குபெறவும்",
      color: "bg-blue-50",
      borderColor: "border-blue-500",
    },
    {
      id: "decline",
      title: "Decline & Exit",
      titleTamil: "மறுக்கவும் & வெளியேறவும்",
      description: "Decline the allotment and exit counselling",
      descriptionTamil: "ஒதுக்கீடு மறுக்கவும் மற்றும் ஆலோசனை வெளியேறவும்",
      color: "bg-red-50",
      borderColor: "border-red-500",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Allotment Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-6 border-l-4 border-purple-600">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {language === "en" ? "Your Allotment" : "உங்கள் ஒதுக்கீடு"}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {language === "en" ? "College" : "கல்லூரி"}
            </p>
            <p className="text-xl font-bold text-gray-900">IIT Madras</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {language === "en" ? "Branch" : "கிளை"}
            </p>
            <p className="text-xl font-bold text-gray-900">Computer Science</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {language === "en" ? "Allotment Fee" : "ஒதுக்கீடு கட்டணம்"}
            </p>
            <p className="text-xl font-bold text-gray-900">₹25,000</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">
              {language === "en" ? "Deadline" : "இறுதி தேதி"}
            </p>
            <p className="text-xl font-bold text-gray-900">25 Nov 2024</p>
          </div>
        </div>
      </div>

      {/* Choose Action */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {language === "en" ? "What would you like to do?" : "நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?"}
        </h3>
        <div className="space-y-3">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedOption(option.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition ${
                selectedOption === option.id
                  ? `${option.borderColor} ${option.color} border-opacity-100`
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full border-2 mt-1 flex items-center justify-center ${
                    selectedOption === option.id ? "border-current" : "border-gray-300"
                  }`}
                >
                  {selectedOption === option.id && <CheckCircle className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{option.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">{option.titleTamil}</p>
                  <p className="text-sm text-gray-600">
                    {language === "en" ? option.description : option.descriptionTamil}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedOption === "accept" && (
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {language === "en" ? "Pay Confirmation Fee" : "உறுதிப்படுத்தல் கட்டணம் செலுத்தவும்"}
          </h3>
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex items-start gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900">
                  {language === "en" ? "Secure Payment" : "பாதுகாப்பான பேமেंट"}
                </h4>
                <p className="text-sm text-gray-600">
                  {language === "en"
                    ? "Your payment is encrypted and secure"
                    : "உங்கள் பேமेंट குறிப்பிடப்பட்டு பாதுகாப்பாக உள்ளது"}
                </p>
              </div>
            </div>
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
              {language === "en"
                ? "Proceed to Payment"
                : "பேமेंट க்கு செல்லவும்"}
            </Button>
          </div>
        </div>
      )}

      {/* Documents */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {language === "en" ? "Important Documents" : "முக்கியமான ஆவணங்கள்"}
        </h3>
        <button className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-4 text-left transition flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              {language === "en" ? "Allotment Letter" : "ஒதுக்கீடு கடிதம்"}
            </p>
            <p className="text-sm text-gray-600">
              {language === "en" ? "PDF • 250 KB" : "PDF • 250 KB"}
            </p>
          </div>
          <Download className="w-5 h-5 text-blue-600" />
        </button>
      </div>
    </div>
  );
}
