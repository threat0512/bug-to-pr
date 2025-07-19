import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables from root .env file
dotenv.config({ path: join(__dirname, '../../../.env') });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.BACKEND_PORT || 3001;
  await app.listen(port);
}

// Handle the promise properly
bootstrap().catch((error) => {
  console.error('Failed to start the application:', error);
  process.exit(1);
});
