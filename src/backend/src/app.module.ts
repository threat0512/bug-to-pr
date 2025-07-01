import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GithubModule } from './github/github.module';

@Module({
  imports: [GithubModule, HttpModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
