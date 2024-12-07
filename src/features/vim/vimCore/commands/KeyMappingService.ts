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
import { createCommandId } from "../../../../common/services/CommandsService";

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

export function enhanceWithIdsAndMode(base: KeyBindingModes): KeyBindingModes {
  (Object.entries(base) as [VimMode, VimCommand[]][]).forEach(
    ([mode, binding]) => {
      binding.forEach((command) => {
        command.id = createCommandId(command);
        command.mode = mode;
      });
    },
  );
  return base;
}

export function mergeKeybindings(
  base: KeyBindingModes,
  other?: KeyBindingModes,
): KeyBindingModes {
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([4])) console.log("base", base);
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([4])) console.log("other", other);
  if (!other) return base;
  if (!base) return other;

  const merged = {
    ...(base ?? {}),
    [VimMode.NORMAL]: [
      ...merge(
        base[VimMode.NORMAL],
        base[VimMode.ALL],
        other[VimMode.NORMAL],
        other[VimMode.ALL],
      ),
    ],
    [VimMode.INSERT]: [
      ...merge(
        base[VimMode.INSERT],
        base[VimMode.ALL],
        other[VimMode.INSERT],
        other[VimMode.ALL],
      ),
    ],
    [VimMode.VISUAL]: [
      ...merge(
        base[VimMode.VISUAL],
        base[VimMode.ALL],
        other[VimMode.VISUAL],
        other[VimMode.ALL],
      ),
    ],
    [VimMode.CUSTOM]: [
      ...merge(
        base[VimMode.CUSTOM],
        base[VimMode.ALL],
        other[VimMode.CUSTOM],
        other[VimMode.ALL],
      ),
    ],
    [VimMode.ALL]: [...merge(base[VimMode.ALL], other[VimMode.ALL])],
  };
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("merged", merged);
  return merged;

  function merge(
    base: VimCommand[] | undefined, // assume existing always has key and command defined
    ...additionals: (VimCommand[] | undefined)[]
  ): VimCommand[] {
    const mergedAdditionals = additionals.reduce((acc, curr) => {
      if (!curr) return acc;
      return acc?.concat(curr);
    }, []);
    const finalBaseBindings = [...(base ?? [])];
    const merged = finalBaseBindings.concat(mergedAdditionals ?? []);
    return merged;
  }
}

export function addKeysToKeybindingsAllModes(
  base: KeyBindingModes | undefined,
  other: KeyBindingModes,
): KeyBindingModes {
  base; /*?*/
  other; /*?*/
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([4])) console.log("base", base);
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([4])) console.log("other", other);
  if (!base) return other;
  if (!other) return base;

  const merged = {
    ...(base ?? {}),
    [VimMode.NORMAL]: [
      ...addKeysToBindings(
        base[VimMode.NORMAL],
        base[VimMode.ALL],
        other[VimMode.NORMAL],
        other[VimMode.ALL],
      ),
    ],
    [VimMode.INSERT]: [
      ...addKeysToBindings(
        base[VimMode.INSERT],
        base[VimMode.ALL],
        other[VimMode.INSERT],
        other[VimMode.ALL],
      ),
    ],
    [VimMode.VISUAL]: [
      ...addKeysToBindings(
        base[VimMode.VISUAL],
        base[VimMode.ALL],
        other[VimMode.VISUAL],
        other[VimMode.ALL],
      ),
    ],
    [VimMode.CUSTOM]: [
      ...addKeysToBindings(
        base[VimMode.CUSTOM],
        base[VimMode.ALL],
        other[VimMode.CUSTOM],
        other[VimMode.ALL],
      ),
    ],
    [VimMode.ALL]: [
      ...addKeysToBindings(base[VimMode.ALL], other[VimMode.ALL]),
    ],
  };
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([4])) console.log("merged", merged);
  return merged;
}

export function overwriteKeybindingsV2(
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
  base: VimCommand[] | undefined, // assume existing always has key and command defined
  ...additionals: (VimCommand[] | undefined)[]
): VimCommand[] {
  const mergedAdditionals = additionals.reduce((acc, curr) => {
    if (!curr) return acc;
    return acc?.concat(curr);
  }, []);
  const finalBaseBindings = [...(base ?? [])];
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("Start -------------------------");
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("finalBaseBindings", finalBaseBindings.length, finalBaseBindings);
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("mergedAdditionals", mergedAdditionals?.length, mergedAdditionals);

  if (finalBaseBindings.length === 0) {
    mergedAdditionals?.forEach((additionalBinding) => {
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

    function getSameKeyAndCommand(): boolean {
      const sameKeyAndCommand = maybeIndeces.filter((index) => {
        const binding = finalBaseBindings[index];
        if (binding.desc === "Cancel all") console.log("here 0");
        const keyOkay = binding.key === additionalBinding.key;
        const commandOkay = binding.command === additionalBinding.command;
        const okay = keyOkay && commandOkay;
        return okay;
      });
      const onlyOne = sameKeyAndCommand.length === 1;
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
      return false;
    }

    function getOnlySameCommandsAndNoKeys(): boolean {
      const onlySameCommandsAndNoKeys = maybeIndeces.filter((index) => {
        const binding = finalBaseBindings[index];
        if (binding.desc === "Cancel all") {
          /*prettier-ignore*/ console.log("[KeyMappingService.ts,309] binding.desc: ", binding.desc);
          console.log("here 1");
        }
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
      return false;
    }

    function getSameCommandButDifferentKey(): boolean {
      const sameCommandButDifferentKey = maybeIndeces.filter((index) => {
        const binding = finalBaseBindings[index];
        if (binding.desc === "Cancel all") console.log("here 2");
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
        return false;
      }
      // hasMultipleSameButDifferent; /*?*/
      /*prettier-ignore*/ Commentary.log("4.2 DIFFERENT key, BUT SAME command MULTIPLE hits, then push", hasMultipleSameButDifferent);
      if (hasMultipleSameButDifferent) {
        finalBaseBindings.push(additionalBinding);
        return true;
      }
      return false;
    }
  });

  /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("finalBaseBindings;", finalBaseBindings.length, finalBaseBindings);
  // const logMe = finalBaseBindings.filter(b=>b.key === "l")
  // /*prettier-ignore*/ console.log("[KeyMappingService.ts,224] logMe: ", logMe);
  return finalBaseBindings;
}

/**
 * Given (custom) bindings, take information from additionals and add to the given (custom) bindings
 */
export function addKeysToBindings(
  current: VimCommand[] | undefined,
  ...additionals: (VimCommand[] | undefined)[]
): VimCommand[] {
  const mergedAdditionals = additionals.reduce((acc, curr) => {
    if (!curr) return acc;
    return acc?.concat(curr);
  }, []);
  const final: VimCommand[] = [];
  const finalCurrentBindings = [...(current ?? [])];
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([1])) console.log("Start -------------------------");
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([1])) console.log("finalCurrentBindings", final.length, final);
  /*                                                                                           prettier-ignore*/ if(l.shouldLog([1])) console.log("mergedAdditionals", mergedAdditionals?.length, mergedAdditionals);

  // 1. If no current bindings, then just add all additionals
  //                                                                                           2. If current bindings, then if the additional binding has a
  finalCurrentBindings?.forEach((binding, index) => {
    binding; /*?*/
    let found = 0;
    mergedAdditionals?.forEach((additionalBinding) => {
      found; /*?*/
      additionalBinding; /*?*/
      const sameKeys = binding.key === additionalBinding.key;
      sameKeys; /*?*/
      //                                                                                             | current       | additional    | result                  |
      //                                                                                             | key - command | key - command | result                  |
      const sameCommand = binding.command === additionalBinding.command;
      sameCommand; /*?*/
      const hasKey = binding.key;
      const noKey_sameCommand = !hasKey && sameCommand;
      noKey_sameCommand; /*?*/
      //                                                                                          a. |     -    x    |  x  -         | add key from additional |
      //                                                                                          a. |     -    x    |  x  -    x    | add key from additional |
      if (noKey_sameCommand) {
        const updated = {
          ...binding,
          key: additionalBinding.key,
        };
        if (found > 0) {
          finalCurrentBindings.splice(index + found + 1, 0, updated);
        } else {
          finalCurrentBindings[index] = updated;
          found++;
        }
      } else if (sameKeys) {
        const updated = {
          ...additionalBinding,
          ...binding,
        };
        finalCurrentBindings[index] = updated;
      } else {
        // final.push(binding);
      }
    });
    found = 0;
  });

  return finalCurrentBindings;
}

//                                                                                             g. key, but no command, then add the key to all current bindings
//                                                                                             b. command, then add the command to the current binding
//                                                                                             c. key and command, then overwrite the current binding
//                                                                                             d. key and command, but the key is different, then add the additional binding
//                                                                                             e. key and command, but the command is different, then add the additional binding
//                                                                                             f. key and command, but both are different, then add the additional binding

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

export type IKeyMappingService = KeyMappingService;
export const IKeyMappingService =
  DI.createInterface<IKeyMappingService>("KeyMappingService");

export class KeyMappingService {
  public keyBindings: KeyBindingModes = keyBindings;
  private potentialCommands: VimCommand[] = [];
  private lastCommand: VimCommand;
  private lastKey: string;
  /** If a command did not trigger, save key */
  public queuedKeys: string[] = [];
  public id = "not-set";

  public static register(container: IContainer) {
    Registration.singleton(IKeyMappingService, KeyMappingService).register(
      container,
    );
    const v = container.get(IKeyMappingService);
  }

  public initWithListener(mappings?: IKeyMappingMapping) {
    document.addEventListener("keydown", (event) => {
      const finalKey = ShortcutService.getKeyWithModifer(event);
      if (mappings?.[finalKey]) {
        const dontPrevent = mappings[finalKey]();
        if (dontPrevent === false) return;
        event.preventDefault();
      }
    });
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
  ): VimCommand | undefined {
    const enhanced = options.keyBindings;
    /*                                                                                           prettier-ignore*/ if(l.shouldLog([1])) console.log("enhanced", enhanced);
    options.keyBindings = enhanced;
    const { targetCommand } = this.findPotentialCommandV2(
      key,
      [],
      mode,
      options,
    );

    if (!targetCommand) return;

    /** Sequence mapping */
    if (targetCommand.execute) {
      targetCommand.command = VIM_COMMAND.customExecute;
      return targetCommand;
    }

    const command = this.getCommandFromKey(mode, key);

    return targetCommand;
  }

  public getCommandFromKey(mode: VimMode, key: string): VimCommand | undefined {
    const modeKeys = this.keyBindings[mode];
    const commandName = modeKeys?.find((command) => {
      const standard = command.key === key;
      if (standard) return true;

      const syn = ShortcutService.getSynonymModifier(key);
      const viaSyn = command.key === syn;
      return viaSyn;
    });
    return commandName;
  }

  private processCommandAwaitingNextInput(
    input: string,
    mode: VimMode,
  ): FindPotentialCommandReturn | undefined {
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
    let targetKeyBinding: VimCommand[] | undefined;
    if (this.potentialCommands?.length) {
      targetKeyBinding = this.potentialCommands;
    } else {
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("this.keyBindings", this.keyBindings);
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("options.keyBindings", options?.keyBindings);
      //const merged = addKeysToKeybindingsAllModes(
      //  options?.keyBindings,
      //  this.keyBindings,
      //);
      const merged = options?.keyBindings ?? this.keyBindings;

      /*                                                                                           prettier-ignore*/ if(l.shouldLog([3])) console.log("merged", merged);
      targetKeyBinding = merged[mode]?.length
        ? merged[mode]
        : merged[VimMode.ALL]?.length
          ? merged[VimMode.ALL]
          : [];
    }
    /*                                                                                             prettier-ignore*/ if(l.shouldLog([3, 5])) console.log("targetKeyBinding", targetKeyBinding);

    //
    input = this.ensureVimModifier(input);
    /* prettier-ignore */ l.culogger.debug(['Finding potential command for: ', input], {}, (...r) => console.log(...r));
    /* prettier-ignore */ l.culogger.debug(['queuedKeys', this.queuedKeys], {}, (...r) => console.log(...r));
    let keySequence = "";
    if (this.queuedKeys.length) {
      keySequence = this.queuedKeys.join("").concat(input);
    } else if (ShortcutService.getSynonymModifier(input) || modifiers.length) {
      const synonymInput = ShortcutService.getSynonymModifier(input);

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
    const finalPotentialCommands = targetKeyBinding?.filter((keyBinding) => {
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
    if (finalPotentialCommands?.length === 0) {
      /*                                                                                             prettier-ignore*/ if(l.shouldLog([])) console.log("1");
      this.emptyQueuedKeys();
    } else if (
      finalPotentialCommands?.length === 1 &&
      keySequence === finalPotentialCommands[0].key
    ) {
      /*                                                                                             prettier-ignore*/ if(l.shouldLog([])) console.log("2");
      const isChain =
        options?.allowChaining && this.lastCommand?.key?.endsWith(keySequence);
      ///*prettier-ignore*/ console.log("[KeyMappingService.ts,511] this.lastCommand: ", this.lastCommand);
      ///*prettier-ignore*/ console.log("[KeyMappingService.ts,510] isChain: ", isChain);
      ///*prettier-ignore*/ console.log("[KeyMappingService.ts,511] keySequence: ", keySequence);
      const isExtendedChain = options?.allowExtendedChaining;
      if (isExtendedChain) {
        /*                                                                                           prettier-ignore*/ if(l.shouldLog([])) console.log("2.1");
        const commandForExtendedChain = targetKeyBinding?.filter(
          (keyBinding) => {
            // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
            //   return true;
            // }
            const result = inputContainsSequence(keyBinding.key, keySequence);
            return result;
          },
        );
        this.lastCommand?.key?.startsWith(keySequence);
        targetCommand = commandForExtendedChain?.[0];
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
      /*                                                                                           prettier-ignore*/ if(l.shouldLog([ , 5])) console.log("this.queuedKeys", this.queuedKeys);
      this.queuedKeys.push(input);
      if (finalPotentialCommands) {
        this.potentialCommands = finalPotentialCommands;
      }
    }

    /*prettier-ignore*/ logPotentialCommands(finalPotentialCommands ?? [], input, mode);
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

/**
 * Add scope
 * - currently
 *   - vim-editor with vim
 *   - or-tabs with move tab
 *   - second brain with save
 */
