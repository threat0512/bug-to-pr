
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Link, Brain, FileCode, Rocket } from "lucide-react";

const ProcessFlow = () => {
  const steps = [
    {
      icon: Link,
      title: "Paste GitHub URL",
      description: "Simply paste any GitHub issue URL into our analyzer",
      color: "bg-blue-500"
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our AI reads and understands the issue context and requirements",
      color: "bg-purple-500"
    },
    {
      icon: FileCode,
      title: "Generate Plan",
      description: "Receive a structured PR plan with commits, files, and code snippets",
      color: "bg-green-500"
    },
    {
      icon: Rocket,
      title: "Start Coding",
      description: "Use the generated plan to implement your solution efficiently",
      color: "bg-orange-500"
    }
  ];

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our streamlined process turns complex GitHub issues into actionable development plans in just four simple steps.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50">
                  <CardContent className="p-8 text-center">
                    <div className={`${step.color} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                      <step.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
                
                {/* Arrow between steps */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessFlow;
