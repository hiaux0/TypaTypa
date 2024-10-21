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
