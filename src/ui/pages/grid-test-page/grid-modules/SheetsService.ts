import { COLORS } from "../../../../common/modules/constants";
import { Cell, GridSelectionRange, Sheet } from "../../../../types";
import { iterateOverGrid } from "./gridModules";

export class SheetsService {
  constructor(private sheet: Sheet) {}

  public getCell(col: number, row: number): Cell {
    const cell = this.sheet.content[row]?.[col];
    return cell;
  }

  public getGridCoordsFromSheet(): GridSelectionRange {
    if (!this.sheet) return;
    const result = [
      [0, 0],
      [this.sheet.content?.[0]?.length - 1, this.sheet.content.length - 1],
    ] as GridSelectionRange;
    return result;
  }

  public iterateOverGrid = iterateOverGrid;
}

export function addMarkdownStylingToCell(cell: Cell): Cell {
  if (!cell?.text) return;

  if (cell.text.startsWith("#")) {
    cell.styles = {};
  }
  if (cell.text.startsWith("# ")) {
    cell.styles.color = COLORS.headings.h1;
  } else if (cell.text.startsWith("## ")) {
    cell.styles.color = COLORS.headings.h2;
  } else if (cell.text.startsWith("### ")) {
    cell.styles.color = COLORS.headings.h3;
  } else if (cell.text.startsWith("#### ")) {
    cell.styles.color = COLORS.headings.h4;
  } else if (cell.text.startsWith("##### ")) {
    cell.styles.color = COLORS.headings.h5;
  } else if (cell.text.startsWith("###### ")) {
    cell.styles.color = COLORS.headings.h6;
  }
  return cell;
}

export function addMarkdownStyling(sheet: Sheet): Sheet {
  const ss = new SheetsService(sheet);
  const [start, end] = ss.getGridCoordsFromSheet();
  ss.iterateOverGrid(start, end, (col, row) => {
    const cell = ss.getCell(col, row);
    addMarkdownStylingToCell(cell);
  });
  return sheet;
}
