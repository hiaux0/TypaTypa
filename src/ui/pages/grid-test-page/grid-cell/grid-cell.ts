import { EventAggregator, bindable, observable, resolve, watch } from "aurelia";
import "./grid-cell.scss";
import { Cell, ColHeaderMap, SheetSettings } from "../../../../types";
import { CELL_WIDTH } from "../../../../common/modules/constants";
import { isEnter, isEscape } from "../../../../features/vim/key-bindings";
import { getValueFromPixelString } from "../../../../common/modules/strings";
import { measureTextWidth } from "../grid-modules/gridModules";
import { Store } from "../../../../common/modules/store";
const PADDING = 6;
const PADDING_LEFT = 6;
const BORDER_WIDTH = 1;

const shouldLog = false;
const c = 6;
const r = 6;

const debug = false;
const debugLog = false;

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

  @observable() public textareaValue = "";

  public completionValue = "";
  public cellContentRef: HTMLElement;
  public contentInputRef: HTMLElement;
  public contentWidth = NaN;
  public PADDING = PADDING;
  public CELL_WIDTH = CELL_WIDTH;
  public widthPxNew = "";
  public autocompleteValue = "";
  public autoCompleteSource: string[] = [];
  public measureTextWidth = measureTextWidth;

  public setWidthPx(
    cell: Cell = this.cell,
    columnWidth: number = this.columnSettings?.colWidth ?? this.CELL_WIDTH,
    /** Used for watching changes on the whole row (Aurelia behavior) */
    rowLength?: number,
  ) {
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
    if (!this.isEdit) {
      return;
    }
    this.textareaValue = this.cell?.text;
    this.updateAutocomplete(this.textareaValue);

    window.setTimeout(() => {
      this.getInput()?.focus();
    }, 0);
  }

  textareaValueChanged(): void {
    this.autocompleteValue = this.textareaValue;
    /*prettier-ignore*/ debugLog &&  console.log("GC.A [grid-cell.ts,148] this.autocompleteValue: ", this.autocompleteValue);
  }

  private getInput(): HTMLInputElement {
    return this.cellContentRef.querySelector("input");
  }

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
    private store: Store = resolve(Store),
  ) {}

  attached() {
    if (debug) {
      this.updateAutocomplete();
    }
    this.setWidthPx();
  }

  public async onKeyDown(event: KeyboardEvent) {
    if (!this.isEdit) return;
    const key = event.key;
    if (isEscape(key)) {
      // /*prettier-ignore*/ debugLog && console.log("before [grid-cell.ts,172] this.textareaValue: ", this.textareaValue);
      this.textareaValue = this.cell.text;
      // /*prettier-ignore*/ debugLog && console.log("after [grid-cell.ts,172] this.textareaValue: ", this.textareaValue);
    } else if (isEnter(key)) {
      if (this.isEdit) {
        this.cell.text = this.textareaValue;
        // /*prettier-ignore*/ debugLog && console.log("A.1 [grid-cell.ts,196] this.cell.text: ", this.cell.text);
        this.onCellUpdate(this.column, this.row, this.cell);
        return;
      }
    }
  }

  private updateAutocomplete(inputValue = ""): void {
    const source = [];
    this.store.activeSheet.content.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        if (!cell?.text) return;
        if (this.column === cellIndex && this.row === rowIndex) return;
        if (!cell.text.toLowerCase().includes(inputValue.toLowerCase())) return;
        source.push(cell.text);
      });
    });
    this.autoCompleteSource = source;
    // /*prettier-ignore*/ console.log("[grid-cell.ts,196] this.autoCompleteSource: ", this.autoCompleteSource);
    this.autocompleteValue = inputValue;
    // /*prettier-ignore*/ console.log("GC.B. [grid-cell.ts,196] this.autocompleteValue: ", this.autocompleteValue);
  }

  public partiallyAcceptAutocomplete = (suggestion: string): void => {
    this.textareaValue = suggestion;
    this.setWidthPx({
      text: suggestion,
      colsToNextText: this.cell.colsToNextText,
    });
  };
}
