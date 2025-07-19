import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GithubIssue } from './interfaces/github-issue.interface';
import { Octokit } from 'octokit';

interface FileTreeItem {
  path: string;
  type: 'file' | 'dir';
  sha: string;
}

interface GitHubError {
  status?: number;
  message?: string;
}

interface GitHubRepoResponse {
  data: {
    default_branch?: string;
  };
}

interface GitHubIssueResponse {
  data: {
    title: string;
    body?: string;
  };
}

interface GitHubTreeResponse {
  data: {
    tree?: Array<{
      path?: string;
      type?: string;
      sha?: string;
    }>;
  };
}

interface GitHubContentResponse {
  data:
    | {
        content?: string;
        encoding?: string;
      }
    | Array<unknown>;
}

@Injectable()
export class GithubService {
  private octokit: Octokit;

  constructor(private readonly httpService: HttpService) {
    // Create octokit without authentication for public repos
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    this.octokit = new Octokit();
  }

  parseGithubUrl(url: string): { owner: string; repo: string; issue_number: number } {
    const regex = /github\.com\/([^/]+)\/([^/]+)\/issues\/(\d+)/;
    const match = url.match(regex);

    if (!match) {
      throw new BadRequestException(
        'Invalid GitHub URL format. Expected: https://github.com/owner/repo/issues/123',
      );
    }

    return {
      owner: match[1],
      repo: match[2],
      issue_number: parseInt(match[3], 10),
    };
  }

  async getDefaultBranch(owner: string, repo: string): Promise<string> {
    try {
      const response = (await this.octokit.rest.repos.get({
        owner,
        repo,
      })) as GitHubRepoResponse;
      return response.data.default_branch || 'main';
    } catch (error) {
      console.error(`Error getting default branch for ${owner}/${repo}:`, error);
      // Try common branch names
      const commonBranches = ['main', 'master', 'develop'];
      for (const branch of commonBranches) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          await this.octokit.rest.repos.getBranch({
            owner,
            repo,
            branch,
          });
          return branch;
        } catch {
          continue;
        }
      }
      return 'main'; // fallback
    }
  }

  async getIssue(owner: string, repo: string, issue_number: number): Promise<GithubIssue> {
    try {
      const response = (await this.octokit.rest.issues.get({
        owner,
        repo,
        issue_number,
      })) as GitHubIssueResponse;

      const issue: GithubIssue = {
        title: response.data.title,
        body: response.data.body || '',
      };

      return issue;
    } catch (error) {
      const githubError = error as GitHubError;
      if (githubError.status === 404) {
        throw new BadRequestException(
          'GitHub issue not found. Please check the URL and ensure the issue exists.',
        );
      }
      if (githubError.status === 403) {
        throw new BadRequestException('Rate limit exceeded. Please try again later.');
      }
      console.error('GitHub API error:', error);
      throw new InternalServerErrorException('Failed to fetch GitHub issue. Please try again.');
    }
  }

  async getFileTree(owner: string, repo: string, ref?: string): Promise<FileTreeItem[]> {
    try {
      // Get the default branch if not specified
      const branch = ref || (await this.getDefaultBranch(owner, repo));

      console.log(`Fetching file tree for ${owner}/${repo} on branch: ${branch}`);

      const response = (await this.octokit.rest.git.getTree({
        owner,
        repo,
        tree_sha: branch,
        recursive: 'true',
      })) as GitHubTreeResponse;

      const tree = response.data.tree || [];

      // Filter to only include files (not directories) and limit to reasonable size
      const files = tree
        .filter((item) => item.type === 'blob')
        .map((item) => ({
          path: item.path || '',
          type: 'file' as const,
          sha: item.sha || '',
        }))
        .slice(0, 1000); // Limit to first 1000 files to avoid token limits

      console.log(`Found ${files.length} files in repository`);
      return files;
    } catch (error) {
      console.error('Error fetching file tree:', error);

      const githubError = error as GitHubError;
      if (githubError.status === 404) {
        throw new BadRequestException(`Repository ${owner}/${repo} not found or not accessible.`);
      }
      if (githubError.status === 403) {
        throw new BadRequestException('Rate limit exceeded or repository access denied.');
      }

      throw new InternalServerErrorException('Failed to fetch repository file tree.');
    }
  }

  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    ref?: string,
  ): Promise<string | null> {
    try {
      const branch = ref || (await this.getDefaultBranch(owner, repo));

      const response = (await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      })) as GitHubContentResponse;

      const data = response.data;

      // Handle directory content (array response)
      if (Array.isArray(data)) {
        return null;
      }

      // Handle file content
      const content = data.content || '';
      const encoding = data.encoding || '';

      if (encoding === 'base64') {
        return Buffer.from(content, 'base64').toString('utf-8');
      } else {
        return content;
      }
    } catch (error) {
      console.error(`Error fetching file content for ${path}:`, error);
      // Don't throw error, just return null for missing files
      return null;
    }
  }

  async getMultipleFileContents(
    owner: string,
    repo: string,
    filePaths: string[],
    ref?: string,
  ): Promise<Record<string, string>> {
    const fileContents: Record<string, string> = {};

    // Limit to first 10 files to avoid token limits
    const limitedPaths = filePaths.slice(0, 10);

    console.log(`Attempting to fetch content for ${limitedPaths.length} files:`, limitedPaths);

    for (const path of limitedPaths) {
      const content = await this.getFileContent(owner, repo, path, ref);
      if (content !== null) {
        // Limit file content size to avoid token limits
        const limitedContent =
          content.length > 5000
            ? content.substring(0, 5000) + '\n// ... (content truncated)'
            : content;
        fileContents[path] = limitedContent;
        console.log(`Successfully fetched content for: ${path}`);
      } else {
        console.log(`Failed to fetch content for: ${path} (file not found or not accessible)`);
      }
    }

    console.log(
      `Successfully fetched content for ${Object.keys(fileContents).length} out of ${limitedPaths.length} files`,
    );
    return fileContents;
  }
}
