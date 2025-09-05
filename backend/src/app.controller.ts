import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get API welcome message' })
  @ApiResponse({ status: 200, description: 'Welcome message returned successfully' })
  getWelcome(): { message: string; version: string; timestamp: string } {
    return this.appService.getWelcome();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  getHealth(): { status: string; timestamp: string; uptime: number } {
    return this.appService.getHealth();
  }
}
