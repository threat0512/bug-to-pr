<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ pnpm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Bug to PR - AI-Powered PR Plan Generator

Transform GitHub issues into structured development plans with AI-powered analysis. Save time, improve code quality, and streamline your development workflow.

## Features

- **GitHub Issue Analysis**: Paste any GitHub issue URL and get instant analysis
- **AI-Powered Planning**: Generate comprehensive PR plans with commit strategies using Groq AI
- **Code Snippets**: Get ready-to-use code snippets for implementation
- **File Recommendations**: See which files need to be modified
- **Modern UI**: Beautiful, responsive interface built with Next.js and Tailwind CSS

## Architecture

### Frontend (Next.js 13+ App Router)
- **Demo Component**: Main landing page with GitHub URL input
- **Results Page**: Displays generated PR plans with code snippets
- **API Route**: Single proxy to backend service
- **TypeScript**: Full type safety with shared interfaces

### Backend (NestJS)
- **GitHub Service**: Fetches issue details from GitHub API
- **AI Integration**: Calls Python AI service for PR plan generation
- **Unified Endpoint**: Single endpoint handles both GitHub fetching and AI generation
- **Error Handling**: Proper HTTP status codes and error messages

### AI Service (Python FastAPI)
- **Groq AI Integration**: Uses Groq's deepseek-r1-distill-llama-70b model
- **Structured Output**: Generates JSON-formatted PR plans
- **LangChain**: Advanced prompt engineering and response parsing

## Quick Start

### Option 1: Use the startup script (Recommended)

**macOS/Linux:**
```bash
chmod +x start-services.sh
./start-services.sh
```

**Windows:**
```cmd
start-services.bat
```

### Option 2: Manual setup

#### Prerequisites
- Node.js 18+
- Python 3.8+
- pnpm (recommended) or npm
- Groq API key

#### Environment Setup

1. **Copy environment file**:
   ```bash
   cp env.example .env
   ```

2. **Get a Groq API Key**:
   - Sign up at [groq.com](https://groq.com)
   - Get your API key from the dashboard

3. **Configure environment variables**:
   ```bash
   # Edit .env file and set your API key
   GROQ_API_KEY=your_groq_api_key_here
   ```

#### Start Services

1. **Start Python AI Service**:
   ```bash
   cd src/ai
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. **Start NestJS Backend**:
   ```bash
   cd src/backend
   npm install
   npm run start:dev
   ```

3. **Start Next.js Frontend**:
   ```bash
   cd src/frontend
   npm install
   npm run dev
   ```

## Deployment

### Environment Configuration

The application uses a single `.env` file in the root directory for all environment variables:

#### Local Development
```bash
# Copy and configure the example file
cp env.example .env

# Edit .env with your values
GROQ_API_KEY=your_groq_api_key_here
AI_SERVICE_URL=http://localhost:8000
BACKEND_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
```

#### Production Deployment
```bash
# Update .env for production
GROQ_API_KEY=your_groq_api_key_here
AI_SERVICE_URL=https://your-ai-service-domain.com
BACKEND_URL=https://your-backend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

### Deployment Options

#### 1. Docker Deployment
Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  ai-service:
    build: ./src/ai
    ports:
      - "8000:8000"
    env_file:
      - .env

  backend:
    build: ./src/backend
    ports:
      - "3001:3001"
    env_file:
      - .env
    depends_on:
      - ai-service

  frontend:
    build: ./src/frontend
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - backend
```

#### 2. Cloud Deployment

**Vercel (Frontend)**:
```bash
cd src/frontend
# Set environment variables in Vercel dashboard
vercel
```

**Railway/Render (Backend & AI Service)**:
```bash
# Set all environment variables from .env in your cloud platform
```

#### 3. Kubernetes Deployment
Create separate deployments for each service with ConfigMap for environment variables.

### Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GROQ_API_KEY` | Groq AI API key | - | Yes |
| `AI_SERVICE_URL` | Python AI service URL | `http://localhost:8000` | Yes |
| `BACKEND_URL` | NestJS backend URL | `http://localhost:3001` | Yes |
| `FRONTEND_URL` | Next.js frontend URL | `http://localhost:3000` | No |
| `GITHUB_TOKEN` | GitHub API token | - | No |
| `AI_SERVICE_HOST` | AI service host | `0.0.0.0` | No |
| `AI_SERVICE_PORT` | AI service port | `8000` | No |

## API Endpoints

### Backend (NestJS)
- `POST /generate-pr-plan` - Fetch GitHub issue and generate PR plan

### Frontend (Next.js API Routes)
- `POST /api/generate-pr-plan` - Proxy to backend service

### AI Service (Python FastAPI)
- `POST /generate` - Generate PR plan from issue title and body

## Usage

1. **Enter GitHub Issue URL**: Paste any GitHub issue URL in the format `https://github.com/owner/repo/issues/123`
2. **Generate Plan**: Click "Generate Plan" to analyze the issue
3. **View Results**: See the generated PR plan with:
   - PR title
   - Commit plan (step-by-step)
   - Files to modify
   - Code snippets
4. **Copy Code**: Use the copy buttons to copy individual snippets or all code at once

## Development

### AI Model Configuration

The AI service uses Groq's `deepseek-r1-distill-llama-70b` model. You can modify the model or parameters in `src/ai/agent.py`:

```python
llm = ChatGroq(
    groq_api_key=os.getenv("GROQ_API_KEY"),
    model="deepseek-r1-distill-llama-70b",  # Change model here
    temperature=0.3,  # Adjust creativity (0.0-1.0)
)
```

### Customizing AI Prompts

Edit the system instructions in `src/ai/agent.py` to customize the AI's behavior:

```python
SYSTEM_INSTRUCTIONS = r"""
You are a meticulous senior software engineer. Given a GitHub issue title and body, generate a structured pull request plan:
1. A concise PR title
2. A list of commit steps
3. A list of files to modify
4. Example code snippets (in diff or fenced code) for each file

Important:
- Do NOT output any internal reasoning or chain-of-thought.
- Output ONLY valid JSON matching this schema exactly:
  {
    "pr_title": "<string>",
    "commit_plan": ["<string>", ...],
    "files_to_modify": ["<string>", ...],
    "code_snippets": {"<file_path>": "<code snippet>", ...}
  }
"""
```

## Troubleshooting

### Common Issues

1. **AI Service Not Running**:
   - Ensure Python virtual environment is activated
   - Check that GROQ_API_KEY is set in `.env`
   - Verify uvicorn is running on port 8000

2. **Backend Connection Errors**:
   - Ensure AI service is running before starting backend
   - Check that all services are on correct ports
   - Verify environment variables are set correctly in `.env`

3. **GitHub API Rate Limits**:
   - Set GITHUB_TOKEN in `.env` for higher limits
   - Consider caching responses for frequently accessed issues

4. **Environment Variables Not Loading**:
   - Ensure `.env` file is in the root directory
   - Restart services after changing `.env`
   - Check for typos in variable names

### Service Ports

- **AI Service**: 8000
- **Backend**: 3001
- **Frontend**: 3000

## Tech Stack

- **Frontend**: Next.js 13+, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, TypeScript, Axios
- **AI Service**: Python, FastAPI, LangChain, Groq AI
- **State Management**: React hooks + localStorage
- **Styling**: Tailwind CSS with custom components
- **Icons**: Lucide React

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
