import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Only load dotenv in development
if (process.env.NODE_ENV !== 'production') {
  try {
    const dotenv = require('dotenv');
    const { join } = require('path');
    dotenv.config({ path: join(__dirname, '../../../.env') });
  } catch (error) {
    console.log('dotenv not available, using platform environment variables');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Use PORT for Render, fallback to BACKEND_PORT for local development
  const port = process.env.PORT || process.env.BACKEND_PORT || 3001;
  
  await app.listen(port, '0.0.0.0'); // Explicitly bind to all interfaces
  console.log(`🚀 Backend server is running on port ${port}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Backend URL: ${process.env.BACKEND_URL || 'http://localhost:3001'}`);
}

// Handle the promise properly
bootstrap().catch((error) => {
  console.error('❌ Failed to start the application:', error);
  process.exit(1);
});