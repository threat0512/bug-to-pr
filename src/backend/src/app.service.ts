import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GithubService } from './github/github.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface AIResponse {
  pr_title: string;
  commit_plan: string[];
  files_to_modify: string[];
  code_snippets: Record<string, string>;
  error?: string;
  raw_response?: string;
}

@Injectable()
export class AppService {
  constructor(
    private readonly githubService: GithubService,
    private readonly httpService: HttpService
  ) { }

  getHello(): string {
    return 'Hello World!';
  }

  async generatePRPlanFromUrl(url: string) {
    // 1. Parse and fetch GitHub issue
    const parsedUrl = this.githubService.parseGithubUrl(url);
    const issue = await this.githubService.getIssue(
      parsedUrl.owner,
      parsedUrl.repo,
      parsedUrl.issue_number
    );

    // 2. Generate PR plan from issue data using AI service
    return this.generatePRPlan(issue.title, issue.body);
  }

  async generatePRPlan(title: string, body: string): Promise<AIResponse> {
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

      // Call the Python AI service
      const response = await firstValueFrom(
        this.httpService.post<AIResponse>(
          `${aiServiceUrl}/generate`,
          {
            title,
            body
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout
          }
        )
      );

      const result = response.data;

      // Check if AI service returned an error
      if (result.error) {
        throw new InternalServerErrorException(
          `AI generation failed: ${result.error}`
        );
      }

      // Validate required fields
      if (!result.pr_title || !result.commit_plan || !result.files_to_modify || !result.code_snippets) {
        throw new InternalServerErrorException(
          'AI service returned incomplete response'
        );
      }

      return result;
    } catch (error) {
      console.error('AI service error:', error);

      if (error.response?.status === 500) {
        throw new InternalServerErrorException(
          `AI service error: ${error.response.data?.detail || 'Unknown error'}`
        );
      }

      if (error.code === 'ECONNREFUSED') {
        throw new InternalServerErrorException(
          `AI service is not running. Please start the Python AI service at ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}.`
        );
      }

      throw new InternalServerErrorException(
        `Failed to generate PR plan: ${error.message}`
      );
    }
  }
}
