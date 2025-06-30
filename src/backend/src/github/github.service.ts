import { Injectable } from '@nestjs/common';
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
            throw new Error('Invalid GitHub URL');
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
            body: response.data.body
        };
        return issue;
        } catch (error) {
            throw new Error('Failed to fetch issue');
        }

        
    }
}