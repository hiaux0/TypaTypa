import { EventAggregator, resolve } from "aurelia";
import "./grid-test-page.scss";
import { EV_CELL_SELECTED } from "../../../modules/eventMessages";
import { clear } from "console";
import { GridSelectionCoord, GridSelectionRange } from "../../../types";
import { getElementPositionAsNumber } from "../../../modules/htmlElements";

interface GridPanel {
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
  public rowSize = 3;
  public columnSize = 5;
  public CELL_HEIGHT = CELL_HEIGHT;
  public CELL_WIDTH = CELL_WIDTH;
  // Drag and select //
  // Container needs to keep track of these values, because the grid cells are not aware of each other
  public dragStartColumnIndex = NaN;
  public dragEndColumnIndex = NaN;
  public dragStartRowIndex = NaN;
  public dragEndRowIndex = NaN;

  public gridPanels: GridPanel[] = [];
  public START_PANEL_TOP = 32;
  public START_PANEL_LEFT = 64;

  private isStartDragGridCell = false;

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
  ) {}

  attached() {
    this.gridPanels = [
      { row: 0, col: 0, type: "button" },
      //{ row: 1, col: 1, width: 2, type: "button" },
      //{ row: 2, col: 3, width: 2, type: "button" },
    ];
    this.gridTestContainerRef.addEventListener("mouseup", () => {
      //this.unselectAllSelecedCells();
      //this.addGridPanelToSelection();
      //this.resetDrag();
    });
  }

  public logCoords() {
    const start = `${this.dragStartColumnIndex}:${this.dragStartRowIndex}`;
    const end = `${this.dragEndColumnIndex}:${this.dragEndRowIndex}`;
    const all = `[${start}] - [${end}]`;
    /*prettier-ignore*/ console.log("[grid-test-page.ts,20] all: ", all);
  }

  public numberToAlphabet = (num: number) => {
    return String.fromCharCode(65 + num);
  };

  public startMouseDragGridCell = (columnIndex: number, rowIndex: number) => {
    this.unselectAllSelecedCells();

    this.isStartDragGridCell = true;
    this.dragStartColumnIndex = columnIndex;
    this.dragEndColumnIndex = columnIndex;
    this.dragStartRowIndex = rowIndex;
    this.dragEndRowIndex = rowIndex;

    this.eventAggregator.publish(
      EV_CELL_SELECTED(this.dragStartColumnIndex, this.dragStartRowIndex),
      {
        selected: true,
      },
    );
  };

  public publishCellUpdate(): void {}

  public onMouseOverGridCell = (columnIndex: number, rowIndex: number) => {
    if (!this.isStartDragGridCell) return;
    clear();
    const before = this.getSelectedArea();
    this.dragEndColumnIndex = columnIndex;
    this.dragEndRowIndex = rowIndex;

    const after = this.getSelectedArea();

    const diff = this.calculateDiff(before, after);
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
    this.unselectAllSelecedCells();
    this.addGridPanelToSelection();
    this.resetDrag();
  }

  private calculateDiff(
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
        if (
          x < x2Start ||
          x > afterEndColumn ||
          y < y2Start ||
          y > afterEndRow
        ) {
          diff.push([x, y]);
        }
      }
    }

    return diff;
  }

  public getCoords(): GridSelectionRange {
    const coords: GridSelectionRange = [
      [this.dragStartColumnIndex, this.dragStartRowIndex],
      [this.dragEndColumnIndex, this.dragEndRowIndex],
    ];
    return coords;
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

  private addGridPanelToSelection(): void {
    const selected = this.getSelectedArea();
    const [[startColumn, startRow], [endColumn, endRow]] = selected;
    const width = endColumn - startColumn + 1;
    const height = endRow - startRow + 1;
    const newPanel: GridPanel = {
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

  private orderByMinMaxRange(
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

  private iterateOverRange(
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

  private iterateOverAllCells(
    callback: (columnIndex: number, rowIndex: number) => void,
  ) {
    for (let columnIndex = 0; columnIndex < this.columnSize; columnIndex++) {
      for (let rowIndex = 0; rowIndex < this.rowSize; rowIndex++) {
        callback(rowIndex, columnIndex);
      }
    }
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

  private unselectAllSelecedCells(): void {
    this.iterateOverSelectedCells((columnIndex, rowIndex) => {
      if (this.isInArea(columnIndex, rowIndex)) {
        this.eventAggregator.publish(EV_CELL_SELECTED(columnIndex, rowIndex), {
          selected: false,
        });
      }
    });
  }

  private resetDrag() {
    this.isStartDragGridCell = false;

    this.dragStartColumnIndex = NaN;
    this.dragEndColumnIndex = NaN;
    this.dragStartRowIndex = NaN;
    this.dragEndRowIndex = NaN;
  }
}
