export const featureFlags = {
  autosave: false,
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
    autoExpandGrid: true,
  },
};

// featureFlags
// featureFlags.copy.autopasteIntoRow
// featureFlags.mode.enterCellInInsertMode
// featureFlags.mode.autoExpandGrid
