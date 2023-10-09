export default {
  globalSetup: "<rootDir>/test/config/jest/globalSetup.js",

  // Other Jest configuration options...
  preset: "ts-jest",
  // Specify your global setup file
  setupFilesAfterEnv: ["<rootDir>/test/config/jest/setupBeforeAll.js"],

  testEnvironment: "node",
  testMatch: ["**/test/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  transform: {},
};
