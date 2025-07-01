import { Controller, Get, Post, Body } from '@nestjs/common';
import { AppService } from './app.service';

interface PRPlanResponse {
  pr_title: string;
  commit_plan: string[];
  files_to_modify: string[];
  code_snippets: Record<string, string>;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('generate-pr-plan')
  async generatePRPlan(@Body() body: { url: string }): Promise<PRPlanResponse> {
    return this.appService.generatePRPlanFromUrl(body.url);
  }
}
