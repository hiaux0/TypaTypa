import { EventAggregator, bindable, resolve } from "aurelia";
import "./grid-cell.scss";
import { Cell, ColHeaderMap, SheetSettings } from "../../../../types";
import { CELL_WIDTH } from "../../../../common/modules/constants";
import { isEnter, isEscape } from "../../../../features/vim/key-bindings";
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
  @bindable public isEdit: boolean;
  @bindable public onCellUpdate: (col: number, row: number, cell: Cell) => void;

  public cellContentRef: HTMLElement;
  public contentWidth = NaN;
  public PADDING = PADDING;
  public CELL_WIDTH = CELL_WIDTH;
  public textareaValue = "";

  private lastContent: string;

  get widthPx() {
    if (!this.cell) return;

    // 1. Show all content in edit mode
    if (this.isEdit) {
      return `${this.cell.scrollWidth + PADDING}px`;
    }

    const adjustedInitialCellWidth = this.CELL_WIDTH - PADDING - BORDER_WIDTH;
    // 2. Show all content if no cells with text to the right
    if (!this.cell.colsToNextText) {
      const finalWidth = Math.max(
        this.cell.scrollWidth,
        adjustedInitialCellWidth,
      );
      return `${finalWidth}px`;
    }

    // 3 Calculate width of cell to show (to not overwrite other cells)
    // 3.1 Prepare data
    const colsToNextText = this.cell.colsToNextText;
    const borderWidthAdjust = colsToNextText * BORDER_WIDTH;
    const colHeaderWidth =
      this.columnSettings?.colWidth - PADDING - borderWidthAdjust;
    const otherColsToConsiderForWidth = this.wholeRow.slice(
      this.column + 1,
      this.column + colsToNextText,
    );
    let otherColWidth = 0;
    otherColsToConsiderForWidth.forEach((cell) => {
      if (!cell) return;
      otherColWidth += cell.scrollWidth;
    }, 0);
    const minHeaderAndScrollWidth = Math.min(
      colHeaderWidth,
      this.cell.scrollWidth,
    );

    // 3.2 Calculate final width of cell to show
    const finalWidthOfCurrent = minHeaderAndScrollWidth + otherColWidth;
    const finalWidth = Math.max(finalWidthOfCurrent, adjustedInitialCellWidth);
    //if (this.column === 0 && this.row === 0) {
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,47] colHeaderWidth: ", colHeaderWidth);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,76] minHeaderAndScrollWidth: ", minHeaderAndScrollWidth);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,73] finalWidthOfCurrent: ", finalWidthOfCurrent);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,63] adjustedInitialCellWidth: ", adjustedInitialCellWidth);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,28] finalWidth: ", finalWidth);
    //}
    const asPx = `${finalWidth}px`;
    return asPx;
  }

  isEditChanged() {
    if (!this.isEdit) return;
    this.textareaValue = this.lastContent;

    window.setTimeout(() => {
      this.cellContentRef.querySelector("input")?.focus();
    }, 0);
  }

  cellChanged() {
    this.updateCell();
  }

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
  ) {}

  attached() {
    this.updateCell();
    if (this.cell?.text) {
      this.lastContent = this.cell.text;
    }
  }

  private updateCell() {
    if (!this.cell) return;
    if (this.cell?.text == null) return;
    if (this.cell.text === "") {
      this.cell.scrollWidth = this.CELL_WIDTH;
    } else {
      this.cell.scrollWidth = this.cellContentRef.scrollWidth;
      this.lastContent = this.textareaValue;
    }
    this.cell.col = this.column;
    this.cell.row = this.row;
  }

  public onKeyDown(event: KeyboardEvent) {
    if (!this.isEdit) return;
    const key = event.key;
    if (isEscape(key)) {
      this.lastContent = this.textareaValue;
      this.onCellUpdate(this.column, this.row, this.cell);
    } else if (isEnter(key)) {
      if (this.isEdit) {
        this.updateCell();
        this.cell.text = this.textareaValue;
        this.onCellUpdate(this.column, this.row, this.cell);
        return;
      }
    }
  }
}
