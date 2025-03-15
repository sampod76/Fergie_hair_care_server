export const ServiceLogger_SEARCHABLE_FIELDS = ['productTitle'];
export const ServiceLogger_FILTERABLE_FIELDS = [
  'searchTerm',
  'logType',
  'status',
  'delete',
  'serialNumber',
  'isDelete',
  'cache',
  //
  'logDateFrom',
  'logDateTo',
  //
  'needProperty',
  'createdAtFrom',
  'createdAtTo',
  //
  'author.userId',
  'author.roleBaseUserId',
  //--category
  'Wash_Day_Mood',
  'Choice_of_Treatment',
  'Post_Wash_Day_Style',
  'Hair_Health',
  'What_Style_Did_You_Do',
  'Style_Rating',
  'Hair_Service_Quality',
  'Duration_of_style_wear',
  'Maintenance_Routine',
  'Haircut_Type',
  'Length_Cut',
];

export enum ENUM_LOG_TYPE {
  logWashDay = 'logWashDay',
  logStyleArchive = 'logStyleArchive',
  logTrimTracker = 'logTrimTracker',
}

export type I_LogType = keyof typeof ENUM_LOG_TYPE;
export const LOG_TYPE_ARRAY = Object.values(ENUM_LOG_TYPE);
