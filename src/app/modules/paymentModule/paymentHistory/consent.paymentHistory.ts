export const PAYMENT_HISTORY_SEARCHABLE_FIELDS = ['title'];
export const PAYMENT_HISTORY_FILTERABLE_FIELDS = [
  'auth',
  'author.userId',
  'author.roleBaseUserId',
  'productId',
  'orderId',
  'payment_type',
  'isRefund',
  'dateRangeFirst',
  'dateRangeSecond',
  'time', // "daily" | "weekly" | "Monthly";
  'yearToQuery', // only use chart
  'totalIncome',
  // always required filter
  'searchTerm',
  'delete', // for permanent delete
  'status',
  'isDelete',
  'needProperty',
  'createdAtFrom',
  'createdAtTo',
];
