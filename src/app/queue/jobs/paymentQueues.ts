import { Job, Queue, QueueEvents, Worker } from 'bullmq';

import { Types } from 'mongoose';
import { ENUM_STATUS } from '../../../global/enum_constant_type';
import { ISellerUser } from '../../modules/allUser/seller/interface.seller';
import { IUserRef } from '../../modules/allUser/typesAndConst';
import { IOrder } from '../../modules/order/interface.order';
import { Order } from '../../modules/order/models.order';
import { ENUM_SELLER_PAID_PAYMENT_STATUS } from '../../modules/paymentModule/paidSellerPaymentHistory/interface.paidSellerPaymentHistory';
import { PaidSellerPaymentHistory } from '../../modules/paymentModule/paidSellerPaymentHistory/model.paidSellerPaymentHistory';
import { stripe } from '../../modules/paymentModule/payment/payment.utls';
import { IPaymentHistory } from '../../modules/paymentModule/paymentHistory/interface.paymentHistory';
import { redisConnectionString } from '../../redis/redis';
import { errorLogger } from '../../share/logger';
import { ENUM_QUEUE_NAME } from '../consent.queus';
import { defaultQueueConfig } from '../queue.config';
export const paymentQueue = new Queue(ENUM_QUEUE_NAME.payment, {
  connection: redisConnectionString,
  defaultJobOptions: {
    ...defaultQueueConfig,
    // delay: 500,
  },
});
//----------checks --- payment queue----------------------------
const paymentQueueEvents = new QueueEvents(ENUM_QUEUE_NAME.payment);
export const checkPaymentQueueResult = (jobId: string) => {
  return new Promise((resolve, reject) => {
    paymentQueueEvents.on(
      'completed',
      ({ jobId: completedJobId, returnvalue }) => {
        if (jobId === completedJobId) {
          resolve(returnvalue);
        }
      },
    );
    paymentQueueEvents.on('failed', ({ jobId: failedJobId, failedReason }) => {
      if (jobId === failedJobId) {
        reject(new Error(failedReason));
      }
    });
  });
};
//----------end --- payment queue----------------------------

export const handler = new Worker(
  ENUM_QUEUE_NAME.payment,
  async (job: Job) => {
    // console.log('��� ~ job.data:', job.data);
    const { orderId } = job.data as { orderId: string };
    console.log('🚀 ~ orderId:', orderId);
    let result: any;
    try {
      const findOrder = (await Order.isOrderExistMethod(orderId, {
        populate: true,
        needProperty: ['paymentId', 'seller'],
      })) as IOrder & {
        paymentDetails: IPaymentHistory;
        seller: IUserRef & {
          details: ISellerUser;
        };
        _id: string;
      };
      const totalAmount = findOrder.paymentDetails.amount_received;
      const paidAmount = totalAmount * (findOrder.sellerPercents / 100);
      const transfer = await stripe.transfers.create({
        amount: paidAmount * 100, // count cents -- $4 = 400 cents
        currency: findOrder.paymentDetails?.currency || 'usd', //Mx er somoy mxn hobe
        destination: findOrder?.seller?.details?.stripeAccount
          ?.accountNo as string, //stripeConnectAccountID
        //@ts-ignore
        transfer_group: findOrder?._id?.toString() || '',
        metadata: {
          //@ts-ignore
          orderId: findOrder?._id?.toString() || '',
          sellerUserId: findOrder?.seller?.userId?.toString() || '',
          buyerUserId: findOrder?.buyer?.userId?.toString() || '',
        },
      });
      console.log('transfer', transfer);

      if (transfer.id) {
        await PaidSellerPaymentHistory.findOneAndUpdate(
          {
            orderId: new Types.ObjectId(findOrder?._id),
            isDelete: false,
            'queue.jobId': job.id,
          },
          {
            // cornJob: {
            //   isActive: false,
            //   status: ENUM_STATUS.INACTIVE,
            // },
            tr_id: transfer.id,
            'cornJob.isActive': false,
            'cornJob.status': ENUM_STATUS.INACTIVE,
            paymentStatus: ENUM_SELLER_PAID_PAYMENT_STATUS.success,
          },
        );
      }
    } catch (error: any) {
      const retryAttempts = job.opts.attempts || 0;
      let delay;

      if (retryAttempts === 0) {
        // First retry after 1 days
        delay = 1 * 24 * 60 * 60 * 1000; // 1 days in milliseconds
      }
      //    else {
      //     // Subsequent retries every 1 day
      //     delay = 1 * 24 * 60 * 60 * 100; // 1 day in milliseconds
      //   }

      // Increment the number of attempts
      const newAttempts = (retryAttempts || 0) + 1;
      await paymentQueue.add(job.name, job.data, {
        delay: delay,
        jobId: job.id, // Retain the same job ID if desired
        attempts: newAttempts, // Set the number of attempts
        removeOnComplete: false, // Keep the job in the queue until it completes
        removeOnFail: false, // Keep the job in the queue for retry
      });
      //! --when any error then automatically set schedule same job for 1day time sate
      const PaidSeller = await PaidSellerPaymentHistory.findOneAndUpdate(
        {
          orderId: new Types.ObjectId(orderId),
          isDelete: false,
          'queue.jobId': job.id,
        },
        {
          paymentStatus: ENUM_SELLER_PAID_PAYMENT_STATUS.failure,
          $push: {
            errorsDetails: {
              types: 'queue_error',
              message: error?.message as string,
              request_log_url: error?.request_log_url, // Adjust as needed
            },
          },
          'cornJob.endDate': new Date(
            new Date().setDate(new Date().getDate() + 1),
          ),
        },
      );
      errorLogger.error(PaidSeller),
        // Optionally, remove the failed job from the queue
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
