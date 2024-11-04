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

const logger = new Logger("KeyMappingService");
const shouldLog = false;

export function overwriteExistingKeyBindings(
  existing: VimCommand[],
  ...additionals: VimCommand[][]
): VimCommand[] {
  // /*prettier-ignore*/ console.log("[KeyMappingService.ts,179] existing: ", existing);
  const mergedAdditionals = additionals.reduce((acc, curr) => {
    if (!curr) return acc;
    return acc.concat(curr);
  }, []);
  // /*prettier-ignore*/ console.log("[KeyMappingService.ts,204] mergedAdditionals: ", mergedAdditionals);
  const finalBindings = [...existing];
  // const finalBindings = existing;
  // /*prettier-ignore*/ console.log("[KeyMappingService.ts,206] finalBindings: ", finalBindings);

  if (finalBindings.length === 0) {
    mergedAdditionals.forEach((additionalBinding) => {
      const hasSimilar = finalBindings.find((b) =>
        this.hasSimilarBinding(b, additionalBinding),
      );
      if (hasSimilar) return;
      finalBindings.push(additionalBinding);
    });
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,216] finalBindings: ", finalBindings);
    return finalBindings;
  }

  mergedAdditionals?.forEach((additionalBinding) => {
    if (!additionalBinding) return;
    let foundCount = 0;
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,181] additionalBinding: ", additionalBinding);

    finalBindings.forEach((existingBinding, index) => {
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
        finalBindings[index] = {
          ...finalBindings[index],
          ...additionalBinding,
        };
        foundCount++;
        if (additionalBinding.command === "copy") {
          /*prettier-ignore*/ shouldLog && console.log("----------------------------");
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,249] both: ", both);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,250] one: ", one);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,225] okay: ", okay);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,252] existingBinding.key: ", existingBinding.key, existingBinding.command);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,226] additionalBinding.key: ", additionalBinding.key, additionalBinding.command);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,227] index: ", index);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,228] foundCount: ", foundCount);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,83] finalBindings: ", finalBindings);
        }
      }

      // If nothing found, then add
      const lastIndex = index === finalBindings.length - 1;
      if (lastIndex && !okay && foundCount === 0) {
        if (additionalBinding.command === "copy") {
          /*prettier-ignore*/ shouldLog && console.log("----------------------------");
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,249] both: ", both);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,250] one: ", one);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,225] okay: ", okay);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,252] existingBinding.key: ", existingBinding.key, existingBinding.command);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,226] additionalBinding.key: ", additionalBinding.key, additionalBinding.command);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,227] index: ", index);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,228] foundCount: ", foundCount);
          /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,229] lastIndex: ", lastIndex);
        }
        // console.log("Push", additionalBinding.key, additionalBinding.command);
        finalBindings.push(additionalBinding);
      }

      // if (additionalBinding.key === "<Control>s") {
      // Reset found count
      if (lastIndex && foundCount > 1) {
        foundCount = 0;
      }
    });
  });
  // /*prettier-ignore*/ console.log("[KeyMappingService.ts,234] updated: ", finalBindings);

  return finalBindings;
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

export class KeyMappingService {
  public keyBindings: KeyBindingModes = keyBindings;
  private potentialCommands: VimCommand[] = [];
  private lastCommand: VimCommand;
  private lastKey: string;
  /** If a command did not trigger, save key */
  private queuedKeys: string[] = [];
  public id = "not-set";

  public create() {
    return new KeyMappingService();
  }

  public init(
    mappings?: IKeyMappingMapping,
    additionalKeyBindings?: KeyBindingModes,
  ) {
    // /*prettier-ignore*/ console.trace("[KeyMappingService.ts,118] init: ");
    // /*prettier-ignore*/ logger.culogger.debug(["[KeyMappingService.ts,122] init: ", {log: true}]);
    const converted = this.convertKeyMappingsToVimCommandMappings(mappings);
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
    this.mergeKeybindings(additionalKeyBindings);

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
      const finalKey = this.getKeyFromEvent(event);
      if (mappings[finalKey]) {
        const dontPrevent = mappings[finalKey]();
        if (dontPrevent === false) return;
        event.preventDefault();
      }
    });
  }

  private convertKeyMappingsToVimCommandMappings(
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

  private mergeKeybindings(additionalKeyBindings?: KeyBindingModes) {
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
    this.keyBindings = merged;
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,174] this.keyBindings: ", this.keyBindings);
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,178] this.id: ", this.id);
  }

  private hasSimilarBinding(a: VimCommand, b: VimCommand): boolean {
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
    /* prettier-ignore */ logger.culogger.debug(['command', command], {}, (...r)=>console.log(...r));

    return {
      command: targetCommand,
      // @ts-ignore -- TODO: adjust type
      commandName,
      keySequence: key,
    };
  }

  public getKeyFromEvent(event: KeyboardEvent) {
    const { collectedModifiers } = ShortcutService.assembleModifiers(event);
    // // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,238] collectedModifiers: ", collectedModifiers);
    const pressedKey = ShortcutService.getPressedKey(event);
    // // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,240] pressedKey: ", pressedKey);
    const finalKey = collectedModifiers.join("") + pressedKey;
    // // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,241] finalKey: ", finalKey);
    /* prettier-ignore */ logger.culogger.debug(['finalKey', finalKey], {}, (...r)=>console.log(...r));
    return finalKey;
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
      /* prettier-ignore */ logger.culogger.debug( ["Found synonym: %s for %s", synonymInput, input], {}, (...r) => console.log(...r),);
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
    /* prettier-ignore */ logger.culogger.debug(['Finding potential command for: ', input], {}, (...r) => console.log(...r));
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
    /* prettier-ignore */ logger.culogger.debug(['keySequence: %s', keySequence], {}, (...r) => console.log(...r));

    /*prettier-ignore*/ shouldLog && console.log("[KeyMappingSemvice.ts,386] targetKeyBinding: ", targetKeyBinding);
    /*prettier-ignore*/ console.log(">>> [KeyMappingService.ts,398] this.id: ", this.id);
    const finalPotentialCommands = targetKeyBinding.filter((keyBinding) => {
      // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
      //   return true;
      // }
      const result = inputContainsSequence(keyBinding.key, keySequence);
      return result;
    });

    /* prettier-ignore */ logger.culogger.debug(['potentialCommands: %o', finalPotentialCommands], {}, (...r) => console.log(...r));
    /*prettier-ignore*/ shouldLog && console.log("[KeyMappingService.ts,402] finalPotentialCommands: ", finalPotentialCommands);
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
      this.queuedKeys.push(input);
      this.potentialCommands = finalPotentialCommands;
    }

    /*prettier-ignore*/ logPotentialCommands(finalPotentialCommands, input, mode);
    /*prettier-ignore*/ console.log("[KeyMappingService.ts,542] targetCommand: ", targetCommand);
    /*prettier-ignore*/ console.log("[KeyMappingService.ts,544] finalPotentialCommands: ", finalPotentialCommands);
    ///*prettier-ignore*/ console.log("[KeyMappingService.ts,546] keySequence: ", keySequence);
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

      /* prettier-ignore */ logger.culogger.debug(['Converted to vim modifier key: %s', asVimModifier], { onlyVerbose: true, }, (...r) => console.log(...r));
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
    /* prettier-ignore */ logger.culogger.debug(['Awaiting potential commands: %o', potentialCommands], {}, (...r) => console.log(...r));
  } else {
    /* prettier-ignore */ logger.culogger.debug([ 'No command for key: %s in Mode: %s ((vim.ts-getCommandName))', key, mode ], { isError: false }, (...r) => console.log(...r));
  }
}

/**
 * Add scope
 * - currently
 *   - vim-editor with vim
 *   - or-tabs with move tab
 *   - second brain with save
 */
