import { DI, IContainer, Registration } from "aurelia";
import { Id } from "../../domain/types/types";
import { IKeyMappingMapping } from "../../types";
import { KeyBindingModes } from "./vim-types";
import { getCallerFunctionName } from "../../common/modules/debugging";

export type InputMap = Record<Id, any>;
export interface KeyToCommandMap {
  mappings: IKeyMappingMapping;
  additionalKeyBindings: KeyBindingModes;
}

export type IVimInputHandlerV2 = VimInputHandlerV2;
export const IVimInputHandlerV2 =
  DI.createInterface<IVimInputHandlerV2>("VimInputHandlerV2");

interface LogConfig {
  log: boolean;
  level: number; // 0 - don't log
  allowedCallerNames: string[];
}
const logConfig: LogConfig = {
  log: true,
  level: 1,
  allowedCallerNames: [],
};

function shouldLog(level?: number, error?: Error) {
  const callerName = getCallerFunctionName(error);
  const levelOkay = level <= logConfig.level;
  const nameOkay =
    logConfig.allowedCallerNames.find((name) => name.includes(callerName)) ??
    true;
  const should = logConfig.log && levelOkay && nameOkay;
  return should;
}

export class VimInputHandlerV2 {
  private idHistory: Id[] = [];
  private inputMap: InputMap = {};

  public get activeId(): Id {
    const active = this.idHistory[this.idHistory.length - 1];
    return active;
  }

  public static register(container: IContainer) {
    Registration.singleton(IVimInputHandlerV2, VimInputHandlerV2).register(
      container,
    );

    const v = container.get(IVimInputHandlerV2);
    v.initEventHandlers();
    // @ts-ignore
    window.v = v;
  }

  public register(
    id: Id,
    mappings?: IKeyMappingMapping,
    additionalKeyBindings?: KeyBindingModes,
  ): void {
    const already = this.inputMap[id];
    if (already) return;

    const map: KeyToCommandMap = {
      mappings,
      additionalKeyBindings,
    };
    this.inputMap[id] = map;
    /*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,72] this.inputMap: ", this.inputMap);
    const log = JSON.stringify(this.inputMap, null, 2);
    /*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,70] map: ", map);
  }

  public setActiveId(id: Id): void {
    /*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,52] id: ", id);
    this.pushIdToHistory(id);
    /*prettier-ignore*/ console.log("[VimInputHandlerV2.ts,55] this.idHistory: ", this.idHistory);
  }

  public popId(): void {
    if (this.idHistory.length <= 1) return;
    this.idHistory.pop();
  }

  private pushIdToHistory(id: string) {
    const latestId = this.idHistory[this.idHistory.length - 1];
    const already = latestId === id;
    if (already) return;
    this.idHistory.push(id);
  }

  private initEventHandlers() {
    document.addEventListener("keydown", (event) => {
      /*prettier-ignore*/ shouldLog(1) && console.log("----------------------------: ", this.activeId, event);
      event.preventDefault();
    });
  }
}
