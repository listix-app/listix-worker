import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ErrorResponseDto } from '../../../shared/presentation/dto/error-response.dto';
import type { AuthenticatedUser } from '../application/access-token.service';
import { AuthService } from '../application/auth.service';
import type { SessionTokens } from '../application/session-issuer';
import type { User } from '../domain/user';
import { SessionTokensResponseDto, UserResponseDto } from './auth-response.dto';
import { CurrentUser } from './current-user.decorator';
import { Public } from './public.decorator';
import { RefreshSessionDto } from './refresh-session.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(ThrottlerGuard)
  @Post('anonymous')
  @ApiOperation({ summary: 'Create an anonymous user session' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Anonymous session created successfully',
    type: SessionTokensResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests',
  })
  createAnonymousSession(): Promise<SessionTokens> {
    return this.authService.signInAnonymously();
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh session tokens using a refresh token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session refreshed successfully',
    type: SessionTokensResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Invalid or revoked refresh token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests',
  })
  refresh(@Body() dto: RefreshSessionDto): Promise<SessionTokens> {
    return this.authService.refreshSession(dto.refreshToken);
  }

  @ApiBearerAuth('access-token')
  @Get('me')
  @ApiOperation({ summary: 'Get profile of currently authenticated user' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Current user profile',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthenticated or invalid access token',
    type: ErrorResponseDto,
  })
  me(@CurrentUser() user: AuthenticatedUser): Promise<User> {
    return this.authService.getCurrentUser(user.userId);
  }
}
