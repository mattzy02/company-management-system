import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private readonly startTime = Date.now();

  /**
   * Get welcome message with API information
   */
  getWelcome(): { message: string; version: string; timestamp: string } {
    return {
      message: 'Welcome to Company Management API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Health check endpoint for monitoring
   */
  getHealth(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }
}
