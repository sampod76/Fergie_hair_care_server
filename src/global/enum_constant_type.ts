//---------------------------------------
export const STATUS_ARRAY = ['active', 'inactive', 'block'];
export type I_STATUS = 'active' | 'inactive' | 'block';
export enum ENUM_STATUS {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BLOCK = 'block',
  COMPLETED = 'completed', //User only used for
}
//---------------------------------------
export type I_SOCKET_STATUS = 'online' | 'offline';
export const SOCKET_STATUS_ARRAY = ['online', 'offline'];
export enum ENUM_SOCKET_STATUS {
  ONLINE = 'online',
  OFFLINE = 'offline',
}

//---------------------------------------
export enum ENUM_YN {
  YES = 'yes',
  NO = 'no',
}
export const YN_ARRAY = ['yes', 'no'];
export type I_YN = 'yes' | 'no';
