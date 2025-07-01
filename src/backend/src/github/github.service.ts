import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GithubIssue } from './interfaces/github-issue.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GithubService {
    constructor(private readonly httpService: HttpService) { }

    parseGithubUrl(url: string): { owner: string; repo: string; issue_number: number } {
        const regex = /github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/;
        const match = url.match(regex);

        if (!match) {
            throw new BadRequestException('Invalid GitHub URL format. Expected: https://github.com/owner/repo/issues/123');
        }

        return {
            owner: match[1],
            repo: match[2],
            issue_number: parseInt(match[3], 10)
        };
    }

    async getIssue(owner: string, repo: string, issue_number: number): Promise<GithubIssue> {
        try {
            const response = await firstValueFrom(
                this.httpService.get<GithubIssue>(
                    `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}`,
                )
            );

            const issue: GithubIssue = {
                title: response.data.title,
                body: response.data.body || ''
            };

            return issue;
        } catch (error) {
            if (error.response?.status === 404) {
                throw new BadRequestException('GitHub issue not found. Please check the URL and ensure the issue exists.');
            }
            if (error.response?.status === 403) {
                throw new BadRequestException('Rate limit exceeded. Please try again later.');
            }
            throw new InternalServerErrorException('Failed to fetch GitHub issue. Please try again.');
        }
    }
}