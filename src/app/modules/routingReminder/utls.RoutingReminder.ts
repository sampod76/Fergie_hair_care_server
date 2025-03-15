import { Types } from 'mongoose';
import { ENUM_REDIS_KEY } from '../../redis/consent.redis';
import {
  RedisAllQueryServiceOop,
  RedisAllSetterServiceOop,
} from '../../redis/service.redis';
import { IRoutingReminder } from './interface.RoutingReminder';
import { RoutingReminder } from './model.RoutingReminder';

export class RoutingReminderOop {
  private id: string;
  cacheData: IRoutingReminder | null = null;
  constructor(id: string) {
    this.id = id.toString();
  }
  async getAndSetCase(patten?: string) {
    const getCase = new RedisAllQueryServiceOop();
    const key = patten || `${ENUM_REDIS_KEY.RIS_RoutingReminder}${this.id}`;
    const getRoutingReminder = await getCase.getAnyDataByKey(key);
    console.log(
      '🚀 ~ RoutingReminderOop ~ getAndSetCase ~ getRoutingReminder:',
      getRoutingReminder,
    );
    if (getRoutingReminder) {
      return getRoutingReminder;
    }
    const cacheData = await RoutingReminder.findOne({
      _id: new Types.ObjectId(this.id),
      isDelete: false,
    });
    console.log(
      '🚀 ~ RoutingReminderOop ~ getAndSetCase ~ cacheData:',
      cacheData,
    );
    if (!cacheData) {
      return null;
    }
    this.cacheData = cacheData;
    const setter = new RedisAllSetterServiceOop();
    await setter.redisSetter([{ key: key, value: cacheData }]);
    return cacheData;
  }
}
