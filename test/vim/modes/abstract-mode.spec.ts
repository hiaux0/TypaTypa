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
  test("cursorWordForwardEnd", () => {
    const testVimState = VimStateClass.createEmpty();
    testVimState.lines = [{ text: "01234. Yes" }];
    const abstractMode = new TestAbstractMode(testVimState);
    const updated = abstractMode.cursorWordForwardEnd();
    expect(updated.cursor.col).toBe(4);
  });

  test("cursorWordForwardEnd - ee", () => {
    const testVimState = VimStateClass.createEmpty();
    testVimState.lines = [{ text: "01234 678" }];
    const abstractMode = new TestAbstractMode(testVimState);
    const one = abstractMode.cursorWordForwardEnd();
    abstractMode.setVimState(one);
    const updated = abstractMode.cursorWordForwardEnd();
    expect(updated.cursor.line).toBe(0);
    expect(updated.cursor.col).toBe(8);
  });

  test("cursorWordForwardEnd - ee - new line", () => {
    const testVimState = VimStateClass.createEmpty();
    testVimState.cursor.col = 4;
    testVimState.lines = [{ text: "01234" }, { text: "abcdef" }];
    const abstractMode = new TestAbstractMode(testVimState);
    const updated = abstractMode.cursorWordForwardEnd();
    expect(updated.cursor.line).toBe(1);
    expect(updated.cursor.col).toBe(5);
  });

  describe("cursorWordForwardStart", () => {
    test("cursorWordForwardStart - isAtLastWord", () => {
      const testVimState = VimStateClass.createEmpty();
      testVimState.lines = [{ text: "01234. 789" }];
      testVimState.cursor.col = 7;
      const abstractMode = new TestAbstractMode(testVimState);
      const updated = abstractMode.cursorWordForwardStart();
      updated; /*?*/
      expect(updated.cursor.col).toBe(9);
    });

    test("cursorWordForwardStart - isAtEnd", () => {
      const testVimState = VimStateClass.createEmpty();
      testVimState.lines = [{ text: "01234" }, { text: "012345" }];
      testVimState.cursor.col = 4;
      const abstractMode = new TestAbstractMode(testVimState);
      const updated = abstractMode.cursorWordForwardStart();
      updated; /*?*/
      expect(updated.cursor.line).toBe(1);
      expect(updated.cursor.col).toBe(0);
    });
  });

  describe("cursorBackwordsStartWord", () => {
    test("cursorBackwordsStartWord - isAtStart", () => {
      const testVimState = VimStateClass.createEmpty();
      testVimState.lines = [{ text: "01234. 789" }];
      testVimState.cursor.col = 7;
      const abstractMode = new TestAbstractMode(testVimState);
      const updated = abstractMode.cursorBackwordsStartWord();
      updated; /*?*/
      expect(updated.cursor.col).toBe(9);
    });

    test("cursorBackwordsStartWord - shouldGoToPreviousLine", () => {
      const testVimState = VimStateClass.createEmpty();
      testVimState.lines = [{ text: "01234" }, { text: "012345" }];
      testVimState.cursor.line = 1;
      testVimState.cursor.col = 0;
      const abstractMode = new TestAbstractMode(testVimState);
      const updated = abstractMode.cursorBackwordsStartWord();
      updated; /*?*/
      expect(updated.cursor.line).toBe(0);
      expect(updated.cursor.col).toBe(0);
    });
  });
});

/**
01234
abcdef
01234 6789
abcd fghifkl
 */
