import { I_DayOfWeek } from '../../global/enums/globalEnums';

export class CronPatternGenerator {
  private static dayMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  private time: string;
  private days: string[];

  constructor(time: string, days: I_DayOfWeek[]) {
    this.time = time;
    this.days = days;
  }

  private parseTime(): [number, number, number] {
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

  private parseDays(): string {
    const cronDays = this.days
      .map(day => CronPatternGenerator.dayMap[day.toLowerCase()])
      .join(',');

    if (!cronDays) {
      throw new Error('Invalid days provided');
    }

    return cronDays;
  }

  public generate(): string {
    const [hour, minute, second] = this.parseTime();
    const cronDays = this.parseDays();

    return `${second} ${minute} ${hour} * * ${cronDays}`;
  }
}
