import { getCallerFunctionName } from "../modules/debugging";
import { CuLogger as Culogger, LogOptions } from "./localCulog";

export interface ShouldLogConfig {
  log?: boolean;
  maxLevel?: number; // 0 - don't log
  onlyLevels?: (undefined | number)[]; // only log specified levels
  logDepth?: number; // 1: 1-9, 2: 10-99, 3: 100-999
  allowedCallerNames?: string[];
  allowedCallerNameParts?: string[];
}

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
  shouldLogConfig?: ShouldLogConfig;
}

export const defaultShouldLogConfig: ShouldLogConfig = {
  log: true,
  maxLevel: 1,
  // onlyLevels: [1], // testing
  // onlyLevels: [3], // commands trace
  // onlyLevels: [4], // mergeKeybindingsV2 and overwriteAndAddExistingKeyBindingsV2
  // onlyLevels: [5], // context ids
  // onlyLevels: [,5], // trace potential commands
  // onlyLevels: [,5], // trace potential commands
  // onlyLevels: [,,1], // vim ui
  // onlyLevels: [,,2], // minimal command trace
  // onlyLevels: [,,3], // E2E v2
  // onlyLevels: [,,6], // All mode tracing
  logDepth: 1,
  allowedCallerNames: [],
  // allowedCallerNameParts: ["Vim"],
};

const DEFAULT_LOG_OPTIONS: ILogOptions = {
  log: false,
  focusedLogging: true,
  measurePerf: false,
  focusedPerf: true,
  logPerf: false,
  reset: false,
  shouldLogConfig: defaultShouldLogConfig,
};

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

export class Logger {
  public readonly culogger: Culogger;

  constructor(
    public scope = "Aurelia",
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

  public shouldLog = (
    givenLevel?: number | (number | undefined)[],
    error?: Error,
  ) => {
    if (givenLevel === 0) return true;

    const callerName = getCallerFunctionName(error);
    const finalOptions = {
      ...defaultShouldLogConfig,
      ...this.options.shouldLogConfig,
    };
    const {
      maxLevel,
      logDepth,
      onlyLevels,
      allowedCallerNames,
      allowedCallerNameParts,
    } = finalOptions;
    // onlyLevels; /*?*/

    // Scope
    let scopeHasPart = "okay";
    if (allowedCallerNameParts) {
      const allowed = allowedCallerNameParts.find((namePart) =>
        this.scope.includes(namePart),
      );
      if (allowed) {
        scopeHasPart = allowed;
      }
    }

    // Level
    const asArray = Array.isArray(givenLevel) ? givenLevel : [givenLevel];
    const levelOkay = asArray.some((level, index) =>
      checkGivenLevel(level, index),
    );
    // levelOkay; /*?*/
    const nameOkay =
      allowedCallerNames?.find((name) => name.includes(callerName)) ?? true;
    // nameOkay; /*?*/
    const should = finalOptions.log && levelOkay && nameOkay && scopeHasPart;
    // should; /*?*/
    return !!should;

    function checkGivenLevel(
      level: number | undefined,
      index: number,
    ): boolean {
      // level; /*?*/
      if (!level) return false;
      let okay = false;
      if (level < 10 && logDepth === 1) {
        const mainLevel = level;
        if (onlyLevels && onlyLevels.length > 0) {
          okay = onlyLevels[index] === mainLevel;
        }
      } else if (level >= 10 && level < 100 && logDepth === 2) {
        const secondaryLevel = level % 10;
        // secondaryLevel; /*?*/
        if (onlyLevels && onlyLevels.length > 0) {
          okay = onlyLevels[index] === secondaryLevel;
          // okay; /*?*/
        }
      }
      return okay;
    }
  };

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

export const shouldLog = new Logger("default").shouldLog;
// export function
