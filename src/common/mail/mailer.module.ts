import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bull';
import * as path from 'path';
import { MailProcessor } from './processsors/mail.processor';
import { MAIL_QUEUE } from './constants';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        secure: false,
        auth: {
          user: 'rayboww.rn@gmail.com',
          pass: 'mdywglfaurrurtni',
        },
      },
      defaults: { from: '"No Reply" <noreply@example.com>' },
      template: {
        dir: path.resolve(__dirname, './templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    BullModule.registerQueue({
      name: MAIL_QUEUE,
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
