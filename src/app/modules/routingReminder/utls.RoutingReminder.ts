import { emailQueue } from '../../queue/jobs/emailQueues';

export class EmailSenderQueueOop {
  readonly globalEmailQueue = emailQueue;
  //   constructor() {}

  async checkEmailQueueResult(
    to: string,
    subject: string,
    content: string,
  ): Promise<void> {
    await this.globalEmailQueue.add('sendEmail', { to, subject, content });
  }
}
