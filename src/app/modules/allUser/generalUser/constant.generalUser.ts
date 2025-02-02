export const GeneralUserSearchableFields = [
  'email',
  'name.firstName',
  'name.lastName',
  'address',
  'contactNumber',
  'userUniqueId',
];

export const GeneralUserFilterableFields = [
  'userUniqueId',
  'userId',
  'gender',
  'countryName',
  'authUserId',
  'skills',
  'dateOfBirth',
  'needProperty',
  'company',
  'verify',
  'createdAtFrom',
  'createdAtTo',
  // always required filter
  'searchTerm',
  'delete', // for permanent delete
  'status',
  'isDelete',
];
