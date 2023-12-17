import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

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
}
