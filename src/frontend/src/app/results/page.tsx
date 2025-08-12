"use client";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, CheckCircle, ArrowLeft, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import { PRPlanResult } from "@/types/pr-plan";
import Logo from "@/components/ui/logo";

function PRPlanResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState<PRPlanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loadingStage, setLoadingStage] = useState("Initializing analysis...");
    const [isRegenerating, setIsRegenerating] = useState(false);
    const githubUrl = searchParams?.get('url') || '';

    useEffect(() => {
        const checkStatus = () => {
            const status = localStorage.getItem("prPlanStatus");
            const storedResult = localStorage.getItem("prPlanResult");
            const storedError = localStorage.getItem("prPlanError");

            if (status === "success" && storedResult) {
                try {
                    const parsedResult = JSON.parse(storedResult);
                    setResult(parsedResult);
                    setIsLoading(false);
                    // Clean up localStorage
                    localStorage.removeItem("prPlanStatus");
                    return;
                } catch {
                    setError("Failed to parse analysis result");
                    setIsLoading(false);
                    return;
                }
            }

            if (status === "error" && storedError) {
                setError(storedError);
                setIsLoading(false);
                // Clean up localStorage
                localStorage.removeItem("prPlanStatus");
                localStorage.removeItem("prPlanError");
                return;
            }

            // If no status yet, keep checking
            if (!status) {
                // Update loading stages to show progress
                const stages = [
                    "Validating GitHub URL...",
                    "Fetching issue details...",
                    "Analyzing code structure...",
                    "Generating PR plan...",
                    "Finalizing results..."
                ];
                
                const currentTime = Date.now();
                const stageIndex = Math.floor((currentTime / 3000) % stages.length);
                setLoadingStage(stages[stageIndex]);
            }
        };

        // Check immediately
        checkStatus();

        // Set up polling to check for updates
        const interval = setInterval(checkStatus, 500);

        // Fallback timeout - if no result after 2 minutes, show error
        const timeout = setTimeout(() => {
            if (isLoading) {
                setError("Analysis timed out. The issue might be too complex or there might be a service issue. Please try again.");
                setIsLoading(false);
            }
        }, 120000); // 2 minutes

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [isLoading]);

    const handleRegenerate = async () => {
        if (!githubUrl) {
            toast.error("No URL available for regeneration");
            return;
        }

        setIsRegenerating(true);
        setError(null);
        
        try {
            console.log("🔄 Regenerating PR plan...");
            
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout

            const response = await fetch("/api/generate-pr-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: githubUrl }),
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
                
                const errorMessage = errorData.error || errorData.message || `Server error (${response.status})`;
                throw new Error(errorMessage);
            }

            const newResult: PRPlanResult = await response.json();

            // Handle partial/warning responses
            if (newResult.warning) {
                console.warn("AI generated response with warning:", newResult.warning);
                if (newResult.should_retry) {
                    toast.warning("Response had formatting issues but regeneration completed");
                } else {
                    toast.warning("Regeneration completed with minor issues");
                }
            } else {
                toast.success("PR plan regenerated successfully!");
            }

            setResult(newResult);

        } catch (err: unknown) {
            console.error("Regeneration error:", err);
            let errorMessage = "Failed to regenerate PR plan";
            
            if (err instanceof Error && err.name === 'AbortError') {
                errorMessage = "Regeneration timed out - please try again";
            } else if (err instanceof Error && err.message) {
                errorMessage = err.message;
            }
            
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setIsRegenerating(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast("Code snippet copied successfully");
        } catch {
            toast("Failed to copy to clipboard");
        }
    };

    const copyAllSnippets = async () => {
        if (!result?.code_snippets) {
            toast("No code snippets available");
            return;
        }

        try {
            const allCode = Object.entries(result.code_snippets)
                .map(([file, code]) => `// ${file}\n${code}`)
                .join('\n\n');
            await navigator.clipboard.writeText(allCode);
            toast("All code snippets have been copied to clipboard");
        } catch {
            toast("Failed to copy code snippets");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    {/* Enhanced loading animation */}
                    <div className="relative mb-8">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-transparent border-r-purple-600 animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    
                    {/* Logo and brand */}
                    <div className="mb-4">
                        <Logo size="sm" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing GitHub Issue</h2>
                    <p className="text-gray-600 mb-4">Our AI is reading and generating your PR plan...</p>
                    
                    {/* Dynamic stage indicator */}
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center gap-2 text-blue-600">
                            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
                            <span className="text-sm font-medium">{loadingStage}</span>
                        </div>
                    </div>
                    
                    {/* Issue URL */}
                    <div className="bg-gray-100 rounded-lg p-3 text-left">
                        <p className="text-xs text-gray-500 mb-1">Analyzing:</p>
                        <p className="text-sm text-gray-700 break-all font-mono">{githubUrl}</p>
                    </div>
                    
                    {/* Progress indicator */}
                    <div className="mt-6">
                        <div className="flex justify-center space-x-2">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${
                                        i <= (Date.now() / 3000) % 5 ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                    style={{
                                        animationDelay: `${i * 0.5}s`,
                                        animation: 'pulse 2s infinite'
                                    }}
                                />
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">This usually takes 30-60 seconds</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    {/* Error icon */}
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
                    <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
                    
                    {/* Error details if available */}
                    {githubUrl && (
                        <div className="bg-gray-100 rounded-lg p-3 mb-6 text-left">
                            <p className="text-xs text-gray-500 mb-1">Failed URL:</p>
                            <p className="text-sm text-gray-700 break-all font-mono">{githubUrl}</p>
                        </div>
                    )}
                    
                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                            onClick={() => {
                                // Clear any stored error state
                                localStorage.removeItem("prPlanStatus");
                                localStorage.removeItem("prPlanError");
                                localStorage.removeItem("prPlanResult");
                                router.push("/");
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Try Another Issue
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => {
                                // Retry with the same URL
                                localStorage.removeItem("prPlanStatus");
                                localStorage.removeItem("prPlanError");
                                localStorage.removeItem("prPlanResult");
                                window.location.reload();
                            }}
                        >
                            Retry Analysis
                        </Button>
                    </div>
                    
                    {/* Help text */}
                    <div className="mt-8 text-xs text-gray-500">
                        <p>Common solutions:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            <li>Make sure the GitHub issue URL is correct and accessible</li>
                            <li>Try a simpler issue if this one is very complex</li>
                            <li>Wait a moment and try again if you hit rate limits</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">No Result Found</h2>
                    <p className="text-gray-600 mb-4">Please generate a PR plan first.</p>
                    <Button onClick={() => router.push("/")}>
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button variant="outline" className="flex items-center gap-2" onClick={() => router.push("/")}>
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button onClick={copyAllSnippets} variant="outline">
                            <Copy className="w-4 h-4 mr-2" />
                            Copy All Code
                        </Button>
                        <Button 
                            onClick={handleRegenerate} 
                            variant="outline"
                            disabled={isRegenerating}
                            className="bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200"
                        >
                            {isRegenerating ? (
                                <div className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-orange-700 border-t-transparent"></div>
                                    <span>Regenerating...</span>
                                </div>
                            ) : (
                                <>
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Regenerate
                                </>
                            )}
                        </Button>
                        <Button asChild>
                            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <ExternalLink className="w-4 h-4" />
                                View Issue
                            </a>
                        </Button>
                    </div>
                </div>

                {/* Results Card */}
                <Card className="shadow-xl border-0 bg-white max-w-6xl mx-auto">
                    <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                        <CardTitle className="flex items-center gap-2 text-2xl text-gray-900">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            Generated PR Plan
                        </CardTitle>
                        <p className="text-gray-600 mt-2">
                            Based on: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{githubUrl}</span>
                        </p>
                    </CardHeader>
                    <CardContent className="p-8">
                        {/* Warning Banner for JSON parsing issues */}
                        {result.warning && (
                            <div className="mb-6">
                                <div className={`rounded-lg p-4 border ${
                                    result.should_retry 
                                        ? 'bg-red-50 border-red-200 text-red-800' 
                                        : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                }`}>
                                    <div className="flex items-start gap-3">
                                        <svg 
                                            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                                result.should_retry ? 'text-red-600' : 'text-yellow-600'
                                            }`} 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                        <div className="flex-1">
                                            <h4 className="font-medium mb-1">
                                                {result.should_retry ? 'Analysis Incomplete' : 'Analysis Warning'}
                                            </h4>
                                            <p className="text-sm mb-2">{result.warning}</p>
                                            {result.should_retry && (
                                                <p className="text-sm font-medium">
                                                    Click &quot;Regenerate&quot; above to try again for a complete result.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* PR Title */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">PR Title</h3>
                            <Card className="bg-blue-50 border-blue-200">
                                <CardContent className="p-4">
                                    <p className="text-blue-900 font-medium text-lg">{result.pr_title}</p>
                                </CardContent>
                            </Card>
                        </div>

                        <Separator className="my-8" />

                        {/* Commit Plan */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Commit Plan</h3>
                            <div className="space-y-3">
                                {result.commit_plan.map((commit: string, index: number) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <Badge variant="outline" className="mt-1 bg-green-50 text-green-700 border-green-200">
                                            {index + 1}
                                        </Badge>
                                        <p className="text-gray-700 flex-1">{commit}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Separator className="my-8" />

                        {/* Files to Modify */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Files to Modify</h3>
                            <div className="flex flex-wrap gap-2">
                                {result.files_to_modify.map((file: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-sm py-2 px-3 bg-purple-100 text-purple-800">
                                        {file}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <Separator className="my-8" />

                        {/* Code Snippets */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Code Snippets</h3>
                            <div className="space-y-4">
                                {Object.entries(result.code_snippets).map(([file, code], index) => (
                                    <Card key={index} className="bg-gray-50 border-gray-200">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-medium text-gray-600">{file}</CardTitle>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(code)}
                                                    className="h-8 w-8 p-0"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <pre className="text-sm text-gray-800 font-mono overflow-x-auto bg-white p-4 rounded-lg border max-h-96 overflow-y-auto">
                                                <code>{code}</code>
                                            </pre>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Loading fallback component
function LoadingFallback() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Results</h2>
                <p className="text-gray-600">Please wait while we load your PR plan...</p>
            </div>
        </div>
    );
}

// Main component with Suspense boundary
export default function PRPlanResults() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <PRPlanResultsContent />
        </Suspense>
    );
}
