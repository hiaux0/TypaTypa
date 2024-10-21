import { expect, test } from "vitest";
import { checkCellOverflow } from "../../src/ui/pages/grid-test-page/grid-modules/gridModules";
import { GridDatabaseType } from "../../src/types";

const testSheetData: GridDatabaseType = {
  version: "0.0.2",
  sheets: [
    {
      id: "1",
      title: "Sheet 1",
      content: [
        [
          { text: "0123456789012345678", scrollWidth: 181 },
          undefined,
          { text: "20" },
        ],
      ],
      selectedRange: [
        [0, 0],
        [0, 0],
      ],
    },
  ],
  selectedSheetId: "1",
};

test.skip("adds 1 + 2 to equal 3", () => {
  const result = checkCellOverflow(testSheetData);
  expect(true).toBe(false);
});
