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
  warning?: string;
  error_type?: string;
  should_retry?: boolean;
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
    const maxRetries = 3;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Generating PR plan (attempt ${attempt}/${maxRetries})`);
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
              timeout: 45000, // 45 second timeout (increased for retries)
            },
          ),
        );

        const result = response.data;

        // Check if AI service returned an error
        if (result.error) {
          throw new InternalServerErrorException(`AI generation failed: ${result.error}`);
        }

        // Check if this is a retry-worthy response (JSON parsing issues)
        if (result.should_retry && result.error_type === 'json_control_characters' && attempt < maxRetries) {
          console.log(`⚠️  JSON parsing issues detected, retrying (attempt ${attempt}/${maxRetries})`);
          lastError = new Error(`JSON parsing failed: ${result.warning}`);
          continue; // Retry
        }

        // Validate required fields (but be more lenient for warning responses)
        if (
          !result.pr_title ||
          !result.commit_plan ||
          !result.files_to_modify ||
          !result.code_snippets
        ) {
          if (attempt < maxRetries) {
            console.log(`⚠️  Incomplete response, retrying (attempt ${attempt}/${maxRetries})`);
            lastError = new Error('AI service returned incomplete response');
            continue; // Retry
          } else {
            throw new InternalServerErrorException('AI service returned incomplete response after all retries');
          }
        }

        // Success! Log if this was a retry
        if (attempt > 1) {
          console.log(`✅ PR plan generated successfully on attempt ${attempt}`);
        }

        return result;
      } catch (error) {
        console.error(`❌ AI service error (attempt ${attempt}/${maxRetries}):`, error.message);
        lastError = error;

        // If this is not the last attempt, continue to retry
        if (attempt < maxRetries) {
          // Add exponential backoff delay
          const delay = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
          console.log(`⏳ Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    // All retries exhausted, handle the last error
    console.error(`💥 All ${maxRetries} attempts failed`);
    
    if (lastError && typeof lastError === 'object' && 'response' in lastError) {
      const responseError = lastError as {
        response?: { status?: number; data?: { detail?: string } };
      };
      if (responseError.response?.status === 500) {
        throw new InternalServerErrorException(
          `AI service error after ${maxRetries} attempts: ${responseError.response.data?.detail || 'Unknown error'}`,
        );
      }
    }

    if (lastError && typeof lastError === 'object' && 'code' in lastError) {
      const networkError = lastError as { code?: string };
      if (networkError.code === 'ECONNREFUSED') {
        throw new InternalServerErrorException(
          `AI service is not running. Please start the Python AI service at ${process.env.AI_SERVICE_URL || 'http://localhost:8000'}.`,
        );
      }
    }

    const errorMessage = lastError instanceof Error ? lastError.message : 'Unknown error';
    throw new InternalServerErrorException(`Failed to generate PR plan after ${maxRetries} attempts: ${errorMessage}`);
  }
}
