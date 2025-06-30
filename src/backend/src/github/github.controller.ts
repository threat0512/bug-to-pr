import { Controller, Post, Body } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubIssue } from './interfaces/github-issue.interface';

@Controller('github')
export class GithubController {
    constructor(private readonly githubService: GithubService) { }

    @Post('get-issue')
    async getIssue(@Body('url') url: string): Promise<GithubIssue> {
        const parsedUrl = this.githubService.parseGithubUrl(url);

        if (!parsedUrl) {
            throw new Error('Invalid GitHub issue URL');
        }

        return this.githubService.getIssue(
            parsedUrl.owner,
            parsedUrl.repo,
            parsedUrl.issue_number
        );
    }
} 