export const RoutingReminder_SEARCHABLE_FIELDS = [
  'productUseDetails',
  'applicationStepsDetails',
];
export const RoutingReminder_FILTERABLE_FIELDS = [
  'searchTerm',
  'reminderType',

  'status',
  'delete',
  'serialNumber',
  'isDelete',
  'month',
  'scheduleType',
  //
  'pickDateFrom',
  'pickDateTo',
  //
  //
  'startTime',
  'endTime',
  //
  'needProperty',
  'createdAtFrom',
  'createdAtTo',
  //
  'author.userId',
  'author.roleBaseUserId',
];

export enum ENUM_SCHEDULE_TYPE_ROUTING {
  date = 'date',
  weekCycle = 'weekCycle',
  weekDay = 'weekDay',
}

export type I_ScheduleType = keyof typeof ENUM_SCHEDULE_TYPE_ROUTING;
