"use client"

import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

const Hero = () => {
  const scrollToDemo = () => {
    const demoSection = document.getElementById('demo-section');
    if (demoSection) {
      demoSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200 rounded-full"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-200 rounded-full"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Zap className="w-4 h-4" />
            AI-Powered Development Planning
          </div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-6 leading-tight">
            Transform GitHub Issues into
            <span className="block text-blue-600">Structured PR Plans</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Paste any GitHub issue URL and get an instant, comprehensive development plan with commit strategies, file modifications, and ready-to-use code snippets.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button onClick={scrollToDemo} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group">
              Try It Now
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            {/* <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold rounded-xl border-2 hover:bg-gray-50 transition-all duration-200 group">
              <Github className="mr-2 w-5 h-5" />
              View on GitHub <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button> */}
          </div>

          {/* Stats
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">10k+</div>
              <div className="text-gray-600">Issues Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">5k+</div>
              <div className="text-gray-600">Developers Using</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
              <div className="text-gray-600">Accuracy Rate</div>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
