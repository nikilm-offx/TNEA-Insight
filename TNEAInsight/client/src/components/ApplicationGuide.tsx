import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  BookOpen, 
  FileText, 
  Upload, 
  CheckCircle, 
  Calendar,
  AlertCircle,
  Clock
} from "lucide-react";

// todo: remove mock functionality
const guideSteps = {
  en: [
    {
      id: "registration",
      title: "Step 1: Registration",
      description: "Complete your TNEA registration online",
      status: "completed",
      timeline: "June 1-15, 2024",
      content: [
        "Visit the official TNEA website",
        "Fill out the online application form",
        "Upload required documents (10th, 12th mark sheets)",
        "Pay the registration fee",
        "Verify your email and mobile number"
      ],
      documents: ["10th Mark Sheet", "12th Mark Sheet", "Transfer Certificate"]
    },
    {
      id: "verification",
      title: "Step 2: Document Verification",
      description: "Submit and verify your certificates",
      status: "current",
      timeline: "June 16-30, 2024",
      content: [
        "Schedule an appointment for document verification",
        "Visit the verification center with original documents",
        "Submit community certificate (if applicable)",
        "Get verification receipt",
        "Wait for verification status update"
      ],
      documents: ["Original Certificates", "Community Certificate", "Income Certificate"]
    },
    {
      id: "choice-filling",
      title: "Step 3: Choice Filling",
      description: "Select your preferred colleges and branches",
      status: "upcoming",
      timeline: "July 1-15, 2024",
      content: [
        "Login to the choice filling portal",
        "Research colleges and branches",
        "Arrange choices in order of preference",
        "Lock your choices before deadline",
        "Download choice filling receipt"
      ],
      documents: ["College preference list", "Branch preference list"]
    },
    {
      id: "allotment",
      title: "Step 4: Seat Allotment",
      description: "Wait for seat allotment results",
      status: "upcoming",
      timeline: "July 20-25, 2024",
      content: [
        "Check seat allotment results online",
        "Download allotment order",
        "Report to allotted college",
        "Complete admission formalities",
        "Pay college fees"
      ],
      documents: ["Allotment Order", "Fee Receipt", "Admission Confirmation"]
    }
  ],
  ta: [
    {
      id: "registration",
      title: "படி 1: பதிவு",
      description: "உங்கள் TNEA பதிவை ஆன்லைனில் முடிக்கவும்",
      status: "completed",
      timeline: "ஜூன் 1-15, 2024",
      content: [
        "அதிகாரப்பூர்வ TNEA வலைத்தளத்தைப் பார்வையிடவும்",
        "ஆன்லைன் விண்ணப்பப் படிவத்தை நிரப்பவும்",
        "தேவையான ஆவணங்களை பதிவேற்றவும் (10வது, 12வது மதிப்பெண் பத்திரங்கள்)",
        "பதிவுக் கட்டணத்தைச் செலுத்தவும்",
        "உங்கள் மின்னஞ்சல் மற்றும் மொபைல் எண்ணைச் சரிபார்க்கவும்"
      ],
      documents: ["10வது மதிப்பெண் பத்திரம்", "12வது மதிப்பெண் பத்திரம்", "இடமாற்றச் சான்றிதழ்"]
    }
  ]
};

export default function ApplicationGuide() {
  const { t, language } = useLanguage();
  const steps = guideSteps[language] || guideSteps.en;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "current":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "upcoming":
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "current":
        return <Badge className="bg-blue-100 text-blue-800">Current</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-guide-title">
            {t("guide.title")}
          </h1>
          <p className="text-muted-foreground">
            Step-by-step guide to complete your TNEA application process
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Timeline</CardTitle>
          <CardDescription>
            Follow these steps to successfully complete your TNEA counseling process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {steps.map((step, index) => (
              <AccordionItem 
                key={step.id} 
                value={step.id}
                data-testid={`guide-step-${step.id}`}
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-4 w-full">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(step.status)}
                      <div className="text-left">
                        <div className="font-medium">{step.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {step.description}
                        </div>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {getStatusBadge(step.status)}
                    </div>
                  </div>
                </AccordionTrigger>
                
                <AccordionContent className="pt-4">
                  <div className="space-y-4 ml-8">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Timeline: {step.timeline}</span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Tasks to Complete:</h4>
                      <ul className="space-y-2">
                        {step.content.map((task, taskIndex) => (
                          <li key={taskIndex} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-muted-foreground mt-0.5" />
                            {task}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Required Documents:</h4>
                      <div className="flex flex-wrap gap-2">
                        {step.documents.map((doc, docIndex) => (
                          <Badge key={docIndex} variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />
                            {doc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}