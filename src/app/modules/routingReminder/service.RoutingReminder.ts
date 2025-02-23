/* eslint-disable @typescript-eslint/no-unused-vars */
import { PipelineStage, Schema, Types } from 'mongoose';
import { paginationHelper } from '../../../helper/paginationHelper';

import { IGenericResponse } from '../../interface/common';
import { IPaginationOption } from '../../interface/pagination';

import { Job, JobsOptions } from 'bullmq';
import { Request } from 'express';
import httpStatus from 'http-status';
import { ENUM_USER_ROLE } from '../../../global/enums/users';
import {
  ILookupCollection,
  LookupAnyRoleDetailsReusable,
  LookupReusable,
} from '../../../helper/lookUpResuable';
import { DateFormatterDayjsOop } from '../../../utils/DateAllUtlsFuntion';
import { UuidBuilder } from '../../../utils/uuidGenerator';
import ApiError from '../../errors/ApiError';
import { ENUM_QUEUE_NAME } from '../../queue/consent.queus';
import { emailQueue } from '../../queue/jobs/emailQueues';
import { CronPatternGenerator } from '../../queue/utls.queue';
import { IUserRef, IUserRefAndDetails } from '../allUser/typesAndConst';
import { RoutingReminder_SEARCHABLE_FIELDS } from './constant.RoutingReminder';
import { generateReminderEmail } from './emailTempleted';
import {
  IRoutingReminder,
  IRoutingReminderFilters,
} from './interface.RoutingReminder';
import { RoutingReminder } from './model.RoutingReminder';
import { RoutingReminderOop } from './utls.RoutingReminder';

const createRoutingReminderByDb = async (
  payload: IRoutingReminder,
  req: Request,
): Promise<IRoutingReminder | null> => {
  let result;
  try {
    const user = req.user as IUserRefAndDetails;
    //***********time************* */
    const oopDate = new DateFormatterDayjsOop(
      payload.pickDate?.toString() as string, // '2025-03-21T06:48:51.107+00:00'
    );
    const afterReplaceTime = oopDate.replaceTime(payload.startTime); //2025-02-22T09:45:29.358Z
    const getDellaTime =
      new Date(afterReplaceTime).getTime() - new Date().getTime(); //returns milliseconds

    const delayTime =
      getDellaTime > 5 * 60 * 1000
        ? getDellaTime - 5 * 60 * 1000
        : getDellaTime;
    //***********end************* */
    const jobId = new UuidBuilder().generateUuid();
    const jobOption: JobsOptions = {
      // repeat: {
      //   pattern: '0 9 * * 6,0', // Corrected syntax for TypeScript
      // },
      jobId: jobId,
      removeOnComplete: {
        age: 3600, // keep up to 1 hour
        count: 1000, // keep up to 1000 jobs
      },
      removeOnFail: {
        age: 24 * 3600, // keep up to 24 hours
      },
      // delay: delayTime, // delay
      attempts: 3,
      timestamp: new Date().getTime(), //as like createAt
    };
    if (payload.scheduleType === 'week' && payload.daysOfWeek) {
      const getCornPattern = new CronPatternGenerator(
        payload.startTime, //example: 13:25:45
        payload.daysOfWeek, //monday,wednesday,friday
      );
      jobOption.repeat = {
        pattern: getCornPattern.generate(), //45 25 13 * * 1,3,5,6
      };
    } else {
      jobOption.delay = delayTime;
    }

    payload = {
      ...payload, //
      cornJob: {
        jobId: jobId,
        isActive: true,
      },
    };
    result = await RoutingReminder.create(payload);
    const cornJob = await emailQueue.add(
      ENUM_QUEUE_NAME.email,
      {
        receiver_email: user.details.email,
        htmlContent: generateReminderEmail(result),
      },
      jobOption,
    );
  } catch (error: any) {
    throw new ApiError(error?.statuscode || 400, error.message);
  }

  return result;
};

//getAllRoutingReminderFromDb
const getAllRoutingReminderFromDb = async (
  filters: IRoutingReminderFilters,
  paginationOptions: IPaginationOption,
  req: Request,
): Promise<IGenericResponse<IRoutingReminder[]>> => {
  const user = req?.user as IUserRef;
  //****************search and filters start************/
  const {
    searchTerm,
    createdAtFrom,
    createdAtTo,
    //
    pickDateFrom,
    pickDateTo,
    //
    needProperty,
    ...filtersData
  } = filters;
  //***********cache start************* */
  if (user.role !== ENUM_USER_ROLE.admin) {
    filtersData['author.userId'] = user.userId.toString();
  }
  filtersData.isDelete = filtersData.isDelete
    ? filtersData.isDelete == 'true'
      ? true
      : false
    : false;
  const andConditions = [];
  if (searchTerm) {
    andConditions.push({
      $or: RoutingReminder_SEARCHABLE_FIELDS.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    const condition = Object.entries(filtersData).map(
      //@ts-ignore
      ([field, value]: [keyof typeof filtersData, string]) => {
        let modifyFiled;
        /* 
        if (field === 'userRoleBaseId' || field === 'referRoleBaseId') {
        modifyFiled = { [field]: new Types.ObjectId(value) };
        } else {
         modifyFiled = { [field]: value };
         } 
       */
        if (
          field === 'author.userId' ||
          field === 'author.roleBaseUserId' ||
          field === 'productId'
        ) {
          modifyFiled = {
            [field]: new Types.ObjectId(value),
          };
        } else {
          modifyFiled = { [field]: value };
        }
        // console.log(modifyFiled);
        return modifyFiled;
      },
    );
    //
    if (createdAtFrom && !createdAtTo) {
      const timeTo = new Date(createdAtFrom);
      const createdAtToModify = new Date(timeTo.setHours(23, 59, 59, 999));
      condition.push({
        //@ts-ignore
        createdAt: {
          //@ts-ignore
          $gte: new Date(createdAtFrom),
          $lte: new Date(createdAtToModify),
        },
      });
    } else if (createdAtFrom && createdAtTo) {
      condition.push({
        //@ts-ignore
        createdAt: {
          //@ts-ignore
          $gte: new Date(createdAtFrom),
          $lte: new Date(createdAtTo),
        },
      });
    }

    //
    //
    if (pickDateFrom && !pickDateTo) {
      const timeTo = new Date(pickDateFrom);
      const pickDateToModify = new Date(timeTo.setHours(23, 59, 59, 999));
      condition.push({
        //@ts-ignore
        createdAt: {
          //@ts-ignore
          $gte: new Date(pickDateFrom),
          $lte: new Date(pickDateToModify),
        },
      });
    } else if (pickDateFrom && pickDateTo) {
      condition.push({
        //@ts-ignore
        createdAt: {
          //@ts-ignore
          $gte: new Date(pickDateFrom),
          $lte: new Date(pickDateTo),
        },
      });
    }

    //
    andConditions.push({
      $and: condition,
    });
  }

  //****************search and filters end**********/

  //****************pagination start **************/
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(paginationOptions);

  const sortConditions: { [key: string]: 1 | -1 } = {};
  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  }
  //****************pagination end ***************/

  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  // const result = await RoutingReminder.find(whereConditions)
  //   .populate('thumbnail')
  //   .sort(sortConditions)
  //   .skip(Number(skip))
  //   .limit(Number(limit));
  const pipeline: PipelineStage[] = [
    { $match: whereConditions },
    { $sort: sortConditions },
    { $skip: Number(skip) || 0 },
    { $limit: Number(limit) || 10 },
  ];
  const collections: ILookupCollection<any>[] = []; // Use the correct type here

  if (needProperty && needProperty.includes('author')) {
    LookupAnyRoleDetailsReusable(pipeline, {
      collections: [
        {
          roleMatchFiledName: 'author.role',
          idFiledName: '$author.roleBaseUserId',
          pipeLineMatchField: '$_id',
          outPutFieldName: 'details',
          margeInField: 'author',
        },
      ],
    });
  }
  if (collections.length) {
    // Use the collections in LookupReusable
    LookupReusable<any, any>(pipeline, {
      collections: collections,
    });
  }

  // const result = await RoutingReminder.aggregate(pipeline);
  // const total = await RoutingReminder.countDocuments(whereConditions);
  const [result, total] = await Promise.all([
    RoutingReminder.aggregate(pipeline),
    RoutingReminder.countDocuments(whereConditions),
  ]);
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// get single RoutingRemindere form db
const getSingleRoutingReminderFromDb = async (
  id: string,
  filters: IRoutingReminderFilters,
  req: Request,
): Promise<IRoutingReminder | null> => {
  const user = req.user as IUserRef;
  const pipeline: PipelineStage[] = [
    { $match: { _id: new Types.ObjectId(id), isDelete: false } },
    ///***************** */ images field ******start
  ];
  const result = await RoutingReminder.aggregate(pipeline);
  const dataReturn = result.length ? result[0] : null;
  if (!dataReturn) {
    throw new ApiError(httpStatus.NOT_FOUND, 'RoutingReminder not found');
  }
  if (
    dataReturn.author.userId.toString() !== user.userId.toString() &&
    user.role !== ENUM_USER_ROLE.admin
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete');
  }
  return dataReturn;
};

// update RoutingRemindere form db
const updateRoutingReminderFromDb = async (
  id: string,
  payload: Partial<IRoutingReminder>,
  req: Request,
): Promise<IRoutingReminder | null> => {
  const user = req.user as IUserRefAndDetails;
  const redis = new RoutingReminderOop(id);
  const isExist = await redis.getAndSetCase();
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'RoutingReminder not found');
  }
  if (
    isExist.author.userId.toString() !== user.userId.toString() &&
    user.role !== ENUM_USER_ROLE.admin
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete');
  }
  const result = await RoutingReminder.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });
  if (!result) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update');
  }
  const jobd = await Job.fromId(emailQueue, result.cornJob.jobId);
  await jobd?.remove();

  const jobOption: JobsOptions = { ...jobd?.opts };
  if (result.scheduleType === 'week' && result.daysOfWeek) {
    const getCornPattern = new CronPatternGenerator(
      result.startTime, //example: 13:25:45
      result.daysOfWeek, //monday,wednesday,friday
    );
    jobOption.repeat = {
      pattern: getCornPattern.generate(), //45 25 13 * * 1,3,5,6
    };
  } else {
    //***********time************* */
    const oopDate = new DateFormatterDayjsOop(
      result.pickDate?.toString() as string, // '2025-03-21T06:48:51.107+00:00'
    );
    const afterReplaceTime = oopDate.replaceTime(result.startTime); //2025-02-22T09:45:29.358Z
    const getDellaTime =
      new Date(afterReplaceTime).getTime() - new Date().getTime(); //returns milliseconds
    const delayTime =
      getDellaTime > 5 * 60 * 1000
        ? getDellaTime - 5 * 60 * 1000
        : getDellaTime;
    //***********end************* */
    jobOption.delay = delayTime;
  }

  const cornJob = await emailQueue.add(
    ENUM_QUEUE_NAME.email,
    {
      receiver_email: user.details.email,
      htmlContent: generateReminderEmail(result),
    },
    jobOption,
  );
  return result;
};

// delete RoutingRemindere form db
const deleteRoutingReminderByIdFromDb = async (
  id: string,
  query: IRoutingReminderFilters,
  req: Request,
): Promise<IRoutingReminder | null> => {
  const user = req.user as IUserRef;
  const isExist = (await RoutingReminder.findById(id)) as IRoutingReminder & {
    _id: Schema.Types.ObjectId;
  };
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'RoutingReminder not found');
  }
  if (
    isExist.author.userId.toString() !== user.userId.toString() &&
    user.role !== ENUM_USER_ROLE.admin
  ) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to delete');
  }

  const result = await RoutingReminder.findOneAndUpdate(
    { _id: id },
    { isDelete: true, 'cornJob.isActive': false },
    { new: true, runValidators: true },
  );

  if (!result) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Failed to delete');
  }
  const jobd = await Job.fromId(emailQueue, result.cornJob.jobId);
  await jobd?.remove();

  return result;
};
//
const updateRoutingReminderSerialNumberFromDb = async (
  payload: { _id: string; number: number }[],
): Promise<IRoutingReminder[] | null> => {
  const premissAll: any = [];
  for (let i = 0; i < payload.length; i++) {
    premissAll.push(
      RoutingReminder.findByIdAndUpdate(
        payload[i]._id,
        { serialNumber: payload[i].number },
        { new: true, runValidators: true },
      ),
    );
  }
  const result = await Promise.all(premissAll);
  // console.log('🚀 ~ result:', result);
  return result;
};

export const RoutingReminderService = {
  createRoutingReminderByDb,
  getAllRoutingReminderFromDb,
  getSingleRoutingReminderFromDb,
  updateRoutingReminderFromDb,
  deleteRoutingReminderByIdFromDb,
  //
  updateRoutingReminderSerialNumberFromDb,
};
