import { ApiProperty } from '@nestjs/swagger';
import { IsHexadecimal, Length } from 'class-validator';

export class RefreshSessionDto {
  @ApiProperty({
    description: '64-character hexadecimal SHA-256 refresh token',
    example: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
    minLength: 64,
    maxLength: 64,
  })
  @IsHexadecimal()
  @Length(64, 64)
  refreshToken!: string;
}
