import dotenv from 'dotenv';

// Run dotenv.config() at the top level
dotenv.config();

// Check if "process.env.CONNECTION_STR" is defined
if (!process.env.CONNECTION_STR1) {
  console.error('CONNECTION_STR is not defined');
  process.exit(1);
}
if (!process.env.CONNECTION_STR2) {
  console.error('CONNECTION_STR is not defined');
  process.exit(1);
}

// Export an object containing CONNECTION_STR as the default export
export default {
  CONNECTION_STR1: process.env.CONNECTION_STR1,
  CONNECTION_STR2: process.env.CONNECTION_STR2,
};
