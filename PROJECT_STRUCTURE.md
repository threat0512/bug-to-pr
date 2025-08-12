# 🏗️ BugToPR Project Structure

This document provides a comprehensive overview of the BugToPR codebase architecture and organization.

## 📁 **Root Directory Structure**

```
bug-to-pr/
├── 📄 README.md                    # Main project documentation
├── 📄 PROJECT_STRUCTURE.md         # This file - detailed structure
├── 📄 env.example                  # Environment variables template
├── 📄 start-services.sh            # Unix/Linux startup script
├── 📄 start-services.bat           # Windows startup script
├── 📁 src/                         # Main source code directory
│   ├── 📁 ai/                      # Python AI service
│   ├── 📁 backend/                 # NestJS backend service
│   ├── 📁 frontend/                # Next.js frontend application
│   ├── 📄 main.ts                  # Root NestJS entry point
│   ├── 📄 app.module.ts            # Root NestJS module
│   ├── 📄 app.controller.ts        # Root NestJS controller
│   └── 📄 app.service.ts           # Root NestJS service
├── 📁 .github/                     # GitHub workflows and templates
├── 📄 package.json                 # Root package configuration
├── 📄 pnpm-lock.yaml              # Package lock file
└── 📄 tsconfig.json               # TypeScript configuration
```

## 🐍 **AI Service (`src/ai/`)**

The AI service is a Python FastAPI application that handles LLM interactions and generates PR plans.

### **Core Files**
```
src/ai/
├── 📄 main.py                      # FastAPI application entry point
├── 📄 requirements.txt             # Python dependencies
├── 📄 start-ai.sh                  # AI service startup script
├── 📁 providers/                   # LLM provider implementations
│   ├── 📄 __init__.py             # Package initialization
│   ├── 📄 base.py                 # Abstract provider interface
│   ├── 📄 factory.py              # Provider factory and fallback logic
│   ├── 📄 groq_provider.py        # Groq LLM provider implementation
│   └── 📄 hf_public_provider.py   # HuggingFace provider implementation
├── 📁 schemas/                     # Pydantic data models
│   └── 📄 issue.py                # GitHub issue data structures
├── 📄 agent.py                     # Main PR plan generation agent
├── 📄 file_selector_agent.py       # File selection agent
├── 📄 pr_planner_agent.py         # PR planning agent
└── 📄 generate_plan.py             # FastAPI router and endpoints
```

### **Key Components**

#### **Provider System (`providers/`)**
- **`base.py`**: Abstract `LLMProvider` interface defining the contract
- **`factory.py`**: Provider creation and fallback logic
- **`groq_provider.py`**: Groq API integration using LangChain
- **`hf_public_provider.py`**: HuggingFace Inference API integration

#### **Agent System**
- **`agent.py`**: Main agent for generating PR plans from issue descriptions
- **`file_selector_agent.py`**: Agent for selecting relevant files to modify
- **`pr_planner_agent.py`**: Agent for detailed PR planning with file contents

#### **Data Models (`schemas/`)**
- **`issue.py`**: Pydantic models for GitHub issue data and PR plan responses

## 🟢 **Backend Service (`src/backend/`)**

The backend service is a NestJS application that handles GitHub API interactions and orchestrates the AI service.

### **Core Files**
```
src/backend/
├── 📄 package.json                 # Node.js dependencies
├── 📄 nest-cli.json               # NestJS CLI configuration
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 tsconfig.build.json         # Build-specific TypeScript config
├── 📄 .eslintrc.js                # ESLint configuration
├── 📄 .prettierrc                 # Prettier configuration
├── 📄 main.ts                     # Application entry point
├── 📁 src/                        # Source code
│   ├── 📄 app.module.ts           # Root module
│   ├── 📄 app.controller.ts       # Root controller
│   ├── 📄 app.service.ts          # Root service
│   ├── 📁 github/                 # GitHub-related modules
│   │   ├── 📄 github.module.ts    # GitHub module
│   │   ├── 📄 github.service.ts   # GitHub API service
│   │   ├── 📄 github.controller.ts # GitHub endpoints
│   │   ├── 📁 dto/                # Data transfer objects
│   │   │   └── 📄 get-issue.dto.ts # Issue fetching DTO
│   │   └── 📁 interfaces/         # TypeScript interfaces
│   │       └── 📄 github-issue.interface.ts # GitHub issue interface
│   └── 📁 dto/                    # Shared DTOs
│       └── 📄 generate-pr-plan.dto.ts # PR plan generation DTO
└── 📁 dist/                       # Compiled JavaScript output
```

### **Key Components**

#### **GitHub Module (`github/`)**
- **`github.service.ts`**: Handles GitHub API calls and data fetching
- **`github.controller.ts`**: Exposes GitHub-related endpoints
- **`github.module.ts`**: Organizes GitHub-related dependencies

#### **Data Transfer Objects (`dto/`)**
- **`get-issue.dto.ts`**: Input validation for GitHub issue fetching
- **`generate-pr-plan.dto.ts`**: Input validation for PR plan generation

#### **Interfaces (`interfaces/`)**
- **`github-issue.interface.ts`**: TypeScript interfaces for GitHub issue data

## ⚛️ **Frontend Application (`src/frontend/`)**

The frontend is a Next.js 13+ application with App Router that provides the user interface.

### **Core Files**
```
src/frontend/
├── 📄 package.json                 # Node.js dependencies
├── 📄 next.config.ts              # Next.js configuration
├── 📄 tsconfig.json               # TypeScript configuration
├── 📄 postcss.config.mjs          # PostCSS configuration
├── 📄 tailwind.config.js          # Tailwind CSS configuration
├── 📄 components.json              # shadcn/ui configuration
├── 📁 public/                     # Static assets
│   └── 📁 assets/                 # Images and icons
│       └── 📄 icon.svg            # Application favicon
├── 📁 src/                        # Source code
│   ├── 📄 app/                    # Next.js App Router
│   │   ├── 📄 layout.tsx          # Root layout component
│   │   ├── 📄 page.tsx            # Home page
│   │   ├── 📄 globals.css         # Global styles
│   │   ├── 📄 not-found.tsx       # 404 page
│   │   ├── 📁 api/                # API routes
│   │   │   └── 📁 generate-pr-plan/ # PR plan generation API
│   │   │       └── 📄 route.ts    # API endpoint implementation
│   │   └── 📁 results/            # Results page
│   │       └── 📄 page.tsx        # PR plan results display
│   ├── 📁 components/             # Reusable UI components
│   │   └── 📁 ui/                 # shadcn/ui components
│   │       ├── 📄 badge.tsx       # Badge component
│   │       ├── 📄 button.tsx      # Button component
│   │       ├── 📄 card.tsx        # Card component
│   │       ├── 📄 input.tsx       # Input component
│   │       ├── 📄 logo.tsx        # Custom logo component
│   │       ├── 📄 separator.tsx   # Separator component
│   │       └── 📄 sonner.tsx      # Toast notifications
│   ├── 📁 features/               # Feature-specific components
│   │   └── 📁 landing/            # Landing page features
│   │       ├── 📄 Demo.tsx        # Main demo component
│   │       ├── 📄 Features.tsx    # Features showcase
│   │       ├── 📄 Footer.tsx      # Footer component
│   │       ├── 📄 Hero.tsx        # Hero section
│   │       └── 📄 ProcessFlow.tsx # Process flow visualization
│   ├── 📁 lib/                    # Utility libraries
│   │   └── 📄 utils.ts            # Common utility functions
│   └── 📁 types/                  # TypeScript type definitions
│       └── 📄 pr-plan.ts          # PR plan data types
└── 📁 .next/                      # Next.js build output
```

### **Key Components**

#### **App Router (`app/`)**
- **`layout.tsx`**: Root layout with metadata and global styles
- **`page.tsx`**: Home page with landing content
- **`results/page.tsx`**: Results page for displaying PR plans

#### **API Routes (`app/api/`)**
- **`generate-pr-plan/route.ts`**: Frontend API proxy to backend service

#### **UI Components (`components/ui/`)**
- **`logo.tsx`**: Custom BugToPR logo component with responsive sizing
- **`button.tsx`**: Reusable button component with variants
- **`card.tsx`**: Card component for content organization
- **`sonner.tsx`**: Toast notification system

#### **Feature Components (`features/landing/`)**
- **`Demo.tsx`**: Main demo component with GitHub URL input
- **`Hero.tsx`**: Hero section with branding and call-to-action
- **`Features.tsx`**: Features showcase section
- **`ProcessFlow.tsx`**: Visual process flow explanation

#### **Type Definitions (`types/`)**
- **`pr-plan.ts`**: TypeScript interfaces for PR plan data structures

## 🔧 **Configuration Files**

### **Environment Configuration**
- **`env.example`**: Template for environment variables
- **`.env`**: Local environment configuration (not in version control)

### **Package Management**
- **`package.json`**: Root package configuration
- **`pnpm-lock.yaml`**: Lock file for reproducible builds

### **TypeScript Configuration**
- **`tsconfig.json`**: Root TypeScript configuration
- **`tsconfig.build.json`**: Build-specific TypeScript settings

### **Code Quality**
- **`.eslintrc.js`**: ESLint configuration for code linting
- **`.prettierrc`**: Prettier configuration for code formatting

## 🚀 **Startup Scripts**

### **Unix/Linux (`start-services.sh`)**
- Checks port availability
- Sets up Python virtual environment
- Starts all three services in sequence
- Provides cleanup on exit

### **Windows (`start-services.bat`)**
- Windows equivalent of the shell script
- Opens services in separate command windows
- Handles Windows-specific path separators

## 📊 **Data Flow Architecture**

```
User Input (GitHub URL)
       ↓
┌─────────────────┐
│   Frontend      │ ← Next.js UI
│   (Next.js)     │
└─────────────────┘
       ↓ (API call)
┌─────────────────┐
│    Backend      │ ← NestJS API
│   (NestJS)      │
└─────────────────┘
       ↓ (GitHub API + AI call)
┌─────────────────┐
│   AI Service    │ ← Python FastAPI
│   (FastAPI)     │
└─────────────────┘
       ↓ (LLM response)
┌─────────────────┐
│   Response      │ ← Structured PR plan
│   Processing    │
└─────────────────┘
       ↓
┌─────────────────┐
│   Frontend      │ ← Results display
│   (Results)     │
└─────────────────┘
```

## 🔄 **Service Communication**

### **Frontend ↔ Backend**
- **Protocol**: HTTP REST API
- **Endpoint**: `/api/generate-pr-plan`
- **Data**: GitHub URL in request body
- **Response**: PR plan data or error information

### **Backend ↔ AI Service**
- **Protocol**: HTTP REST API
- **Endpoint**: `/generate-pr-plan`
- **Data**: GitHub issue details
- **Response**: AI-generated PR plan

### **Backend ↔ GitHub API**
- **Protocol**: HTTP REST API
- **Endpoint**: GitHub REST API v3
- **Data**: Issue URL parsing and fetching
- **Response**: Issue title, body, and metadata

## 🎯 **Key Design Patterns**

### **1. Provider Pattern (AI Service)**
- Abstract interface for LLM providers
- Easy switching between different AI services
- Automatic fallback on provider failure

### **2. Microservices Architecture**
- Independent service deployment
- Technology-specific optimizations
- Scalable service boundaries

### **3. Type Safety Everywhere**
- Full TypeScript coverage
- Shared type definitions
- Runtime type validation with Pydantic

### **4. Error Handling Strategy**
- Comprehensive error boundaries
- User-friendly error messages
- Graceful degradation

## 🚧 **Development Workflow**

### **Local Development**
1. **Clone repository** and copy `env.example` to `.env`
2. **Run startup script** (`start-services.sh` or `start-services.bat`)
3. **Access application** at `http://localhost:3000`

### **Code Changes**
1. **Frontend**: Changes reflect immediately with Next.js hot reload
2. **Backend**: Changes reflect with NestJS hot reload
3. **AI Service**: Changes reflect with uvicorn hot reload

### **Testing Strategy**
- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + NestJS testing utilities
- **AI Service**: pytest for Python testing

## 📈 **Scaling Considerations**

### **Horizontal Scaling**
- **Frontend**: CDN-ready, stateless design
- **Backend**: Stateless API, horizontal scaling ready
- **AI Service**: Provider fallback, timeout management

### **Performance Optimization**
- **Frontend**: Next.js automatic optimizations
- **Backend**: Connection pooling, request caching
- **AI Service**: Provider selection, response optimization

---

This structure provides a solid foundation for:
- **Team Development**: Clear separation of concerns
- **Scalability**: Microservices architecture
- **Maintainability**: Consistent patterns and organization
- **Deployment**: Independent service deployment
- **Testing**: Isolated testing strategies 