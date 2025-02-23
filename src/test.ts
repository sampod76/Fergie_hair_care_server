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
    // console.log(jobd, 'job');
    // Example Usage
    const oopDate = new DateFormatterDayjsOop(
      '2025-02-23T14:30:00Z', // '2025-03-21T06:48:51.107+00:00'
    );
    const afterReplaceTime = oopDate.replaceTime('06:06'); //2025-02-22T09:45:29.358Z
    console.log('🚀 ~ afterReplaceTime:', new Date(afterReplaceTime).getTime());
    console.log(new Date().getTime());
    const getDellaTime =
      new Date(afterReplaceTime).getTime() - new Date().getTime(); //returns milliseconds
    console.log('🚀 ~ getDellaTime:', getDellaTime);
  } catch (error) {
    console.log(error);
  }
};

export { TestFile };
