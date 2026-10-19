import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
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
import type { Response } from 'express';
import { ErrorResponseDto } from '../../../shared/presentation/dto/error-response.dto';
import { httpStatusFor } from '../../../shared/presentation/error-status.map';
import type { AuthenticatedUser } from '../../auth/application/access-token.service';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import { Public } from '../../auth/presentation/public.decorator';
import { SnapshotPresenter } from '../../lists/presentation/lists.presenter';
import { InvitesService } from '../application/invites.service';
import {
  InviteValidationResponseDto,
  JoinListResponseDto,
} from './invites-response.dto';
import { JoinListDto } from './join-list.dto';

@ApiTags('invites')
@Controller('invites')
@UseGuards(ThrottlerGuard)
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Public()
  @Get(':credential')
  @ApiOperation({
    summary: 'Validate an invite credential and inspect list metadata',
  })
  @ApiParam({
    name: 'credential',
    description:
      'Invite code (8 alphanumeric chars) or 64-character hex link token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invite is valid and active',
    type: InviteValidationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid credential format',
    type: InviteValidationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invite not found or list deleted',
    type: InviteValidationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.GONE,
    description: 'Invite has expired or was revoked',
    type: InviteValidationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'List member limit reached (max 5 members)',
    type: InviteValidationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests',
  })
  async validate(
    @Param('credential') credential: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.invitesService.validate(credential);
    response.status(
      result.valid ? HttpStatus.OK : httpStatusFor(result.errorCode ?? ''),
    );
    return result;
  }

  @ApiBearerAuth('access-token')
  @Post('join')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Join a shopping list using an invite credential' })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Joined the list successfully or returned current snapshot if already member',
    type: JoinListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or credential format',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Invite not found or list deleted',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.GONE,
    description: 'Invite expired or revoked',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'List member limit reached (max 5 members)',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests',
  })
  async join(@Body() dto: JoinListDto, @CurrentUser() user: AuthenticatedUser) {
    const result = await this.invitesService.join({
      ...dto,
      userId: user.userId,
    });
    return {
      alreadyMember: result.alreadyMember,
      ...SnapshotPresenter.toResponse(result),
    };
  }
}
