import { EventAggregator, bindable, resolve } from "aurelia";
import "./grid-cell.scss";
import { Cell, ColHeaderMap, SheetSettings } from "../../../../types";
import { CELL_WIDTH } from "../../../../common/modules/constants";
import { isEnter, isEscape } from "../../../../features/vim/key-bindings";
import { getValueFromPixelString } from "../../../../common/modules/strings";
const PADDING = 6;
const PADDING_LEFT = 6;
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
  private hasAttached = false;

  get widthPx(): string {
    if (!this.hasAttached) return;
    if (!this.cell) return;

    // 1. Show all content in edit mode
    if (this.isEdit) {
      return `${this.cell.scrollWidth + PADDING}px`;
    }

    const minCellWidth = Math.min(
      this.columnSettings?.colWidth ?? this.CELL_WIDTH,
      // this.CELL_WIDTH,
    );
    const adjustedInitialCellWidth = minCellWidth - PADDING - BORDER_WIDTH;
    if (!this.cell.text) {
      return `${adjustedInitialCellWidth}px`;
    }

    // 2. Show all content if no cells with text to the right
    if (!this.cell.colsToNextText) {
      const finalWidth = Math.max(
        this.cell.scrollWidth,
        adjustedInitialCellWidth,
      );
      //if (this.column === 5 && this.row === 0) {
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,50] this.cell.scrollWidth,: ", this.cell.scrollWidth,);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,52] adjustedInitialCellWidth,: ", adjustedInitialCellWidth,);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,49] finalWidth: ", finalWidth);
      //}
      return `${finalWidth}px`;
    }

    // 3 Calculate width of cell to show (to not overwrite other cells)
    // 3.1 Prepare data
    const colsToNextText = this.cell.colsToNextText;
    const borderWidthAdjust = colsToNextText * BORDER_WIDTH;
    const colHeaderWidth = minCellWidth - PADDING - borderWidthAdjust;
    const otherColsToConsiderForWidth = this.wholeRow?.slice(
      this.column + 1,
      this.column + colsToNextText,
    );
    let otherColWidth = 0;
    otherColsToConsiderForWidth?.forEach((cell) => {
      otherColWidth += minCellWidth;
      return;
      if (!cell) {
        otherColWidth += this.columnSettings.colWidth;
        return;
      }
      otherColWidth += cell.scrollWidth;
    }, 0);
    const minHeaderAndScrollWidth = Math.min(
      colHeaderWidth,
      this.cell.scrollWidth,
    );

    // 3.2 Calculate final width of cell to show
    const finalWidthOfCurrent = colHeaderWidth + otherColWidth;
    // const finalWidth = Math.max(finalWidthOfCurrent, adjustedInitialCellWidth);
    const finalWidth = Math.min(
      finalWidthOfCurrent,
      this.cell.scrollWidth + PADDING_LEFT,
    );
    //if (this.column === 2 && this.row === 0) {
    //  /*prettier-ignore*/ console.log("AAAA. -------------------------------------------------------------------");
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,96] this.cell.text: ", this.cell.text);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,97] this.cellContentRef.innerText: ", this.cellContentRef.innerText);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,99] this.cell.scrollWidth: ", this.cell.scrollWidth);
    //  // /*prettier-ignore*/ console.log("[grid-cell.ts,98] otherColsToConsiderForWidth: ", otherColsToConsiderForWidth);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,100] otherColWidth: ", otherColWidth);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,101] colHeaderWidth: ", colHeaderWidth);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,102] minHeaderAndScrollWidth: ", minHeaderAndScrollWidth);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,103] finalWidthOfCurrent: ", finalWidthOfCurrent);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,104] adjustedInitialCellWidth: ", adjustedInitialCellWidth);
    //  /*prettier-ignore*/ console.log("[grid-cell.ts,105] finalWidth: ", finalWidth);
    //}
    const asPx = `${finalWidth}px`;
    return asPx;
  }

  get isOverflown(): boolean {
    if (!this.cell) return false;
    const width = getValueFromPixelString(this.widthPx);
    return width > (this.columnSettings?.colWidth ?? this.CELL_WIDTH);
  }

  isEditChanged() {
    if (!this.isEdit) return;
    this.textareaValue = this.lastContent;
    this.updateCell();

    window.setTimeout(() => {
      this.getInput()?.focus();
    }, 0);
  }

  private getInput(): HTMLInputElement {
    return this.cellContentRef.querySelector("input");
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
    this.hasAttached = true;
  }

  private updateCell(callback?: () => void) {
    if (!this.cell) return;
    if (this.cell.text !== "") {
      this.lastContent = this.textareaValue;
    }
    this.cell.col = this.column;
    this.cell.row = this.row;
    window.setTimeout(() => {
      //const inputScrollWidth = this.getInput()?.scrollWidth ?? 0;
      //const maxScrollWidth = Math.max(
      //  this.cellContentRef?.scrollWidth ?? 0,
      //  inputScrollWidth,
      //  this.columnSettings?.colWidth ?? 0,
      //);
      //// const finalScrollWidth = maxScrollWidth - PADDING_LEFT - BORDER_WIDTH;
      //const finalScrollWidth = maxScrollWidth;
      // this.cell.scrollWidth = finalScrollWidth;
      //if (this.column === 0 && this.row === 1) {
      //  /*prettier-ignore*/ console.log("BBBB. ----------------------------");
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,152] this.cell.text: ", this.cell.text);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,154] this.cellContentRef.innerText: ", this.cellContentRef.innerText);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,151] maxScrollWidth: ", maxScrollWidth);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,152] finalScrollWidth: ", finalScrollWidth);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,153] inputScrollWidth: ", inputScrollWidth);
      //  /*prettier-ignore*/ console.log("[grid-cell.ts,154] this.cellContentRef.scrollWidth: ", this.cellContentRef.scrollWidth);
      //  /*prettier-ignore*/ console.log(">>>>>>>>>> [grid-cell.ts,155] finalScrollWidth: ", finalScrollWidth);
      //}
    }, 0);
  }

  public async onKeyDown(event: KeyboardEvent) {
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
