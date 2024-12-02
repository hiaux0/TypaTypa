import { ShortcutService } from "../../common/services/ShortcutService";
import {
  DI,
  EventAggregator,
  Registration,
  lifecycleHooks,
  resolve,
} from "aurelia";
import { IVimState, KeyBindingModes, VimMode, VimOptions } from "./vim-types";
import { KeyMappingService } from "./vimCore/commands/KeyMappingService";
import { VimHelper } from "./VimHelper";
import { VimUi } from "./vim-ui/VimUi";
import { VimCore } from "./vimCore/VimCore";
import { SelectionService } from "../../common/services/SelectionService";
import { getIsInputActive } from "../../common/modules/htmlElements";

import { CursorUtils } from "../../common/modules/cursor/cursor-utils";
import { SPACE } from "../../common/modules/keybindings/app-keys";
import { VIM_COMMAND } from "./vim-commands-repository";
import { cursorAllModes, isEnter, isEscape } from "./key-bindings";
import { EV_VIM_ID_CHANGED } from "../../common/modules/eventMessages";
import { Id } from "../../domain/types/types";
import { container } from "../../diContainer";
import { Logger } from "../../common/logging/logging";
import { IKeyMappingMapping } from "../../types";
import { IVimInputHandlerV2, VimInputHandlerV2 } from "./VimInputHandlerV2";

const logger = new Logger("VimInputHandler");

export class LoggerService {
  log(message: string) {
    console.log(message);
  }
}

export const ILoggerService = DI.createInterface<ILoggerService>(
  "ILoggerService",
  (x) => x.singleton(LoggerService),
);

// Export type equal to the class to create an interface
export type ILoggerService = LoggerService;

export class PaymentProcessor {
  processPayment(amount: number) {
    // Payment processing logic
  }
}

// Export type equal to the class to create an interface
export type IPaymentProcessor = PaymentProcessor;

/**
 * - Takes in input from user
 * - redirects them to
 *   - VimCore
 *   - and VimUi
 */
@lifecycleHooks()
export class VimInputHandler {
  public vimCore: VimCore;
  private vimUi: VimUi;
  private options?: VimOptions;
  private eventListeners: any[] = [];
  private keyMappingService: KeyMappingService;

  static inject = [IVimInputHandlerV2, ILoggerService];

  constructor(
    private vimInputHandlerV2?: IVimInputHandlerV2,
    private logg?: ILoggerService,
  ) {
    this.keyMappingService = new KeyMappingService();
  }

  public init(
    options?: VimOptions,
    mappings?: IKeyMappingMapping,
    additionalKeyBindings?: KeyBindingModes,
  ) {
    this.vimInputHandlerV2?.register(options.vimId, additionalKeyBindings);
