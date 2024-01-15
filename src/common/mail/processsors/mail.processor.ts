import { MailerService } from '@nestjs-modules/mailer';
import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { User } from 'src/users/entities/user.entity';
import { CONFIRM_REGISTRATION, MAIL_QUEUE } from '../constants';

@Processor(MAIL_QUEUE)
export class MailProcessor {
  constructor(
    private readonly mailerService: MailerService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.debug(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueCompleted()
  public onComplete(job: Job) {
    this.logger.debug(`Completed job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  public onError(job: Job<any>, error: any) {
    this.logger.error(
      `Failed job ${job.id} of type ${job.name}: ${error.message}`,
      error.stack,
    );
  }

  @Process(CONFIRM_REGISTRATION)
  async sendConfirmationMail(job: Job<{ user: User }>) {
    console.log(
      `Sending confirm registration email to '${job.data.user.email}'`,
    );

    try {
      return this.mailerService.sendMail({
        to: job.data.user.email,
        subject: 'Confirm your Email',
        template: 'email-confirmation',
        context: {
          token: job.data.user.confirmationToken,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to send confirmation email to '${job.data.user.email}`,
      );
    }
  }
}
