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
    return 1;
  } catch (error) {
    console.log(error);
  }
};

export { TestFile };
