import { NextFunction, Request, Response } from 'express';

import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import { ENUM_STATUS } from '../../global/enum_constant_type';
import { jwtHelpers } from '../../helper/jwtHelpers';
import ApiError from '../errors/ApiError';
import { validateUserInDbOrRedis } from '../modules/allUser/user/user.utils';
import { redisClient } from '../redis/redis';
// Dedicated Redis service
const getUserFromCache = async (token: string) => {
  const cachedUser = await redisClient.get(token);
  return cachedUser ? JSON.parse(cachedUser) : null;
};
//
const cacheUser = async (token: string, data: any, ttl: number) => {
  if (ttl > 0) {
    await redisClient.set(token, JSON.stringify(data), 'EX', ttl);
  }
};
// Token verification with TTL calculation
const verifyAndCacheToken = async (token: string, secret: Secret) => {
  const verifiedUser = jwtHelpers.verifyToken(token, secret);
  const currentTimestampInSeconds = Math.floor(Date.now() / 1000);
  const llt = Math.max(verifiedUser.exp! - currentTimestampInSeconds, 0);

  if (llt > 0) {
    verifiedUser.status = ENUM_STATUS.ACTIVE;
    await cacheUser(token, verifiedUser, llt);
  }
  return verifiedUser;
};
const authMiddleware =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
      }

      let verifiedUser = await getUserFromCache(token);
      if (!verifiedUser) {
        verifiedUser = await verifyAndCacheToken(
          token,
          config.jwt.secret as Secret,
        );
      }

      if (verifiedUser?.status && verifiedUser?.status !== ENUM_STATUS.ACTIVE) {
        throw new ApiError(httpStatus.FORBIDDEN, 'forbidden access');
      }
      req.user = verifiedUser;

      // role diye guard korar jnno
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser?.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'forbidden access');
      }

      //--validation in database or raids--
      const user = await validateUserInDbOrRedis([verifiedUser?.userId]);
      req.user = {
        ...req.user,
        details: user[0],
        accessToken: token,
      };

      next();
    } catch (error) {
      next(error);
    }
  };

export default authMiddleware;

/* 

import { NextFunction, Request, Response } from 'express';

import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import { jwtHelpers } from '../../helper/jwtHelpers';
import ApiError from '../errors/ApiError';
import { validateUserInDbOrRedis } from '../modules/allUser/user/user.utils';

const authMiddleware =
  (...requiredRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      //get authorization token
      let verifiedUser = null;
      const token = req.headers.authorization;

      if (!token) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
      }

      // verify token only general user

      try {
        if (token) {
          verifiedUser = jwtHelpers.verifyToken(
            token,
            config.jwt.secret as Secret,
          );

          req.user = verifiedUser;
        }
      } catch (error) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
      }

      // role diye guard korar jnno
      if (requiredRoles.length && !requiredRoles.includes(verifiedUser?.role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'forbidden access');
      }
      //--validation in database or raids--
      const user = await validateUserInDbOrRedis([verifiedUser?.userId]);
      req.user = {
        ...req.user,
        details: user[0],
      };

      next();
    } catch (error) {
      next(error);
    }
  };

export default authMiddleware;

*/
