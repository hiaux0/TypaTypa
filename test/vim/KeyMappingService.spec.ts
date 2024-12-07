import { describe, expect, test } from "vitest";
import { Logger } from "../../src/common/logging/logging";
import {
  addKeysToBindings,
  KeyMappingService,
  overwriteAndAddExistingKeyBindingsV2,
  overwriteKeybindingsV2,
} from "../../src/features/vim/vimCore/commands/KeyMappingService";
import { KeyBindingModes } from "../../src/features/vim/vim-types";
import {
  VIM_COMMAND,
  VimCommand,
  VimCommandNames,
} from "../../src/features/vim/vim-commands-repository";

const logger = new Logger("VimInit.spec.ts", { terminalColor: "FgMagenta" });

describe("KeyMappingService", () => {
  describe("mergeKeybindingsV2", () => {
    test("mergeKeybindingsV2", () => {
      const current = {
        NORMAL: [
          {
            key: "k",
            command: "cursorUp",
          },
          {
            key: "<ArrowUp>",
            command: "cursorUp",
          },
        ],
      } as KeyBindingModes;
      const additional = {
        NORMAL: [
          {
            command: "cursorUp",
            desc: "expected",
          },
        ],
      } as KeyBindingModes;

      const keyMappingService = new KeyMappingService();
      const result = overwriteKeybindingsV2(current, additional);
      result; /*?*/
      /*prettier-ignore*/ console.log("[KeyMappingService.spec.ts,996] result: ", result['NORMAL']);
      expect(result).toBe(true);
    });
  });

  describe("addKeysToBindings", () => {
    /*prettier-ignore*/
    const testCases: [base: VimCommand[], additional: VimCommand[], expected: VimCommand[]][] = [
      [
         [{key:"<Enter>"}],
         [{key:"<Space>cl"}],
         [{key:"<Enter>"}],
      ],
      [
        [{               command: "newLine"}],
        [{key:"<Enter>", command: "newLine"},{key:"u", command: "newLine"}],
        [{key:"<Enter>", command: "newLine"},{key:"u", command: "newLine"}],
      ],
      [
        [{               command: "newLine"}],
        [{key:"<Enter>", command: "newLine"},{key:"u", command: "newLine"},{key:"hey", command: "newLine"}],
        [{key:"<Enter>", command: "newLine"},{key:"u", command: "newLine"},{key:"hey", command: "newLine"}],
      ],
      [
        [{ "command": "cursorUp", }, { "command": "cursorDown", } ],
        [
          { "key": "x", "command": "delete" },
          { "key": "<Control>c", "command": "copy" },
          { "key": "<Control>x", "command": "cut" },
        ],
        [{ "command": "cursorUp", }, { "command": "cursorDown", } ],
      ],
    ]

    testCases.forEach(([base, additional, expected]) => {
      base; /*?*/
      additional; /*?*/
      test.only("dont add base to additional (should just overwrite)", () => {
        const result = addKeysToBindings(base, additional);
        result; /*?*/
        expect(result).toMatchObject(expected);
      });
    });
  });

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

      const otherNormal: VimCommand[] = [
        {
          key: "<ArrowUp>",
          command: "cursorUp",
        },
      ];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,
        otherNormal,
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

      const otherNormal: VimCommand[] = [
        {
          command: "cursorUp",
        },
      ];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,
        otherNormal,
      );
      expect(result).toMatchSnapshot();
    });

    test("add key to base", () => {
      const baseNormal: VimCommand[] = [
        {
          command: "cursorUp",
        },
      ];

      const otherNormal: VimCommand[] = [
        {
          key: "<ArrowUp>",
          command: "cursorUp",
        },
      ];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,

        otherNormal,
      );
      expect(result).toMatchSnapshot();
    });

    test("add command to multiple existing", () => {
      const baseNormal: VimCommand[] = [
        {
          key: "<ArrowDown>",
          command: "cursorDown",
        },
        {
          key: "u",
          command: "cursorDown",
        },
      ];

      const otherNormal: VimCommand[] = [
        {
          command: "cursorDown",
          desc: "cursorDown",
          context: ["Grid"],
          preventUndoRedo: true,
          key: "u",
        },
      ];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,

        otherNormal,
      );
      result; /*?*/
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

      const otherNormal: VimCommand[] = [
        {
          command: "cursorRight",
          context: ["Grid"],
          key: "l",
        },
      ];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,

        otherNormal,
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

      const otherNormal: VimCommand[] = [
        {
          command: "cursorRight",
          context: ["Grid"],
          key: "r",
        },
      ];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,

        otherNormal,
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

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,

        otherNormal,
      );

      expect(result).toMatchSnapshot();
    });

    test("sequence", () => {
      // test("sequence", () => {
      const baseNormal: VimCommand[] = [
        { key: "<Space>tc", sequence: "^elrx" },
      ];

      const otherNormal: VimCommand[] = [
        {
          key: "<Control>s",
          desc: "[S]ave",
          context: ["Grid"],
          preventUndoRedo: true,
        },
      ];

      const result = overwriteAndAddExistingKeyBindingsV2(
        baseNormal,

        otherNormal,
      );

      // result; /*?*/
      expect(result).toMatchSnapshot();
    });
  });

  describe("completeBinding", () => {
    test("should add key to binding", () => {
      const binding = [
        {
          command: "cursorDown",
          desc: "cursorDown",
          context: ["Grid"],
          preventUndoRedo: true,
        },
      ] as VimCommand[];
      const additional = [
        {
          key: "<ArrowDown>",
          command: "cursorDown",
        },
        {
          key: "u",
          command: "cursorDown",
        },
      ] as VimCommand[];
      const result = overwriteAndAddExistingKeyBindingsV2(additional, binding);
      result; /*?*/
      // expect(result).toMatchSnapshot();
    });
  });

  // test("sequence", () => {
  test("Key, but no command", () => {
    const baseNormal: VimCommand[] = [
      {
        key: "<Enter>",
        command: "newLine",
      },
    ];

    const otherNormal: VimCommand[] = [
      {
        key: "<Enter>",
        desc: "Accept changes and exit edit mode",
        context: ["gridCell"],
      },
    ];

    const result = overwriteAndAddExistingKeyBindingsV2(
      baseNormal,

      otherNormal,
    );

    result; /*?*/
    // expect(result).toMatchSnapshot();
  });
});
