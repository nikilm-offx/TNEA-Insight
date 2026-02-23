import axios, { AxiosInstance } from "axios";

const API_BASE_URL = "http://localhost:5000/api";

interface RegistrationData {
  studentName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  caste: string;
  community: string;
  gender: string;
}

interface VerificationData {
  applicationId: string;
  documents: File[];
  documentType: string[];
}

interface RankAnalysisData {
  studentId: string;
  marksCovered: number;
  totalMarks: number;
}

interface ChoiceFillingData {
  studentId: string;
  choices: {
    collegeCode: string;
    collegeName: string;
    courseCode: string;
    courseName: string;
    preference: number;
  }[];
}

interface AllotmentResult {
  studentId: string;
  allottedCollege: string;
  allottedCourse: string;
  seatType: string;
}

interface ConfirmationData {
  studentId: string;
  allotmentId: string;
  confirmStatus: "accepted" | "declined";
}

interface AdmissionData {
  studentId: string;
  documentVerification: boolean;
  finalRegistration: boolean;
}

class WorkflowAPI {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json"
      }
    });

    // Add auth token to requests if available
    this.apiClient.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Registration endpoints
  async submitRegistration(data: RegistrationData): Promise<{ applicationId: string; message: string }> {
    try {
      const response = await this.apiClient.post("/workflow/registration", data);
      return response.data;
    } catch (error) {
      console.error("Registration submission error:", error);
      throw error;
    }
  }

  async getRegistrationStatus(applicationId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/workflow/registration/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error("Registration status error:", error);
      throw error;
    }
  }

  // Verification endpoints
  async uploadDocuments(data: VerificationData): Promise<{ verificationId: string; status: string }> {
    try {
      const formData = new FormData();
      formData.append("applicationId", data.applicationId);
      formData.append("documentType", JSON.stringify(data.documentType));
      
      data.documents.forEach((file, index) => {
        formData.append(`documents`, file);
      });

      const response = await this.apiClient.post("/workflow/verification/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      return response.data;
    } catch (error) {
      console.error("Document upload error:", error);
      throw error;
    }
  }

  async getVerificationStatus(applicationId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/workflow/verification/${applicationId}`);
      return response.data;
    } catch (error) {
      console.error("Verification status error:", error);
      throw error;
    }
  }

  // Rank Analysis endpoints
  async getRankAnalysis(studentId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/workflow/rank-analysis/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Rank analysis error:", error);
      throw error;
    }
  }

  async getCollegeCutoffs(studentRank: number): Promise<any> {
    try {
      const response = await this.apiClient.get(`/workflow/cutoffs?rank=${studentRank}`);
      return response.data;
    } catch (error) {
      console.error("Cutoff data error:", error);
      throw error;
    }
  }

  async submitRankAnalysis(data: RankAnalysisData): Promise<{ analysisId: string; rank: number }> {
    try {
      const response = await this.apiClient.post("/workflow/rank-analysis", data);
      return response.data;
    } catch (error) {
      console.error("Rank analysis submission error:", error);
      throw error;
    }
  }

  // Choice Filling endpoints
  async submitChoices(data: ChoiceFillingData): Promise<{ choiceId: string; message: string }> {
    try {
      const response = await this.apiClient.post("/workflow/choice-filling", data);
      return response.data;
    } catch (error) {
      console.error("Choice filling submission error:", error);
      throw error;
    }
  }

  async getChoices(studentId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/workflow/choice-filling/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Get choices error:", error);
      throw error;
    }
  }

  async getAvailableColleges(): Promise<any[]> {
    try {
      const response = await this.apiClient.get("/workflow/colleges");
      return response.data;
    } catch (error) {
      console.error("Colleges list error:", error);
      throw error;
    }
  }

  // Allotment endpoints
  async getAllotmentResult(studentId: string): Promise<AllotmentResult> {
    try {
      const response = await this.apiClient.get(`/workflow/allotment/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Allotment result error:", error);
      throw error;
    }
  }

  async checkAllotmentStatus(studentId: string): Promise<{ status: string; message: string }> {
    try {
      const response = await this.apiClient.get(`/workflow/allotment-status/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Allotment status error:", error);
      throw error;
    }
  }

  // Confirmation endpoints
  async submitConfirmation(data: ConfirmationData): Promise<{ confirmationId: string; status: string }> {
    try {
      const response = await this.apiClient.post("/workflow/confirmation", data);
      return response.data;
    } catch (error) {
      console.error("Confirmation submission error:", error);
      throw error;
    }
  }

  async getConfirmationStatus(studentId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/workflow/confirmation/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Confirmation status error:", error);
      throw error;
    }
  }

  // Admission endpoints
  async submitAdmission(data: AdmissionData): Promise<{ admissionId: string; message: string }> {
    try {
      const response = await this.apiClient.post("/workflow/admission", data);
      return response.data;
    } catch (error) {
      console.error("Admission submission error:", error);
      throw error;
    }
  }

  async getAdmissionStatus(studentId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/workflow/admission/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Admission status error:", error);
      throw error;
    }
  }

  // General endpoints
  async getWorkflowProgress(studentId: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/workflow/progress/${studentId}`);
      return response.data;
    } catch (error) {
      console.error("Workflow progress error:", error);
      throw error;
    }
  }

  async saveWorkflowDraft(studentId: string, stepName: string, data: any): Promise<{ draftId: string }> {
    try {
      const response = await this.apiClient.post("/workflow/draft", {
        studentId,
        stepName,
        data,
        timestamp: new Date().toISOString()
      });
      return response.data;
    } catch (error) {
      console.error("Draft save error:", error);
      throw error;
    }
  }

  async getWorkflowDraft(studentId: string, stepName: string): Promise<any> {
    try {
      const response = await this.apiClient.get(`/workflow/draft/${studentId}/${stepName}`);
      return response.data;
    } catch (error) {
      console.error("Draft retrieve error:", error);
      throw error;
    }
  }

  // Error handling helper
  getErrorMessage(error: any): string {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return "An unexpected error occurred. Please try again.";
  }
}

// Export singleton instance
export default new WorkflowAPI();
