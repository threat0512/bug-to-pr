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
    const router = useRouter();

    const handleAnalyze = async () => {
        if (!url.includes('github.com')) {
            toast("Please enter a valid GitHub issue URL");
            return;
        }

        setIsAnalyzing(true);

        try {
            // Single API call to backend that handles both GitHub fetching and AI generation
            const response = await fetch("/api/generate-pr-plan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Failed to generate PR plan");
            }

            const result: PRPlanResult = await response.json();

            // Store result and navigate to results page
            localStorage.setItem("prPlanResult", JSON.stringify(result));
            router.push(`/results?url=${encodeURIComponent(url)}`);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Something went wrong";
            toast(errorMessage);
            console.error("Analysis error:", err);
        } finally {
            setIsAnalyzing(false);
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
                                    disabled={isAnalyzing || !url}
                                    className="px-8 py-6 text-lg font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {isAnalyzing ? "Analyzing..." : "Generate Plan"}
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
