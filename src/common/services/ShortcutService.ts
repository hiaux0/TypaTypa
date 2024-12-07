import { getIsInputActive } from "../modules/htmlElements";
import { MODIFIER_SYNONYMS, Modifier } from "../../features/vim/key-bindings";
import {
  ModifiersType,
  ALL_MODIFIERS,
  SPECIAL_KEYS,
  SPACE,
} from "../modules/keybindings/app-keys";
import { KeyBindingModes } from "../../features/vim/vim-types";
import { isMac } from "../modules/platform/platform-check";
import { legacyKeyCodes } from "../modules/constants";
import { Logger } from "../logging/logging";

const logger = new Logger("ShortcutService");

export class ShortcutService {
  public static clickGlobalShortcut(key: string): void {
    const isActive = getIsInputActive();
    if (isActive) return;

    const hits = document.querySelectorAll(`[data-shortcut="${key}"]`);
    if (hits.length === 0) return;
    if (hits.length > 1) {
      console.warn("Multiple elements with the same shortcut:");
      console.log(hits);
    }
    (hits[0] as HTMLElement).click();
  }

  public static isModifierKey(input: string): input is ModifiersType {
    const modifierInput = input as ModifiersType;
    return ALL_MODIFIERS.includes(modifierInput);
  }

  public static ensureVimModifier(input: string) {
    if (SPECIAL_KEYS.includes(input)) {
      const asVimModifier = `<${input}>`;

      return asVimModifier;
    }
    return input;
  }

  public static getSynonymModifier(input: string): string {
    const synonymInput = MODIFIER_SYNONYMS[input.toLowerCase()];

    if (synonymInput) {
      return synonymInput;
    } else {
      return input;
    }
  }

  /**
   * Handle "Space" case.
   * The rest stays say.
   */
  public static getPressedKey(ev: KeyboardEvent) {
    let pressedKey: string;
    if (ev.code === SPACE) {
      pressedKey = ev.code;
    } else {
      pressedKey = ev.key;
    }
    return pressedKey;
  }

  public static checkAllowedBrowserShortcuts(ev: KeyboardEvent) {
    const mainModifier = isMac ? ev.metaKey : ev.ctrlKey;
    const reload = ev.key === "r" && mainModifier;
    const hardReload = ev.key === "R" && mainModifier && ev.shiftKey;
    if (reload || hardReload) {
      return true;
    } else if (ev.key === "l" && mainModifier) {
      return true;
    } else if (ev.key === "C" && mainModifier && ev.shiftKey) {
      return true;
    } else if (ev.key === "=" && mainModifier) {
      return true;
    } else if (ev.key === "-" && mainModifier) {
      return true;
    }

    return false;
  }

  public static assembleModifiers(ev: KeyboardEvent) {
    let modifiers = "";
    const collectedModifiers = [];
    if (ev.ctrlKey) {
      modifiers += "Ctrl+";
      collectedModifiers.push(Modifier["<Control>"]);
    }
    if (ev.shiftKey) {
      modifiers += "Shift+";
      collectedModifiers.push(Modifier["<Shift>"]);
    }
    if (ev.altKey) {
      modifiers += "Alt+";
      collectedModifiers.push(Modifier["<Alt>"]);
    }
    if (ev.metaKey) {
      modifiers += "Meta+";
      collectedModifiers.push(Modifier["<Meta>"]);
    }
    return { collectedModifiers, modifiers };
  }

  public static splitInputSequence(inputSequence: string) {
    /**
     * 1st part: match char after > (positive lookbehind)
     * 2nd part: match < with char following (positive lookahead)
     *
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet
     */
    const regex = /(?<=>).|<(?=.)/g;
    const splitByModifier = inputSequence
      .replace(regex, (match) => {
        return `,${match}`;
      })
      .split(",");

    const result: string[] = [];
    splitByModifier.forEach((splitCommands) => {
      if (splitCommands.includes("<")) {
        result.push(splitCommands);
      } else {
        splitCommands.split("").forEach((command) => {
          result.push(command);
        });
      }
    });

    return result;
  }

  public static getKeyWithModifer(event: KeyboardEvent) {
    const { collectedModifiers } = this.assembleModifiers(event);
    // // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,238] collectedModifiers: ", collectedModifiers);
    const pressedKey = this.getPressedKey(event);
    // // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,240] pressedKey: ", pressedKey);
    const finalKey = collectedModifiers.join("") + pressedKey;
    // // // /*prettier-ignore*/ console.log("[KeyMappingService.ts,241] finalKey: ", finalKey);
    /* prettier-ignore */ logger.culogger.debug(['finalKey', finalKey], {}, (...r)=>console.log(...r));
    return finalKey;
  }
}
