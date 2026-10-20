import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class JoinListDto {
  @ApiProperty({
    example: 'K7M4XP2Q',
    description:
      'Invite code (8 alphanumeric chars) or 64-char hex invite token',
    minLength: 6,
    maxLength: 128,
  })
  @IsString()
  @Length(6, 128)
  credential!: string;

  @ApiPropertyOptional({
    example: 'Ana',
    description: 'Member display name shown to other list members',
    maxLength: 60,
  })
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @ApiPropertyOptional({
    example: 'ana@example.com',
    description: 'Optional member email address',
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
