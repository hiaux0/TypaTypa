import { describe, expect, test } from "vitest";
import { VimInit } from "../../../src/features/vim/VimInit";
import { VIM_COMMAND } from "../../../src/features/vim/vim-commands-repository";
import { Logger } from "../../../src/common/logging/logging";
import { VimStateClass } from "../../../src/features/vim/vim-state";
import { KeyMappingService } from "../../../src/features/vim/vimCore/commands/KeyMappingService";
import {
  IVimState,
  KeyBindingModes,
  VimMode,
} from "../../../src/features/vim/vim-types";
import { AbstractMode } from "../../../src/features/vim/modes/AbstractMode";

const logger = new Logger("VimInit.spec.ts", { terminalColor: "FgMagenta" });

class TestAbstractMode extends AbstractMode {
  constructor(vimState: IVimState) {
    super(vimState);
  }
}

describe("AbstractMode", () => {
  test.only("cursorWordForwardEnd", () => {
    const testVimState = VimStateClass.createEmpty();
    testVimState.lines = [{ text: "01234. Yes" }];
    const abstractMode = new TestAbstractMode(testVimState);
    const updated = abstractMode.cursorWordForwardEnd();
    /*prettier-ignore*/ console.log("[abstract-mode.spec.ts,28] updated: ", updated);
    expect(updated.cursor.col).toBe(4);
  });
});
