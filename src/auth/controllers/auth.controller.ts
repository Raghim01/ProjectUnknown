import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthDto } from '../dto/auth.dto';
import { Request } from 'express';
import { AccessTokenGuard } from 'src/common/guards/accessToken.guard';
import { RefreshTokenGuard } from 'src/common/guards/refreshToken.guard';
import { JwtHelper } from 'src/common/jwt/token-helper.functions';
import { UpdatePasswordDto } from '../dto/update-user_password.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private jwtHelper: JwtHelper) {}

  @Post('signup')
  async signup(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return await this.authService.signUp(createUserDto);
  }

  @Post('signin')
  async signin(@Body() data: AuthDto) {
    return await this.authService.signIn(data);
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(AuthGuard())
  @Patch('/update-password/:email')
  async updatePassword(
    @Param('email') email: string,
    @Body() updatePassword: UpdatePasswordDto,
  ) {
    await this.authService.updateUserPassword(email, updatePassword);
  }

  @UseGuards(AccessTokenGuard)
  @UseGuards(AuthGuard())
  @Get('logout')
  async logout(@Req() req: Request) {
    await this.authService.logout(req.user['sub']);
  }

  @UseGuards(RefreshTokenGuard)
  @UseGuards(AuthGuard())
  @Get('refresh')
  async refreshToken(@Req() req: Request) {
    const userId = req.user['sub'];
    const refreshToken = req.user['refreshToken'];
    return this.jwtHelper.refreshToken(userId, refreshToken);
  }
}
