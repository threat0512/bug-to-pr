# 🐛 BugToPR - AI-Powered GitHub Issue to PR Plan Generator

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-13+-black?style=for-the-badge&logo=next.js" alt="Next.js 13+" />
  <img src="https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react" alt="React 18+" />
  <img src="https://img.shields.io/badge/TypeScript-5+-blue?style=for-the-badge&logo=typescript" alt="TypeScript 5+" />
  <img src="https://img.shields.io/badge/Python-3.8+-green?style=for-the-badge&logo=python" alt="Python 3.8+" />
  <img src="https://img.shields.io/badge/FastAPI-0.100+-green?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/NestJS-10+-red?style=for-the-badge&logo=nestjs" alt="NestJS 10+" />
</div>

<div align="center">
  <h3>Transform GitHub Issues into Structured Development Plans with AI</h3>
  <p>Save time, improve code quality, and streamline your development workflow</p>
</div>

## 🚀 **Live Demo**

**[Try BugToPR Now](https://your-deployed-url.com)** - Paste any GitHub issue URL and see the magic happen!

## 🎯 **What Problem Does This Solve?**

As a developer, you've probably experienced:
- **Time-consuming planning**: Manually breaking down GitHub issues into actionable PR plans
- **Inconsistent approaches**: Different team members planning the same type of issues differently
- **Missing details**: Forgetting important implementation steps or file modifications
- **Poor documentation**: Unclear commit strategies that make code review difficult

**BugToPR solves these problems by:**
- **Automating the planning process** using AI to analyze GitHub issues
- **Generating structured PR plans** with clear commit strategies
- **Providing ready-to-use code snippets** for immediate implementation
- **Ensuring consistency** across all PR planning

## ✨ **Key Features**

### 🤖 **AI-Powered Analysis**
- **Multiple LLM Providers**: Support for HuggingFace Inference API, Groq, and OpenAI with automatic fallback
- **Smart Issue Parsing**: Understands complex GitHub issues and generates appropriate solutions
- **Context-Aware Planning**: Considers repository structure and issue context

### 📋 **Structured Output**
- **PR Title Generation**: Clear, descriptive titles for pull requests
- **Commit Strategy**: Step-by-step commit plan with logical progression
- **File Recommendations**: Identifies which files need modification
- **Code Snippets**: Ready-to-use code examples for each file

### 🎨 **Developer Experience**
- **Instant Results**: Get PR plans in seconds, not hours
- **Modern UI**: Beautiful, responsive interface built with Next.js 13+ and Tailwind CSS
- **Copy & Paste Ready**: One-click copying of code snippets and plans
- **Regeneration**: Retry analysis if you need different approaches

### 🔧 **Enterprise Ready**
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Scalable Architecture**: Microservices design for easy scaling
- **Environment Flexibility**: Easy switching between AI providers

## 🏗️ **Architecture Overview**

BugToPR follows a **microservices architecture** with three main components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Service    │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│   (FastAPI)     │
│                 │    │                 │    │                 │
│ • User Interface│    │ • GitHub API    │    │ • LLM Providers │
│ • State Mgmt    │    │ • Business Logic│    │ • Prompt Engine │
│ • API Routes    │    │ • Error Handling│    │ • JSON Parsing  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Frontend (Next.js 13+ App Router)**
- **Technology Stack**: Next.js 13+, React 18+, TypeScript, Tailwind CSS
- **Key Components**:
  - `Demo.tsx`: Main landing page with GitHub URL input
  - `Results.tsx`: Displays generated PR plans with code snippets
  - `Logo.tsx`: Custom SVG logo component with responsive sizing
- **State Management**: React hooks + localStorage for persistence
- **Styling**: Tailwind CSS with custom design system

### **Backend (NestJS)**
- **Technology Stack**: NestJS, TypeScript, Axios, class-validator
- **Key Services**:
  - `GitHubService`: Fetches issue details from GitHub API
  - `AppService`: Orchestrates between GitHub and AI services
- **Features**:
  - Input validation with DTOs
  - Comprehensive error handling
  - Rate limiting considerations

### **AI Service (Python FastAPI)**
- **Technology Stack**: Python 3.8+, FastAPI, LangChain, Pydantic
- **Key Components**:
  - `Provider Abstraction`: Clean interface for multiple LLM providers
  - `Agent System`: Specialized agents for different tasks
  - `JSON Parsing`: Robust parsing with multiple fallback strategies
- **LLM Providers**:
  - **HuggingFace Inference API** (Default): No API key required, hosted inference
  - **Groq**: High-performance inference with API key
  - **OpenAI**: High-quality GPT models with API key

## 🛠️ **Technical Decisions & Trade-offs**

### **Why This Architecture?**

1. **Microservices Separation**:
   - **Pros**: Independent scaling, technology flexibility, team autonomy
   - **Cons**: Network latency, deployment complexity
   - **Decision**: Chosen for future scalability and team development

2. **Next.js 13+ App Router**:
   - **Pros**: Latest React features, built-in optimizations, great DX
   - **Cons**: Learning curve, rapid evolution
   - **Decision**: Chosen for modern development experience and performance

3. **Provider Abstraction Pattern**:
   - **Pros**: Easy switching between AI providers, fallback strategies
   - **Cons**: Additional complexity, abstraction overhead
   - **Decision**: Chosen for business flexibility and cost optimization

4. **TypeScript Everywhere**:
   - **Pros**: Type safety, better IDE support, reduced runtime errors
   - **Cons**: Development overhead, compilation time
   - **Decision**: Chosen for code quality and team productivity

### **Performance Optimizations**

- **Frontend**: Next.js automatic optimizations, lazy loading, efficient state management
- **Backend**: Connection pooling, request caching, efficient error handling
- **AI Service**: Provider fallback, JSON parsing optimization, timeout management

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- Python 3.8+
- pnpm (recommended) or npm
- Git


#### Start Services

<details>
<summary>Click to expand manual setup instructions</summary>

#### **1. AI Service (Python)**
```bash
cd src/ai
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### **2. Backend Service (NestJS)**
```bash
cd src/backend
pnpm install
pnpm run dev
```

#### **3. Frontend Service (Next.js)**
```bash
cd src/frontend
pnpm install
pnpm run dev
```

</details>

## 🔧 **Configuration**

### **Environment Variables**

The application uses a single `.env` file for configuration:

```bash
# AI Provider (choose one)
AI_PROVIDER=openai  # Options: openai, groq, hf_inference_api

# OpenAI (requires API key)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini  # Default model
OPENAI_TEMPERATURE=0.3    # Default temperature (0.0-1.0)

# HuggingFace (default - no API key required)
HF_MODEL_ID=Qwen/Qwen3-4B-Instruct-2507
HF_API_KEY=  # Optional: for better rate limits

# Groq (requires API key)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=deepseek-r1-distill-llama-70b  # Default model
GROQ_TEMPERATURE=0.3                      # Default temperature (0.0-1.0)

# Service URLs
AI_SERVICE_URL=http://localhost:8000
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

### **AI Provider Selection**

| Provider | Pros | Cons | Best For |
|----------|------|------|----------|
| **HuggingFace** | No API key, reliable, free tier | Rate limits, slower | Development, testing |
| **Groq** | Fast, high quality, generous limits | Requires API key, cost | Production, high volume |
| **OpenAI** | High quality, reliable, extensive model options | Requires API key, higher cost | Production, enterprise, GPT models |

## 📱 **Usage Examples**

### **Basic Usage**
1. **Enter GitHub Issue URL**: `https://github.com/owner/repo/issues/123`
2. **Click "Generate Plan"**: AI analyzes the issue
3. **Review Results**: See PR title, commit plan, files, and code snippets
4. **Copy & Implement**: Use the generated plan for your PR

### **Advanced Features**
- **Regeneration**: Click "Regenerate" to get alternative approaches
- **Code Copying**: Copy individual snippets or all code at once
- **Error Handling**: Clear error messages with actionable solutions

## 🚀 **Deployment**

### **Production Deployment Options**

#### **1. Vercel + Railway/Render (Recommended)**
- **Frontend**: Deploy to Vercel for global CDN and automatic scaling
- **Backend & AI**: Deploy to Railway or Render for managed hosting

#### **2. Docker Compose**
```yaml
version: '3.8'
services:
  ai-service:
    build: ./src/ai
    ports: ["8000:8000"]
    env_file: [.env]
  
  backend:
    build: ./src/backend
    ports: ["3001:3001"]
    env_file: [.env]
    depends_on: [ai-service]
  
  frontend:
    build: ./src/frontend
    ports: ["3000:3000"]
    env_file: [.env]
    depends_on: [backend]
```

#### **3. Kubernetes**
- Separate deployments for each service
- ConfigMaps for environment variables
- Ingress for external access

### **Environment-Specific Configs**
```bash
# Development
cp env.example .env

# Staging
cp env.example .env.staging

# Production
cp env.example .env.production
```


```

### **AI Service Testing**
```bash
cd src/ai
python -m pytest tests/           # Unit tests
python -m pytest tests/ --cov     # Coverage report
```

## 🔍 **Code Quality & Standards**

### **Linting & Formatting**
- **Frontend**: ESLint + Prettier with Next.js recommended rules
- **Backend**: ESLint + Prettier with NestJS recommended rules
- **Python**: Black + isort + flake8 for consistent formatting

### **Type Safety**
- **100% TypeScript coverage** across frontend and backend
- **Strict TypeScript configuration** for maximum safety
- **Shared type definitions** between services

### **Error Handling**
- **Comprehensive error boundaries** in React components
- **Structured error responses** from API endpoints
- **User-friendly error messages** with actionable solutions

## 📊 **Performance Metrics**

### **Response Times**
- **Frontend Load**: < 2 seconds (First Contentful Paint)
- **API Response**: < 5 seconds (95th percentile)
- **AI Generation**: < 30 seconds (complex issues)

### **Scalability**
- **Frontend**: CDN-ready, automatic scaling
- **Backend**: Stateless design, horizontal scaling ready
- **AI Service**: Provider fallback, timeout management

## 🔒 **Security Considerations**

### **Input Validation**
- **GitHub URL validation** with strict regex patterns
- **Request size limits** to prevent abuse
- **Rate limiting** on API endpoints

### **Data Privacy**
- **No data persistence** of user inputs
- **Local storage only** for temporary state
- **No analytics tracking** of user behavior

### **API Security**
- **CORS configuration** for production domains
- **Input sanitization** to prevent injection attacks
- **Timeout limits** to prevent resource exhaustion

## 🚧 **Known Limitations & Future Improvements**

### **Current Limitations**
- **Single issue analysis**: Cannot analyze multiple related issues
- **Repository context**: Limited access to full codebase structure
- **Language support**: Optimized for English-language issues

### **Planned Improvements**
- **Multi-issue analysis**: Batch processing of related issues
- **Repository integration**: GitHub App for deeper context
- **Multi-language support**: Internationalization for global users
- **Team collaboration**: Shared plans and team templates
- **Integration APIs**: Webhook support for automated workflows

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

### **Development Setup**
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes with tests
4. Ensure all tests pass: `npm run test && npm run lint`
5. Submit a pull request

### **Code Standards**
- Follow existing code style and patterns
- Add tests for new functionality
- Update documentation for API changes
- Use conventional commit messages

### **Areas for Contribution**
- **Frontend**: UI/UX improvements, accessibility, performance
- **Backend**: API enhancements, error handling, testing
- **AI Service**: Prompt engineering, provider integration, optimization
- **Documentation**: README updates, API docs, deployment guides

## 📚 **Learning Resources**

### **Technologies Used**
- **[Next.js Documentation](https://nextjs.org/docs)**: App Router, Server Components
- **[NestJS Documentation](https://docs.nestjs.com/)**: Framework concepts, decorators
- **[FastAPI Documentation](https://fastapi.tiangolo.com/)**: Python web framework
- **[LangChain Documentation](https://python.langchain.com/)**: LLM integration patterns

### **Architecture Patterns**
- **Microservices**: Service separation and communication
- **Provider Pattern**: Abstraction for different implementations
- **Error Handling**: Comprehensive error management strategies
- **Type Safety**: TypeScript best practices and patterns

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **HuggingFace** for providing the Inference API infrastructure
- **Groq** for high-performance AI inference
- **Next.js team** for the amazing React framework
- **NestJS team** for the enterprise-ready Node.js framework
- **FastAPI team** for the modern Python web framework

---

<div align="center">
  <p>Built with ❤️ by the BugToPR team</p>
  <p>
    <a href="https://github.com/yourusername/bug-to-pr/issues">Report Bug</a> •
    <a href="https://github.com/yourusername/bug-to-pr/pulls">Request Feature</a> •
    <a href="https://github.com/yourusername/bug-to-pr/discussions">Discuss</a>
  </p>
</div>
