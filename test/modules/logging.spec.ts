import { describe, expect, test } from "vitest";
import { Logger } from "../../src/common/logging/logging";

describe("Logging", () => {
  test("shouldLog", () => {
    const testLogger = new Logger("VimInit.spec.ts", {
      shouldLogConfig: { onlyLevels: [, 1], logDepth: 1 },
    });
    const result = testLogger.shouldLog([, 1]);
    expect(result).toBe(true);
  });

  test("shouldLog - onlyLevels: [1] 2", () => {
    const testLogger = new Logger("VimInit.spec.ts", {
      shouldLogConfig: { onlyLevels: [1], logDepth: 1 },
    });
    const result = testLogger.shouldLog(1);
    result; /*?*/
    expect(result).toBe(true);
  });

  test("shouldLog - onlyLevels: [1]", () => {
    const testLogger = new Logger("VimInit.spec.ts", {
      shouldLogConfig: { onlyLevels: [1], logDepth: 1 },
    });
    const result = testLogger.shouldLog([1]);
    expect(result).toBe(true);
  });

  test("shouldLog - onlyLevels: [2]", () => {
    const testLogger = new Logger("VimInit.spec.ts", {
      shouldLogConfig: { onlyLevels: [2], logDepth: 1 },
    });
    const result = testLogger.shouldLog([12]);
    expect(result).toBe(false);
  });

  test("shouldLog - onlyLevels: [2], logDept: 2", () => {
    const testLogger = new Logger("VimInit.spec.ts", {
      shouldLogConfig: { onlyLevels: [2], logDepth: 2 },
    });
    const result = testLogger.shouldLog([12]);
    expect(result).toBe(true);
  });

  test("shouldLog - onlyLevels: [, 1]", () => {
    const testLogger = new Logger("VimInit.spec.ts", {
      shouldLogConfig: { onlyLevels: [, 1], logDepth: 1 },
    });
    const result = testLogger.shouldLog(1);
    result; /*?*/
    expect(result).toBe(false);
  });

  test("shouldLog - onlyLevels: [, 1] 3", () => {
    const testLogger = new Logger("VimInit.spec.ts", {
      shouldLogConfig: { onlyLevels: [, 2], logDepth: 2 },
    });
    const result = testLogger.shouldLog([16, 12]);
    expect(result).toBe(true);
  });

  test("shouldLog - onlyLevels: [, 1]", () => {
    const testLogger = new Logger("VimInit.spec.ts", {
      shouldLogConfig: { onlyLevels: [, 2], logDepth: 2 },
    });
    const result = testLogger.shouldLog(32);
    expect(result).toBe(false);
  });
});
