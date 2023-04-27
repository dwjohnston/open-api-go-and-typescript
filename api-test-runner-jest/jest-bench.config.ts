/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */



export default {
  preset: "ts-jest",
  coverageProvider: "v8",
  transform: {
    ".(ts|tsx)": "ts-jest",
  },
  testEnvironment: "jest-bench/environment.js",

  coveragePathIgnorePatterns: ["/node_modules/", "/test/"],
  collectCoverageFrom: ["src/**/*.ts"],
  testRegex: "(/__benchmarks__/.*|(\\.|/)bench)\\.[jt]sx?$",
  reporters: ["default", "jest-bench/reporter"],
  testEnvironmentOptions: {
    testEnvironment: "jest-environment-node",
  },
};
