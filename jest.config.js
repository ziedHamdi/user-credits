export default {
  extensionsToTreatAsEsm: [".ts"],

  globalSetup: "<rootDir>/test/config/jest/globalSetup.js",

  // Add this line
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],

  // Other Jest configuration options...
  preset: "ts-jest",

  // Specify your global setup file
  setupFilesAfterEnv: ["<rootDir>/test/config/jest/setupBeforeAll.js"],

  testEnvironment: "node",

  testMatch: ["**/test/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],

  testPathIgnorePatterns: ["extend", "mock", "config"],
  transform: {
    ".*\\.(j|t)sx?$": ["@swc/jest"],
  },
  transformIgnorePatterns: [],
};
