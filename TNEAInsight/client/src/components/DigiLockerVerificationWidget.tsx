import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  Shield,
  TrendingUp,
  LogOut,
} from "lucide-react";

interface CertificateStatus {
  id: string;
  type: string;
  status: "pending" | "verified" | "rejected" | "expired";
  issuer: string;
  verifiedAt?: string;
}

interface VerificationStatus {
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  certificates: {
    total: number;
    verified: number;
    byType: Record<
      string,
      {
        status: string;
        issuer: string;
      }
    >;
  };
  eligibility: {
    overallStatus: string;
    categoryValidation: string;
    nativeValidation: string;
    incomeValidation: string;
    cutoffStatus: string;
    eligibilityPercentage: number;
    remarks: string;
  } | null;
  lastUpdated: string;
}

export default function DigiLockerVerificationWidget() {
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"login" | "retrieve" | "eligibility" | "complete">("login");
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch("/api/verification/complete-status");
      if (!response.ok) {
        if (response.status === 404) {
          setStep("login");
          return;
        }
        throw new Error("Failed to fetch status");
      }
      const data = await response.json();
      setVerificationStatus(data);

      // Determine current step based on status
      if (data.certificates.verified === 0) {
        setStep("retrieve");
      } else if (!data.eligibility) {
        setStep("eligibility");
      } else {
        setStep("complete");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch verification status");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginWithDigiLocker = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/digilocker/authorize", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to initiate DigiLocker login");

      const data = await response.json();
      window.location.href = data.authUrl;
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to initiate login",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieveCertificates = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/certificates/retrieve", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to retrieve certificates");

      const data = await response.json();
      toast({
        title: "Success",
        description: `Retrieved ${data.certificatesRetrieved} certificates`,
      });

      fetchVerificationStatus();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to retrieve certificates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/digilocker/logout", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to logout");

      toast({
        title: "Success",
        description: "DigiLocker token revoked",
      });

      setVerificationStatus(null);
      setStep("login");
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to logout",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "pending":
        return <Clock className="h-5 w-5 text-amber-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "expired":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getEligibilityColor = (status: string) => {
    switch (status) {
      case "eligible":
        return "bg-green-50 border-l-4 border-l-green-600";
      case "needs_review":
        return "bg-amber-50 border-l-4 border-l-amber-600";
      case "rejected":
        return "bg-red-50 border-l-4 border-l-red-600";
      default:
        return "bg-gray-50";
    }
  };

  if (loading && !verificationStatus) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading verification status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            DigiLocker Certificate Verification
          </CardTitle>
          <CardDescription>Secure Aadhaar-linked authentication and eligibility verification</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-8">
            {["Login", "Retrieve", "Eligibility", "Complete"].map((label, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    (i === 0 && step === "login") ||
                    (i === 1 && step === "retrieve") ||
                    (i === 2 && step === "eligibility") ||
                    (i === 3 && step === "complete")
                      ? "bg-primary text-white"
                      : i < ["login", "retrieve", "eligibility", "complete"].indexOf(step)
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {i < ["login", "retrieve", "eligibility", "complete"].indexOf(step) ? (
                    <CheckCircle2 className="h-6 w-6" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span className="text-sm text-center">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Step Content */}
      {step === "login" && (
        <Card>
          <CardHeader>
            <CardTitle>Connect with DigiLocker</CardTitle>
            <CardDescription>
              Securely authenticate using your Aadhaar-linked DigiLocker account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                DigiLocker provides secure access to your official documents using Aadhaar authentication.
                Your documents will be retrieved securely and verified.
              </p>
            </div>
            <Button onClick={handleLoginWithDigiLocker} disabled={loading} size="lg" className="w-full">
              {loading ? "Connecting..." : "Login with DigiLocker"}
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "retrieve" && verificationStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Retrieve Your Certificates</CardTitle>
            <CardDescription>
              Fetch your official documents from DigiLocker
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Click below to retrieve your 10th marksheet, 12th marksheet, community certificate, and other
              required documents.
            </p>
            <Button onClick={handleRetrieveCertificates} disabled={loading} size="lg" className="w-full">
              {loading ? "Retrieving..." : "Retrieve Certificates"}
            </Button>
            <Button onClick={handleLogout} variant="outline" disabled={loading} size="sm" className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "eligibility" && verificationStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Verify Eligibility</CardTitle>
            <CardDescription>
              Your certificates have been retrieved and are pending eligibility verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-900">
                Your documents are being verified. An admin will review and confirm your eligibility status.
                This process typically takes 24-48 hours.
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Retrieved Certificates:</h4>
              {Object.entries(verificationStatus.certificates.byType).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm capitalize">{type.replace(/_/g, " ")}</span>
                  </div>
                  <Badge variant="outline">{data.status}</Badge>
                </div>
              ))}
            </div>

            <Button onClick={handleLogout} variant="outline" disabled={loading} size="sm" className="w-full">
              Logout
            </Button>
          </CardContent>
        </Card>
      )}

      {step === "complete" && verificationStatus && (
        <>
          {/* Certificate Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Certificate Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(verificationStatus.certificates.byType).map(([type, data]) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-4 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div>
                        {data.status === "verified" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium capitalize">{type.replace(/_/g, " ")}</p>
                        <p className="text-xs text-gray-600">{data.issuer}</p>
                      </div>
                    </div>
                    <Badge
                      variant={data.status === "verified" ? "default" : "outline"}
                      className={data.status === "verified" ? "bg-green-600" : ""}
                    >
                      {data.status}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span>Certificate Verification Progress</span>
                  <span className="font-medium">
                    {verificationStatus.certificates.verified}/{verificationStatus.certificates.total}
                  </span>
                </div>
                <Progress
                  value={
                    (verificationStatus.certificates.verified /
                      Math.max(1, verificationStatus.certificates.total)) *
                    100
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Eligibility Result */}
          {verificationStatus.eligibility && (
            <Card className={getEligibilityColor(verificationStatus.eligibility.overallStatus)}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Eligibility Result
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Overall Status</span>
                    <Badge
                      variant={
                        verificationStatus.eligibility.overallStatus === "eligible"
                          ? "default"
                          : verificationStatus.eligibility.overallStatus === "needs_review"
                            ? "outline"
                            : "destructive"
                      }
                    >
                      {verificationStatus.eligibility.overallStatus.toUpperCase().replace(/_/g, " ")}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span>Cutoff Status:</span>
                      <Badge variant="outline">{verificationStatus.eligibility.cutoffStatus}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span>Category Validation:</span>
                      <Badge variant="outline">{verificationStatus.eligibility.categoryValidation}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span>Nativity Validation:</span>
                      <Badge variant="outline">{verificationStatus.eligibility.nativeValidation}</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded">
                      <span>Income Validation:</span>
                      <Badge variant="outline">{verificationStatus.eligibility.incomeValidation}</Badge>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Eligibility Score</span>
                      <span className="font-medium">
                        {verificationStatus.eligibility.eligibilityPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={verificationStatus.eligibility.eligibilityPercentage} />
                  </div>

                  {verificationStatus.eligibility.remarks && (
                    <div className="mt-4 p-3 bg-white rounded">
                      <p className="text-sm font-medium mb-1">Remarks:</p>
                      <p className="text-xs text-gray-700">{verificationStatus.eligibility.remarks}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleLogout} variant="outline" disabled={loading} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout from DigiLocker
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
