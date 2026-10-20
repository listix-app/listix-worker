import {
  Body,
  Controller,
  Delete,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
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
import { ItemsService } from '../application/items.service';
import { DeleteItemQueryDto, UpsertItemDto } from './lists.dto';
import {
  DeleteItemResponse,
  ItemPresenter,
  UpsertItemResponse,
} from './lists.presenter';

@ApiTags('items')
@ApiBearerAuth('access-token')
@Controller('lists/:listId/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Put(':itemId')
  @ApiOperation({
    summary: 'Create or update a list item (LWW conflict resolution)',
  })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Unique identifier of the list',
  })
  @ApiParam({
    name: 'itemId',
    format: 'uuid',
    description: 'Client-generated UUID of the item',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item upsert result and current state',
    type: UpsertItemResponse,
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
    description: 'Caller is not a member of the list',
    type: ErrorResponseDto,
  })
  async upsert(
    @Param('listId', ParseUUIDPipe) listId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpsertItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.itemsService.upsert({
      listId,
      itemId,
      userId: user.userId,
      title: dto.title,
      isCompleted: dto.isCompleted,
      position: dto.position,
      clientUpdatedAt: new Date(dto.updatedAt),
    });
    return {
      applied: result.applied,
      item: ItemPresenter.toResponse(result.item),
    };
  }

  @Delete(':itemId')
  @ApiOperation({
    summary: 'Soft delete a list item (LWW conflict resolution)',
  })
  @ApiParam({
    name: 'listId',
    format: 'uuid',
    description: 'Unique identifier of the list',
  })
  @ApiParam({
    name: 'itemId',
    format: 'uuid',
    description: 'Unique identifier of the item',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Item deletion result',
    type: DeleteItemResponse,
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
    description: 'Item not found in this list',
    type: ErrorResponseDto,
  })
  async remove(
    @Param('listId', ParseUUIDPipe) listId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Query() query: DeleteItemQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.itemsService.delete({
      listId,
      itemId,
      userId: user.userId,
      clientDeletedAt: query.deletedAt ? new Date(query.deletedAt) : undefined,
    });
  }
}
