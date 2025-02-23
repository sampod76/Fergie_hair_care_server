import { Job } from 'bullmq';
import { ENUM_QUEUE_NAME } from './app/queue/consent.queus';
import { emailQueue } from './app/queue/jobs/emailQueues';
import { CronPatternGenerator } from './app/queue/utls.queue';
import { createDirectories } from './utils/createDir';

const TestFile = async () => {
  try {
    createDirectories();
    await asyncFunction();
  } catch (error) {
    console.log(error);
  }
};

const asyncFunction = async () => {
  try {
    const jobId = 'aa02e4b2-734d-482f-af57-4fb2a2f05cd';
    await emailQueue.add(
      ENUM_QUEUE_NAME.email,
      { sampod: 'ds' },
      { jobId: jobId },
    );
    const jobd = await Job.fromId(emailQueue, jobId);
    // console.log(jobd, 'job');
    // Example Usage
    const pattern = new CronPatternGenerator('13:25:45', [
      'monday',
      'wednesday',
      'friday',
      'saturday',
    ]);
    console.log(`Generated Cron Pattern: ${pattern.generate()}`);
  } catch (error) {
    console.log(error);
  }
};

export { TestFile };
