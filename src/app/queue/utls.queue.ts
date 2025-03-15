import { I_DayOfWeek } from '../../global/enums/globalEnums';

class CornTimePicker {
  private time: string; // example: 13:25:45
  constructor(time: string) {
    this.time = time;
  }
  public parseTime(): [number, number, number] {
    const timeParts = this.time.split(':').map(Number);
    const [hour, minute, second = 0] = timeParts;

    if (
      hour === undefined ||
      minute === undefined ||
      hour > 23 ||
      minute > 59 ||
      second > 59
    ) {
      throw new Error('Invalid time format. Use "HH:mm" or "HH:mm:ss".');
    }

    return [hour, minute, second];
  }
}

export class CronPatternGenerator extends CornTimePicker {
  private static dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  private days: string[]; //monday,wednesday,friday

  constructor(time: string, days: I_DayOfWeek[]) {
    super(time);
    this.days = days; //monday,wednesday,friday
  }

  private parseDays(): string {
    const cronDays = this.days
      .map(day => CronPatternGenerator.dayMap[day.toLowerCase()])
      .join(',');

    if (!cronDays) {
      throw new Error('Invalid days provided');
    }

    return cronDays; //1,3,5,6
  }

  public generate(): string {
    const [hour, minute, second] = this.parseTime();
    const cronDays = this.parseDays();

    return `${second} ${minute} ${hour} * * ${cronDays}`; //45 25 13 * * 1,3,5,6
  }
}

export class AnyCornPatternGenerator extends CornTimePicker {
  constructor(time: string) {
    super(time);
  }
  public generateRepeatOnSpecificDay(day: number): string {
    if (day < 1 || day > 31) {
      throw new Error('Day must be between 1 and 31');
    }

    const [hour, minute, second] = this.parseTime(); // Extract hour, minute, and second from the time

    // Cron format: `second minute hour day month dayOfWeek`
    // Here, day of the month is specified as the `day` argument
    return `${second} ${minute} ${hour} ${day} * *`; // Runs on the specified `day` every month at the given time
  }
  // Generates a cron pattern for weekly repeat
  public generateEveryRepeatWeekly(number: number): string {
    const [hour, minute, second] = this.parseTime();
    // Cron format: `* * * * *` -> [minute] [hour] [day of month] [month] [day of week]
    // For weekly, we set the `day of week` to repeat every X weeks.
    // Every `number` weeks (e.g., number = 4 -> every 4 weeks)
    return `${second} ${minute} ${hour} * * ${number * 7}`; // Runs at specified time every `number` weeks
  }

  // Generates a cron pattern for monthly repeat
  public generateEveryRepeatMonthly(number: number): string {
    const [hour, minute, second] = this.parseTime();
    // Cron format: `* * * * *` -> [minute] [hour] [day of month] [month] [day of week]
    // Every `number` months (e.g., number = 2 -> every 2 months)
    return `${second} ${minute} ${hour} 1 */${number}`; // Runs on the 1st day of every `number` month(s)
  }

  // Generates a cron pattern for yearly repeat
  public generateEveryRepeatYearly(number: number): string {
    const [hour, minute, second] = this.parseTime();
    // Cron format: `* * * * *` -> [minute] [hour] [day of month] [month] [day of week]
    // Every `number` years (e.g., number = 2 -> every 2 years)
    return `${second} ${minute} ${hour} 1 1 */${number}`; // Runs on the 1st January every `number` years
  }
}
