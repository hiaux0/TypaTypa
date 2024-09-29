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
}

export class KeyMappingService {
  static keyBindings: KeyBindingModes = keyBindings;
  private static potentialCommands: VimCommand[] = [];
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
        ...(this.keyBindings[VimMode.NORMAL] ?? []),
        ...(additionalKeyBindings[VimMode.NORMAL] ?? []),
      ],
      [VimMode.INSERT]: [
        ...(this.keyBindings[VimMode.INSERT] ?? []),
        ...(additionalKeyBindings[VimMode.INSERT] ?? []),
      ],
      [VimMode.VISUAL]: [
        ...(this.keyBindings[VimMode.VISUAL] ?? []),
        ...(additionalKeyBindings[VimMode.VISUAL] ?? []),
      ],
    };
    this.keyBindings = merged;
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
    const { potentialCommands, targetCommand } = this.findPotentialCommand(
      key,
      [],
      mode,
    );
    if (potentialCommands?.length) {
      /* prettier-ignore */ logger.culogger.debug(['Awaiting potential commands: %o', potentialCommands], {}, (...r) => console.log(...r));
    } else {
      /* prettier-ignore */ logger.culogger.debug([ 'No command for key: %s in Mode: %s ((vim.ts-getCommandName))', key, mode ], { isError: false }, (...r) => console.log(...r));
    }

    if (!targetCommand) return;

    /** Sequence mapping */
    if (targetCommand.sequence) {
      return {
        commandName: targetCommand.command as any,
        commandSequence: targetCommand.sequence,
        keySequence: key,
      };
    }

    /** Sequence mapping */
    if (targetCommand.execute) {
      targetCommand.execute();
      return;
    }

    /** Standard command */

    if (targetCommand) {
      return {
        commandName: targetCommand.command as any,
        keySequence: key,
      };
    }

    const command = this.getCommandFromKey(mode, key);
    const commandName = command?.command;
    /* prettier-ignore */ logger.culogger.debug(['command', command], {}, (...r)=>console.log(...r));

    // @ts-ignore
    return { commandName, keySequence: finalKey };
  }

  public static getKeyFromEvent(event: KeyboardEvent) {
    const { collectedModifiers } = ShortcutService.assembleModifiers(event);
    const pressedKey = ShortcutService.getPressedKey(event);
    const finalKey = collectedModifiers.join() + pressedKey;
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

    const potentialCommands = targetKeyBinding.filter((keyBinding) => {
      // if (ignoreCaseForModifiers(keyBinding.key, keySequence)) {
      //   return true;
      // }
      const result = inputContainsSequence(keyBinding.key, keySequence);
      return result;
    });

    /* prettier-ignore */ logger.culogger.debug(['potentialCommands: %o', potentialCommands], {}, (...r) => console.log(...r));

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

/**
 * Add scope
 * - currently
 *   - vim-editor with vim
 *   - or-tabs with move tab
 *   - second brain with save
 */
