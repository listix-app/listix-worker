import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ErrorResponseDto } from '../../../shared/presentation/dto/error-response.dto';
import type { AuthenticatedUser } from '../../auth/application/access-token.service';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import { InvitesService } from '../application/invites.service';
import { CreateInviteResponseDto } from './invites-response.dto';

@ApiTags('invites')
@ApiBearerAuth('access-token')
@Controller('lists/:listId/invites')
@UseGuards(ThrottlerGuard)
export class ListInvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create or rotate active invite for a list (owner or admin)',
  })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Unique identifier of the list',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Active invite link and code generated',
    type: CreateInviteResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permission denied: caller must be owner or admin',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'List not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests',
  })
  async create(
    @Param('listId', ParseUUIDPipe) listId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.invitesService.create({ listId, userId: user.userId });
  }

  @Delete('active')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke active invite for a list (owner or admin)' })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Unique identifier of the list',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Active invite revoked successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permission denied: caller must be owner or admin',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'List not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests',
  })
  async revoke(
    @Param('listId', ParseUUIDPipe) listId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.invitesService.revoke({ listId, userId: user.userId });
  }
}
