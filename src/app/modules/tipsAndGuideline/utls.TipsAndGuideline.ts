import { Types } from 'mongoose';
import { ENUM_REDIS_KEY } from '../../redis/consent.redis';
import {
  RedisAllQueryServiceOop,
  RedisAllSetterServiceOop,
} from '../../redis/service.redis';
import { ITipsAndGuideline } from './interface.TipsAndGuideline';
import { TipsAndGuideline } from './model.TipsAndGuideline';

export class TipsAndGuidelineOop {
  private id: string;
  cacheData: ITipsAndGuideline | null = null;
  constructor(id: string) {
    this.id = id.toString();
  }
  async getAndSetCase(patten?: string) {
    const getCase = new RedisAllQueryServiceOop();
    const key = patten || `${ENUM_REDIS_KEY.RIS_TipsAndGuideline}${this.id}`;
    const getTipsAndGuideline = getCase.getAnyDataByKey(key);
    if (getTipsAndGuideline) {
      return getTipsAndGuideline;
    }
    const cacheData = await TipsAndGuideline.findOne({
      _id: new Types.ObjectId(this.id),
      isDelete: false,
    });
    if (!cacheData) {
      return null;
    }
    this.cacheData = cacheData;
    const setter = new RedisAllSetterServiceOop();
    await setter.redisSetter([{ key: key, value: cacheData }]);
    return cacheData;
  }
}
