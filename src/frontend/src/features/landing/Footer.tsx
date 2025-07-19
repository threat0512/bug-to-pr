"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Github, X, Heart, Mail } from "lucide-react";

const Footer = () => {
  const handleEmailClick = () => {
    // Try to open email client, fallback to copying email to clipboard
    const email = "niteshsoni0512@gmail.com";
    const mailtoLink = `mailto:${email}?subject=PR Plan Generator - Contact`;
    
    try {
      window.open(mailtoLink, '_blank');
    } catch (error) {
      // Fallback: copy email to clipboard
      navigator.clipboard.writeText(email).then(() => {
        alert('Email copied to clipboard: ' + email);
      }).catch(() => {
        alert('Email: ' + email);
      });
    }
  };

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">PR Plan Generator</h3>
            <p className="text-gray-400 text-lg leading-relaxed mb-6">
              Transform GitHub issues into structured development plans with AI-powered analysis.
              Save time, improve code quality, and streamline your development workflow.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
                asChild
              >
                <a 
                  href="https://github.com/threat0512" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-transparent border-gray-600 text-white hover:bg-gray-800"
                onClick={handleEmailClick}
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
            </div>
          </div>

          {/* Product */}
          {/* <div>
            <h4 className="font-semibold text-lg mb-4">Product</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API Docs</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div> */}

          {/* Company */}
          {/* <div>
            <h4 className="font-semibold text-lg mb-4">Company</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
            </ul>
          </div> */}
        </div>

        <Separator className="bg-gray-800 mb-8" />

        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">
            © 2025 PR Plan Generator. All rights reserved.
          </p>
          <p className="text-gray-400 flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-500" /> for developers
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
