import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '../auth/presentation/public.decorator';
import { DatabaseHealthIndicator } from './database-health.indicator';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Service root status check' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service is operational',
    schema: {
      example: {
        status: 'ok',
        service: 'listix-api',
        timestamp: '2026-11-05T15:00:00.000Z',
      },
    },
  })
  root() {
    return {
      status: 'ok',
      service: 'listix-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health')
  @HealthCheck()
  @ApiOperation({ summary: 'System and database health check' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Service and database are operational',
    schema: {
      example: {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
        uptime: 123.45,
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Service or database is unhealthy',
    schema: {
      example: {
        status: 'error',
        info: {},
        error: {
          database: { status: 'down', message: 'database unavailable' },
        },
        details: {
          database: { status: 'down', message: 'database unavailable' },
        },
      },
    },
  })
  async check() {
    const result = await this.health.check([
      () => this.database.isHealthy('database'),
    ]);
    return {
      ...result,
      uptime: process.uptime(),
    };
  }
}
