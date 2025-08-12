"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "lucide-react";
import { toast } from "sonner";
import { PRPlanResult } from "@/types/pr-plan";

const Demo = () => {
    const [url, setUrl] = useState("");
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisStage, setAnalysisStage] = useState("");
    const router = useRouter();

    const validateGitHubUrl = (url: string): { isValid: boolean; error?: string } => {
        if (!url.trim()) {
            return { isValid: false, error: "Please enter a URL" };
        }
        
        if (!url.includes('github.com')) {
            return { isValid: false, error: "Please enter a valid GitHub URL" };
        }

        const issuePattern = /github\.com\/[^\/]+\/[^\/]+\/issues\/\d+/;
        if (!issuePattern.test(url)) {
            return { isValid: false, error: "Please enter a GitHub issue URL (not PR, discussion, or other)" };
        }

        return { isValid: true };
    };

    const getErrorMessage = (error: unknown, response?: Response): string => {
        // Handle network errors
        if (error instanceof Error && error.name === 'TypeError' && error.message.includes('fetch')) {
            return "Network error - please check your connection and try again";
        }

        // Handle timeout errors
        if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('timeout'))) {
            return "Request timed out - the issue might be too complex. Please try again.";
        }

        // Handle HTTP status codes
        if (response) {
            switch (response.status) {
                case 400:
                    return "Invalid GitHub URL or issue not found";
                case 401:
                    return "Authentication error - please check your setup";
                case 403:
                    return "Access denied - the repository might be private";
                case 404:
                    return "GitHub issue not found - please check the URL";
                case 429:
                    return "Too many requests - please wait a moment and try again";
                case 500:
                    return "Server error - our AI service is temporarily unavailable";
                case 502:
                case 503:
                case 504:
                    return "Service temporarily unavailable - please try again in a few minutes";
                default:
                    return `Server error (${response.status}) - please try again`;
            }
        }

        // Handle known error messages
        if (error instanceof Error && error.message) {
            if (error.message.includes('JSON')) {
                return "AI response formatting error - please try again";
            }
            if (error.message.includes('timeout') || error.message.includes('TIMEOUT')) {
                return "Request timed out - please try a simpler issue or try again";
            }
            if (error.message.includes('rate limit')) {
                return "Rate limit exceeded - please wait a moment and try again";
            }
            return error.message;
        }

        return "Something went wrong - please try again";
    };

    const handleAnalyze = async () => {
        const validation = validateGitHubUrl(url);
        if (!validation.isValid) {
            toast.error(validation.error);
            return;
        }

        // Instantly start loading and navigate to results page
        setIsAnalyzing(true);
        setAnalysisStage("Validating GitHub URL...");
        
        // Navigate immediately to show loading state
        router.push(`/results?url=${encodeURIComponent(url)}`);

        try {
            setAnalysisStage("Fetching issue details...");
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

            const response = await fetch("/api/generate-pr-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = {};
                }
                
                const errorMessage = errorData.error || errorData.message || getErrorMessage(new Error(), response);
                throw new Error(errorMessage);
            }

            setAnalysisStage("Generating PR plan...");
            const result: PRPlanResult = await response.json();

            // Handle partial/warning responses
            if (result.warning) {
                console.warn("AI generated response with warning:", result.warning);
                toast.warning("Analysis completed with minor issues - check results for details");
            }

            // Store result
            localStorage.setItem("prPlanResult", JSON.stringify(result));
            localStorage.setItem("prPlanStatus", "success");

        } catch (err: unknown) {
            console.error("Analysis error:", err);
            const errorMessage = getErrorMessage(err);
            
            // Store error state
            localStorage.setItem("prPlanStatus", "error");
            localStorage.setItem("prPlanError", errorMessage);
            
            // Don't show toast here since user is already on results page
        } finally {
            setIsAnalyzing(false);
            setAnalysisStage("");
        }
    };

    return (
        <section id="demo-section" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                        See It In Action
                    </h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Try our PR Plan Generator with any GitHub issue URL and see the magic happen.
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* Input Section */}
                    <Card className="mb-8 shadow-lg border-0">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Link className="w-5 h-5 text-blue-600" />
                                Enter GitHub Issue URL
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-4">
                                <Input
                                    type="url"
                                    placeholder="https://github.com/owner/repo/issues/123"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="flex-1 text-lg py-6 px-4 rounded-xl"
                                    disabled={isAnalyzing}
                                />
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !url.trim()}
                                    className="px-8 py-6 text-lg font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all duration-200"
                                >
                                    {isAnalyzing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            <span>{analysisStage || "Starting Analysis..."}</span>
                                        </div>
                                    ) : (
                                        "Generate Plan"
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
};

export default Demo;
