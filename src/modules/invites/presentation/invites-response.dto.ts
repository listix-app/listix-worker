import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ListItemResponse,
  ListMemberResponse,
  ListResponse,
} from '../../lists/presentation/lists.presenter';

export class CreateInviteResponseDto {
  @ApiProperty({
    example: '1f3c8a90-b1e2-43c4-8d5e-6f7a8b9c0d1e',
    description: 'Unique identifier of the invite',
  })
  inviteId!: string;

  @ApiProperty({
    example: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    description: '64-character hexadecimal invite token',
  })
  token!: string;

  @ApiProperty({
    example: 'K7M4XP2Q',
    description: '8-character human-friendly uppercase invite code',
  })
  inviteCode!: string;

  @ApiProperty({
    example: 'https://api.listix.app/join/e3b0c442...',
    description: 'Full public invite URL',
  })
  inviteUrl!: string;

  @ApiProperty({
    example: '2026-10-26T10:00:00.000Z',
    description: 'Invite expiration timestamp',
  })
  expiresAt!: Date;
}

export class InviteValidationResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the invite credential is valid and active',
  })
  valid!: boolean;

  @ApiPropertyOptional({
    example: 'INVITE_EXPIRED',
    description: 'Domain error code if the invite is invalid',
  })
  errorCode?: string;

  @ApiPropertyOptional({
    example: 'The invitation link has expired.',
    description: 'Human-readable message explaining why the invite is invalid',
  })
  message?: string;

  @ApiPropertyOptional({
    example: 'Groceries',
    description: 'Name of the list being shared',
  })
  listName?: string;

  @ApiPropertyOptional({
    example: 3,
    description: 'Current member count of the list',
  })
  memberCount?: number;

  @ApiProperty({
    example: 5,
    description: 'Maximum allowable members for the list',
  })
  maxMembers!: number;

  @ApiPropertyOptional({
    example: '2026-10-26T10:00:00.000Z',
    description: 'Invite expiration timestamp in ISO 8601 format',
  })
  expiresAt?: string;
}

export class JoinListResponseDto {
  @ApiProperty({
    example: false,
    description:
      'Whether the user was already a member of the list prior to joining',
  })
  alreadyMember!: boolean;

  @ApiProperty({ type: () => ListResponse })
  list!: ListResponse;

  @ApiProperty({ type: () => [ListItemResponse] })
  items!: ListItemResponse[];

  @ApiProperty({ type: () => [ListMemberResponse] })
  members!: ListMemberResponse[];

  @ApiProperty({
    example: '2026-10-18T10:15:00.000Z',
    description: 'Server timestamp when the join operation completed',
  })
  serverTime!: string;
}
