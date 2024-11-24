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
  paste: {
    splitByPeriodAndComma: true,
  },
  mode: {
    enterCellInInsertMode: false,
    autoExpandGrid: false,
  },
};

// featureFlags
// featureFlags.llm.printPrompts
// featureFlags.copy.autopasteIntoRow
// featureFlags.mode.enterCellInInsertMode
// featureFlags.mode.autoExpandGrid
