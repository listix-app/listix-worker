import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
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
import { ListsService } from '../application/lists.service';
import { SyncListDto } from './lists.dto';
import {
  ListPresenter,
  ListResponse,
  ListSnapshotResponse,
  SnapshotPresenter,
  SyncListResponse,
} from './lists.presenter';

@ApiTags('lists')
@ApiBearerAuth('access-token')
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all active shopping lists for the current user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of shopping lists owned or joined by the user',
    type: [ListResponse],
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated or invalid access token',
    type: ErrorResponseDto,
  })
  async findMine(@CurrentUser() user: AuthenticatedUser) {
    const lists = await this.listsService.findMine(user.userId);
    return lists.map(ListPresenter.toResponse);
  }

  @Put(':listId')
  @ApiOperation({
    summary: 'Create or update a shopping list (LWW conflict resolution)',
  })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Client-generated UUID of the list',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sync result and current list state',
    type: SyncListResponse,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or validation error',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated or invalid access token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Permission denied or not a member of the list',
    type: ErrorResponseDto,
  })
  async sync(
    @Param('listId', ParseUUIDPipe) listId: string,
    @Body() dto: SyncListDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.listsService.sync({
      listId,
      userId: user.userId,
      name: dto.name,
      isStarred: dto.isStarred,
      position: dto.position,
      clientUpdatedAt: new Date(dto.updatedAt),
    });
    return {
      applied: result.applied,
      created: result.created,
      list: ListPresenter.toResponse(result.list),
    };
  }

  @Get(':listId')
  @ApiOperation({
    summary: 'Get a full snapshot of a list, including its items and members',
  })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Unique identifier of the list',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Snapshot containing list details, items, members, and server time',
    type: ListSnapshotResponse,
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
  async snapshot(
    @Param('listId', ParseUUIDPipe) listId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return SnapshotPresenter.toResponse(
      await this.listsService.getSnapshot({ listId, userId: user.userId }),
    );
  }

  @Delete(':listId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Soft delete a shopping list (only owner or admin)',
  })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Unique identifier of the list',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'List deleted successfully',
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
    description: 'List not found or already deleted',
    type: ErrorResponseDto,
  })
  async remove(
    @Param('listId', ParseUUIDPipe) listId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.listsService.delete({ listId, userId: user.userId });
  }
}
