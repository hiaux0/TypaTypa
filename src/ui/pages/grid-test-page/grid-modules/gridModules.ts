import { CELL_WIDTH } from "../../../../common/modules/constants";
import {
  Cell,
  GridDatabaseType,
  GridSelectionCoord,
  GridSelectionRange,
} from "../../../../types";

export interface GridIteratorOptions {
  startCol?: number;
  endCol?: number;
  startRow?: number;
  endRow?: number;
  colSize?: number;
  rowSize?: number;
}

export const defaultGridIteratorOptions: GridIteratorOptions = {
  startCol: 0,
  startRow: 0,
};

export function calculateDiff(
  before: GridSelectionRange,
  after: GridSelectionRange,
): GridSelectionRange {
  const diff: any = [];

  const [beforeStartColumn, beforeStartRow] = before[0]; // Top-left corner of first rectangle
  const [beforeEndColumn, beforeEndRow] = before[1]; // Bottom-right corner of first rectangle
  const [x2Start, y2Start] = after[0]; // Top-left corner of second rectangle
  const [afterEndColumn, afterEndRow] = after[1]; // Bottom-right corner of second rectangle

  // Iterate over the first rectangle's selection
  for (let col = beforeStartColumn; col <= beforeEndColumn; col++) {
    for (let row = beforeStartRow; row <= beforeEndRow; row++) {
      // If the current point is not within the bounds of the second rectangle, add it to the diff
      if (
        col < x2Start ||
        col > afterEndColumn ||
        row < y2Start ||
        row > afterEndRow
      ) {
        diff.push([col, row]);
      }
    }
  }

  return diff;
}

export function orderByMinMaxRange(
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number,
): GridSelectionRange {
  const minColumnIndex = Math.min(startCol, endCol);
  const maxColumnIndex = Math.max(startCol, endCol);
  const minRowIndex = Math.min(startRow, endRow);
  const maxRowIndex = Math.max(startRow, endRow);
  const result: GridSelectionRange = [
    [minColumnIndex, minRowIndex],
    [maxColumnIndex, maxRowIndex],
  ];
  return result;
}

/**
 * Iterate row first
 */
export function iterateOverRange(
  start: GridSelectionCoord,
  end: GridSelectionCoord,
  callback: (columnIndex: number, rowIndex: number) => boolean | void,
  options?: GridIteratorOptions,
) {
  const startCol = options?.startCol ?? start[0];
  const startRow = options?.startRow ?? start[1];
  const endCol = options?.endCol ?? end[0];
  const endRow = options?.endRow ?? end[1];

  let stopAll = false;
  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
    if (stopAll) break;
    for (let columnIndex = startCol; columnIndex <= endCol; columnIndex++) {
      stopAll = !!callback(columnIndex, rowIndex);
      if (stopAll) {
        break;
      }
    }
  }
}

/**
 * Iterate row first.
 * Loop back through start of column
 */
export function iterateOverGrid(
  start: GridSelectionCoord,
  end: GridSelectionCoord,
  callback: (columnIndex: number, rowIndex: number) => boolean | void,
  options?: GridIteratorOptions,
) {
  let startCol = options?.startCol ?? start[0];
  const startRow = options?.startRow ?? start[1];

  let stopAll = false;
  for (let rowIndex = startRow; rowIndex <= end[1]; rowIndex++) {
    if (stopAll) break;
    if (rowIndex > startRow) {
      startCol = 0;
    }
    for (let columnIndex = startCol; columnIndex <= end[0]; columnIndex++) {
      stopAll = !!callback(columnIndex, rowIndex);
      if (stopAll) {
        break;
      }
    }
  }
}

/**
 * Iterate row first
 */
export function iterateOverRangeBackwards(
  start: GridSelectionCoord,
  end: GridSelectionCoord,
  callback: (columnIndex: number, rowIndex: number) => boolean | void,
  options: GridIteratorOptions,
) {
  const startCol = options?.startCol ?? start[0];
  // /*prettier-ignore*/ console.log("[gridModules.ts,133] startCol: ", startCol);
  const startRow = options?.startRow ?? start[1];
  // /*prettier-ignore*/ console.log("[gridModules.ts,135] startRow: ", startRow);
  const endCol = options?.endCol ?? end[0];
  // /*prettier-ignore*/ console.log("[gridModules.ts,137] endCol: ", endCol);
  const endRow = options?.endRow ?? end[1];
  // /*prettier-ignore*/ console.log("[gridModules.ts,139] endRow: ", endRow);

  let stopAll = false;
  for (let rowIndex = endRow; rowIndex >= startRow; rowIndex--) {
    if (stopAll) break;
    for (let columnIndex = endCol; columnIndex >= startCol; columnIndex--) {
      stopAll = !!callback(columnIndex, rowIndex);
      if (stopAll) {
        break;
      }
    }
  }
}

/**
 * Iterate row first
 */
export function iterateOverGridBackwards(
  end: GridSelectionCoord,
  callback: (columnIndex: number, rowIndex: number) => boolean | void,
  options: GridIteratorOptions,
) {
  let startCol = options.startCol ?? end[0];
  const startRow = options.startRow ?? end[1];

  let stopAll = false;
  for (let rowIndex = startRow; rowIndex >= 0; rowIndex--) {
    if (stopAll) break;
    if (rowIndex < end[1]) {
      startCol = options.colSize;
    }
    for (let columnIndex = startCol; columnIndex >= 0; columnIndex--) {
      stopAll = !!callback(columnIndex, rowIndex);
      if (stopAll) {
        break;
      }
    }
  }
}

export function measureTextWidth(
  text: string,
  font = getComputedStyle(document.body).font,
) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

export function checkCellOverflow(
  sheetsData: GridDatabaseType,
  options: { cellWidth: number } = { cellWidth: CELL_WIDTH },
) {
  sheetsData.sheets.forEach((sheet) => {
    sheet.content.forEach((row) => {
      // /*prettier-ignore*/ console.log("[gridModules.ts,185] row: ", row);
      if (!row) return;
      let lastCell: Cell | undefined = undefined;
      let lastCellIndex = 0;
      let colOfCellAfterFirstCellWithText = 0;
      row.forEach((cell, col) => {
        const cellText = cell?.text;

        //if (cellText) {
        //  cell.scrollWidth = measureTextWidth(cellText);
        //}

        // /*prettier-ignore*/ console.log("----------------------------");
        // /*prettier-ignore*/ console.log("0. [gridModules.ts,191] cell.text: ", cell.text);
        if (lastCell) {
          if (cellText) {
            // /*prettier-ignore*/ console.log("1. [gridModules.ts,191] hasCellText: ", hasCellText);
            // /*prettier-ignore*/ console.log("1.1 [gridModules.ts,194] lastCellWidth: ", lastCellWidth);
            const colDiff = col - lastCellIndex;
            // /*prettier-ignore*/ console.log("1.2 [gridModules.ts,198] lastCellIndex: ", lastCellIndex);
            // /*prettier-ignore*/ console.log("1.3 [gridModules.ts,198] col: ", col);
            // /*prettier-ignore*/ console.log("1.4 [gridModules.ts,196] colDiff: ", colDiff);
            // /*prettier-ignore*/ console.log("1.5.1 [gridModules.ts,201] col: ", col);
            // /*prettier-ignore*/ console.log("1.5.2 [gridModules.ts,204] colDiff: ", colDiff);
            // /*prettier-ignore*/ console.log("1.5.3 [gridModules.ts,208] lastCell.text: ", lastCell.text);
            lastCell.colsToNextText = colDiff;

            // Do once, because we skip the very first cell
            if (!colOfCellAfterFirstCellWithText) {
              // /*prettier-ignore*/ console.log("[gridModules.ts,215] colOfCellAfterFirstCellWithText: ", colOfCellAfterFirstCellWithText);
              colOfCellAfterFirstCellWithText = col;
            }
          }
        }

        if (cell?.text) {
          lastCell = cell;
          lastCellIndex = col;
        }
      });

      const firstCell = row[0];
      if (colOfCellAfterFirstCellWithText) {
        firstCell.colsToNextText = colOfCellAfterFirstCellWithText;
        // /*prettier-ignore*/ console.log("[gridModules.ts,230] colOfCellAfterFirstCellWithText: ", colOfCellAfterFirstCellWithText);
      }
    });
  });

  return sheetsData;
}
