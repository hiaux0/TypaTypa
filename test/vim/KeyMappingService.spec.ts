import { describe, expect, test } from "vitest";
import { Logger } from "../../src/common/logging/logging";
import {
  KeyMappingService,
  overwriteExistingKeyBindingsV2,
} from "../../src/features/vim/vimCore/commands/KeyMappingService";
import { KeyBindingModes } from "../../src/features/vim/vim-types";
import { VimCommand } from "../../src/features/vim/vim-commands-repository";

const current: KeyBindingModes = {
  normal: [],
  NORMAL: [
    {
      key: "<Control>Enter",
    },
    {
      command: "cursorDown",
      desc: "Move to below cell when in INSERT mode",
      context: ["Grid"],
      key: "u",
    },
    {
      command: "cursorUp",
      desc: "Move to above cell when in INSERT mode",
      context: ["Grid"],
      key: "k",
    },
    {
      key: "<Escape>",
      desc: "Cancel edit and revert changes",
      command: "enterNormalMode",
    },
  ],
  insert: [],
  INSERT: [],
  visual: [],
  VISUAL: [
    {
      key: "y",
      desc: "yank",
      context: ["Grid"],
      command: "yank",
    },
  ],
  visualline: [],
  VISUALLINE: [
    {
      key: "d",
      command: "visualDelete",
    },
    {
      key: "o",
      command: "visualMoveToOtherEndOfMarkedArea",
    },
    {
      key: "x",
      command: "visualDelete",
    },
    {
      key: "<Control>c",
      command: "copy",
    },
    {
      key: "<Control>x",
      command: "cut",
    },
    {
      key: "<Control>z",
      command: "undo",
    },
    {
      key: "<Control><Shift>Z",
      command: "redo",
    },
    {
      key: "<Escape>",
      command: "enterNormalMode",
    },
    {
      key: "<ArrowLeft>",
      command: "cursorLeft",
    },
    {
      key: "<ArrowUp>",
      command: "cursorUp",
    },
    {
      key: "<ArrowRight>",
      command: "cursorRight",
    },
    {
      key: "<ArrowDown>",
      command: "cursorDown",
    },
    {
      key: "b",
      command: "cursorBackwordsStartWord",
    },
    {
      key: "e",
      command: "cursorWordForwardEnd",
    },
    {
      key: "gg",
      command: "goToFirstLine",
    },
    {
      key: "h",
      command: "cursorLeft",
    },
    {
      key: "k",
      command: "cursorUp",
    },
    {
      key: "l",
      command: "cursorRight",
    },
    {
      key: "u",
      command: "cursorDown",
    },
    {
      key: "w",
      command: "cursorWordForwardStart",
    },
    {
      key: "y",
      command: "yank",
    },
    {
      key: "<Shift>G",
      command: "goToLastLine",
    },
    {
      key: "<Shift>$",
      command: "cursorLineEnd",
    },
    {
      key: "$",
      command: "cursorLineEnd",
    },
    {
      key: "<Shift>^",
      command: "cursorLineStart",
    },
    {
      key: "^",
      command: "cursorLineStart",
    },
    {
      key: "<Shift>}",
      command: "jumpNextBlock",
    },
    {
      key: "}",
      command: "jumpNextBlock",
    },
    {
      key: "<Shift>{",
      command: "jumpPreviousBlock",
    },
    {
      key: "{",
      command: "jumpPreviousBlock",
    },
    {
      key: "<Shift>><Shift>>",
      command: "indentRight",
    },
    {
      key: "<Shift><<Shift><",
      command: "indentLeft",
    },
    {
      key: "<Shift>F",
      command: "toCharacterAtBack",
    },
    {
      key: "f",
      command: "toCharacterAt",
    },
    {
      key: "r",
      command: "replace",
    },
    {
      key: "T",
      command: "toCharacterAfterBack",
    },
    {
      key: "t",
      command: "toCharacterBefore",
    },
  ],
  CUSTOM: [],
  ALL: [
    {
      key: "<Space>cl",
      desc: "[cl]ear console",
      preventUndoRedo: true,
    },
  ],
  synonyms: {
    "<esc>": "<Escape>",
    escape: "<Escape>",
  },
};

const additional: KeyBindingModes = {
  normal: [],
  NORMAL: [
    {
      key: "<Space>tc",
      sequence: "^elrx",
    },
    {
      key: "<Space>fu",
      command: "unfoldAll",
    },
    {
      key: "a",
      command: "enterInsertAfterMode",
    },
    {
      key: "cc",
      command: "clearLine",
    },
    {
      key: "dd",
      command: "deleteLine",
    },
    {
      key: "diw",
      command: "deleteInnerWord",
    },
    {
      key: "i",
      command: "enterInsertMode",
      preventUndoRedo: true,
    },
    {
      key: "<Shift>I",
      command: "enterInsertModeStart",
    },
    {
      key: "J",
      command: "joinLine",
    },
    {
      key: "o",
      command: "createNewLine",
    },
    {
      key: "<Shift>O",
      command: "createNewLineAbove",
    },
    {
      key: "p",
      command: "pasteVim",
    },
    {
      key: "<Shift>P",
      command: "pasteVimBefore",
    },
    {
      key: "v",
      command: "enterVisualMode",
    },
    {
      key: "<Shift>V",
      command: "visualStartLineWise",
    },
    {
      key: "x",
      command: "delete",
    },
    {
      key: "za",
      command: "toggleFold",
    },
    {
      key: ".",
      command: "repeatLastCommand",
    },
    {
      key: "gh",
      command: "hint",
    },
    {
      key: "<Shift>A",
      command: "enterInsertAfterModeEnd",
    },
    {
      key: "<Control>v",
      command: "paste",
    },
    {
      key: "<Enter>",
      command: "newLine",
    },
    {
      key: "<Backspace>",
      command: "backspace",
    },
    {
      key: "<Meta>",
      command: "nothing",
    },
    {
      key: "<Control>c",
      command: "copy",
    },
    {
      key: "<Control>x",
      command: "cut",
    },
    {
      key: "<Control>z",
      command: "undo",
    },
    {
      key: "<Control><Shift>Z",
      command: "redo",
    },
    {
      key: "<Escape>",
      command: "enterNormalMode",
    },
    {
      key: "<ArrowLeft>",
      command: "cursorLeft",
    },
    {
      key: "<ArrowUp>",
      command: "cursorUp",
    },
    {
      key: "<ArrowRight>",
      command: "cursorRight",
    },
    {
      key: "<ArrowDown>",
      command: "cursorDown",
    },
    {
      key: "<Control>]",
      command: "indentRight",
    },
    {
      key: "<Control>[",
      command: "indentLeft",
    },
    {
      key: "b",
      command: "cursorBackwordsStartWord",
    },
    {
      key: "e",
      command: "cursorWordForwardEnd",
    },
    {
      key: "gg",
      command: "goToFirstLine",
    },
    {
      key: "h",
      command: "cursorLeft",
    },
    {
      key: "k",
      command: "cursorUp",
    },
    {
      key: "l",
      command: "cursorRight",
    },
    {
      key: "u",
      command: "cursorDown",
    },
    {
      key: "w",
      command: "cursorWordForwardStart",
    },
    {
      key: "y",
      command: "yank",
    },
    {
      key: "<Shift>G",
      command: "goToLastLine",
    },
    {
      key: "<Shift>$",
      command: "cursorLineEnd",
    },
    {
      key: "$",
      command: "cursorLineEnd",
    },
    {
      key: "<Shift>^",
      command: "cursorLineStart",
    },
    {
      key: "^",
      command: "cursorLineStart",
    },
    {
      key: "<Shift>}",
      command: "jumpNextBlock",
    },
    {
      key: "}",
      command: "jumpNextBlock",
    },
    {
      key: "<Shift>{",
      command: "jumpPreviousBlock",
    },
    {
      key: "{",
      command: "jumpPreviousBlock",
    },
    {
      key: "<Shift>><Shift>>",
      command: "indentRight",
    },
    {
      key: "<Shift><<Shift><",
      command: "indentLeft",
    },
    {
      key: "<Shift>F",
      command: "toCharacterAtBack",
    },
    {
      key: "f",
      command: "toCharacterAt",
    },
    {
      key: "r",
      command: "replace",
    },
    {
      key: "T",
      command: "toCharacterAfterBack",
    },
    {
      key: "t",
      command: "toCharacterBefore",
    },
  ],
  insert: [],
  INSERT: [
    {
      key: "<Backspace>",
      command: "backspace",
    },
    {
      key: "<Delete>",
      command: "delete",
    },
    {
      key: "<Enter>",
      command: "newLine",
    },
    {
      key: "<Shift>",
      command: "shift",
    },
    {
      key: "<Space>",
      command: "space",
    },
    {
      key: "<Control>",
      command: "nothing",
    },
    {
      key: "<Tab>",
      command: "indentRight",
    },
    {
      key: "<Shift><Tab>",
      command: "indentLeft",
    },
    {
      key: "<Control>c",
      command: "copy",
    },
    {
      key: "<Control>x",
      command: "cut",
    },
    {
      key: "<Control>z",
      command: "undo",
    },
    {
      key: "<Control><Shift>Z",
      command: "redo",
    },
    {
      key: "<Escape>",
      command: "enterNormalMode",
    },
    {
      key: "<ArrowLeft>",
      command: "cursorLeft",
    },
    {
      key: "<ArrowUp>",
      command: "cursorUp",
    },
    {
      key: "<ArrowRight>",
      command: "cursorRight",
    },
    {
      key: "<ArrowDown>",
      command: "cursorDown",
    },
  ],
  visual: [],
  VISUAL: [
    {
      key: "iw",
      command: "visualInnerWord",
    },
    {
      key: "ii",
      command: "visualInnerBlock",
    },
    {
      key: "d",
      command: "visualDelete",
    },
    {
      key: "o",
      command: "visualMoveToOtherEndOfMarkedArea",
    },
    {
      key: "x",
      command: "visualDelete",
    },
    {
      key: "<Control>c",
      command: "copy",
    },
    {
      key: "<Control>x",
      command: "cut",
    },
    {
      key: "<Control>z",
      command: "undo",
    },
    {
      key: "<Control><Shift>Z",
      command: "redo",
    },
    {
      key: "<Escape>",
      command: "enterNormalMode",
    },
    {
      key: "<ArrowLeft>",
      command: "cursorLeft",
    },
    {
      key: "<ArrowUp>",
      command: "cursorUp",
    },
    {
      key: "<ArrowRight>",
      command: "cursorRight",
    },
    {
      key: "<ArrowDown>",
      command: "cursorDown",
    },
    {
      key: "b",
      command: "cursorBackwordsStartWord",
    },
    {
      key: "e",
      command: "cursorWordForwardEnd",
    },
    {
      key: "gg",
      command: "goToFirstLine",
    },
    {
      key: "h",
      command: "cursorLeft",
    },
    {
      key: "k",
      command: "cursorUp",
    },
    {
      key: "l",
      command: "cursorRight",
    },
    {
      key: "u",
      command: "cursorDown",
    },
    {
      key: "w",
      command: "cursorWordForwardStart",
    },
    {
      key: "y",
      command: "yank",
    },
    {
      key: "<Shift>G",
      command: "goToLastLine",
    },
    {
      key: "<Shift>$",
      command: "cursorLineEnd",
    },
    {
      key: "$",
      command: "cursorLineEnd",
    },
    {
      key: "<Shift>^",
      command: "cursorLineStart",
    },
    {
      key: "^",
      command: "cursorLineStart",
    },
    {
      key: "<Shift>}",
      command: "jumpNextBlock",
    },
    {
      key: "}",
      command: "jumpNextBlock",
    },
    {
      key: "<Shift>{",
      command: "jumpPreviousBlock",
    },
    {
      key: "{",
      command: "jumpPreviousBlock",
    },
    {
      key: "<Shift>><Shift>>",
      command: "indentRight",
    },
    {
      key: "<Shift><<Shift><",
      command: "indentLeft",
    },
    {
      key: "<Shift>F",
      command: "toCharacterAtBack",
    },
    {
      key: "f",
      command: "toCharacterAt",
    },
    {
      key: "r",
      command: "replace",
    },
    {
      key: "T",
      command: "toCharacterAfterBack",
    },
    {
      key: "t",
      command: "toCharacterBefore",
    },
  ],
  visualline: [],
  VISUALLINE: [
    {
      key: "d",
      command: "visualDelete",
    },
    {
      key: "o",
      command: "visualMoveToOtherEndOfMarkedArea",
    },
    {
      key: "x",
      command: "visualDelete",
    },
    {
      key: "<Control>c",
      command: "copy",
    },
    {
      key: "<Control>x",
      command: "cut",
    },
    {
      key: "<Control>z",
      command: "undo",
    },
    {
      key: "<Control><Shift>Z",
      command: "redo",
    },
    {
      key: "<Escape>",
      command: "enterNormalMode",
    },
    {
      key: "<ArrowLeft>",
      command: "cursorLeft",
    },
    {
      key: "<ArrowUp>",
      command: "cursorUp",
    },
    {
      key: "<ArrowRight>",
      command: "cursorRight",
    },
    {
      key: "<ArrowDown>",
      command: "cursorDown",
    },
    {
      key: "b",
      command: "cursorBackwordsStartWord",
    },
    {
      key: "e",
      command: "cursorWordForwardEnd",
    },
    {
      key: "gg",
      command: "goToFirstLine",
    },
    {
      key: "h",
      command: "cursorLeft",
    },
    {
      key: "k",
      command: "cursorUp",
    },
    {
      key: "l",
      command: "cursorRight",
    },
    {
      key: "u",
      command: "cursorDown",
    },
    {
      key: "w",
      command: "cursorWordForwardStart",
    },
    {
      key: "y",
      command: "yank",
    },
    {
      key: "<Shift>G",
      command: "goToLastLine",
    },
    {
      key: "<Shift>$",
      command: "cursorLineEnd",
    },
    {
      key: "$",
      command: "cursorLineEnd",
    },
    {
      key: "<Shift>^",
      command: "cursorLineStart",
    },
    {
      key: "^",
      command: "cursorLineStart",
    },
    {
      key: "<Shift>}",
      command: "jumpNextBlock",
    },
    {
      key: "}",
      command: "jumpNextBlock",
    },
    {
      key: "<Shift>{",
      command: "jumpPreviousBlock",
    },
    {
      key: "{",
      command: "jumpPreviousBlock",
    },
    {
      key: "<Shift>><Shift>>",
      command: "indentRight",
    },
    {
      key: "<Shift><<Shift><",
      command: "indentLeft",
    },
    {
      key: "<Shift>F",
      command: "toCharacterAtBack",
    },
    {
      key: "f",
      command: "toCharacterAt",
    },
    {
      key: "r",
      command: "replace",
    },
    {
      key: "T",
      command: "toCharacterAfterBack",
    },
    {
      key: "t",
      command: "toCharacterBefore",
    },
  ],
  CUSTOM: [
    {
      key: "x",
      command: "delete",
    },
    {
      key: "<Control>c",
      command: "copy",
    },
    {
      key: "<Control>x",
      command: "cut",
    },
    {
      key: "<Control>z",
      command: "undo",
    },
    {
      key: "<Control><Shift>Z",
      command: "redo",
    },
    {
      key: "<Escape>",
      command: "enterNormalMode",
    },
    {
      key: "<ArrowLeft>",
      command: "cursorLeft",
    },
    {
      key: "<ArrowUp>",
      command: "cursorUp",
    },
    {
      key: "<ArrowRight>",
      command: "cursorRight",
    },
    {
      key: "<ArrowDown>",
      command: "cursorDown",
    },
    {
      key: "b",
      command: "cursorBackwordsStartWord",
    },
    {
      key: "e",
      command: "cursorWordForwardEnd",
    },
    {
      key: "gg",
      command: "goToFirstLine",
    },
    {
      key: "h",
      command: "cursorLeft",
    },
    {
      key: "k",
      command: "cursorUp",
    },
    {
      key: "l",
      command: "cursorRight",
    },
    {
      key: "u",
      command: "cursorDown",
    },
    {
      key: "w",
      command: "cursorWordForwardStart",
    },
    {
      key: "y",
      command: "yank",
    },
    {
      key: "<Shift>G",
      command: "goToLastLine",
    },
    {
      key: "<Shift>$",
      command: "cursorLineEnd",
    },
    {
      key: "$",
      command: "cursorLineEnd",
    },
    {
      key: "<Shift>^",
      command: "cursorLineStart",
    },
    {
      key: "^",
      command: "cursorLineStart",
    },
    {
      key: "<Shift>}",
      command: "jumpNextBlock",
    },
    {
      key: "}",
      command: "jumpNextBlock",
    },
    {
      key: "<Shift>{",
      command: "jumpPreviousBlock",
    },
    {
      key: "{",
      command: "jumpPreviousBlock",
    },
    {
      key: "<Shift>><Shift>>",
      command: "indentRight",
    },
    {
      key: "<Shift><<Shift><",
      command: "indentLeft",
    },
    {
      key: "<Shift>F",
      command: "toCharacterAtBack",
    },
    {
      key: "f",
      command: "toCharacterAt",
    },
    {
      key: "r",
      command: "replace",
    },
    {
      key: "T",
      command: "toCharacterAfterBack",
    },
    {
      key: "t",
      command: "toCharacterBefore",
    },
  ],
  ALL: [
    {
      key: "<Space>cl",
      desc: "[cl]ear console",
      preventUndoRedo: true,
    },
  ],
  synonyms: {
    "<esc>": "<Escape>",
    escape: "<Escape>",
  },
};

const logger = new Logger("VimInit.spec.ts", { terminalColor: "FgMagenta" });

describe("KeyMappingService", () => {
  test("mergeKeybindingsV2", () => {
    const keyMappingService = new KeyMappingService();
    const result = keyMappingService.mergeKeybindingsV2(current, additional);
    /*prettier-ignore*/ console.log("[KeyMappingService.spec.ts,996] result: ", result);
    expect(result).toBe(true);
  });

  test("overwriteExistingKeyBindingsV2", () => {
    const a = [
      {
        key: "<Enter>",
      },
    ];
    const b = [
      {
        key: "<Space>cl",
      },
    ];
    const result = overwriteExistingKeyBindingsV2(a, b);
    expect(result).toMatchSnapshot();
  });

  test("overwriteExistingKeyBindingsV2 - add, if not matching key", () => {
    const baseNormal: VimCommand[] = [
      {
        key: "k",
        command: "cursorUp",
      },
    ];

    const baseAll = [];

    const otherNormal: VimCommand[] = [
      {
        key: "<ArrowUp>",
        command: "cursorUp",
      },
    ];

    const otherAll = [];

    const result = overwriteExistingKeyBindingsV2(
      baseNormal,
      baseAll,
      otherNormal,
      otherAll,
    );
    expect(result).toMatchSnapshot();
  });

  test("overwriteExistingKeyBindingsV2 - add key to other", () => {
    const baseNormal: VimCommand[] = [
      {
        key: "k",
        command: "cursorUp",
      },
    ];

    const baseAll = [];

    const otherNormal: VimCommand[] = [
      {
        command: "cursorUp",
      },
    ];

    const otherAll = [];

    const result = overwriteExistingKeyBindingsV2(
      baseNormal,
      baseAll,
      otherNormal,
      otherAll,
    );
    expect(result).toMatchSnapshot();
  });

  test.only("overwriteExistingKeyBindingsV2 - add key to base", () => {
    const baseNormal: VimCommand[] = [
      {
        command: "cursorUp",
      },
    ];

    const baseAll = [];

    const otherNormal: VimCommand[] = [
      {
        key: "<ArrowUp>",
        command: "cursorUp",
      },
    ];

    const otherAll = [];

    const result = overwriteExistingKeyBindingsV2(
      baseNormal,
      baseAll,
      otherNormal,
      otherAll,
    );
    expect(result).toMatchSnapshot();
  });
});
