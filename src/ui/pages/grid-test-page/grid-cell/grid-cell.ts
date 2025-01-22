import {
  EventAggregator,
  IDisposable,
  bindable,
  observable,
  resolve,
} from "aurelia";
import "./grid-cell.scss";
import {
  AutocompleteSource,
  Cell,
  CellKind,
  ColHeaderMap,
  RowHeaderMap,
  Sheet,
  SheetSettings,
} from "../../../../types";
import {
  BORDER_WIDTH,
  CELL_EVENT_SOURCE_MAP,
  CELL_HEIGHT,
  CELL_WIDTH,
  PADDING,
  VIM_ID_MAP,
} from "../../../../common/modules/constants";
import { isEnter, isEscape } from "../../../../features/vim/key-bindings";
import { measureTextWidth } from "../grid-modules/gridModules";
import { Store } from "../../../../common/modules/store";
import { Logger, shouldLog } from "../../../../common/logging/logging";
import {
  IVimState,
  KeyBindingModes,
  VimHooks,
  VimMode,
} from "../../../../features/vim/vim-types";
import { Id } from "../../../../domain/types/SecondBrainDataModel";
import { VIM_COMMAND } from "../../../../features/vim/vim-commands-repository";
import { debugFlags } from "../../../../common/modules/debug/debugFlags";
import { overwriteExistingKeyBindings } from "../../../../features/vim/vimCore/commands/KeyMappingService";
import { FF, featureFlags } from "../grid-modules/featureFlags";
import { IVimInputHandlerV2 } from "../../../../features/vim/VimInputHandlerV2";
import { ArrayUtils } from "../../../../common/modules/array/array-utils";
import { GRID_FUNCTION_TRIGGER } from "../../../../common/modules/keybindings/app-keys";
import { availableGridFunctions } from "../grid-modules/GridFunctionService";
import { CellEventMessagingService } from "../../../../common/services/CellEventMessagingService";
import { GridTestPage } from "../grid-test-page";
import {
  GRID_FUNCTIONS,
  IAudioCellEndPayload,
  IAudioCellStartPayload,
} from "../../../../domain/entities/grid/CellFunctionEntities";

const logger = new Logger("GridCell");

const GC_PADDING = PADDING + 1;
const PADDING_LEFT = PADDING - 1;
const ADJUST_RIGHT_OVERFLOW = 40; // needed to have the highlight on cell content wrap, when it is going over the screen

const allowLog = false;
const c = 0;
const r = 0;

const debug = false;
const debugLog = false;

export class GridCell {
  @bindable public cell: Cell;
  @bindable public column: number;
  @bindable public row: number;
  @bindable public wholeRow: Cell[];
  @bindable public selected: boolean = false;
  @bindable public sheet: Sheet;
  @bindable public sheetSettings: SheetSettings;
  @bindable public columnSettings: ColHeaderMap[string];
  @bindable public rowSettings: RowHeaderMap[string];
  @bindable public isEdit: boolean;
  @bindable public onCellUpdate: (col: number, row: number, cell: Cell) => void;
  @bindable public onEscape: () => void;
  @bindable public onEnter: () => void;
  @bindable public parentGrid: GridTestPage;
  @bindable public mappingByMode: KeyBindingModes;
  @bindable public vimEditorHooks: VimHooks;

  @observable() public textareaValue = "";

  public finalMappingByMode: KeyBindingModes = {};
  public completionValue = "";
  public cellContentRef: HTMLElement;
  public contentInputRef: HTMLElement;
  public contentWidth = NaN;
  public PADDING = GC_PADDING;
  public CELL_WIDTH = CELL_WIDTH;
  public CELL_HEIGHT = CELL_HEIGHT;
  public widthPxNew = "";
  public autocompleteValue = "";
  public autoCompleteSource: string[] = [];
  public measureTextWidth = measureTextWidth;
  public clipText = FF.canClipText();
  public vimState: IVimState;
  public finalVimEditorHooks: VimHooks;
  public availableGridFunctions =
    availableGridFunctions.map<AutocompleteSource>((v) => ({ text: v }));
  public mappingByModeCell: KeyBindingModes = {
    [VimMode.NORMAL]: [
      {
        key: "<Escape>",
        desc: "Cancel edit and revert changes",
        context: [VIM_ID_MAP.gridCell],
        execute: (mode) => {
          if (mode === VimMode.NORMAL) {
            this.textareaValue = this.cell?.text;
            this.onEscape();
          }
        },
      },
      {
        key: "<Enter>",
        desc: "Accept changes and exit edit mode",
        context: [VIM_ID_MAP.gridCell],
        execute: (_, __, vimCore) => {
          const mode = vimCore?.getVimState().mode;
          if (mode === VimMode.INSERT) return;
          if (this.isEdit) {
            this.cell.text = this.textareaValue;
            this.onCellUpdate(this.column, this.row, this.cell);
            this.onEnter();
          }
          return true;
        },
      },
    ],
  };

  private subscriptions: IDisposable[] = [];

  public get getEditWidth(): string {
    const longestLine = ArrayUtils.getLongestElement(
      this.textareaValue.split("\n"),
    );
    const cellScrollWidth = measureTextWidth(longestLine);
    const minCellWidth = Math.min(
      this.columnSettings?.colWidth ?? this.CELL_WIDTH,
    );
    const adjustedTextWidth = cellScrollWidth + PADDING_LEFT * 2;
    const value = Math.max(adjustedTextWidth, minCellWidth) - 2 * BORDER_WIDTH;
    return `${value}px`;
  }

  public get getEditHeight(): string {
    const numNewLines = this.textareaValue.split("\n").length;
    const value =
      numNewLines === 1 ? CELL_HEIGHT : (CELL_HEIGHT - 8) * numNewLines;
    const adjusted = value;
    return `${adjusted}px`;
  }

  public get getOverflownHeight(): number {
    if (!this.cell?.text) return CELL_HEIGHT;
    const numNewLines = this.cell.text.split("\n").length;
    const value =
      numNewLines === 1 ? CELL_HEIGHT : CELL_HEIGHT * numNewLines - PADDING;
    const adjusted = value;
    return adjusted;
  }

  public get overflownWidthWhenSelected(): string | number {
    if (!this.cell) return CELL_WIDTH;
    const vw = document.body.clientWidth;
    const longestLine = ArrayUtils.getLongestElement(
      this.cell.text.split("\n"),
    );
    const textWidth = measureTextWidth(longestLine);
    if (textWidth > vw - ADJUST_RIGHT_OVERFLOW) {
      return "95vw";
    }
    const adjusted = textWidth + GC_PADDING * 2;
    const final = Math.max(adjusted, this.columnSettings?.colWidth ?? 0);
    return final;
  }

  public get isOverflown(): boolean {
    if (!this.cell?.text) return false;
    const width = measureTextWidth(this.cell.text);
    const isMultiRow = this.cell.text.split("\n").length > 1;
    const otherWidth = this.columnSettings?.colWidth ?? this.CELL_WIDTH;
    const is = width > otherWidth || isMultiRow;
    if (this.debug_logIfIsCell()) {
      /*prettier-ignore*/ console.log("[grid-cell.ts,123] width: ", width);
      /*prettier-ignore*/ console.log("[grid-cell.ts,125] otherWidth: ", otherWidth);
      /*prettier-ignore*/ console.log("[grid-cell.ts,127] is: ", is);
    }
    return is;
  }

  isEditChanged() {
    if (!this.isEdit) {
      return;
    }
    this.textareaValue = this.cell?.text;
    this.updateAutocomplete(this.textareaValue);
    const id = this.getVimId();
    const text = this.cell.text;
    const lines = text.split("\n").map((text) => ({ text }));
    // const startingMode = text ? VimMode.NORMAL : VimMode.INSERT; // TODO, properly init cursor
    const startingMode = text ? VimMode.NORMAL : VimMode.NORMAL;
    const vimState: IVimState = {
      mode: startingMode,
      cursor: {
        col: debugFlags.grid.startCellAtCol0WhenEnterNormalMode
          ? 0
          : Math.max(0, text.length),
        line: 0,
      },
      id,
      lines,
    };
    if (featureFlags.vim.mode.putCursorAtFirstNonWhiteSpace) {
      const firstNonWhitespaceIndex = Math.max(0, text.search(/\S/));
      if (vimState.cursor) {
        vimState.cursor.col = firstNonWhitespaceIndex;
      }
    }

    this.vimState = vimState;
    // /*prettier-ignore*/ console.log("[grid-cell.ts,174] vimState: ", vimState);
    // /*prettier-ignore*/ console.log("[grid-cell.ts,162] id: ", id);
    window.activeVimInstancesIdMap.push(id);

    window.setTimeout(() => {
      this.getInput()?.focus();
    }, 0);
  }

  cellChanged() {
    this.initCellMessagingSubscriptions();
  }

  textareaValueChanged(): void {
    this.autocompleteValue = this.textareaValue;
  }

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
    private store: Store = resolve(Store),
    private vimInputHandlerV2: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
    private cellEventMessagingService = resolve(CellEventMessagingService),
  ) {}

  attached() {
    if (this.cell) {
      this.cell.col = this.column;
      this.cell.row = this.row;
    }

    if (debug) {
      this.updateAutocomplete();
    }
    this.setWidthPx();

    if (this.debug_logIfIsCell()) {
      // /*prettier-ignore*/ console.log("[grid-cell.ts,233] this.rowSettings: ", this.rowSettings);
    }

    this.finalMappingByMode[VimMode.ALL] = overwriteExistingKeyBindings(
      this.mappingByMode[VimMode.ALL] ?? [],
      this.mappingByModeCell[VimMode.ALL] ?? [],
    );
    this.finalMappingByMode[VimMode.NORMAL] = overwriteExistingKeyBindings(
      this.mappingByMode[VimMode.NORMAL] ?? [],
      this.mappingByModeCell[VimMode.NORMAL] ?? [],
    );
    this.finalMappingByMode[VimMode.INSERT] = overwriteExistingKeyBindings(
      this.mappingByMode[VimMode.INSERT] ?? [],
      this.mappingByModeCell[VimMode.INSERT] ?? [],
    );
    this.finalMappingByMode[VimMode.VISUAL] = overwriteExistingKeyBindings(
      this.mappingByMode[VimMode.VISUAL] ?? [],
      this.mappingByModeCell[VimMode.VISUAL] ?? [],
    );
    if (this.debug_onlyLogCell(7, 1)) {
      /*                                                                                           prettier-ignore*/ shouldLog(31) && console.log("this.finalMappingByMode", this.finalMappingByMode);
    }
    //this.vimInputHandlerV2.registerAndInit(
    //  { vimId: VIM_ID_MAP.gridCell },
    //  this.finalMappingByMode,
    //);
    this.finalVimEditorHooks = {
      ...this.vimEditorHooks,
      afterInit: (vim) => {
        if (featureFlags.mode.enterCellInInsertMode) {
          vim.executeCommand(VIM_COMMAND.enterInsertMode, "i");
        }
        this.vimEditorHooks?.afterInit?.(vim);
      },
      onInsertInput: (...args) => {
        const textSoFar = args[1];
        // /*prettier-ignore*/ console.log("[grid-test-page.ts,2076] textSoFar: ", textSoFar);
        const key = args[2];
        // /*prettier-ignore*/ console.log("[grid-test-page.ts,2078] key: ", key);
        this.vimEditorHooks?.onInsertInput?.(...args);
      },
    };
    this.initCellMessagingSubscriptions();
  }

  detached() {
    this.subscriptions.forEach((s) => s.dispose());
  }

  public setWidthPx(
    cell: Cell = this.cell,
    columnWidth: number = this.columnSettings?.colWidth ?? this.CELL_WIDTH,
    /** Used for watching changes on the whole row (Aurelia behavior) */
    rowLength?: number,
  ) {
    // logger.culogger.debug(["hi"], { log: true }, (...r) => console.log(...r));
    const getWidth = (): string => {
      if (!cell) return "";
      if (!cell?.text) return "";
      if (this.clipText) {
        // return columnWidth - PADDING_LEFT + "px";
        return columnWidth - BORDER_WIDTH + "px";
      }

      // xx 1. Show all content in edit mode --> Don't need anymore?!
      const longestLine = ArrayUtils.getLongestElement(
        this.cell.text.split("\n"),
      );
      const cellScrollWidth = measureTextWidth(longestLine);
      const minCellWidth = Math.min(columnWidth ?? this.CELL_WIDTH);
      if (this.isEdit) {
        const adjustedTextWidth = cellScrollWidth + PADDING_LEFT * 2;
        const value = Math.max(adjustedTextWidth, minCellWidth);
        return `${value}px`;
      }

      const adjustedInitialCellWidth = minCellWidth - GC_PADDING - BORDER_WIDTH;
      if (!cell.text) {
        if (this.column === c && this.row === r && allowLog) {
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
          cellScrollWidth + PADDING_LEFT * 2,
          adjustedInitialCellWidth,
        );
        if (this.column === c && this.row === r && allowLog) {
          // /*prettier-ignore*/ console.log("2. [grid-cell.ts,50] cellScrollWidth,: ", cellScrollWidth,);
          // /*prettier-ignore*/ console.log("[grid-cell.ts,52] adjustedInitialCellWidth,: ", adjustedInitialCellWidth,);
        }
        return `${finalWidth}px`;
      }

      // 3 Calculate width of cell to show (to not overwrite other cells)
      // 3.1 Prepare data
      const colsToNextText = cell.colsToNextText;
      const borderWidthAdjust = colsToNextText * BORDER_WIDTH;
      const colHeaderWidth = minCellWidth - GC_PADDING - borderWidthAdjust;
      const otherColsToConsiderForWidth = this.wholeRow?.slice(
        this.column + 1,
        this.column + colsToNextText,
      );
      let otherColWidth = 0;
      otherColsToConsiderForWidth?.forEach((cell) => {
        if (!cell) {
          otherColWidth += this.CELL_WIDTH;
          return;
        }
        otherColWidth += minCellWidth;
      }, 0);
      const minHeaderAndScrollWidth = Math.min(colHeaderWidth, cellScrollWidth);

      // 3.2 Calculate final width of cell to show
      const finalWidthOfCurrent = colHeaderWidth + otherColWidth;
      // const finalWidth = Math.max(finalWidthOfCurrent, adjustedInitialCellWidth);
      let finalWidth = Math.min(
        finalWidthOfCurrent,
        cellScrollWidth + PADDING_LEFT * 2,
      );
      if (this.column === c && this.row === r && allowLog) {
        /*prettier-ignore*/ console.log("AAAA. -------------------------------------------------------------------");
        /*prettier-ignore*/ console.log("[grid-cell.ts,96] cell.text: ", cell.text);
        // /*prettier-ignore*/ console.log("[grid-cell.ts,97] this.cellContentRef.innerText: ", this.cellContentRef.innerText);
        /*prettier-ignore*/ console.log("[grid-cell.ts,99] cellScrollWidth: ", cellScrollWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,98] otherColsToConsiderForWidth: ", otherColsToConsiderForWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,100] otherColWidth: ", otherColWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,101] colHeaderWidth: ", colHeaderWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,102] minHeaderAndScrollWidth: ", minHeaderAndScrollWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,103] finalWidthOfCurrent: ", finalWidthOfCurrent);
        /*prettier-ignore*/ console.log("[grid-cell.ts,104] adjustedInitialCellWidth: ", adjustedInitialCellWidth);
        /*prettier-ignore*/ console.log("[grid-cell.ts,105] finalWidth: ", finalWidth);
      }

      const clipTextOffset = FF.getClipTextOffset();
      if (clipTextOffset) {
        finalWidth = adjustWithClipTextOffset.bind(this)(
          finalWidth,
          clipTextOffset,
        );
      }

      const asPx = `${finalWidth}px`;
      return asPx;

      function adjustWithClipTextOffset(
        this: GridCell,
        width: number,
        offset: number,
      ): number {
        if (!this.isOverflown) return width;
        let result = width;
        const nextCellCol = this.column + colsToNextText;
        const start = nextCellCol - offset;
        for (let i = start; i < nextCellCol; i++) {
          const adjusted =
            this.sheet.colHeaderMap?.[i]?.colWidth ?? this.CELL_WIDTH;
          result -= adjusted;
        }
        result = Math.max(result, adjustedInitialCellWidth);
        return result;
      }
    };

    const result = getWidth();
    this.widthPxNew = result;
    return result;
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

  public partiallyAcceptAutocomplete = (suggestion: string): void => {
    this.textareaValue = suggestion;
    this.setWidthPx({
      text: suggestion,
      colsToNextText: this.cell.colsToNextText,
      kind: CellKind.TEXT,
    });
  };

  private getInput(): HTMLInputElement | null {
    return this.cellContentRef.querySelector("input");
  }

  private updateAutocomplete(inputValue = ""): void {
    const source: string[] = [];
    this.store.activeSheet.content.forEach((row, rowIndex) => {
      if (!row) return;
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

  private getVimId(): Id {
    // return EV_GRID_CELL(this.column, this.row);
    return VIM_ID_MAP.gridCell;
  }

  private debug_onlyLogCell(c: number, r: number): boolean {
    return this.column === c && this.row === r;
  }

  private debug_logIfIsCell(): boolean {
    const isCell = this.column === c && this.row === r;
    const is = isCell && debugLog;
    return is;
  }

  private initCellMessagingSubscriptions(): void {
    if (!this.cell?.text) return;

    if (!featureFlags.grid.cells.audio.aBRepeat) return;
    const text = this.cell.text.trim().toLocaleUpperCase();
    switch (text) {
      case GRID_FUNCTIONS.audio.start: {
        const nextCell = this.parentGrid.getNextCell(
          this.cell.col,
          this.cell.row,
        );
        const startAsNum = parseInt(nextCell?.text ?? "");
        const key = this.cellEventMessagingService.getKey(0, 0);
        this.cellEventMessagingService.publish<IAudioCellStartPayload>(key, {
          source: CELL_EVENT_SOURCE_MAP.audioPlayer,
          name: GRID_FUNCTIONS.audio.start,
          data: { start: startAsNum },
        });
        break;
      }
      case GRID_FUNCTIONS.audio.end: {
        const nextCell = this.parentGrid.getCurrentCell(
          (this.cell.col ?? 0) + 2,
          this.cell.row,
        );
        /*prettier-ignore*/ console.log("[grid-cell.ts,520] nextCell: ", nextCell);
        const endAsNum = parseInt(nextCell?.text ?? "");
        /*prettier-ignore*/ console.log("[grid-cell.ts,525] endAsNum: ", endAsNum);
        const key = this.cellEventMessagingService.getKey(0, 0);
        this.cellEventMessagingService.publish<IAudioCellEndPayload>(key, {
          source: CELL_EVENT_SOURCE_MAP.audioPlayer,
          name: GRID_FUNCTIONS.audio.end,
          data: { end: endAsNum },
        });
        break;
      }
    }
  }
}
