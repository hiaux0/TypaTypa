import { EventAggregator, resolve } from "aurelia";
import "./grid-test-page.scss";
import { EV_CELL_SELECTED } from "../../../modules/eventMessages";
import { clear } from "console";
import { GridSelectionCoord, GridSelectionRange } from "../../../types";
import { getElementPositionAsNumber } from "../../../modules/htmlElements";

export class GridTestPage {
  public gridTestContainerRef: HTMLElement;
  public testButtonRef: HTMLElement;
  public rowSize = 3;
  public columnSize = 5;
  // Drag and select
  public startColumnIndex = NaN;
  public endColumnIndex = NaN;
  public startRowIndex = NaN;
  public endRowIndex = NaN;

  private isDragStart = false;

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
  ) {}

  attached() {
    this.gridTestContainerRef.addEventListener("mouseup", () => {
      //this.iterateOverSelectedCells((columnIndex, rowIndex) => {
      //  if (this.isInArea(columnIndex, rowIndex)) {
      //    this.eventAggregator.publish(
      //      EV_CELL_SELECTED(columnIndex, rowIndex),
      //      {
      //        selected: false,
      //      },
      //    );
      //  }
      //});

      this.resetDrag();
    });
  }

  public logCoords() {
    const start = `${this.startColumnIndex}:${this.startRowIndex}`;
    const end = `${this.endColumnIndex}:${this.endRowIndex}`;
    const all = `[${start}] - [${end}]`;
    /*prettier-ignore*/ console.log("[grid-test-page.ts,20] all: ", all);
  }

  public numberToAlphabet = (num: number) => {
    return String.fromCharCode(65 + num);
  };

  public startMouseDrag = (columnIndex: number, rowIndex: number) => {
    this.iterateOverSelectedCells((columnIndex, rowIndex) => {
      if (this.isInArea(columnIndex, rowIndex)) {
        this.eventAggregator.publish(EV_CELL_SELECTED(columnIndex, rowIndex), {
          selected: false,
        });
      }
    });

    this.isDragStart = true;
    this.startColumnIndex = columnIndex;
    this.endColumnIndex = columnIndex;
    this.startRowIndex = rowIndex;
    this.endRowIndex = rowIndex;

    this.eventAggregator.publish(
      EV_CELL_SELECTED(this.startColumnIndex, this.startRowIndex),
      {
        selected: true,
      },
    );
  };

  public publishCellUpdate(): void {}

  public onMouseOver = (columnIndex: number, rowIndex: number) => {
    if (!this.isDragStart) return;
    clear();
    const before = this.getSelectedArea();
    this.endColumnIndex = columnIndex;
    this.endRowIndex = rowIndex;

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
      [this.startColumnIndex, this.startRowIndex],
      [this.endColumnIndex, this.endRowIndex],
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

  private getSelectedArea() {
    const minColumnIndex = Math.min(this.startColumnIndex, this.endColumnIndex);
    const maxColumnIndex = Math.max(this.startColumnIndex, this.endColumnIndex);
    const minRowIndex = Math.min(this.startRowIndex, this.endRowIndex);
    const maxRowIndex = Math.max(this.startRowIndex, this.endRowIndex);
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

  private resetDrag() {
    this.isDragStart = false;
    //this.startColumnIndex = NaN;
    //this.endColumnIndex = NaN;
    //this.startRowIndex = NaN;
    // this.endRowIndex = NaN;
  }
}
