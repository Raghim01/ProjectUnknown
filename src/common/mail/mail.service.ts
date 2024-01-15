import { Inject, Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/entities/user.entity';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { MailProcessor } from './processsors/mail.processor';
import { CONFIRM_REGISTRATION, MAIL_QUEUE } from './constants';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @Inject('winston') private readonly logger: Logger,
    @InjectQueue(MAIL_QUEUE) private readonly mailQueue: Queue,
  ) {}

  async sendUserConfirmation(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Confirm your Email',
      template: 'email-confirmation',
      context: {
        token: user.confirmationToken,
      },
    });
  }

  async sendPasswordRecover(user: User) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Recover Password email',
      template: 'recover-password',
      context: {
        token: user.recoveryToken,
      },
    });
  }

  public async sendConfirmationEmail(user: User): Promise<void> {
    try {
      await this.mailQueue.add(CONFIRM_REGISTRATION, {
        user,
      });
    } catch (error) {
      this.logger.error(
        `Error queueing registration email to user ${user.email}`,
      );
    }
  }
}
