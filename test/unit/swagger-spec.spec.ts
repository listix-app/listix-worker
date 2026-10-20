import { buildSwaggerConfig } from '../../src/shared/presentation/swagger.setup';

describe('Swagger / OpenAPI Configuration (Unit)', () => {
  it('builds valid OpenAPI document configuration', () => {
    const config = buildSwaggerConfig();

    expect(config.info.title).toBe('Listix Worker API');
    expect(config.info.version).toBe('1.0.0');
    expect(config.info.description).toContain(
      'Listix collaborative shopping list',
    );

    // Security scheme validation
    expect(config.components?.securitySchemes).toHaveProperty('access-token');
    const bearerScheme = config.components?.securitySchemes?.[
      'access-token'
    ] as {
      type: string;
      scheme: string;
      bearerFormat: string;
    };
    expect(bearerScheme.type).toBe('http');
    expect(bearerScheme.scheme).toBe('bearer');
    expect(bearerScheme.bearerFormat).toBe('JWT');

    // Tags validation
    const expectedTags = [
      'auth',
      'lists',
      'items',
      'members',
      'invites',
      'health',
      'public-web',
    ];
    const registeredTagNames = (config.tags ?? []).map((t) => t.name);
    for (const tag of expectedTags) {
      expect(registeredTagNames).toContain(tag);
    }
  });
});
