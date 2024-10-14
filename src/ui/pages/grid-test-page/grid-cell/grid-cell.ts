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
    const adjustedCellWidth = this.CELL_WIDTH + PADDING - BORDER_WIDTH;
    if (!this.cell?.colsToNextText) {
      const finalWidth = Math.max(this.cell?.scrollWidth, adjustedCellWidth);
      if (this.column === 0 && this.row === 0) {
        /*prettier-ignore*/ console.log("[grid-cell.ts,28] finalWidth: ", finalWidth);
      }
      return `${finalWidth}px`;
    }

    const colsToNextText = this.cell.colsToNextText;
    const borderWidthAdjust = colsToNextText * BORDER_WIDTH;
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
    const finalWidthOfCurrent = widthOfCurrentCell + otherColWidth;
    const finalWidth = Math.min(finalWidthOfCurrent, adjustedCellWidth);
    if (this.column === 0 && this.row === 0) {
      /*prettier-ignore*/ console.log("[grid-cell.ts,28] finalWidth: ", finalWidth);
    }
    const asPx = `${finalWidth}px`;
    return asPx;
  }

  isEditChanged() {
    if (!this.isEdit) return;
    this.textareaValue = this.lastContent;

    window.setTimeout(() => {
      this.cellContentRef.querySelector("input").focus();
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
