import { Types } from 'mongoose';
import { ENUM_REDIS_KEY } from '../../redis/consent.redis';
import {
  RedisAllQueryServiceOop,
  RedisAllSetterServiceOop,
} from '../../redis/service.redis';
import { IAddToCart } from './interface.addToCart';
import { AddToCart } from './model.addToCart';

export class AddToCartOop {
  private id: string;
  cacheData: IAddToCart | null = null;
  constructor(id: string) {
    this.id = id.toString();
  }
  async getAndSetCase(patten?: string) {
    const getCase = new RedisAllQueryServiceOop();
    const key = patten || `${ENUM_REDIS_KEY.RIS_AddToCart}${this.id}`;
    const getAddToCart = await getCase.getAnyDataByKey(key);
    if (getAddToCart) {
      return getAddToCart;
    }
    const cacheData = await AddToCart.findOne({
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
