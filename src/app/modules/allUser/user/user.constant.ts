export const userSearchableFields = ['email', 'userUniqueId'];

export const userFilterableFields = [
  'role',
  'multipleRole',
  'needProperty',
  'verify',
  'company',
  'authUserId',
  //
  'latitude',
  'longitude',
  'maxDistance',
  // always required filter
  'searchTerm',
  'delete', // for permanent delete
  'status',
  'socketStatus',
  'isDelete',
  'createdAtFrom',
  'createdAtTo',
];

export enum ENUM_COMPANY_TYPE {
  companyOne = 'companyOne',
  companyTwo = 'companyTwo',
}
