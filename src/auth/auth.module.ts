import { Module } from '@nestjs/common';

import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtHelper } from 'src/common/jwt/token-helper.functions';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from 'src/common/mail/mailer.module';
import { User, UserSchema } from 'src/users/entities/user.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    UsersModule,
    MailModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    JwtHelper,
  ],
})
export class AuthModule {}
