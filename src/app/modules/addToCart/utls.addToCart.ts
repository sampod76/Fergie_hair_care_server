import { Types } from 'mongoose';
import { IAddToCart } from './interface.addToCart';
import { AddToCart } from './model.addToCart';
import {
  RedisAllQueryServiceOop,
  RedisAllSetterServiceOop,
} from '../../redis/service.redis';
import { ENUM_REDIS_KEY } from '../../redis/consent.redis';

export class AddToCartOop {
  readonly id: string;
  caseData: IAddToCart | null = null;
  constructor(id: string) {
    this.id = id;
  }
  async getAndSetCase(userId: string, patten?: string) {
    const getCase = new RedisAllQueryServiceOop();
    const key = `${ENUM_REDIS_KEY.RIS_AddToCart}${userId}:${this.id}`;
    const getAddToCart = getCase.getAnyDataByKey(key);
    if (getAddToCart) {
      return getAddToCart;
    }
    const caseData = await AddToCart.findOne({
      _id: new Types.ObjectId(this.id),
      'author.userId': new Types.ObjectId(userId),
      isDelete: false,
    });
    if (!caseData) {
      return null;
    }
    this.caseData = caseData;
    const setter = new RedisAllSetterServiceOop();
    await setter.redisSetter([{ key: key, value: caseData }]);
  }
}
