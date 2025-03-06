import { createDirectories } from './utils/createDir';

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
    // const getPayment = await PaymentHistory.find();
    // console.log('🚀 ~ asyncFunction ~ getPayment:', getPayment);
    return 1;
  } catch (error) {
    console.log(error);
  }
};

export { TestFile };
