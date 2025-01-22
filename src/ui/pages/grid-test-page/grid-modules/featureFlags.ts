import { CELL_HEIGHT } from "../../../../common/modules/constants";

/**
 * Priority
 * 0: Base
 * 1: Medium
 * 2: High
 */
export const featureFlags = {
  autosave: true,
  autoPlayAudio: false,
  llm: {
    printPrompts: true,
  },
  copy: {
    autopasteIntoRow: {
      enabled: true,
      col: 2,
      method: ["yank"],
    },
  },
  grid: {
    cells: {
      flag: false, // 0
      clipText: true, // 1
      clipTextOffset: 1, // 2 measured in cells
      audio: {
        aBRepeat: true,
      }
    },
    cursor: {
      keepCursorAtCenter: true,
      cell: {
        scrollAmount: 6,
        scrollOffset: CELL_HEIGHT * 2,
        scrollAmountHorizontal: 1,
      },
    },
  },
  paste: {
    autosplit: {
      flag: true,
      endingChars: ".!?",
      byEnding: ".!?",
      separatorChars: ",;:",
      bySeparator: "",
    },
    splitByPeriod: true,
    splitByPeriodAndComma: false,
  },
  mode: {
    enterCellInInsertMode: false,
    autoExpandGrid: false,
  },
  vim: {
    mode: {
      putCursorAtFirstNonWhiteSpace: true,
    },
  },
};

// featureFlags
// featureFlags.copy.autopasteIntoRow
// featureFlags.grid.cursor.cell.scrollAmount
// featureFlags.grid.cursor.keepCursorAtCenter
// featureFlags.grid.cells.clipTextOffset;
// featureFlags.grid.cells.audio.aBRepeat;
// featureFlags.llm.printPrompts
// featureFlags.mode.enterCellInInsertMode
// featureFlags.mode.autoExpandGrid
// featureFlags.vim.mode.putCursorAtFirstNonWhiteSpace

export class FF {
  static get(key: keyof typeof featureFlags) {
    return featureFlags[key];
  }

  //                                                                                            Paste autosplit
  static canPasteAutoSplitFlag(): boolean {
    return featureFlags.paste.autosplit.flag;
  }
  static getPasteAutoSplitByEnding(): boolean {
    if (!this.canPasteAutoSplitFlag()) return false;
    return featureFlags.paste.autosplit.byEnding.length > 0;
  }
  static getPasteAutoSplitBySeparator(): boolean {
    if (!this.canPasteAutoSplitFlag()) return false;
    return featureFlags.paste.autosplit.bySeparator.length > 0;
  }

  //                                                                                            Grid Cells
  static getClipTextFlag(): boolean {
    return featureFlags.grid.cells.flag;
  }

  static canClipText(): boolean {
    if (!this.getClipTextFlag()) return false;
    const { cells } = featureFlags.grid;
    const should = cells.clipText && !cells.clipTextOffset;
    return should;
  }

  static getClipTextOffset(): number {
    if (!this.getClipTextFlag()) return NaN;
    if (this.canClipText()) return NaN;
    return featureFlags.grid.cells.clipTextOffset;
  }
}
