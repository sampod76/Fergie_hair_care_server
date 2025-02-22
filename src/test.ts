import dayjs from 'dayjs';
import { createDirectories } from './utils/createDir';
import { DateFormatterDayjsOop } from './utils/DateAllUtlsFuntion';

const TestFile = async () => {
  try {
    createDirectories();
    await asyncFunction();
  } catch (error) {
    console.log(error);
  }
};

const asyncFunction = async () => {
  try {
    const daleyTime =
      new Date('2025-03-21T06:48:51.107+00:00').getTime() -
      new Date().getTime();
    console.log('🚀 ~ asyncFunction ~ daleyTime:', daleyTime);
    const pickDateTime = dayjs(
      `${'2025-03-21'} ${'17:30'}`,
      'YYYY-MM-DD HH:mm',
    );
    console.log(
      '🚀 ~ asyncFunction ~ pickDateTime:',
      pickDateTime.toISOString(),
    );
    const oopDate = new DateFormatterDayjsOop('2025-03-21T06:48:51.107+00:00');

    console.log(
      '🚀 ~ asyncFunction ~ pickDateTime:',
      oopDate.replaceTime('17:50'),
    );
  } catch (error) {
    console.log(error);
  }
};

export { TestFile };
