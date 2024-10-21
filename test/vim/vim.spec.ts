import { describe, expect, test } from "vitest";
import { VimInit } from "../../src/features/vim/VimInit";
import { VIM_COMMAND } from "../../src/features/vim/vim-commands-repository";
import { Logger } from "../../src/common/logging/logging";
import { VimStateClass } from "../../src/features/vim/vim-state";
import { KeyMappingService } from "../../src/features/vim/vimCore/commands/KeyMappingService";
import { KeyBindingModes, VimMode } from "../../src/features/vim/vim-types";

const logger = new Logger("VimInit.spec.ts", { terminalColor: "FgMagenta" });

describe("VimInit", () => {
  test("Init", () => {
    const vimInit = new VimInit();
    vimInit.init();
    const result = vimInit.executeCommand(VIM_COMMAND.enterInsertMode, "");
    expect(result).toMatchSnapshot();
  });

  test.only("Cursor", () => {
    const mappingByKey = {};
    const mappingByMode: KeyBindingModes = {
      [VimMode.NORMAL]: [
        {
          key: "a",
          execute: () => {
            return true;
          },
        },
      ],
    };
    new KeyMappingService().init(mappingByKey, mappingByMode);
    const keyBindings = KeyMappingService.keyBindings;
    const vimInit = new VimInit();
    const vimState = VimStateClass.createEmpty();
    vimState.lines = [{ text: "Hello, World" }];
    vimInit.init({ vimState, keyBindings });

    const result = vimInit.executeCommand(VIM_COMMAND.customExecute, "a");
    /*prettier-ignore*/ logger.culogger.debug(["[vim.spec.ts,20] result: ", result]);
    // expect(result).toMatchSnapshot();
    // expect(false).toBe(true);
  });
});

/**
 * 
1. Press key
2. Map to command
3. Execute command
4. Update state
 */
