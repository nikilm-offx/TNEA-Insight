import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Search, 
  GraduationCap, 
  MapPin, 
  Users,
  Star,
  TrendingUp
} from "lucide-react";

interface CollegeResult {
  id: string;
  name: string;
  location: string;
  branch: string;
  cutoff: number;
  seats: number;
  matchScore: number;
}

// todo: remove mock functionality
const mockColleges: CollegeResult[] = [
  {
    id: "1",
    name: "Anna University - CEG",
    location: "Chennai",
    branch: "Computer Science & Engineering",
    cutoff: 195.5,
    seats: 120,
    matchScore: 95
  },
  {
    id: "2", 
    name: "PSG College of Technology",
    location: "Coimbatore",
    branch: "Computer Science & Engineering",
    cutoff: 189.2,
    seats: 100,
    matchScore: 88
  },
  {
    id: "3",
    name: "Thiagarajar College of Engineering",
    location: "Madurai", 
    branch: "Computer Science & Engineering",
    cutoff: 186.7,
    seats: 80,
    matchScore: 82
  }
];

export default function CollegeSuggestionTool() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    marks: "",
    category: "",
    preferences: ""
  });
  const [results, setResults] = useState<CollegeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // todo: remove mock functionality - simulate API call
    console.log("College suggestion requested:", formData);
    
    setTimeout(() => {
      setResults(mockColleges);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Search className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-suggestions-title">
            {t("suggestions.title")}
          </h1>
          <p className="text-muted-foreground">
            Get personalized college recommendations based on your marks and preferences
          </p>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Details</CardTitle>
          <CardDescription>
            Provide your TNEA marks and preferences to get tailored suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marks" data-testid="label-marks">
                  {t("suggestions.marks")}
                </Label>
                <Input
                  id="marks"
                  type="number"
                  placeholder="Enter your cutoff marks"
                  value={formData.marks}
                  onChange={(e) => setFormData(prev => ({ ...prev, marks: e.target.value }))}
                  data-testid="input-marks"
                  min="0"
                  max="200"
                  step="0.1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category" data-testid="label-category">
                  {t("suggestions.category")}
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="obc">OBC</SelectItem>
                    <SelectItem value="sc">SC</SelectItem>
                    <SelectItem value="st">ST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferences" data-testid="label-preferences">
                  {t("suggestions.preferences")}
                </Label>
                <Select
                  value={formData.preferences}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, preferences: value }))}
                >
                  <SelectTrigger data-testid="select-preferences">
                    <SelectValue placeholder="Preferred branch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cse">Computer Science</SelectItem>
                    <SelectItem value="ece">Electronics</SelectItem>
                    <SelectItem value="mech">Mechanical</SelectItem>
                    <SelectItem value="civil">Civil</SelectItem>
                    <SelectItem value="eee">Electrical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full md:w-auto"
              disabled={isLoading}
              data-testid="button-get-suggestions"
            >
              <Search className="h-4 w-4 mr-2" />
              {isLoading ? t("common.loading") : "Get Suggestions"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {t("suggestions.results")}
            </CardTitle>
            <CardDescription>
              Based on your marks and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((college) => (
                <div
                  key={college.id}
                  className="p-4 border rounded-lg hover-elevate"
                  data-testid={`college-suggestion-${college.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{college.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {college.location}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{college.matchScore}% Match</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div>
                      <div className="text-sm text-muted-foreground">Branch</div>
                      <div className="font-medium">{college.branch}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Cutoff</div>
                      <Badge variant="secondary">{college.cutoff}</Badge>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Available Seats</div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {college.seats}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Match Score</span>
                      <span>{college.matchScore}%</span>
                    </div>
                    <Progress value={college.matchScore} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}