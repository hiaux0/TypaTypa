import { CELL_HEIGHT } from "../../../../common/modules/constants";

/**
 * Priority
 * 0: Base
 * 1: Medium
 * 2: High
 */
export const featureFlags = {
  autosave: true,
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
      flag: true,        // 0
      clipText: true,    // 1
      clipTextOffset: 1, // 2 measured in cells
    },
    cursor: {
      cell: {
        scrollAmount: 6,
        scrollOffset: CELL_HEIGHT * 2,
        scrollAmountHorizontal: 1,
      },
    },
  },
  paste: {
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

export class FF {
  static get(key: string) {
    return featureFlags[key];
  }

  static getClipTextFlag(): boolean {
    return featureFlags.grid.cells.flag;
  }

  static canClipText(): boolean {
    if (!this.getClipTextFlag()) return;
    const { cells } = featureFlags.grid;
    const should = cells.clipText && !cells.clipTextOffset;
    return should;
  }

  static getClipTextOffset(): number {
    if (!this.getClipTextFlag()) return;
    if (this.canClipText()) return;
    return featureFlags.grid.cells.clipTextOffset;
  }
}

// featureFlags
// featureFlags.copy.autopasteIntoRow
// featureFlags.grid.cursor.cell.scrollAmount
// featureFlags.grid.cells.clipTextOffset;
// featureFlags.llm.printPrompts
// featureFlags.mode.enterCellInInsertMode
// featureFlags.mode.autoExpandGrid
// featureFlags.vim.mode.putCursorAtFirstNonWhiteSpace
