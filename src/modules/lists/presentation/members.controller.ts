import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponseDto } from '../../../shared/presentation/dto/error-response.dto';
import type { AuthenticatedUser } from '../../auth/application/access-token.service';
import { CurrentUser } from '../../auth/presentation/current-user.decorator';
import { ListAccessService } from '../application/list-access.service';
import { MembersService } from '../application/members.service';
import { ListMemberRepository } from '../domain/repositories';
import { ChangeMemberRoleDto } from './lists.dto';
import { ListMemberResponse, MemberPresenter } from './lists.presenter';

@ApiTags('members')
@ApiBearerAuth('access-token')
@Controller('lists/:listId/members')
export class MembersController {
  constructor(
    private readonly access: ListAccessService,
    private readonly members: ListMemberRepository,
    private readonly membersService: MembersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all members of a shopping list' })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Unique identifier of the list',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of members and their roles',
    type: [ListMemberResponse],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Access denied: caller is not a member of this list',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'List not found or deleted',
    type: ErrorResponseDto,
  })
  async findByList(
    @Param('listId', ParseUUIDPipe) listId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.access.requireMember(listId, user.userId);
    const members = await this.members.findByList(listId);
    return members.map(MemberPresenter.toResponse);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Change the role of a list member (owner only)' })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Unique identifier of the list',
  })
  @ApiParam({
    name: 'userId',
    format: 'uuid',
    description: 'Unique identifier of the target user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Updated member details',
    type: ListMemberResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid role change',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permission denied: caller must be owner',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member or list not found',
    type: ErrorResponseDto,
  })
  async updateRole(
    @Param('listId', ParseUUIDPipe) listId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @Body() dto: ChangeMemberRoleDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const member = await this.membersService.changeRole({
      listId,
      actorUserId: user.userId,
      targetUserId,
      role: dto.role,
    });
    return MemberPresenter.toResponse(member);
  }

  @Delete('me')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Leave a shopping list (owner cannot leave)' })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Unique identifier of the list',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Left the list successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Caller is not a member of the list',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'List not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Owner cannot leave without transferring ownership',
    type: ErrorResponseDto,
  })
  async leave(
    @Param('listId', ParseUUIDPipe) listId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.membersService.remove({
      listId,
      actorUserId: user.userId,
      targetUserId: user.userId,
    });
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a member from the list (owner or admin)' })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Unique identifier of the list',
  })
  @ApiParam({
    name: 'userId',
    format: 'uuid',
    description: 'Unique identifier of the member to remove',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Member removed successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Permission denied: caller lacks permission to remove this member',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Member or list not found',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Owner cannot be removed',
    type: ErrorResponseDto,
  })
  async remove(
    @Param('listId', ParseUUIDPipe) listId: string,
    @Param('userId', ParseUUIDPipe) targetUserId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.membersService.remove({
      listId,
      actorUserId: user.userId,
      targetUserId,
    });
  }
}
