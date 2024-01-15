import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { winstonConfig } from './common/winston/winston.config';
import { WinstonModule } from 'nest-winston';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { BullModule } from '@nestjs/bull';
import { MailModule } from './common/mail/mailer.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async () => ({
        redis: {
          host: 'localhost',
          port: 6379,
        },
      }),
    }),
    WinstonModule.forRoot(winstonConfig),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.DB_URL),
    UsersModule,
    AuthModule,
    MailModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: ClassSerializerInterceptor,
    // },
  ],
})
export class AppModule {}
