import { EventAggregator, resolve } from "aurelia";
import "./grid-test-page.scss";
import { EV_CELL_SELECTED } from "../../../common/modules/eventMessages";
import { GridSelectionCoord, GridSelectionRange } from "../../../types";
import { generateId } from "../../../common/modules/random";

interface GridPanel {
  id: string;
  row: number;
  col: number;
  width?: number;
  height?: number;
  type: "button";
}

const CELL_HEIGHT = 32;
const CELL_WIDTH = 64;

export class GridTestPage {
  public gridTestContainerRef: HTMLElement;
  public rowSize = 12;
  public columnSize = 13;
  public CELL_HEIGHT = CELL_HEIGHT;
  public CELL_WIDTH = CELL_WIDTH;
  // Drag and select //
  // Container needs to keep track of these values, because the grid cells are not aware of each other
  public dragStartColumnIndex = 0;
  public dragEndColumnIndex = 0;
  public dragStartRowIndex = 0;
  public dragEndRowIndex = 0;

  public gridPanels: GridPanel[] = [];
  public START_PANEL_TOP = 32;
  public START_PANEL_LEFT = 64;

  private isStartDragGridCell = false;

  public get orderedSelectedRangeToString(): string {
    const ordered = this.getSelectedArea();
    const [[startColumn, startRow], [endColumn, endRow]] = ordered;
    // const result = `${this.numberToAlphabet(startColumn)}${startRow + 1} - ${this.numberToAlphabet(endColumn)}${endRow + 1}`;
    const result = `${startColumn},${startRow}:${endColumn},${endRow}`;
    return result;
  }

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
  ) {}

  attached() {
    this.gridPanels = [
      // { id: "1", row: 0, col: 0, type: "button" },
      //{ row: 1, col: 1, width: 2, type: "button" },
      // { id: "2", row: 2, col: 5, width: 4, height: 4, type: "button" },
    ];
    this.gridTestContainerRef.addEventListener("mouseup", () => {
      //this.unselectAllSelecedCells();
      //this.addGridPanelToSelection();
      //this.resetDrag();
    });
  }

  public startMouseDragGridCell = (columnIndex: number, rowIndex: number) => {
    this.unselectAllSelecedCells();

    this.isStartDragGridCell = true;

    this.dragStartColumnIndex = columnIndex;
    this.dragStartRowIndex = rowIndex;
    this.dragEndColumnIndex = columnIndex;
    this.dragEndRowIndex = rowIndex;

    this.eventAggregator.publish(
      EV_CELL_SELECTED(this.dragStartColumnIndex, this.dragStartRowIndex),
      {
        selected: true,
      },
    );
  };

  public onMouseOverGridCell = (columnIndex: number, rowIndex: number) => {
    if (!this.isStartDragGridCell) return;
    const before = this.getSelectedArea();
    this.dragEndColumnIndex = columnIndex;
    this.dragEndRowIndex = rowIndex;

    const after = this.getSelectedArea();

    const diff = calculateDiff(before, after);
    if (diff.length) {
      diff.forEach(([columnIndex, rowIndex]) => {
        this.eventAggregator.publish(EV_CELL_SELECTED(columnIndex, rowIndex), {
          selected: false,
        });
      });
    }

    this.iterateOverSelectedCells((columnIndex, rowIndex) => {
      if (!this.isInArea(columnIndex, rowIndex)) return;
      this.eventAggregator.publish(EV_CELL_SELECTED(columnIndex, rowIndex), {
        selected: true,
      });
    });
  };

  public onMouseUpGridCell(): void {
    // this.addGridPanelToSelection();
    this.resetDrag();
  }

  public addPanel(): void {
    this.unselectAllSelecedCells();
    this.addGridPanelToSelection();
  }

  /**
   * A1 - C3
   * B2 ok
   * B3 ok
   * C4 not ok
   */
  public isInArea(columnIndex: number, rowIndex: number): boolean {
    const [[startColumn, startRow], [endColumn, endRow]] =
      this.getSelectedArea();

    const isInColumn = columnIndex >= startColumn && columnIndex <= endColumn;
    const isInRow = rowIndex >= startRow && rowIndex <= endRow;
    const is = isInRow && isInColumn;
    return is;
  }

  public deletePanel(panel: GridPanel): void {
    const filtered = this.gridPanels.filter((p) => p !== panel);
    this.gridPanels = filtered;
  }

  private addGridPanelToSelection(): void {
    const selected = this.getSelectedArea();
    const [[startColumn, startRow], [endColumn, endRow]] = selected;
    const width = endColumn - startColumn + 1;
    const height = endRow - startRow + 1;
    const newPanel: GridPanel = {
      id: generateId(),
      row: startRow,
      col: startColumn,
      width,
      height,
      type: "button",
    };
    this.gridPanels.push(newPanel);
  }

  private getSelectedArea() {
    const minColumnIndex = Math.min(
      this.dragStartColumnIndex,
      this.dragEndColumnIndex,
    );
    const maxColumnIndex = Math.max(
      this.dragStartColumnIndex,
      this.dragEndColumnIndex,
    );
    const minRowIndex = Math.min(this.dragStartRowIndex, this.dragEndRowIndex);
    const maxRowIndex = Math.max(this.dragStartRowIndex, this.dragEndRowIndex);
    const result: GridSelectionRange = [
      [minColumnIndex, minRowIndex],
      [maxColumnIndex, maxRowIndex],
    ];
    return result;
  }

  private unselectAllSelecedCells(): void {
    this.iterateOverSelectedCells((columnIndex, rowIndex) => {
      if (this.isInArea(columnIndex, rowIndex)) {
        this.eventAggregator.publish(EV_CELL_SELECTED(columnIndex, rowIndex), {
          selected: false,
        });
      }
    });
  }

  private iterateOverSelectedCells(
    callback: (columnIndex: number, rowIndex: number) => void,
  ) {
    const [[startColumn, startRow], [endColumn, endRow]] =
      this.getSelectedArea();
    for (
      let columnIndex = startColumn;
      columnIndex <= endColumn;
      columnIndex++
    ) {
      for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
        callback(columnIndex, rowIndex);
      }
    }
  }

  private resetDrag() {
    this.isStartDragGridCell = false;

    //this.dragStartColumnIndex = NaN;
    //this.dragEndColumnIndex = NaN;
    //this.dragStartRowIndex = NaN;
    //this.dragEndRowIndex = NaN;
  }

  private logCoords() {
    const start = `${this.dragStartColumnIndex}:${this.dragStartRowIndex}`;
    const end = `${this.dragEndColumnIndex}:${this.dragEndRowIndex}`;
    const all = `[${start}] - [${end}]`;
    /*prettier-ignore*/ console.log("[grid-test-page.ts,20] all: ", all);
  }
}

function calculateDiff(
  before: GridSelectionRange,
  after: GridSelectionRange,
): GridSelectionRange {
  const diff: any = [];

  const [beforeStartColumn, beforeStartRow] = before[0]; // Top-left corner of first rectangle
  const [beforeEndColumn, beforeEndRow] = before[1]; // Bottom-right corner of first rectangle
  const [x2Start, y2Start] = after[0]; // Top-left corner of second rectangle
  const [afterEndColumn, afterEndRow] = after[1]; // Bottom-right corner of second rectangle

  // Iterate over the first rectangle's selection
  for (let x = beforeStartColumn; x <= beforeEndColumn; x++) {
    for (let y = beforeStartRow; y <= beforeEndRow; y++) {
      // If the current point is not within the bounds of the second rectangle, add it to the diff
      if (x < x2Start || x > afterEndColumn || y < y2Start || y > afterEndRow) {
        diff.push([x, y]);
      }
    }
  }

  return diff;
}

function orderByMinMaxRange(
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

function iterateOverRange(
  start: GridSelectionCoord,
  end: GridSelectionCoord,
  callback: (columnIndex: number, rowIndex: number) => void,
) {
  for (let columnIndex = start[0]; columnIndex <= end[0]; columnIndex++) {
    for (let rowIndex = start[1]; rowIndex <= end[1]; rowIndex++) {
      callback(rowIndex, columnIndex);
    }
  }
}

function iterateOverAllCells(
  callback: (columnIndex: number, rowIndex: number) => void,
) {
  for (let columnIndex = 0; columnIndex < this.columnSize; columnIndex++) {
    for (let rowIndex = 0; rowIndex < this.rowSize; rowIndex++) {
      callback(rowIndex, columnIndex);
    }
  }
}
