import { EventAggregator, bindable, resolve, watch } from "aurelia";
import "./grid-cell.scss";
import { Cell, ColHeaderMap, SheetSettings } from "../../../../types";
import { CELL_WIDTH } from "../../../../common/modules/constants";
import { isEnter, isEscape } from "../../../../features/vim/key-bindings";
import { getValueFromPixelString } from "../../../../common/modules/strings";
import { measureTextWidth } from "../grid-modules/gridModules";
const PADDING = 6;
const PADDING_LEFT = 6;
const BORDER_WIDTH = 1;

const shouldLog = false;
const c = 6;
const r = 6;

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
  public widthPxNew = "";
  public textareaValue = "";

  private lastContent: string;
  private hasAttached = false;
  private counter = 0;

  public setWidthPx(cell: Cell, columnWidth: number) {
    this.counter++;
    const getWidth = () => {
      if (!cell) return;

      // xx 1. Show all content in edit mode --> Don't need anymore?!
      const cellScrollWidth = measureTextWidth(cell.text);
      if (this.isEdit) {
        // return `${cellScrollWidth + PADDING}px`;
      }

      const minCellWidth = Math.min(columnWidth ?? this.CELL_WIDTH);
      const adjustedInitialCellWidth = minCellWidth - PADDING - BORDER_WIDTH;
      if (!cell.text) {
        if (this.column === c && this.row === r && shouldLog) {
          /*prettier-ignore*/ console.log("1. [grid-cell.ts,45] adjustedInitialCellWidth: ", adjustedInitialCellWidth);
          /*prettier-ignore*/ console.log( cell.text, this.cellContentRef.innerText, this.column, this.row,);
        }
        return `${adjustedInitialCellWidth}px`;
      }
      // /*prettier-ignore*/ console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>");
      // /*prettier-ignore*/ console.log("[grid-cell.ts,35] cell.text: ",this.column, this.row, cell.text);

      // 2. Show all content if no cells with text to the right
      if (!cell.colsToNextText) {
        const finalWidth = Math.max(
          cellScrollWidth + PADDING_LEFT,
          adjustedInitialCellWidth,
        );
        if (this.column === c && this.row === r && shouldLog) {
          // /*prettier-ignore*/ console.log("2. [grid-cell.ts,50] cellScrollWidth,: ", cellScrollWidth,);
          // /*prettier-ignore*/ console.log("[grid-cell.ts,52] adjustedInitialCellWidth,: ", adjustedInitialCellWidth,);
          /*prettier-ignore*/ console.log("[grid-cell.ts,49] finalWidth: ", finalWidth);
        }
        return `${finalWidth}px`;
      }

      // 3 Calculate width of cell to show (to not overwrite other cells)
      // 3.1 Prepare data
      const colsToNextText = cell.colsToNextText;
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
      }, 0);
      const minHeaderAndScrollWidth = Math.min(colHeaderWidth, cellScrollWidth);

      // 3.2 Calculate final width of cell to show
      const finalWidthOfCurrent = colHeaderWidth + otherColWidth;
      // const finalWidth = Math.max(finalWidthOfCurrent, adjustedInitialCellWidth);
      const finalWidth = Math.min(
        finalWidthOfCurrent,
        cellScrollWidth + PADDING_LEFT,
      );
      if (this.column === c && this.row === r && shouldLog) {
        /*prettier-ignore*/ console.log("AAAA. -------------------------------------------------------------------");
        /*prettier-ignore*/ console.log("[grid-cell.ts,96] cell.text: ", cell.text);
        /*prettier-ignore*/ console.log("[grid-cell.ts,97] this.cellContentRef.innerText: ", this.cellContentRef.innerText);
        /*prettier-ignore*/ console.log("[grid-cell.ts,99] cellScrollWidth: ", cellScrollWidth);
        // /*prettier-ignore*/ console.log("[grid-cell.ts,98] otherColsToConsiderForWidth: ", otherColsToConsiderForWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,100] otherColWidth: ", otherColWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,101] colHeaderWidth: ", colHeaderWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,102] minHeaderAndScrollWidth: ", minHeaderAndScrollWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,103] finalWidthOfCurrent: ", finalWidthOfCurrent);
        /*prettier-ignore*/ console.log("[grid-cell.ts,104] adjustedInitialCellWidth: ", adjustedInitialCellWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,105] finalWidth: ", finalWidth);
      }
      const asPx = `${finalWidth}px`;
      return asPx;
    };

    const result = getWidth();
    this.widthPxNew = result;
    return result;
  }

  get isOverflown(): boolean {
    if (!this.cell) return false;
    const width = getValueFromPixelString(this.widthPxNew);
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

  //cellChanged() {
  //  this.updateCell();
  //}

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
  ) {}

  attached() {
    // this.setWidthPx();
    this.updateCell();
    if (this.cell?.text) {
      this.lastContent = this.cell.text;
    }
    this.hasAttached = true;
  }

  private updateCell() {
    if (!this.cell) return;
    if (this.cell.text !== "") {
      this.lastContent = this.textareaValue;
    }
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
