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
    cursor: {
      cell: {
        scrollAmount: 6,
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
};

// featureFlags
// featureFlags.grid.cursor.cell.scrollAmount
// featureFlags.llm.printPrompts
// featureFlags.copy.autopasteIntoRow
// featureFlags.mode.enterCellInInsertMode
// featureFlags.mode.autoExpandGrid
