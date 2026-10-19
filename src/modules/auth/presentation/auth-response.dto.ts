import { ApiProperty } from '@nestjs/swagger';

export class SessionTokensResponseDto {
  @ApiProperty({
    example: 'd8c7e2b1-5a3f-4e9b-9a8c-123456789abc',
    description: 'Unique identifier of the user',
  })
  userId: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Bearer access token',
  })
  accessToken: string;

  @ApiProperty({
    example: 900,
    description: 'Access token time-to-live in seconds',
  })
  accessTokenExpiresIn: number;

  @ApiProperty({
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    description: 'Opaque hexadecimal refresh token',
  })
  refreshToken: string;

  @ApiProperty({
    example: '2026-11-01T12:00:00.000Z',
    description: 'Expiration date of the refresh token in ISO 8601 format',
  })
  refreshTokenExpiresAt: Date;
}

export class UserResponseDto {
  @ApiProperty({
    example: 'd8c7e2b1-5a3f-4e9b-9a8c-123456789abc',
    description: 'Unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    example: 'Anonymous User',
    nullable: true,
    description: 'Display name of the user, or null if anonymous',
  })
  displayName: string | null;

  @ApiProperty({
    example: '2026-10-18T10:00:00.000Z',
    description: 'Account creation timestamp',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-10-18T12:30:00.000Z',
    description: 'Last activity timestamp',
  })
  lastSeenAt: Date;
}
