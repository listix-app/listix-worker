import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class SyncListDto {
  @ApiProperty({
    example: 'Groceries',
    description: 'Name of the shopping list (max 120 characters)',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the list is starred for quick access',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isStarred?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Display ordering position (non-negative integer)',
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @ApiProperty({
    example: '2026-10-18T10:00:00.000Z',
    description:
      'Client update timestamp in ISO 8601 format for LWW conflict resolution',
  })
  @IsISO8601({ strict: true })
  updatedAt!: string;
}

export class UpsertItemDto {
  @ApiProperty({
    example: 'Oat milk',
    description: 'Title of the list item (max 200 characters)',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @ApiProperty({
    example: false,
    description: 'Whether the item is marked as purchased / completed',
  })
  @IsBoolean()
  isCompleted!: boolean;

  @ApiProperty({
    example: 0,
    description: 'Display ordering position within the list',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  position!: number;

  @ApiProperty({
    example: '2026-10-18T10:05:00.000Z',
    description:
      'Client update timestamp in ISO 8601 format for LWW conflict resolution',
  })
  @IsISO8601({ strict: true })
  updatedAt!: string;
}

export class DeleteItemQueryDto {
  @ApiPropertyOptional({
    example: '2026-10-18T10:10:00.000Z',
    description:
      'Client deletion timestamp in ISO 8601 format for LWW conflict resolution',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  deletedAt?: string;
}

export class ChangeMemberRoleDto {
  @ApiProperty({
    enum: ['admin', 'member'],
    example: 'member',
    description: 'New role for the list member',
  })
  @IsIn(['admin', 'member'])
  role!: 'admin' | 'member';
}
