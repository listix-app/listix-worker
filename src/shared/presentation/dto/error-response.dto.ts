import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: 404, description: 'HTTP status code' })
  statusCode: number;

  @ApiProperty({
    example: 'LIST_NOT_FOUND',
    description: 'Domain-specific error code',
  })
  errorCode: string;

  @ApiProperty({
    example: 'List not found',
    description: 'Human-readable error description',
  })
  message: string;
}
