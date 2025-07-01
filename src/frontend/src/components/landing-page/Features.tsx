
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Code2, FileText, GitBranch, Clock, Target, Sparkles } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: GitBranch,
      title: "Smart PR Titles",
      description: "Generate clear, descriptive PR titles that follow best practices and conventions.",
      color: "bg-blue-100 text-blue-600"
    },
    {
      icon: FileText,
      title: "Commit Strategies",
      description: "Get step-by-step commit plans that break down complex changes into manageable pieces.",
      color: "bg-green-100 text-green-600"
    },
    {
      icon: Code2,
      title: "File Modifications",
      description: "Identify exactly which files need to be changed to implement the solution.",
      color: "bg-purple-100 text-purple-600"
    },
    {
      icon: Target,
      title: "Code Snippets",
      description: "Receive ready-to-use code snippets for each file modification needed.",
      color: "bg-orange-100 text-orange-600"
    },
    {
      icon: Clock,
      title: "Instant Analysis",
      description: "Get comprehensive development plans in seconds, not hours.",
      color: "bg-teal-100 text-teal-600"
    },
    {
      icon: Sparkles,
      title: "AI-Powered",
      description: "Leverages advanced AI to understand context and provide accurate solutions.",
      color: "bg-pink-100 text-pink-600"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything You Need to
            <span className="text-blue-600 block">Plan Your Next PR</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our AI analyzes GitHub issues and generates comprehensive development plans that save you hours of planning time.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
