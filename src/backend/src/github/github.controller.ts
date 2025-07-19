import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { GithubService } from './github.service';
import { GithubIssue } from './interfaces/github-issue.interface';
import { GetIssueDto } from './dto/get-issue.dto';

@Controller('github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Post('get-issue')
  async getIssue(@Body() body: GetIssueDto): Promise<GithubIssue> {
    if (!body.url) {
      throw new BadRequestException('URL is required');
    }

    const parsedUrl = this.githubService.parseGithubUrl(body.url);

    return this.githubService.getIssue(parsedUrl.owner, parsedUrl.repo, parsedUrl.issue_number);
  }
}
