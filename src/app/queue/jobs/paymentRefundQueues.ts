import { Job, Queue, QueueEvents, Worker } from 'bullmq';

import { ENUM_YN } from '../../../global/enum_constant_type';
import { stripeRefund } from '../../modules/paymentModule/payment/payment.utls';
import { IPaymentHistory } from '../../modules/paymentModule/paymentHistory/interface.paymentHistory';
import { PaymentHistory } from '../../modules/paymentModule/paymentHistory/model.paymentHistory';
import { redisConnectionString } from '../../redis/redis';
import { ENUM_QUEUE_NAME } from '../consent.queus';
import { defaultQueueConfig } from '../queue.config';
export const paymentRefundQueue = new Queue(ENUM_QUEUE_NAME.refund, {
  connection: redisConnectionString,
  defaultJobOptions: {
    ...defaultQueueConfig,
    // delay: 500,
  },
});
//----------checks --- payment queue----------------------------
const paymentRefundQueueEvents = new QueueEvents(ENUM_QUEUE_NAME.refund);
export const checkPaymentQueueResult = (jobId: string) => {
  return new Promise((resolve, reject) => {
    paymentRefundQueueEvents.on(
      'completed',
      ({ jobId: completedJobId, returnvalue }) => {
        if (jobId === completedJobId) {
          resolve(returnvalue);
        }
      },
    );
    paymentRefundQueueEvents.on(
      'failed',
      ({ jobId: failedJobId, failedReason }) => {
        if (jobId === failedJobId) {
          reject(new Error(failedReason));
        }
      },
    );
  });
};
//----------end --- payment queue----------------------------

export const handler = new Worker(
  ENUM_QUEUE_NAME.refund,
  async (job: Job) => {
    // console.log('��� ~ job.data:', job.data);
    const { paymentId } = job.data as { paymentId: string };
    let result: any;
    try {
      const findPayment = (await PaymentHistory.findById(
        paymentId,
      )) as IPaymentHistory;
      if (findPayment?.orderId) {
        const refund = await stripeRefund({ ch_id: findPayment.ch_id });
        const refundPayment = await PaymentHistory.findOneAndUpdate(
          { _id: paymentId },
          {
            refund: {
              isRefund: ENUM_YN.YES,
              stripeRefundId: refund.id,
              balance_transaction: refund.balance_transaction,
              ch_id: refund.charge,
            },
          },
        );
      }
    } catch (error: any) {
      const retryAttempts = job.opts.attempts || 0;
      let delay;

      if (retryAttempts === 0) {
        // First retry after 1 days
        delay = 1 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
      }
      //    else {
      //     // Subsequent retries every 1 day
      //     delay = 1 * 24 * 60 * 60 * 100; // 1 day in milliseconds
      //   }

      // Increment the number of attempts
      const newAttempts = (retryAttempts || 0) + 1;
      await paymentRefundQueue.add(job.name, job.data, {
        delay: delay,
        jobId: job.id, // Retain the same job ID if desired
        attempts: newAttempts, // Set the number of attempts
        removeOnComplete: false, // Keep the job in the queue until it completes
        removeOnFail: false, // Keep the job in the queue for retry
      });
      //! --when any error then automatically set schedule same job for 1day time sate

      await job.remove();
    }
    // console.log('🚀 ~ process.pid:', process.pid);
    return { result };
    // {
    //     ...findOrder,
    //     paymentStatus: ENUM_SELLER_PAID_PAYMENT_STATUS.failure,
    //     error: {
    //       message: error?.message,
    //       types: error?.type,
    //       request_log_url: error?.raw.doc_url,
    //     },
    //   }
    // console.log('🚀 ~ result:', result);
  },
  {
    connection: redisConnectionString,
    removeOnComplete: {
      age: 3600, // keep up to 1 hour
      count: 1000, // keep up to 1000 jobs
    },
    removeOnFail: {
      count: 1000, // keep up to 1000 jobs
      age: 24 * 3600, // keep up to 24 hours
    },
  },
);
