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

function PRPlanResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState<PRPlanResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const githubUrl = searchParams?.get('url') || '';

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2000);

        // Try to get result from localStorage
        const stored = localStorage.getItem("prPlanResult");
        if (stored) {
            try {
                const parsedResult = JSON.parse(stored);
                setResult(parsedResult);
            } catch {
                setError("Failed to load saved result");
            }
        }

        return () => clearTimeout(timer);
    }, []);

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
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing GitHub Issue</h2>
                    <p className="text-gray-600">Our AI is reading and generating your PR plan...</p>
                    <p className="text-sm text-gray-500 mt-2">URL: {githubUrl}</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => router.push("/")}>
                        Back to Home
                    </Button>
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
