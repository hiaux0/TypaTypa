import { CELL_HEIGHT } from "../../../../common/modules/constants";

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
      clipText: false,
      clipTextOffset: 1, // measured in cells
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
    }
  }
};

// featureFlags
// featureFlags.copy.autopasteIntoRow
// featureFlags.grid.cursor.cell.scrollAmount
// featureFlags.grid.cells.clipTextOffset;
// featureFlags.llm.printPrompts
// featureFlags.mode.enterCellInInsertMode
// featureFlags.mode.autoExpandGrid
// featureFlags.vim.mode.putCursorAtFirstNonWhiteSpace
