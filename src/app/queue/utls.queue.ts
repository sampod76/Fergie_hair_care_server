import { I_DayOfWeek } from '../../global/enums/globalEnums';

export function generateCronPattern(time: string, days: I_DayOfWeek[]): string {
  const dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  // Extract hour, minute, and second (if provided)
  const timeParts = time.split(':').map(Number);
  const [hour, minute, second = 0] = timeParts; // Default second to 0 if not provided

  // Validate time format
  if (
    hour === undefined ||
    minute === undefined ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    throw new Error('Invalid time format. Use "HH:mm" or "HH:mm:ss".');
  }

  // Convert day names to cron values
  const cronDays = days.map(day => dayMap[day.toLowerCase()]).join(',');

  if (!cronDays) {
    throw new Error('Invalid days provided');
  }

  // Return a valid cron pattern
  return `${second} ${minute} ${hour} * * ${cronDays}`;
}
