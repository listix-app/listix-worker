import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let healthMock: any;
  let databaseMock: any;

  beforeEach(() => {
    databaseMock = {
      isHealthy: jest.fn().mockResolvedValue({ database: { status: 'up' } }),
    };
    healthMock = {
      check: jest.fn().mockImplementation(async (indicators) => {
        const results = await Promise.all(
          indicators.map((fn: () => any) => fn()),
        );
        const details = Object.assign({}, ...results);
        return {
          status: 'ok',
          info: details,
          error: {},
          details,
        };
      }),
    };
    controller = new HealthController(healthMock, databaseMock);
  });

  describe('GET / (root)', () => {
    it('returns service status, name, and current timestamp', () => {
      const result = controller.root();

      expect(result).toMatchObject({
        status: 'ok',
        service: 'listix-api',
      });
      expect(typeof result.timestamp).toBe('string');
      expect(!isNaN(Date.parse(result.timestamp))).toBe(true);
    });
  });

  describe('GET /health (health check)', () => {
    it('returns ok status and process uptime along with database indicators', async () => {
      const result = await controller.check();

      expect(result).toMatchObject({
        status: 'ok',
        info: { database: { status: 'up' } },
        details: { database: { status: 'up' } },
      });
      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThanOrEqual(0);
      expect(databaseMock.isHealthy).toHaveBeenCalledWith('database');
    });
  });
});
