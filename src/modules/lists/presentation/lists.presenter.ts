import { ApiProperty } from '@nestjs/swagger';
import type { ListSnapshot } from '../application/lists.service';
import type { ListItem } from '../domain/list-item';
import type { ListMember } from '../domain/list-member';
import type { ShoppingList } from '../domain/shopping-list';

export class ListResponse {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id!: string;

  @ApiProperty({ example: 'Groceries' })
  name!: string;

  @ApiProperty({ example: false })
  isStarred!: boolean;

  @ApiProperty({ example: 0 })
  position!: number;

  @ApiProperty({ example: '2026-10-18T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-18T10:00:00.000Z' })
  updatedAt!: string;
}

export class ListItemResponse {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id!: string;

  @ApiProperty({ example: 'Oat milk' })
  title!: string;

  @ApiProperty({ example: false })
  isCompleted!: boolean;

  @ApiProperty({ example: 0 })
  position!: number;

  @ApiProperty({ example: '2026-10-18T10:05:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-10-18T10:05:00.000Z' })
  updatedAt!: string;
}

export class ListMemberResponse {
  @ApiProperty({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  userId!: string;

  @ApiProperty({ example: 'owner', enum: ['owner', 'admin', 'member'] })
  role!: string;

  @ApiProperty({ example: 'Juan' })
  displayName!: string;

  @ApiProperty({ example: 'user@example.com', nullable: true })
  email!: string | null;

  @ApiProperty({ example: '2026-10-18T10:00:00.000Z' })
  joinedAt!: string;
}

export class ListSnapshotResponse {
  @ApiProperty({ type: () => ListResponse })
  list!: ListResponse;

  @ApiProperty({ type: () => [ListItemResponse] })
  items!: ListItemResponse[];

  @ApiProperty({ type: () => [ListMemberResponse] })
  members!: ListMemberResponse[];

  @ApiProperty({ example: '2026-10-18T10:10:00.000Z' })
  serverTime!: string;
}

export class SyncListResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the incoming change was applied by LWW',
  })
  applied!: boolean;

  @ApiProperty({
    example: false,
    description: 'Whether a new list row was created',
  })
  created!: boolean;

  @ApiProperty({ type: () => ListResponse })
  list!: ListResponse;
}

export class UpsertItemResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the item upsert was applied by LWW',
  })
  applied!: boolean;

  @ApiProperty({ type: () => ListItemResponse })
  item!: ListItemResponse;
}

export class DeleteItemResponse {
  @ApiProperty({
    example: true,
    description: 'Whether the item deletion was applied by LWW',
  })
  applied!: boolean;
}

export const ListPresenter = {
  toResponse(list: ShoppingList): ListResponse {
    return {
      id: list.id,
      name: list.name,
      isStarred: list.isStarred,
      position: list.position,
      createdAt: list.createdAt.toISOString(),
      updatedAt: list.updatedAt.toISOString(),
    };
  },
};

export const ItemPresenter = {
  toResponse(item: ListItem): ListItemResponse {
    return {
      id: item.id,
      title: item.title,
      isCompleted: item.isCompleted,
      position: item.position,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  },
};

export const MemberPresenter = {
  toResponse(member: ListMember): ListMemberResponse {
    return {
      userId: member.userId,
      role: member.role,
      displayName: member.displayName,
      email: member.email,
      joinedAt: member.joinedAt.toISOString(),
    };
  },
};

export const SnapshotPresenter = {
  toResponse(snapshot: ListSnapshot): ListSnapshotResponse {
    return {
      list: ListPresenter.toResponse(snapshot.list),
      items: snapshot.items.map(ItemPresenter.toResponse),
      members: snapshot.members.map(MemberPresenter.toResponse),
      serverTime: snapshot.serverTime.toISOString(),
    };
  },
};
