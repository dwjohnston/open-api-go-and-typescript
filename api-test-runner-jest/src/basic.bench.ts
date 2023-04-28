import { benchmarkSuite } from "jest-bench";


/**
 * These are just demo benchmark tests shown in the examples of jest-bench 
 */

benchmarkSuite(
  "regexp",
  {
    ["test"]: () => {
      /o/.test("Hello World!");
    },
  },
  1000
);

benchmarkSuite("string", {
  ["indexOf"]: () => {

    console.log("1");
    "Hello World!".indexOf("o") > -1;
  },

  ["match"]: () => {
    !!"Hello World!".match(/o/);
  },
});

benchmarkSuite("string with SuiteOptions", {
  ["indexOf"]: () => {
    "Hello World!".indexOf("o") > -1;
  },

  ["match"]: () => {
    !!"Hello World!".match(/o/);
  },
}, { delay: 0.1, maxTime: 0.5, timeoutSeconds: 10 });