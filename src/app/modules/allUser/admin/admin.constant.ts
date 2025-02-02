export const adminSearchableFields = [
  'email',
  'name.firstName',
  'name.lastName',
  'address',
  'userUniqueId',
];

export const adminFilterableFields = [
  'author',
  'userId',
  'gender',
  'contactNumber',
  // always required filter
  'searchTerm',
  'delete', // for permanent delete
  'status',
  'isDelete',
];
