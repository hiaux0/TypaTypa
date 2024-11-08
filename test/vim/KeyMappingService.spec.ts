import { describe, expect, test } from "vitest";
import { Logger } from "../../src/common/logging/logging";
import {
  KeyMappingService,
  overwriteAndAddExistingKeyBindingsV2,
} from "../../src/features/vim/vimCore/commands/KeyMappingService";
import { KeyBindingModes } from "../../src/features/vim/vim-types";
import {
  VIM_COMMAND,
  VimCommand,
} from "../../src/features/vim/vim-commands-repository";

const logger = new Logger("VimInit.spec.ts", { terminalColor: "FgMagenta" });

describe("KeyMappingService", () => {
  //test("mergeKeybindingsV2", () => {
  //  const keyMappingService = new KeyMappingService();
  //  const result = keyMappingService.mergeKeybindingsV2(current, additional);
  //  /*prettier-ignore*/ console.log("[KeyMappingService.spec.ts,996] result: ", result);
  //  expect(result).toBe(true);
  //});

  describe("overwriteAndAddExistingKeyBindingsV2", () => {
    test("init", () => {
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
      const result = overwriteAndAddExistingKeyBindingsV2(a, b);
      expect(result).toMatchSnapshot();
    });

    test("overwrite, if not matching key", () => {
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

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,
        baseAll,
        otherNormal,
        otherAll,
      );
      expect(result).toMatchSnapshot();
    });

    test("add key to other", () => {
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

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,
        baseAll,
        otherNormal,
        otherAll,
      );
      expect(result).toMatchSnapshot();
    });

    test("add key to base", () => {
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

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,
        baseAll,
        otherNormal,
        otherAll,
      );
      expect(result).toMatchSnapshot();
    });

    test("overwrite with base", () => {
      const baseNormal: VimCommand[] = [
        {
          key: "<ArrowRight>",
          command: "cursorRight",
        },
        {
          key: "l",
          command: "cursorRight",
        },
      ];

      const baseAll = [];

      const otherNormal: VimCommand[] = [
        {
          command: "cursorRight",
          context: ["Grid"],
          key: "l",
        },
      ];

      const otherAll = [];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,
        baseAll,
        otherNormal,
        otherAll,
      );

      expect(result).toMatchSnapshot();
    });

    test("overwrite, but keep different key", () => {
      const baseNormal: VimCommand[] = [
        {
          key: "<ArrowRight>",
          command: "cursorRight",
        },
        {
          key: "l",
          command: "cursorRight",
        },
      ];

      const baseAll = [];

      const otherNormal: VimCommand[] = [
        {
          command: "cursorRight",
          context: ["Grid"],
          key: "r",
        },
      ];

      const otherAll = [];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,
        baseAll,
        otherNormal,
        otherAll,
      );

      expect(result).toMatchSnapshot();
    });

    test("combo - overwrite and push", () => {
      const baseNormal: VimCommand[] = [
        {
          key: "<ArrowRight>", // [1.1] 2 bindings with same command, but different key
          command: "cursorRight", // [1.2] 2 bindings with same command
        },
        {
          key: "l", // [1.1] 2 bindings with same command, but different key
          command: "cursorRight", // [1.2] 2 bindings with same command
        },
        {
          key: "r",
          command: "redo",
        },
      ];

      const baseAll = [];

      const otherNormal: VimCommand[] = [
        {
          key: "<leader>l", // [1.3] different key, but same command, so push
          command: "cursorRight", // [1.2] 2 bindings with same command
          context: ["Grid"], // [1.4] additional data, to highlight overwriting
        },
        {
          command: "redo",
          key: "l", // new command, but same key --> overwrite key
        },
      ];

      const otherAll = [];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,
        baseAll,
        otherNormal,
        otherAll,
      );

      expect(result).toMatchSnapshot();
    });

    test("sequence", () => {
      // test("sequence", () => {
      const baseNormal: VimCommand[] = [
        { key: "<Space>tc", sequence: "^elrx" },
      ];

      const baseAll = [];

      const otherNormal: VimCommand[] = [
        {
          key: "<Control>s",
          desc: "[S]ave",
          context: ["Grid"],
          preventUndoRedo: true,
        },
      ];

      const otherAll = [];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,
        baseAll,
        otherNormal,
        otherAll,
      );

      // result; /*?*/
      expect(result).toMatchSnapshot();
    });
  });

    // test("sequence", () => {
  test.only("Key, but no command", () => {
    const baseNormal: VimCommand[] = [
      {
        key: "<Enter>",
        command: "newLine",
      },
    ];

    const baseAll = [];

    const otherNormal: VimCommand[] = [
      {
        key: "<Enter>",
        desc: "Accept changes and exit edit mode",
        context: ["gridCell"],
      },
    ];

    const otherAll = [];

    const result = overwriteAndAddExistingKeyBindingsV2(
      baseNormal,
      baseAll,
      otherNormal,
      otherAll,
    );

    result; /*?*/
    // expect(result).toMatchSnapshot();
  });
});
