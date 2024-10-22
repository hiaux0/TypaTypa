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
} from "../../vim-types";
import { SPECIAL_KEYS } from "../../../../common/modules/keybindings/app-keys";
import { Logger } from "../../../../common/logging/logging";

const logger = new Logger("KeyMappingService");

/** Name from keydown event */
type EventKeyName = string;
interface IKeyMappingMapping {
  /**
   * Return `false` to prevent default
   */
  [key: EventKeyName]: () => boolean | void;
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
  public static keyBindings: KeyBindingModes = keyBindings;
  private static potentialCommands: VimCommand[] = [];
  private static lastCommand: VimCommand;
  private static lastKey: string;
  /** If a command did not trigger, save key */
  private static queuedKeys: string[] = [];

  public static create() {
    return new KeyMappingService();
  }

  public init(
    mappings: IKeyMappingMapping,
    additionalKeyBindings?: KeyBindingModes,
  ) {
    KeyMappingService.mergeKeybindings(additionalKeyBindings);

    document.addEventListener("keydown", (event) => {
      // console.clear();
      const finalKey = KeyMappingService.getKeyFromEvent(event);
      if (mappings[finalKey]) {
        const dontPrevent = mappings[finalKey]();
        if (dontPrevent === false) return;
        event.preventDefault();
      }
    });
  }

  private static mergeKeybindings(additionalKeyBindings?: KeyBindingModes) {
    if (!additionalKeyBindings) return;

    const merged = {
      ...this.keyBindings,
      [VimMode.NORMAL]: [
        ...this.overwriteExistingKeyBindings(
          this.keyBindings[VimMode.NORMAL],
          this.keyBindings[VimMode.ALL],
          additionalKeyBindings[VimMode.NORMAL],
          additionalKeyBindings[VimMode.ALL],
        ),
      ],
      [VimMode.INSERT]: [
        ...this.overwriteExistingKeyBindings(
          this.keyBindings[VimMode.INSERT],
          this.keyBindings[VimMode.ALL],
          additionalKeyBindings[VimMode.INSERT],
          additionalKeyBindings[VimMode.ALL],
        ),
      ],
      [VimMode.VISUAL]: [
        ...this.overwriteExistingKeyBindings(
          this.keyBindings[VimMode.VISUAL],
          this.keyBindings[VimMode.ALL],
          additionalKeyBindings[VimMode.VISUAL],
          additionalKeyBindings[VimMode.ALL],
        ),
      ],
      [VimMode.CUSTOM]: [
        ...this.overwriteExistingKeyBindings(
          this.keyBindings[VimMode.CUSTOM],
          this.keyBindings[VimMode.ALL],
          additionalKeyBindings[VimMode.CUSTOM],
          additionalKeyBindings[VimMode.ALL],
        ),
      ],
    };
    this.keyBindings = merged;
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,157] this.keyBindings: ", this.keyBindings);
  }

  private static overwriteExistingKeyBindings(
    existing: VimCommand[],
    ...additionals: VimCommand[][]
  ): VimCommand[] {
    const merged = additionals.reduce((acc, curr) => {
      return acc.concat(curr);
    }, []);
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,176] merged: ", merged);

    merged?.forEach((additionalBinding) => {
      // /*prettier-ignore*/ console.log("[KeyMappingService.ts,181] additionalBinding: ", additionalBinding);
      let foundCount = 0;
      existing.forEach((existingBinding, index) => {
        const okayKey = existingBinding.key === additionalBinding.key;
        let okayCommand = false;
        if (existingBinding.command || additionalBinding.command) {
          okayCommand = existingBinding.command === additionalBinding.command;
        }
        const okay = okayKey || okayCommand;
        if (okay) {
          existing[index] = {
            ...existing[index],
            ...additionalBinding,
          };
          foundCount++;
        }

        // If nothing found, then add
        const lastIndex = index === existing.length - 1;
        if (lastIndex && !okay && foundCount === 0) {
          existing.push(additionalBinding);
        }

        // if (additionalBinding.key === "<Control>s") {
        //if (additionalBinding.command === "jumpNextBlock") {
        //  /*prettier-ignore*/ console.log("----------------------------");
        //  /*prettier-ignore*/ console.log("[KeyMappingService.ts,190] okay: ", okay);
        //  /*prettier-ignore*/ console.log("[KeyMappingService.ts,191] additionalBinding.key: ", additionalBinding.key, additionalBinding.command);
        //  /*prettier-ignore*/ console.log("[KeyMappingService.ts,176] index: ", index);
        //  /*prettier-ignore*/ console.log("[KeyMappingService.ts,213] foundCount: ", foundCount);
        //  /*prettier-ignore*/ console.log("[KeyMappingService.ts,200] lastIndex: ", lastIndex);
        //}
        // Reset found count
        if (lastIndex && foundCount > 1) {
          foundCount = 0;
        }
      });
    });
    return existing;
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
  public static prepareCommand(
    key: string,
    mode: VimMode,
  ): IPrepareCommandReturn | undefined {
    const { targetCommand } = this.findPotentialCommand(key, [], mode);
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,240] targetCommand: ", targetCommand);

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

  public static getKeyFromEvent(event: KeyboardEvent) {
    const { collectedModifiers } = ShortcutService.assembleModifiers(event);
    // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,238] collectedModifiers: ", collectedModifiers);
    const pressedKey = ShortcutService.getPressedKey(event);
    // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,240] pressedKey: ", pressedKey);
    const finalKey = collectedModifiers.join("") + pressedKey;
    // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,241] finalKey: ", finalKey);
    /* prettier-ignore */ logger.culogger.debug(['finalKey', finalKey], {}, (...r)=>console.log(...r));
    return finalKey;
  }

  public static getCommandFromKey(
    mode: VimMode,
    key: string,
  ): VimCommand | undefined {
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

  public static getSynonymModifier(
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
  private static findPotentialCommand(
    input: string,
    modifiers: string[] = [],
    mode: VimMode,
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
      targetKeyBinding = this.keyBindings[mode] ?? [];
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

    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,386] targetKeyBinding: ", targetKeyBinding);
    const potentialCommands = targetKeyBinding.filter((keyBinding) => {
      // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
      //   return true;
      // }
      const result = inputContainsSequence(keyBinding.key, keySequence);
      return result;
    });

    /* prettier-ignore */ logger.culogger.debug(['potentialCommands: %o', potentialCommands], {}, (...r) => console.log(...r));
    // /*prettier-ignore*/ console.log("[KeyMappingService.ts,394] potentialCommands: ", potentialCommands);

    let targetCommand;
    if (potentialCommands.length === 0) {
      this.emptyQueuedKeys();
    } else if (
      potentialCommands.length === 1 &&
      keySequence === potentialCommands[0].key
    ) {
      targetCommand = potentialCommands[0];
      this.emptyQueuedKeys();
    } else {
      this.queuedKeys.push(input);
      this.potentialCommands = potentialCommands;
    }

    /*prettier-ignore*/ logPotentialCommands(potentialCommands, input, mode);
    return { targetCommand, potentialCommands, keySequence };
  }

  // private static includesPotentialCommands(
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

  public static getLastCommand(): VimCommand {
    return this.lastCommand;
  }

  public static setLastCommand(lastCommand: VimCommand): void {
    this.lastCommand = lastCommand;
  }

  public static getLastKey(): string {
    return this.lastKey;
  }

  public static setLastKey(lastKey: string): void {
    this.lastKey = lastKey;
  }

  private static emptyQueuedKeys() {
    this.queuedKeys = [];
    this.potentialCommands = [];
  }

  /** */
  private static ensureVimModifier(input: string) {
    if (SPECIAL_KEYS.includes(input)) {
      const asVimModifier = `<${input}>`;

      /* prettier-ignore */ logger.culogger.debug(['Converted to vim modifier key: %s', asVimModifier], { onlyVerbose: true, }, (...r) => console.log(...r));
      return asVimModifier;
    }
    return input;
  }

  public static isEnter(event: KeyboardEvent): boolean {
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
