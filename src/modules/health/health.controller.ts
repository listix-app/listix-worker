import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '../auth/presentation/public.decorator';
import { DatabaseHealthIndicator } from './database-health.indicator';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly database: DatabaseHealthIndicator,
  ) {}

  @Public()
  @Get()
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
  check() {
    return this.health.check([() => this.database.isHealthy('database')]);
  }
}
