import { EventAggregator, bindable, resolve } from "aurelia";
import "./grid-cell.scss";
import { Cell, ColHeaderMap, SheetSettings } from "../../../../types";
import { CELL_WIDTH } from "../../../../common/modules/constants";
const PADDING = 8;
const BORDER_WIDTH = 1;

export class GridCell {
  @bindable public cell: Cell;
  @bindable public column: number;
  @bindable public row: number;
  @bindable public wholeRow: Cell[];
  @bindable public selected: boolean = false;
  @bindable public sheetSettings: SheetSettings;
  @bindable public columnSettings: ColHeaderMap[string];

  public cellContentRef: HTMLElement;
  public contentWidth = NaN;
  public PADDING = PADDING;
  public CELL_WIDTH = CELL_WIDTH;

  get widthPx() {
    if (!this.cell?.colsToNextText) return "unset";
    const colsToNextText = this.cell.colsToNextText;
    const borderWidthAdjust = colsToNextText * BORDER_WIDTH;

    // old way
    // const width = colsToNextText * CELL_WIDTH - PADDING - borderWidthAdjust;

    const colHeaderWidth =
      this.columnSettings?.colWidth - PADDING - borderWidthAdjust;
    const widthOfCurrentCell = Math.min(colHeaderWidth, this.cell.scrollWidth);
    const otherColsToConsiderForWidth = this.wholeRow.slice(
      this.column + 1,
      this.column + colsToNextText,
    );
    let otherColWidth = 0;
    otherColsToConsiderForWidth.forEach((cell) => {
      if (!cell) return;
      otherColWidth += cell.scrollWidth;
    }, 0);

    const finalWidthOfCurrent = Math.max(widthOfCurrentCell, colHeaderWidth);
    const finalWidth = finalWidthOfCurrent + otherColWidth;

    const log = [finalWidthOfCurrent, otherColWidth, finalWidth];
    const adjustedWidth = finalWidth;
    if (this.column === 1 && this.row === 1) {
      console.clear();
      /*prettier-ignore*/ console.log("[grid-cell.ts,42] finalWidthOfCurrent: ", finalWidthOfCurrent);
      /*prettier-ignore*/ console.log("[grid-cell.ts,34] otherColsToConsiderForWidth: ", otherColsToConsiderForWidth);
      /*prettier-ignore*/ console.log("[grid-cell.ts,44] finalWidth: ", finalWidth);
      /*prettier-ignore*/ console.log("2.3 [grid-cell.ts,28] log: ", log);
    }
    const asPx = `${adjustedWidth}px`;
    return asPx;
  }

  columnSettingsChanged() {
    /*prettier-ignore*/ console.log("[grid-cell.ts,30] this.columnSettings: ", this.columnSettings);
  }

  cellChanged() {
    this.updateCell();
  }

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
  ) {}

  attached() {
    this.updateCell();
  }

  private updateCell() {
    if (!this.cell) return;
    if (this.cell?.text == null) return;
    if (this.cell.text === "") {
      this.cell.scrollWidth = this.CELL_WIDTH;
    } else {
      this.cell.scrollWidth = this.cellContentRef.scrollWidth;
    }
    this.cell.col = this.column;
    this.cell.row = this.row;
  }
}
