import { inputContainsSequence } from "../../../../common/modules/string/string";
import { ShortcutService } from "../../../../common/services/ShortcutService";
import {
  commandsThatWaitForNextInput,
  cursorNormalAndInsert,
  keyBindings,
} from "../../key-bindings";
import { VIM_COMMAND, VimCommand } from "../../vim-commands-repository";
import {
  FindPotentialCommandReturn,
  KeyBindingModes,
  VimMode,
  VimOptions,
} from "../../vim-types";
import { SPECIAL_KEYS } from "../../../../common/modules/keybindings/app-keys";
import { Logger } from "../../../../common/logging/logging";
import { IKeyMappingMapping } from "../../../../types";
import { DI, IContainer, Registration } from "aurelia";

const l = new Logger("KeyMappingService");
const logAllowed = false;
class Commentary {
  // how can I define the type of a function with variable argument length?
  public static log(...args: any[]): void {
    return;
    const [message, condition] = args as [message: string, condition: boolean];
    if (args.length === 1) console.log(message);
    if (condition) console.log(message);
  }
}

export function hasSimilarBinding(a: VimCommand, b: VimCommand): boolean {
  const okayKey = a.key === b.key;
  let okayCommand = false;
  if (a.command || b.command) {
    okayCommand = a.command === b.command;
  }
  const both = okayKey && okayCommand;
  const one = okayKey || okayCommand;
  const similar = one && !both;
  return similar;
}

export function overwriteExistingKeyBindings(
  existing: VimCommand[],
  ...additionals: VimCommand[][]
): VimCommand[] {
  // /*prettier-ignore*/ console.log("[KeyMappingService.ts,179] existing: ", existing);
  const mergedAdditionals = additionals.reduce((acc, curr) => {
    if (!curr) return acc;
    return acc.concat(curr);
  }, []);
  const finalBaseBindings = [...existing];

  if (finalBaseBindings.length === 0) {
    mergedAdditionals.forEach((additionalBinding) => {
      const hasSimilar = finalBaseBindings.find((b) =>
        hasSimilarBinding(b, additionalBinding),
      );
      if (hasSimilar) return;
      finalBaseBindings.push(additionalBinding);
    });
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,216] finalBaseBindings: ", finalBaseBindings);
    return finalBaseBindings;
  }

  mergedAdditionals?.forEach((additionalBinding) => {
    if (!additionalBinding) return;
    let foundCount = 0;
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,181] additionalBinding: ", additionalBinding);

    finalBaseBindings.forEach((existingBinding, index) => {
      // /*prettier-ignore*/ console.log("[KeyMappingService.ts,226] existingBinding: ", existingBinding);
      if (!existingBinding) return;
      const okayKey = existingBinding.key === additionalBinding.key;
      let okayCommand = false;
      if (existingBinding.command || additionalBinding.command) {
        okayCommand = existingBinding.command === additionalBinding.command;
      }
      const both = okayKey && okayCommand;
      // /*prettier-ignore*/ console.log("[KeyMappingService.ts,234] both: ", both);
      const one = okayKey || okayCommand;
      // /*prettier-ignore*/ console.log("[KeyMappingService.ts,236] one: ", one);
      const okay = one || both;
      // /*prettier-ignore*/ console.log("[KeyMappingService.ts,238] okay: ", okay);
      if (okay) {
        // /*prettier-ignore*/ console.log(">>> [KeyMappingService.ts,236] okay: ", okay);
        finalBaseBindings[index] = {
          ...finalBaseBindings[index],
          ...additionalBinding,
        };
        foundCount++;
        if (additionalBinding.command === "copy") {
          /*prettier-ignore*/ logAllowed && console.log("----------------------------");
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,249] both: ", both);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,250] one: ", one);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,225] okay: ", okay);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,252] existingBinding.key: ", existingBinding.key, existingBinding.command);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,226] additionalBinding.key: ", additionalBinding.key, additionalBinding.command);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,227] index: ", index);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,228] foundCount: ", foundCount);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,83] finalBaseBindings: ", finalBaseBindings);
        }
      }

      // If nothing found, then add
      const lastIndex = index === finalBaseBindings.length - 1;
      if (lastIndex && !okay && foundCount === 0) {
        if (additionalBinding.command === "copy") {
          /*prettier-ignore*/ logAllowed && console.log("----------------------------");
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,249] both: ", both);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,250] one: ", one);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,225] okay: ", okay);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,252] existingBinding.key: ", existingBinding.key, existingBinding.command);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,226] additionalBinding.key: ", additionalBinding.key, additionalBinding.command);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,227] index: ", index);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,228] foundCount: ", foundCount);
          /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,229] lastIndex: ", lastIndex);
        }
        // console.log("Push", additionalBinding.key, additionalBinding.command);
        finalBaseBindings.push(additionalBinding);
      }

      // if (additionalBinding.key === "<Control>s") {
      // Reset found count
      if (lastIndex && foundCount > 1) {
        foundCount = 0;
      }
    });
  });
  // /*prettier-ignore*/ console.log("[KeyMappingService.ts,234] updated: ", finalBaseBindings);

  return finalBaseBindings;
}

export function overwriteAndAddExistingKeyBindingsV2(
  base: VimCommand[], // assume existing always has key and command defined
  ...additionals: VimCommand[][]
): VimCommand[] {
  const mergedAdditionals = additionals.reduce((acc, curr) => {
    if (!curr) return acc;
    return acc.concat(curr);
  }, []);
  const finalBaseBindings = [...(base ?? [])];
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("Start -------------------------");
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("finalBaseBindings", finalBaseBindings.length, finalBaseBindings);
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("mergedAdditionals", mergedAdditionals.length, mergedAdditionals);

  if (finalBaseBindings.length === 0) {
    mergedAdditionals.forEach((additionalBinding) => {
      const hasSimilar = finalBaseBindings.find((b) =>
        hasSimilarBinding(b, additionalBinding),
      );
      if (hasSimilar) return;
      finalBaseBindings.push(additionalBinding);
    });
    return finalBaseBindings;
  }

  mergedAdditionals?.forEach((additionalBinding) => {
    if (!additionalBinding) return;

    /**
     * Cases:
     *          base                additional                   result
     * 1. { key, command }   { command }                   --> take key from base
     * 2. { key, command }   { key, command }              --> overwrite additional to base
     * 3. { key, command }   { differentKey, command }     --> overwrite additional to base
     * 4. { command      }   { command }                   --> overwrite additional to base
     */

    const maybeIndeces: number[] = [];
    finalBaseBindings.forEach((binding, index) => {
      const keyOkay = binding.key === additionalBinding.key;
      const hasCommand = !!additionalBinding.command;
      const commandOkay = binding.command === additionalBinding.command;
      const okay = keyOkay || (hasCommand && commandOkay);
      if (okay) {
        maybeIndeces.push(index);
      }
    });
    if (maybeIndeces.length === 0) {
      finalBaseBindings.push(additionalBinding);
      return;
    }

    if (getSameKeyAndCommand()) return;
    if (getOnlySameCommandsAndNoKeys()) return;
    if (getSameCommandButDifferentKey()) return;

    if (maybeIndeces.length > 2) {
      /*prettier-ignore*/ throw new Error( "[ERROR][KeyMappingService]: found multiple mappings to one key",);
    }

    const index = maybeIndeces[0];
    const binding = finalBaseBindings[index];
    finalBaseBindings[index] = {
      ...binding,
      ...additionalBinding,
    };

    finalBaseBindings; /*?*/

    function getSameKeyAndCommand(): boolean {
      const sameKeyAndCommand = maybeIndeces.filter((index) => {
        const binding = finalBaseBindings[index];
        const keyOkay = binding.key === additionalBinding.key;
        const commandOkay = binding.command === additionalBinding.command;
        const okay = keyOkay && commandOkay;
        return okay;
      });
      const onlyOne = sameKeyAndCommand.length === 1;
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([4])) console.log("onlyOne", onlyOne);
      /*prettier-ignore*/ Commentary.log("2. SAME key AND a command, then OVERWRITE base", onlyOne);
      // sameKeyAndCommand; /*?*/
      if (onlyOne) {
        const index = sameKeyAndCommand[0];
        const binding = finalBaseBindings[index];
        finalBaseBindings[index] = {
          ...binding,
          ...additionalBinding,
        };
        return true;
      } else if (sameKeyAndCommand.length > 1) {
        throw new Error("[ERROR][KeyMappingService]: not possible");
      }
    }

    function getOnlySameCommandsAndNoKeys(): boolean {
      const onlySameCommandsAndNoKeys = maybeIndeces.filter((index) => {
        const binding = finalBaseBindings[index];
        const hasKey = !!additionalBinding.key;
        const commandOkay = binding.command === additionalBinding.command;
        const okay = !hasKey && commandOkay;
        return okay;
      });
      // onlySameCommandsAndNoKeys; /*?*/
      const isOnlySame = onlySameCommandsAndNoKeys.length;
      /*prettier-ignore*/ Commentary.log("3. If the additional binding only specified a command and NO key, then OVERWRITE all bases to get the key+additions", isOnlySame);
      if (onlySameCommandsAndNoKeys.length) {
        ("A"); /*?*/
        onlySameCommandsAndNoKeys.forEach((index) => {
          const binding = finalBaseBindings[index];
          finalBaseBindings[index] = {
            ...binding,
            ...additionalBinding,
          };
        });
        return true;
      }
    }

    function getSameCommandButDifferentKey(): boolean {
      const sameCommandButDifferentKey = maybeIndeces.filter((index) => {
        const binding = finalBaseBindings[index];
        // [binding.key, binding.command]; /*?*/
        const sameKey = binding.key === additionalBinding.key;
        const commandOkay = binding.command === additionalBinding.command;
        const okay = !sameKey && commandOkay;
        return okay;
      });
      // sameCommandButDifferentKey; /*?*/
      /*prettier-ignore*/ Commentary.log("4. DIFFERENT key, BUT SAME command, then OVERWRITE base based on key", sameCommandButDifferentKey.length);
      const hasOnlyOneSameButDifferent =
        sameCommandButDifferentKey.length === 1;
      // hasOnlyOneSameButDifferent; /*?*/
      const hasMultipleSameButDifferent = sameCommandButDifferentKey.length > 1;
      /*prettier-ignore*/ Commentary.log("4.1 DIFFERENT key, BUT SAME command ONLY one hit, then OVERWRITE base based on key", hasOnlyOneSameButDifferent);
      if (hasOnlyOneSameButDifferent) {
        // ("C"); /*?*/
        const index = sameCommandButDifferentKey[0];
        const binding = finalBaseBindings[index];
        finalBaseBindings[index] = {
          ...binding,
          ...additionalBinding,
        };
        return;
      }
      // hasMultipleSameButDifferent; /*?*/
      /*prettier-ignore*/ Commentary.log("4.2 DIFFERENT key, BUT SAME command MULTIPLE hits, then push", hasMultipleSameButDifferent);
      if (hasMultipleSameButDifferent) {
        finalBaseBindings.push(additionalBinding);
        return true;
      }
    }
  });

  /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("finalBaseBindings;", finalBaseBindings.length, finalBaseBindings);
  // const logMe = finalBaseBindings.filter(b=>b.key === "l")
  // /*prettier-ignore*/ console.log("[KeyMappingService.ts,224] logMe: ", logMe);
  return finalBaseBindings;
}

/**
 * @example
 *   input = t
 *   potentialCommands = []
 *   getCommandAwaitingNextInput() // {targetCommand: undefined, potentialCommands: { key: 't', command: 'toCharacterBefore' }}
 *
 *   input = 4 //
 *   potentialCommands = [{ key: 't', command: 'toCharacterBefore' }]
 *   getCommandAwaitingNextInput() // {targetCommand: potentialCommands[0], potentialCommands}
 */
function getCommandAwaitingNextInput(
  input: string,
  queuedKeys: string[],
  potentialCommands: VimCommand[],
): FindPotentialCommandReturn | undefined {
  const keySequence = queuedKeys.join("").concat(input);
  const awaitingCommand = commandsThatWaitForNextInput.find(
    // BUG?
    /**
     * 1. press <space>
     * 2. t
     * 3. Expect: <space>t
     * 4. But: t
     */
    (command) => command.key === keySequence,
  );
  // if (input === "t") debugger;
  if (awaitingCommand) {
    return {
      targetCommand: undefined,
      potentialCommands: [awaitingCommand],
      keySequence,
    };
  }

  if (potentialCommands.length !== 1) return;
  const isInputForAwaitingCommand = commandsThatWaitForNextInput.find(
    (command) => command.command === potentialCommands[0].command,
  );
  if (!isInputForAwaitingCommand) return;

  const result = {
    targetCommand: isInputForAwaitingCommand,
    potentialCommands: [isInputForAwaitingCommand],
    keySequence,
  };
  return result;
}

/**
 * @example
 * <Enter> <enter>
 */
export function ignoreCaseForModifiers(key: string, keySequence: string) {
  const isIgnoreCase = keySequence.toLowerCase().includes(key.toLowerCase());
  return isIgnoreCase;
}

function isCommonCommand(
  input: string,
  modifiers: string[],
): VimCommand | undefined {
  const composite = `${modifiers.join("")}${input}`;
  const targetCommand = cursorNormalAndInsert.find((command) => {
    return command.key === composite;
  });

  return targetCommand;
}

interface IPrepareCommandReturn {
  commandName: VIM_COMMAND;
  commandSequence?: string;
  keySequence: string;
  command?: VimCommand;
}

export type IKeyMappingService = KeyMappingService;
export const IKeyMappingService =
  DI.createInterface<IKeyMappingService>("KeyMappingService");

export class KeyMappingService {
  public keyBindings: KeyBindingModes = keyBindings;
  private potentialCommands: VimCommand[] = [];
  private lastCommand: VimCommand;
  private lastKey: string;
  /** If a command did not trigger, save key */
  private queuedKeys: string[] = [];
  public id = "not-set";

  public static register(container: IContainer) {
    Registration.singleton(IKeyMappingService, KeyMappingService).register(
      container,
    );
    const v = container.get(IKeyMappingService);
  }

  public init(
    mappings?: IKeyMappingMapping,
    additionalKeyBindings?: KeyBindingModes,
  ) {
    // /*prettier-ignore*/ console.trace("[KeyMappingService.ts,118] init: ");
    // /*prettier-ignore*/ logger.culogger.debug(["[KeyMappingService.ts,122] init: ", {log: true}]);
    const converted = convertKeyMappingsToVimCommandMappings(mappings);
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,125] converted: ", converted);
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,126] additionalKeyBindings: ", additionalKeyBindings);
    if (!additionalKeyBindings) {
      additionalKeyBindings = converted;
    } else {
      if (!additionalKeyBindings[VimMode.ALL]) {
        additionalKeyBindings[VimMode.ALL] = [];
      }
      additionalKeyBindings[VimMode.ALL] = additionalKeyBindings[
        VimMode.ALL
      ].concat(converted[VimMode.ALL]);
      // /*prettier-ignore*/ console.log("[KeyMappingService.ts,132] additionalKeyBindings[VimMode.ALL]: ", additionalKeyBindings[VimMode.ALL]);
      // /*prettier-ignore*/ console.log("[KeyMappingService.ts,134] converted[VimMode.ALL]: ", converted[VimMode.ALL]);
    }
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,135] additionalKeyBindings: ", additionalKeyBindings);
    this.mergeDefaultKeybindingsWithAdditional(additionalKeyBindings);

    //document.addEventListener("keydown", (event) => {
    //  // console.clear();
    //  const finalKey = this.getKeyFromEvent(event);
    //  if (mappings[finalKey]) {
    //    const dontPrevent = mappings[finalKey]();
    //    if (dontPrevent === false) return;
    //    event.preventDefault();
    //  }
    //});
  }

  public initWithListener(mappings?: IKeyMappingMapping) {
    document.addEventListener("keydown", (event) => {
      // console.clear();
      const finalKey = ShortcutService.getKeyWithModifer(event);
      if (mappings[finalKey]) {
        const dontPrevent = mappings[finalKey]();
        if (dontPrevent === false) return;
        event.preventDefault();
      }
    });
  }

  private mergeDefaultKeybindingsWithAdditional(
    additionalKeyBindings?: KeyBindingModes,
  ): KeyBindingModes {
    if (!additionalKeyBindings) return;

    // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,141] this.keyBindings: ", this.keyBindings);
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,146] this.keyBindings[VimMode.NORMAL]: ", this.keyBindings[VimMode.NORMAL]);
    const merged = {
      ...this.keyBindings,
      [VimMode.NORMAL]: [
        ...overwriteExistingKeyBindings(
          this.keyBindings[VimMode.NORMAL],
          this.keyBindings[VimMode.ALL],
          additionalKeyBindings[VimMode.NORMAL],
          additionalKeyBindings[VimMode.ALL],
        ),
      ],
      [VimMode.INSERT]: [
        ...overwriteExistingKeyBindings(
          this.keyBindings[VimMode.INSERT],
          this.keyBindings[VimMode.ALL],
          additionalKeyBindings[VimMode.INSERT],
          additionalKeyBindings[VimMode.ALL],
        ),
      ],
      [VimMode.VISUAL]: [
        ...overwriteExistingKeyBindings(
          this.keyBindings[VimMode.VISUAL],
          this.keyBindings[VimMode.ALL],
          additionalKeyBindings[VimMode.VISUAL],
          additionalKeyBindings[VimMode.ALL],
        ),
      ],
      [VimMode.CUSTOM]: [
        ...overwriteExistingKeyBindings(
          this.keyBindings[VimMode.CUSTOM],
          this.keyBindings[VimMode.ALL],
          additionalKeyBindings[VimMode.CUSTOM],
          additionalKeyBindings[VimMode.ALL],
        ),
      ],
    };
    // this.keyBindings = merged;
    return merged;
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,174] this.keyBindings: ", this.keyBindings);
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,178] this.id: ", this.id);
  }

  public mergeKeybindingsV2(
    base: KeyBindingModes,
    other?: KeyBindingModes,
  ): KeyBindingModes {
    base; /*?*/
    other; /*?*/
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([4])) console.log("base", base);
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([4])) console.log("other", other);
    if (!other) return base;
    if (!base) return other;

    const merged = {
      ...(base ?? {}),
      [VimMode.NORMAL]: [
        ...overwriteAndAddExistingKeyBindingsV2(
          base[VimMode.NORMAL],
          base[VimMode.ALL],
          other[VimMode.NORMAL],
          other[VimMode.ALL],
        ),
      ],
      [VimMode.INSERT]: [
        ...overwriteAndAddExistingKeyBindingsV2(
          base[VimMode.INSERT],
          base[VimMode.ALL],
          other[VimMode.INSERT],
          other[VimMode.ALL],
        ),
      ],
      [VimMode.VISUAL]: [
        ...overwriteAndAddExistingKeyBindingsV2(
          base[VimMode.VISUAL],
          base[VimMode.ALL],
          other[VimMode.VISUAL],
          other[VimMode.ALL],
        ),
      ],
      [VimMode.CUSTOM]: [
        ...overwriteAndAddExistingKeyBindingsV2(
          base[VimMode.CUSTOM],
          base[VimMode.ALL],
          other[VimMode.CUSTOM],
          other[VimMode.ALL],
        ),
      ],
      [VimMode.ALL]: [
        ...overwriteAndAddExistingKeyBindingsV2(
          base[VimMode.ALL],
          other[VimMode.ALL],
        ),
      ],
    };
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("merged", merged);
    return merged;
  }

  /**
   * keys mapping to
   * 1. normal commands
   * 2. sequence (which then gets mapped to commands executed one after another)
   *
   * @examples
   * - \<Space\>tc
   * - \<Ctrl\>v
   *
   * @todo
   * - Ctrl+v
   * - key sequence
   */
  public prepareCommand(
    key: string,
    mode: VimMode,
    options?: VimOptions,
  ): IPrepareCommandReturn | undefined {
    const { targetCommand } = this.findPotentialCommand(key, [], mode, options);
    // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,240] targetCommand: ", targetCommand);

    if (!targetCommand) return;

    /** Sequence mapping */
    if (targetCommand.sequence) {
      return {
        command: targetCommand,
        commandName: targetCommand.command as any,
        commandSequence: targetCommand.sequence,
        keySequence: key,
      };
    }

    /** Sequence mapping */
    if (targetCommand.execute) {
      return {
        command: targetCommand,
        commandName: VIM_COMMAND.customExecute,
        keySequence: key,
      };
    }

    /** Standard command */
    if (targetCommand) {
      return {
        command: targetCommand,
        commandName: targetCommand.command as any,
        keySequence: key,
      };
    }

    const command = this.getCommandFromKey(mode, key);
    const commandName = command?.command;
    /* prettier-ignore */ l.culogger.debug(['command', command], {}, (...r)=>console.log(...r));

    return {
      command: targetCommand,
      // @ts-ignore -- TODO: adjust type
      commandName,
      keySequence: key,
    };
  }

  /**
   * keys mapping to
   * 1. normal commands
   * 2. sequence (which then gets mapped to commands executed one after another)
   *
   * @examples
   * - \<Space\>tc
   * - \<Ctrl\>v
   *
   * @todo
   * - Ctrl+v
   * - key sequence
   */
  public prepareCommandV2(
    key: string,
    mode: VimMode,
    options: VimOptions = {},
  ): IPrepareCommandReturn | undefined {
    // /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("options.keyBindings", options.keyBindings);
    // /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("this.keyBindings", this.keyBindings);
    const bindings = options?.keyBindings ?? this.keyBindings;
    const enhanced = options.keyBindings
    // const enhanced = this.mergeKeybindingsV2(bindings, this.keyBindings);
    // const enhanced = overwriteAndAddExistingKeyBindingsV2(bindings, this.keyBindings);
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([1])) console.log("enhanced", enhanced);
    options.keyBindings = enhanced;
    const { targetCommand } = this.findPotentialCommandV2(
      key,
      [],
      mode,
      options,
    );
    // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,240] targetCommand: ", targetCommand);

    if (!targetCommand) return;

    /** Sequence mapping */
    if (targetCommand.sequence) {
      return {
        command: targetCommand,
        commandName: targetCommand.command as any,
        commandSequence: targetCommand.sequence,
        keySequence: key,
      };
    }

    /** Sequence mapping */
    if (targetCommand.execute) {
      return {
        command: targetCommand,
        commandName: VIM_COMMAND.customExecute,
        keySequence: key,
      };
    }

    /** Standard command */
    if (targetCommand) {
      return {
        command: targetCommand,
        commandName: targetCommand.command as any,
        keySequence: key,
      };
    }

    const command = this.getCommandFromKey(mode, key);
    const commandName = command?.command;
    /* prettier-ignore */ l.culogger.debug(['command', command], {}, (...r)=>console.log(...r));

    return {
      command: targetCommand,
      // @ts-ignore -- TODO: adjust type
      commandName,
      keySequence: key,
    };
  }

  public getCommandFromKey(mode: VimMode, key: string): VimCommand | undefined {
    const modeKeys = this.keyBindings[mode];
    const commandName = modeKeys?.find((command) => {
      const standard = command.key === key;
      if (standard) return true;

      const syn = this.getSynonymModifier(this.keyBindings, key);
      const viaSyn = command.key === syn;
      return viaSyn;
    });
    return commandName;
  }

  public getSynonymModifier(
    keyBindings: KeyBindingModes,
    input: string,
  ): string {
    if (!keyBindings.synonyms) return "";

    const synonymInput = keyBindings.synonyms[input.toLowerCase()];

    if (synonymInput) {
      /* prettier-ignore */ l.culogger.debug( ["Found synonym: %s for %s", synonymInput, input], {}, (...r) => console.log(...r),);
      return synonymInput;
    } else {
      return input;
    }
  }

  /**
   * @throws EmpytArrayException
   * sideeffect queuedKeys
   * sideeffect potentialCommands
   */
  private findPotentialCommand(
    input: string,
    modifiers: string[] = [],
    mode: VimMode,
    options?: VimOptions,
  ): FindPotentialCommandReturn {
    const awaiting = this.processCommandAwaitingNextInput(input, mode);
    if (awaiting) return awaiting;

    //
    let targetKeyBinding: VimCommand[];
    if (this.potentialCommands?.length) {
      targetKeyBinding = this.potentialCommands;
    } else {
      // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,371] this.keyBindings: ", this.keyBindings);
      targetKeyBinding = (options.keyBindings ?? this.keyBindings)[mode] ?? [];
    }

    //
    input = this.ensureVimModifier(input);
    /* prettier-ignore */ l.culogger.debug(['Finding potential command for: ', input], {}, (...r) => console.log(...r));
    let keySequence = "";
    if (this.queuedKeys.length) {
      keySequence = this.queuedKeys.join("").concat(input);
    } else if (
      this.getSynonymModifier(this.keyBindings, input) ||
      modifiers.length
    ) {
      const synonymInput = this.getSynonymModifier(this.keyBindings, input);

      if (modifiers.length) {
        keySequence += modifiers.join("");
        // Already included, then use the array
      }
      if (synonymInput) {
        keySequence += synonymInput;
      }
    } else {
      keySequence = input;
    }
    /* prettier-ignore */ l.culogger.debug(['keySequence: %s', keySequence], {}, (...r) => console.log(...r));

    /*prettier-ignore*/ logAllowed && console.log("[KeyMappingSemvice.ts,386] targetKeyBinding: ", targetKeyBinding);
    // /*prettier-ignore*/ console.log(">>> [KeyMappingService.ts,398] this.id: ", this.id);
    const finalPotentialCommands = targetKeyBinding.filter((keyBinding) => {
      // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
      //   return true;
      // }
      const result = inputContainsSequence(keyBinding.key, keySequence);
      return result;
    });
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("finalPotentialCommands", finalPotentialCommands);
    /*prettier-ignore*/ console.log("---------------------------- end");

    /* prettier-ignore */ l.culogger.debug(['potentialCommands: %o', finalPotentialCommands], {}, (...r) => console.log(...r));
    // /*prettier-ignore*/ logAllowed && console.log("[KeyMappingService.ts,402] finalPotentialCommands: ", finalPotentialCommands);
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,502] keySequence: ", keySequence);
    let targetCommand;
    if (finalPotentialCommands.length === 0) {
      this.emptyQueuedKeys();
    } else if (
      finalPotentialCommands.length === 1 &&
      keySequence === finalPotentialCommands[0].key
    ) {
      const isChain =
        options?.allowChaining && this.lastCommand?.key.endsWith(keySequence);
      ///*prettier-ignore*/ console.log("[KeyMappingService.ts,511] this.lastCommand: ", this.lastCommand);
      ///*prettier-ignore*/ console.log("[KeyMappingService.ts,510] isChain: ", isChain);
      ///*prettier-ignore*/ console.log("[KeyMappingService.ts,511] keySequence: ", keySequence);
      const isExtendedChain = options?.allowExtendedChaining;
      if (isExtendedChain) {
        const commandForExtendedChain = targetKeyBinding.filter(
          (keyBinding) => {
            // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
            //   return true;
            // }
            const result = inputContainsSequence(keyBinding.key, keySequence);
            return result;
          },
        );
        this.lastCommand?.key.startsWith(keySequence);
        targetCommand = commandForExtendedChain[0];
      } else if (isChain) {
        targetCommand = this.lastCommand;
        this.emptyQueuedKeys();
      } else {
        targetCommand = finalPotentialCommands[0];
        this.emptyQueuedKeys();
      }
    } else {
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("Pushing input: ", input);
      this.queuedKeys.push(input);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("To queuedKeys: ", this.queuedKeys);
      this.potentialCommands = finalPotentialCommands;
    }

    /*prettier-ignore*/ logPotentialCommands(finalPotentialCommands, input, mode);
    ///*prettier-ignore*/ console.log("[KeyMappingService.ts,542] targetCommand: ", targetCommand);
    ///*prettier-ignore*/ console.log("[KeyMappingService.ts,544] finalPotentialCommands: ", finalPotentialCommands);
    ///*prettier-ignore*/ console.log("[KeyMappingService.ts,546] keySequence: ", keySequence);
    return {
      targetCommand,
      potentialCommands: finalPotentialCommands,
      keySequence,
    };
  }

  private processCommandAwaitingNextInput(
    input: string,
    mode: VimMode,
  ): FindPotentialCommandReturn {
    if (mode === VimMode.INSERT) return;
    const commandAwaitingNextInput = getCommandAwaitingNextInput(
      input,
      this.queuedKeys,
      this.potentialCommands,
    );
    if (commandAwaitingNextInput !== undefined) {
      if (this.potentialCommands.length === 0) {
        this.potentialCommands = commandAwaitingNextInput.potentialCommands;
      } else if (this.potentialCommands.length === 1) {
        this.potentialCommands = [];
      }

      /*prettier-ignore*/ logPotentialCommands(this.potentialCommands, input, mode);
      return commandAwaitingNextInput;
    }
  }

  /**
   * @throws EmpytArrayException
   * sideeffect queuedKeys
   * sideeffect potentialCommands
   */
  private findPotentialCommandV2(
    input: string,
    modifiers: string[] = [],
    mode: VimMode,
    options?: VimOptions,
  ): FindPotentialCommandReturn {
    const awaiting = this.processCommandAwaitingNextInput(input, mode);
    if (awaiting) return awaiting;

    //
    let targetKeyBinding: VimCommand[];
    if (this.potentialCommands?.length) {
      targetKeyBinding = this.potentialCommands;
    } else {
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("this.keyBindings", this.keyBindings);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("options.keyBindings", options.keyBindings);
      const merged = this.mergeKeybindingsV2(
        this.keyBindings,
        options.keyBindings,
      );
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("merged", merged);
      // /*prettier-ignore*/ console.log("[KeyMappingService.ts,815] options.vimId: ", options);
      ///*prettier-ignore*/ console.log("[KeyMappingService.ts,815] merged: ", merged);
      targetKeyBinding = merged[mode] ?? [];
    }
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("targetKeyBinding", targetKeyBinding);

    //
    input = this.ensureVimModifier(input);
    /* prettier-ignore */ l.culogger.debug(['Finding potential command for: ', input], {}, (...r) => console.log(...r));
    let keySequence = "";
    if (this.queuedKeys.length) {
      keySequence = this.queuedKeys.join("").concat(input);
    } else if (
      this.getSynonymModifier(this.keyBindings, input) ||
      modifiers.length
    ) {
      const synonymInput = this.getSynonymModifier(this.keyBindings, input);

      if (modifiers.length) {
        keySequence += modifiers.join("");
        // Already included, then use the array
      }
      if (synonymInput) {
        keySequence += synonymInput;
      }
    } else {
      keySequence = input;
    }
    /* prettier-ignore */ l.culogger.debug(['keySequence: %s', keySequence], {}, (...r) => console.log(...r));

    /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("targetKeyBinding", targetKeyBinding);
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("keySequence", keySequence);
    // /*prettier-ignore*/ console.log(">>> [KeyMappingService.ts,398] this.id: ", this.id);
    const finalPotentialCommands = targetKeyBinding.filter((keyBinding) => {
      // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
      //   return true;
      // }
      const result = inputContainsSequence(keyBinding.key, keySequence);
      return result;
    });

    /* prettier-ignore */ l.culogger.debug(['potentialCommands: %o', finalPotentialCommands], {}, (...r) => console.log(...r));
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("finalPotentialCommands", finalPotentialCommands);
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,502] keySequence: ", keySequence);
    let targetCommand;
    if (finalPotentialCommands.length === 0) {
      /*                                                                                             prettier-ignore*/ if(l.shouldLog([])) console.log("1");
      this.emptyQueuedKeys();
    } else if (
      finalPotentialCommands.length === 1 &&
      keySequence === finalPotentialCommands[0].key
    ) {
      /*                                                                                             prettier-ignore*/ if(l.shouldLog([])) console.log("2");
      const isChain =
        options?.allowChaining && this.lastCommand?.key.endsWith(keySequence);
      ///*prettier-ignore*/ console.log("[KeyMappingService.ts,511] this.lastCommand: ", this.lastCommand);
      ///*prettier-ignore*/ console.log("[KeyMappingService.ts,510] isChain: ", isChain);
      ///*prettier-ignore*/ console.log("[KeyMappingService.ts,511] keySequence: ", keySequence);
      const isExtendedChain = options?.allowExtendedChaining;
      if (isExtendedChain) {
        /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("2.1");
        const commandForExtendedChain = targetKeyBinding.filter(
          (keyBinding) => {
            // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
            //   return true;
            // }
            const result = inputContainsSequence(keyBinding.key, keySequence);
            return result;
          },
        );
        this.lastCommand?.key.startsWith(keySequence);
        targetCommand = commandForExtendedChain[0];
      } else if (isChain) {
        /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("3");
        targetCommand = this.lastCommand;
        this.emptyQueuedKeys();
      } else {
        /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("4");
        targetCommand = finalPotentialCommands[0];
        /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("finalPotentialCommands", finalPotentialCommands);
        this.emptyQueuedKeys();
      }
    } else {
      /*                                                                                             prettier-ignore*/ if(l.shouldLog([])) console.log("5");
      this.queuedKeys.push(input);
      this.potentialCommands = finalPotentialCommands;
    }

    /*prettier-ignore*/ logPotentialCommands(finalPotentialCommands, input, mode);
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([11])) console.log("finalPotentialCommands,", finalPotentialCommands,);
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("targetCommand", targetCommand);
    return {
      targetCommand,
      potentialCommands: finalPotentialCommands,
      keySequence,
    };
  }

  // private  includesPotentialCommands(
  //   commandAwaitingNextInput: FindPotentialCommandReturn,
  // ): VimCommand | undefined {
  //   const has = this.potentialCommands.find((command) => {
  //     const found = includes(
  //       commandAwaitingNextInput?.potentialCommands,
  //       command,
  //     );
  //     return found;
  //   });
  //   return has;
  // }

  public getLastCommand(): VimCommand {
    return this.lastCommand;
  }

  public setLastCommand(lastCommand: VimCommand): void {
    this.lastCommand = lastCommand;
  }

  public getLastKey(): string {
    return this.lastKey;
  }

  public setLastKey(lastKey: string): void {
    this.lastKey = lastKey;
  }

  private emptyQueuedKeys() {
    this.queuedKeys = [];
    this.potentialCommands = [];
    //this.lastCommand = undefined;
    //this.lastKey = undefined;
  }

  /** */
  private ensureVimModifier(input: string) {
    if (SPECIAL_KEYS.includes(input)) {
      const asVimModifier = `<${input}>`;

      /* prettier-ignore */ l.culogger.debug(['Converted to vim modifier key: %s', asVimModifier], { onlyVerbose: true, }, (...r) => console.log(...r));
      return asVimModifier;
    }
    return input;
  }

  public isEnter(event: KeyboardEvent): boolean {
    const is = event.key === "Enter";
    return is;
  }
}

function logPotentialCommands(
  potentialCommands: VimCommand[],
  key: string,
  mode: VimMode,
): void {
  if (potentialCommands?.length) {
    /* prettier-ignore */ l.culogger.debug(['Awaiting potential commands: %o', potentialCommands], {}, (...r) => console.log(...r));
  } else {
    /* prettier-ignore */ l.culogger.debug([ 'No command for key: %s in Mode: %s ((vim.ts-getCommandName))', key, mode ], { isError: false }, (...r) => console.log(...r));
  }
}

export function convertKeyMappingsToVimCommandMappings(
  mappings: IKeyMappingMapping,
): KeyBindingModes {
  const result: KeyBindingModes = {
    [VimMode.ALL]: [],
  };
  Object.entries(mappings ?? {}).forEach(([key, execute]) => {
    const converted: VimCommand = {
      key,
      execute,
    };
    result[VimMode.ALL].push(converted);
  });
  return result;
}

/**
 * Add scope
 * - currently
 *   - vim-editor with vim
 *   - or-tabs with move tab
 *   - second brain with save
 */
