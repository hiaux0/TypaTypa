import { getCallerFunctionName } from "../modules/debugging";
import { CuLogger as Culogger, LogOptions } from "./localCulog";

interface ILogOptions extends LogOptions {
  log?: boolean;
  focusedLogging?: boolean;

  measurePerf?: boolean;
  focusedPerf?: boolean;
  logPerf?: boolean;

  /**
   * Indicate to, that log can/should perform a reset
   */
  reset?: boolean;
  highlight?: boolean;
}

export function logOptionsGuard(input: any): input is ILogOptions {
  if (typeof input !== "object") {
    return false;
  }

  const keys = Object.keys(input);
  const validKeys = [
    "log",
    "focusedLogging",
    "measurePerf",
    "focusedPerf",
    "logPerf",
    "reset",
    "highlight",
  ];
  for (const key of keys) {
    if (!validKeys.includes(key)) {
      return false;
    }
  }
  return true;
}

const DEFAULT_LOG_OPTIONS: ILogOptions = {
  log: false,
  focusedLogging: true,
  measurePerf: false,
  focusedPerf: true,
  logPerf: false,
  reset: false,
};

export class Logger {
  public readonly culogger: Culogger;

  constructor(
    scope = "Aurelia",
    private readonly options: ILogOptions = DEFAULT_LOG_OPTIONS,
  ) {
    this.culogger = new Culogger({ scope });
    this.culogger.overwriteDefaultLogOtpions({
      logTable: true,
      logLevel: "INFO",
      focusedLogging: false,
      ...options,
      // logScope: false,
    });
  }

  log(...args: any[]) {
    let options = {} as ILogOptions;
    if (args.length > 2 && typeof args[args.length - 1] === "object") {
      options = args.pop() as ILogOptions;
    }
    const message = args.join(" ");

    /**
     * Wallaby logic.
     * Wallaby does not console.log from external library.
     */
    this.logMessage(message, options);
  }

  private logMessage(
    message: string,
    options: ILogOptions = DEFAULT_LOG_OPTIONS,
  ) {
    const { log } = options;
    const loggedMessage = this.culogger.debug([message], {
      logLevel: "INFO",
      log,
      ...options,
    });
    if (loggedMessage.length > 0) {
      // console.log(loggedMessage[0]);
      if (loggedMessage.length > 1) {
        console.log("There are more log messages");
      }
    }
  }
}

// export function

export interface LogConfig {
  log: boolean;
  maxLevel: number; // 0 - don't log
  onlyLevels: number[]; // only log specified levels
  logDepth: number; // 1: 1-9, 2: 10-99, 3: 100-999
  allowedCallerNames: string[];
}
export const defaultLogConfig: LogConfig = {
  log: true,
  maxLevel: 1,
  // onlyLevels: [2], // KeyMappingService, command with bindings array
  // onlyLevels: [3], //
  // onlyLevels: [4], // checkout how bindings are handled: base other merged
  // onlyLevels: [5], //
  // onlyLevels: [6], // after correct merged, still command undefined
  // onlyLevels: [7], // checkout how bindings are handled: base other merged
  onlyLevels: [8], // zoom into mergedv2
  // onlyLevels: [2],
  // onlyLevels: [9], // test
  logDepth: 2,
  allowedCallerNames: [],
};

export function shouldLog(givenLevel?: number, error?: Error) {
  if (givenLevel === 0) return true;

  const callerName = getCallerFunctionName(error);
  const { maxLevel, logDepth } = defaultLogConfig;

  // let levelOkay = givenLevel <= maxLevel;
  let levelOkay = false;
  if (givenLevel < 10 && logDepth === 1) {
    const mainLevel = givenLevel;
    if (defaultLogConfig.onlyLevels.length > 0) {
      levelOkay = defaultLogConfig.onlyLevels.includes(mainLevel);
    }
  } else if (givenLevel >= 10 && givenLevel < 100 && logDepth === 2) {
    const secondaryLevel = givenLevel % 10;
    if (defaultLogConfig.onlyLevels.length > 0) {
      levelOkay = defaultLogConfig.onlyLevels.includes(secondaryLevel);
    }
  }

  const nameOkay =
    defaultLogConfig.allowedCallerNames.find((name) =>
      name.includes(callerName),
    ) ?? true;
  const should = defaultLogConfig.log && levelOkay && nameOkay;
  return should;
}
