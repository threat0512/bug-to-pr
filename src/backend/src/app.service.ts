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

interface FileSelectionResponse {
  relevant_files: string[];
  error?: string;
}

@Injectable()
export class AppService {
  constructor(
    private readonly githubService: GithubService,
    private readonly httpService: HttpService,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async generatePRPlanFromUrl(url: string) {
    // 1. Parse and fetch GitHub issue
    const parsedUrl = this.githubService.parseGithubUrl(url);
    const issue = await this.githubService.getIssue(
      parsedUrl.owner,
      parsedUrl.repo,
      parsedUrl.issue_number,
    );

    // 2. Fetch repository file tree
    const fileTree = await this.githubService.getFileTree(parsedUrl.owner, parsedUrl.repo);

    // 3. Use FileSelectorAgent to select relevant files
    const fileSelectionResult = await this.selectRelevantFiles(issue.title, issue.body, fileTree);

    if (fileSelectionResult.error) {
      throw new InternalServerErrorException(`File selection failed: ${fileSelectionResult.error}`);
    }

    // 4. Fetch content of selected files
    const fileContents = await this.githubService.getMultipleFileContents(
      parsedUrl.owner,
      parsedUrl.repo,
      fileSelectionResult.relevant_files,
    );

    // 5. Check if we successfully fetched any file contents
    if (Object.keys(fileContents).length === 0) {
      console.log('No file contents fetched, falling back to basic generation');
      // Fall back to basic generation without file contents
      return this.generatePRPlan(issue.title, issue.body);
    }

    // 6. Generate PR plan with file contents
    return this.generatePRPlanWithFiles(issue.title, issue.body, fileContents);
  }

  async selectRelevantFiles(
    title: string,
    body: string,
    fileTree: Array<{ path: string; type: string; sha: string }>,
  ): Promise<FileSelectionResponse> {
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL;

      const response = await firstValueFrom(
        this.httpService.post<FileSelectionResponse>(
          `${aiServiceUrl}/select-files`,
          {
            title,
            body,
            file_tree: fileTree,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000,
          },
        ),
      );

      return response.data;
    } catch (error) {
      console.error('File selection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to select relevant files: ${errorMessage}`);
    }
  }

  async generatePRPlanWithFiles(
    title: string,
    body: string,
    fileContents: Record<string, string>,
  ): Promise<AIResponse> {
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL;

      const response = await firstValueFrom(
        this.httpService.post<AIResponse>(
          `${aiServiceUrl}/generate-with-files`,
          {
            title,
            body,
            file_contents: fileContents,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 60000, // 60 second timeout for enhanced processing
          },
        ),
      );

      const result = response.data;

      // Check if AI service returned an error
      if (result.error) {
        throw new InternalServerErrorException(`AI generation failed: ${result.error}`);
      }

      // Validate required fields
      if (
        !result.pr_title ||
        !result.commit_plan ||
        !result.files_to_modify ||
        !result.code_snippets
      ) {
        throw new InternalServerErrorException('AI service returned incomplete response');
      }

      return result;
    } catch (error) {
      console.error('AI service error:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as {
          response?: { status?: number; data?: { detail?: string } };
        };
        if (responseError.response?.status === 500) {
          throw new InternalServerErrorException(
            `AI service error: ${responseError.response.data?.detail || 'Unknown error'}`,
          );
        }
      }

      if (error && typeof error === 'object' && 'code' in error) {
        const networkError = error as { code?: string };
        if (networkError.code === 'ECONNREFUSED') {
          throw new InternalServerErrorException(
            `AI service is not running. Please start the Python AI service at ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}.`,
          );
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to generate PR plan: ${errorMessage}`);
    }
  }

  async generatePRPlan(title: string, body: string): Promise<AIResponse> {
    try {
      const aiServiceUrl = process.env.AI_SERVICE_URL;

      // Call the Python AI service
      const response = await firstValueFrom(
        this.httpService.post<AIResponse>(
          `${aiServiceUrl}/generate`,
          {
            title,
            body,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 second timeout
          },
        ),
      );

      const result = response.data;

      // Check if AI service returned an error
      if (result.error) {
        throw new InternalServerErrorException(`AI generation failed: ${result.error}`);
      }

      // Validate required fields
      if (
        !result.pr_title ||
        !result.commit_plan ||
        !result.files_to_modify ||
        !result.code_snippets
      ) {
        throw new InternalServerErrorException('AI service returned incomplete response');
      }

      return result;
    } catch (error) {
      console.error('AI service error:', error);

      if (error && typeof error === 'object' && 'response' in error) {
        const responseError = error as {
          response?: { status?: number; data?: { detail?: string } };
        };
        if (responseError.response?.status === 500) {
          throw new InternalServerErrorException(
            `AI service error: ${responseError.response.data?.detail || 'Unknown error'}`,
          );
        }
      }

      if (error && typeof error === 'object' && 'code' in error) {
        const networkError = error as { code?: string };
        if (networkError.code === 'ECONNREFUSED') {
          throw new InternalServerErrorException(
            `AI service is not running. Please start the Python AI service at ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}.`,
          );
        }
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(`Failed to generate PR plan: ${errorMessage}`);
    }
  }
}
