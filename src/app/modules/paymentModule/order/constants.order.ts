export enum ENUM_ORDER_STATUS {
  pending = 'pending', // first of all order is default pending
  accept = 'accept', // receiver is accept only
  reject = 'reject', // receiver is reject only
  completed = 'completed', //when accepted sender and receiver . then update completed
  cancel = 'cancel',
}

export const OrderSearchableFields = ['note'];

export const OrderFilterableFields = [
  'myData',
  'authorUserId',
  'authorRoleBaseUserId',
  'packageId',
  'paymentId',
  'accessType',
  'orderType',
  'fileType',
  'isTrial',
  /**
   * @property {orderType} 
   * @param {packageByPayment} - only package by payment and  ['paymentId']: { $exists: true },
   * @param {file} - He can purchase the file/or get it from a package only exist productId then accessthis,
  
   */
  // always required filter
  'searchTerm',
  'delete', // for permanent delete
  'status',
  'isDelete',
  'needProperty',
  'createdAtFrom',
  'createdAtTo',
];
