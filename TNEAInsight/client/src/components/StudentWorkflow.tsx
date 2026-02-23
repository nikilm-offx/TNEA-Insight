/**
 * Student Workflow Component
 * 7-step counselling journey with progress tracking
 */

import { useState } from "react";
import {
  User,
  FileCheck,
  BarChart3,
  CheckSquare,
  Award,
  CreditCard,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

// Step Components
import RegistrationStep from "./workflow/RegistrationStep";
import VerificationStep from "./workflow/VerificationStep";
import RankAnalysisStep from "./workflow/RankAnalysisStep";
import ChoiceFillingStep from "./workflow/ChoiceFillingStep";
import AllotmentStep from "./workflow/AllotmentStep";
import ConfirmationStep from "./workflow/ConfirmationStep";
import AdmissionStep from "./workflow/AdmissionStep";

interface StepConfig {
  id: number;
  title: string;
  titleTamil: string;
  description: string;
  descriptionTamil: string;
  icon: any;
  status: "completed" | "current" | "upcoming";
}

const STEPS: (language: string) => StepConfig[] = (language) => [
  {
    id: 1,
    title: "Registration",
    titleTamil: "பதிவு",
    description: "Complete your profile and academic details",
    descriptionTamil: "உங்கள் சுயவிவரம் மற்றும் கல்வி விபரங்களை நிரப்புங்கள்",
    icon: User,
    status: "current",
  },
  {
    id: 2,
    title: "Verification",
    titleTamil: "சரிபார்ப்பு",
    description: "Verify your documents via DigiLocker",
    descriptionTamil: "DigiLocker மூலம் உங்கள் ஆவணங்களை சரிபார்க்கவும்",
    icon: FileCheck,
    status: "upcoming",
  },
  {
    id: 3,
    title: "Rank Analysis",
    titleTamil: "தர பகுப்பாய்வு",
    description: "View your rank and cutoff predictions",
    descriptionTamil: "உங்கள் தர மற்றும் வெட்டு மதிப்பு முன்னறிவிப்புகளைப் பார்க்கவும்",
    icon: BarChart3,
    status: "upcoming",
  },
  {
    id: 4,
    title: "Choice Filling",
    titleTamil: "விருப்ப முறை",
    description: "Fill your college preferences with AI guidance",
    descriptionTamil: "AI வழிகாட்டுதலுடன் கல்லூரி விருப்பங்களை நிரப்புங்கள்",
    icon: CheckSquare,
    status: "upcoming",
  },
  {
    id: 5,
    title: "Allotment",
    titleTamil: "ஒதுக்கீடு",
    description: "Receive your seat allotment",
    descriptionTamil: "உங்கள் இருக்கை ஒதுக்கீடை பெறுங்கள்",
    icon: Award,
    status: "upcoming",
  },
  {
    id: 6,
    title: "Confirmation",
    titleTamil: "உறுதிப்படுத்தல்",
    description: "Confirm your seat and pay fees",
    descriptionTamil: "உங்கள் இருக்கையை உறுதிப்படுத்தி கட்டணம் செலுத்துங்கள்",
    icon: CreditCard,
    status: "upcoming",
  },
  {
    id: 7,
    title: "Admission",
    titleTamil: "சேர்க்கை",
    description: "Complete admission and join college",
    descriptionTamil: "சேர்க்கை முடித்து கல்லூரியில் சேரவும்",
    icon: GraduationCap,
    status: "upcoming",
  },
];

export default function StudentWorkflow() {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = STEPS(language).map((step) => ({
    ...step,
    status:
      completedSteps.includes(step.id) ? "completed" : step.id === currentStep ? "current" : "upcoming",
  }));

  const handleContinue = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
  };

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 1:
        return <RegistrationStep onContinue={handleContinue} />;
      case 2:
        return <VerificationStep onContinue={handleContinue} />;
      case 3:
        return <RankAnalysisStep onContinue={handleContinue} />;
      case 4:
        return <ChoiceFillingStep onContinue={handleContinue} />;
      case 5:
        return <AllotmentStep onContinue={handleContinue} />;
      case 6:
        return <ConfirmationStep onContinue={handleContinue} />;
      case 7:
        return <AdmissionStep />;
      default:
        return <RegistrationStep onContinue={handleContinue} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === "en"
              ? `Step ${currentStep}: ${steps[currentStep - 1].title}`
              : `படி ${currentStep}: ${steps[currentStep - 1].titleTamil}`}
          </h1>
          <p className="text-gray-600">
            {language === "en"
              ? steps[currentStep - 1].description
              : steps[currentStep - 1].descriptionTamil}
          </p>

          {/* Progress Bar */}
          <div className="mt-6 flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(currentStep / 7) * 100}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              {currentStep}/7
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-32">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase">
                {language === "en" ? "Journey" : "பயணம்"}
              </h3>
              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div key={step.id}>
                    <button
                      onClick={() => handleStepClick(step.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                        step.status === "current"
                          ? "bg-blue-50 border-l-4 border-blue-600"
                          : step.status === "completed"
                            ? "bg-green-50 border-l-4 border-green-600"
                            : "hover:bg-gray-50 border-l-4 border-gray-200"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          step.status === "completed"
                            ? "bg-green-600 text-white"
                            : step.status === "current"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-300 text-white"
                        }`}
                      >
                        {step.status === "completed" ? "✓" : step.id}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-900">{step.title}</div>
                        <div className="text-xs text-gray-600">{step.titleTamil}</div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-8">{getCurrentStepComponent()}</div>

              {/* Navigation Buttons */}
              {currentStep < 7 && (
                <div className="border-t border-gray-200 p-8 flex justify-between">
                  <Button
                    onClick={handleBack}
                    disabled={currentStep === 1}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    {language === "en" ? "Previous" : "முந்தைய"}
                  </Button>
                  <Button
                    onClick={handleContinue}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    {language === "en" ? "Continue" : "தொடரவும்"}
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
