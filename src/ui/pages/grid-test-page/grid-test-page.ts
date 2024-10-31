import { EventAggregator, observable, resolve } from "aurelia";
import "./grid-test-page.scss";
import { EV_CELL_SELECTED } from "../../../common/modules/eventMessages";
import {
  DirectionMap,
  Cell,
  ContentMap,
  Direction,
  GridDatabaseType,
  GridSelectionCoord,
  GridSelectionRange,
  Sheet,
  defaultGridSelectionRange,
} from "../../../types";
import { generateId } from "../../../common/modules/random";
import { VimInit } from "../../../features/vim/VimInit";
import {
  KeyBindingModes,
  QueueInputReturn,
  VimMode,
  VimOptions,
} from "../../../features/vim/vim-types";
import {
  VIM_COMMAND,
  VimCommand,
} from "../../../features/vim/vim-commands-repository";
import { cycleInRange } from "../../../common/modules/numbers";
import {
  findParentElement,
  getIsInputActive,
} from "../../../common/modules/htmlElements";
import { CRUDService } from "../../../common/services/CRUDService";
import {
  CELL_COORDS,
  CELL_HEIGHT,
  CELL_WIDTH,
  INITIAL_COLUMN_COUNT,
  INITIAL_ROW_COUNT,
  PADDING,
} from "../../../common/modules/constants";
import { gridDatabase } from "../../../common/modules/database/gridDatabase";
import { ITab, ITabHooks } from "../../molecules/or-tabs/or-tabs";
import { downloadText } from "../../../common/modules/downloadText";
import {
  getClipboardContent,
  setClipboardContent,
} from "../../../common/modules/platform/clipboard";
import { UndoRedo } from "../../../common/modules/undoRedo";
import { runGridMigrations } from "../../../common/modules/migrations/gridMigrations";
import {
  GridIteratorOptions,
  calculateDiff,
  checkCellOverflow,
  convertGridToVimState,
  convertRangeToVimState,
  defaultGridIteratorOptions,
  iterateOverGrid,
  iterateOverGridBackwards,
  iterateOverRange,
  iterateOverRangeBackwards,
  measureTextWidth,
} from "./grid-modules/gridModules";
import { Store } from "../../../common/modules/store";
import { Logger } from "../../../common/logging/logging";
import {
  getComputedValueFromPixelString,
  getCssVar,
} from "../../../common/modules/css/css-variables";
import { popVimInstanceId } from "../../../features/vim/mulitple-vim-instances-handle";
import { featureFlags } from "./grid-modules/featureFlags";
import { splitByEndingAndSeparator } from "../../../common/modules/strings";
import { VisualMode } from "../../../features/vim/modes/VisualMode";

const logger = new Logger("GridTestPage");
const debugLog = false;

interface CellRect {
  top: number;
  bottom: number;
  left: number;
  right: number;
  x: number;
  y: number;
  width: number;
  height: number;
}
type GridPanelTypes = "button" | "text";

type MappingByCommandName = Record<
  VimMode,
  Record<
    VIM_COMMAND,
    (
      result?: QueueInputReturn,
    ) => void | Promise<void> | { preventUndoRedoTrace: boolean }
  >
>;

interface GridPanel {
  id: string;
  row: number;
  col: number;
  width?: number;
  height?: number;
  isEdit?: boolean;
  type: GridPanelTypes;
  content?: string;
}

export class GridTestPage {
  public gridTestContainerRef: HTMLElement;
  public spreadsheetContainerRef: HTMLElement;
  public colSize = INITIAL_COLUMN_COUNT;
  public rowSize = INITIAL_ROW_COUNT;
  public CELL_HEIGHT = CELL_HEIGHT;
  public CELL_WIDTH = CELL_WIDTH;
  public EV_CELL_SELECTED = EV_CELL_SELECTED;
  public CELL_COORDS = CELL_COORDS;
  // Drag and select //
  // Container needs to keep track of these values, because the grid cells are not aware of each other
  public dragStartColumnIndex = 0;
  public dragEndColumnIndex = 0;
  public dragStartRowIndex = 0;
  public dragEndRowIndex = 0;
  public contentMap: ContentMap = [];
  public contentMapForView: {};
  public selectedMap: Record<string, boolean> = {};
  public textareaValue = "";
  public downloadData = () => downloadText(this.sheetsData);
  public gridPanels: GridPanel[] = [];
  public START_PANEL_TOP = 32;
  public START_PANEL_LEFT = 64;
  public mode: VimMode | "Move" = VimMode.NORMAL;
  public activeSheet: Sheet;
  public activeContent = "initial";
  public sheetTabHooks: ITabHooks;
  public gridUndoRedo: UndoRedo<ContentMap>;
  public editedCellCoords = "";
  public mappingByModeForCell: KeyBindingModes = {
    [VimMode.NORMAL]: [
      {
        key: "<Control>Enter",
        execute: (_, vimState, vimCore) => {
          const cellText =
            this.contentMap[this.dragStartRowIndex]?.[this.dragStartColumnIndex]
              ?.text;
          if (!cellText) return;
          const { col } = vimState.cursor;
          const beforeText = cellText.slice(0, col).trim();
          const afterText = cellText.slice(col).trim();
          // set current cell
          this.setCurrentCellContent(beforeText);
          vimState.lines[vimState.cursor.line].text = beforeText;
          vimCore.setVimState(vimState);
          // add new cell, and set
          this.addRowBelow();
          this.addCellAt(
            afterText,
            this.dragStartColumnIndex,
            this.dragStartRowIndex + 1,
          );
          this.updateContentMapChangedForView();
        },
      },
    ],
    [VimMode.VISUAL]: [
      {
        key: "y",
        command: VIM_COMMAND.yank,
        afterExecute: async (mode, _, vimCore) => {
          const { autopasteIntoRow } = featureFlags.copy;
          const okay =
            autopasteIntoRow.enabled &&
            autopasteIntoRow.method.includes("yank");
          if (okay) {
            const modeHandler = vimCore.manager.getMode(mode) as VisualMode;
            const text = modeHandler.getSelectedText();
            const col = featureFlags.copy.autopasteIntoRow.col;
            const isCellEmpty = this.isCellEmpty(col);
            if (isCellEmpty) {
              this.setCurrentCellContent(text, col);
              return;
            }
            this.addCellBelow(text, col);
            return true;
          }
        },
      },
    ],
  };
  @observable public activeSheetId = "";

  private isRowEmpty(row: number): boolean {
    return !this.contentMap[row]?.some((cell) => cell.text);
  }
  private addCellBelow(content: string, col = this.dragStartColumnIndex): void {
    const nextRow = this.dragStartRowIndex + 1;
    const rowEmpty = this.isRowEmpty(this.dragStartRowIndex);
    if (rowEmpty) {
      this.setCurrentCellContent(content, col, nextRow);
      return;
    }
    this.addRowBelow();
    this.setCurrentCellContent(content, col, nextRow);
  }
  private isCellEmpty(
    col: number = this.dragStartColumnIndex,
    row: number = this.dragStartRowIndex,
  ): boolean {
    const text = this.getCurrentCell(col, row)?.text.trim();
    const is = !text;
    return is;
  }

  private activePanel: GridPanel;
  private activePanelElement: HTMLElement;
  private lastCellContentArray: string[][] = [];
  private sheetTabs: ITab[] = [];
  private sheetsData: GridDatabaseType;
  private isStartDragGridCell = false;
  private panelCRUD: CRUDService<GridPanel>;
  private mappingByNormalMode: VimCommand[] = [
    {
      command: VIM_COMMAND.cursorRight,
      execute: () => {
        this.unselectAllSelecedCells();
        let next = this.dragStartColumnIndex + 1;
        const mostRight = this.colSize;
        if (next >= mostRight && featureFlags.mode.autoExpandGrid) {
          this.addColRight();
          this.dragStartColumnIndex = mostRight;
          this.dragEndColumnIndex = mostRight;
          this.updateAllSelecedCells();
          this.updateContentMapChangedForView();
          this.scrollEditor("right", 1);
          return;
        } else {
          next = Math.min(next, this.colSize - 1);
        }
        this.dragStartColumnIndex = next;
        this.dragEndColumnIndex = next;
        this.updateAllSelecedCells();
        if (this.dragStartColumnIndex === 0) {
          this.spreadsheetContainerRef.scrollLeft = 0;
        } else {
          this.scrollEditor("right", 1);
        }
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorLeft,
      execute: () => {
        this.unselectAllSelecedCells();
        let next = this.dragStartColumnIndex - 1;
        if (next < 0 && featureFlags.mode.autoExpandGrid) {
          this.addColLeft();
          this.dragStartColumnIndex = 0;
          this.dragEndColumnIndex = 0;
          this.updateAllSelecedCells();
          this.updateContentMapChangedForView();
          this.scrollEditor("left", 1);
          return;
        } else {
          next = Math.max(0, next);
        }

        this.dragStartColumnIndex = next;
        this.dragEndColumnIndex = next;
        this.updateAllSelecedCells();
        if (this.dragStartColumnIndex === this.colSize - 1) {
          this.spreadsheetContainerRef.scrollLeft = this.colSize * CELL_WIDTH;
        } else {
          this.scrollEditor("left", 1);
        }
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorUp,
      execute: () => {
        this.unselectAllSelecedCells();
        let next = this.dragStartRowIndex - 1;

        // 1. Add new row above
        if (next < 0 && featureFlags.mode.autoExpandGrid) {
          this.addRowAbove();
          this.dragStartRowIndex = 0;
          this.dragEndRowIndex = 0;
          this.updateAllSelecedCells();
          this.updateContentMapChangedForView();
          this.scrollEditor("up", 1);
          return;
        } else {
          next = Math.max(0, next);
        }

        // 2. Move normally
        this.dragStartRowIndex = next;
        this.dragEndRowIndex = next;
        this.updateAllSelecedCells();
        if (this.dragStartRowIndex === this.rowSize - 1) {
          this.spreadsheetContainerRef.scrollTop = this.rowSize * CELL_HEIGHT;
        } else {
          this.scrollEditor("up", 1);
        }
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorDown,
      execute: () => {
        this.unselectAllSelecedCells();
        let next = this.dragStartRowIndex + 1;
        const mostBottom = this.rowSize;
        if (next >= mostBottom && featureFlags.mode.autoExpandGrid) {
          this.addRowBelow();
          this.dragStartRowIndex = mostBottom;
          this.dragEndRowIndex = mostBottom;
          this.updateAllSelecedCells();
          this.updateContentMapChangedForView();
          this.scrollEditor("down", 1);
          return;
        } else {
          next = Math.min(next, this.rowSize - 1);
        }

        this.dragStartRowIndex = next;
        this.dragEndRowIndex = next;
        this.updateAllSelecedCells();
        if (this.dragStartRowIndex === 0) {
          this.spreadsheetContainerRef.scrollTop = 0;
        } else {
          this.scrollEditor("down", 1);
        }
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.delete,
      execute: () => {
        const panel = this.getPanelUnderCursor();
        if (!panel) {
          this.lastCellContentArray = [[this.getCurrentCell()?.text ?? ""]];
          this.removeCellAt();
          return;
        }
        this.panelCRUD.delete(panel.id);
        this.gridPanels = this.panelCRUD.readAll();
      },
    },
    {
      command: VIM_COMMAND.pasteVim,
      execute: () => {
        if (this.lastCellContentArray.length === 0) return;
        const startCol = this.dragStartColumnIndex + 1;
        const startRow = this.dragStartRowIndex;
        const endCol = startCol + this.lastCellContentArray[0]?.length - 1;
        const endRow =
          this.dragStartRowIndex + this.lastCellContentArray.length - 1;
        iterateOverRangeBackwards(
          [startCol, startRow],
          [endCol, endRow],
          (col, row) => {
            this.addCellEmptyAt(col, row);
            const rowIndex = row - startRow;
            const colIdnex = col - startCol;
            const content = this.lastCellContentArray[rowIndex][colIdnex];
            if (content) {
              this.setCurrentCellContent(content, col, row, {
                skipUpdate: true,
              });
            }
          },
        );
        this.updateContentMapChangedForView();
      },
    },
    {
      command: VIM_COMMAND.pasteVimBefore,
      execute: () => {
        if (this.lastCellContentArray.length === 0) return;
        const startCol = this.dragStartColumnIndex;
        const startRow = this.dragStartRowIndex;
        const endCol = startCol + this.lastCellContentArray[0]?.length - 1;
        const endRow =
          this.dragStartRowIndex + this.lastCellContentArray.length - 1;
        iterateOverRangeBackwards(
          [startCol, startRow],
          [endCol, endRow],
          (col, row) => {
            this.addCellEmptyAt(col, row);
            const rowIndex = row - startRow;
            const colIdnex = col - startCol;
            const content = this.lastCellContentArray[rowIndex][colIdnex];
            if (content) {
              this.setCurrentCellContent(content, col, row, {
                skipUpdate: true,
              });
            }
          },
        );
        this.updateContentMapChangedForView();
      },
    },
    {
      command: VIM_COMMAND.paste,
      execute: async () => {
        const text = (await getClipboardContent()).trim();
        /*prettier-ignore*/ console.log("[grid-test-page.ts,350] text: ", text);
        try {
          const is2DimStringArray = JSON.parse(text);
          if (
            Array.isArray(is2DimStringArray) &&
            Array.isArray(is2DimStringArray[0]) &&
            typeof is2DimStringArray[0][0] === "string"
          ) {
            /*prettier-ignore*/ logger.culogger.debug(["Is 2 dim string array, so invoke pasteVimBefore"])
            this.lastCellContentArray = is2DimStringArray;
            const pasteVimBeforeCommand = this.mappingByNormalMode.find(
              (a) => a.command === VIM_COMMAND.pasteVimBefore,
            );
            pasteVimBeforeCommand.execute();
            return;
          }
        } catch {}

        const splitByNewLine = text.split("\n");
        let split = splitByNewLine;
        if (featureFlags.paste.splitByPeriodAndComma) {
          split = splitByEndingAndSeparator(text);
        }

        const len = split.length;
        this.rowSize = Math.max(this.rowSize, this.dragStartRowIndex + len);
        this.dragEndRowIndex = this.dragStartRowIndex + len - 1;
        this.iterateOverSelectedCells((col, row) => {
          const content = split.shift();
          this.setCurrentCellContent(content, col, row, { skipUpdate: true });
        });
        this.dragEndRowIndex = this.dragStartRowIndex;
        this.updateContentMapChangedForView();
      },
    },
    {
      command: VIM_COMMAND.enterNormalMode,
      execute: () => {
        this.editedCellCoords = "";
        this.unselectAllSelecedCells();
        this.dragEndColumnIndex = this.dragStartColumnIndex;
        this.dragEndRowIndex = this.dragStartRowIndex;
        this.updateAllSelecedCells();
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.jumpPreviousBlock,
      execute: () => {
        const colRange: GridSelectionRange = [
          [this.dragStartColumnIndex, 0],
          [this.dragStartColumnIndex, this.rowSize - 1],
        ];
        const start = this.getSelectedArea()[0];
        const vimState = convertRangeToVimState(
          this.contentMap,
          colRange,
          start,
        );
        this.vimInit.vimCore.setVimState(vimState);
        const result = this.vimInit.executeCommand(
          VIM_COMMAND.jumpPreviousBlock,
        );
        const nextEmptyRow = result.cursor.line;
        this.setAndUpdateSingleCellSelection(
          this.dragStartColumnIndex,
          nextEmptyRow,
        );
        this.updateAllSelecedCells();
        this.spreadsheetContainerRef.scrollTop = nextEmptyRow * CELL_HEIGHT;
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.jumpNextBlock,
      execute: () => {
        const colRange: GridSelectionRange = [
          [this.dragStartColumnIndex, 0],
          [this.dragStartColumnIndex, this.rowSize - 1],
        ];
        const start = this.getSelectedArea()[0];
        const vimState = convertRangeToVimState(
          this.contentMap,
          colRange,
          start,
        );
        this.vimInit.vimCore.setVimState(vimState);
        const result = this.vimInit.executeCommand(VIM_COMMAND.jumpNextBlock);
        const nextEmptyRow = result.cursor.line;
        this.setAndUpdateSingleCellSelection(
          this.dragStartColumnIndex,
          nextEmptyRow,
        );
        this.updateAllSelecedCells();
        this.spreadsheetContainerRef.scrollTop =
          (nextEmptyRow - 5) * CELL_HEIGHT;
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.undo,
      execute: () => {
        const undone = this.gridUndoRedo.undo();
        if (!undone) return;
        this.contentMap = undone;
        this.updateContentMapChangedForView();
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.redo,
      execute: () => {
        const redone = this.gridUndoRedo.redo();
        if (!redone) return;
        this.contentMap = redone;
        this.updateContentMapChangedForView();
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorLineStart,
      execute: () => {
        this.setAndUpdateSingleCellSelection(0, this.dragStartRowIndex);
        this.spreadsheetContainerRef.scrollLeft = 0;
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorLineEnd,
      execute: () => {
        this.setAndUpdateSingleCellSelection(
          this.colSize - 1,
          this.dragStartRowIndex,
        );
        this.spreadsheetContainerRef.scrollLeft = this.colSize * CELL_WIDTH;
      },
      preventUndoRedo: true,
    },
    {
      key: "b",
      execute: () => {
        let nextColWithContent = NaN;
        let nextRowWithContent = NaN;
        const [prevCol, prevRow] = this.getPreviousCellCoords();

        iterateOverGridBackwards(
          [prevCol, prevRow],
          (col, row) => {
            if (nextColWithContent) return;
            const content = this.getCurrentCell(col, row)?.text ?? "";
            if (content) {
              nextColWithContent = col;
              nextRowWithContent = row;
              return true;
            }
          },
          {
            colSize: this.colSize,
          },
        );

        if (
          !Number.isNaN(nextColWithContent) &&
          !Number.isNaN(nextRowWithContent)
        ) {
          const newCellDirection = this.getNewCellDirection(
            nextColWithContent,
            nextRowWithContent,
          );
          this.setAndUpdateSingleCellSelection(
            nextColWithContent,
            nextRowWithContent,
          );
          this.scrollToCell(
            nextColWithContent,
            nextRowWithContent,
            newCellDirection,
          );
        }
      },
      preventUndoRedo: true,
    },
    {
      key: "cc",
      desc: "Clear cell and go into Insert",
      execute: () => {
        this.clearCurrentCellContent();
        this.putCellIntoEdit();
        this.vimInit.executeCommand(VIM_COMMAND.enterInsertMode, "");

        return true;
      },
    },
    {
      key: "<Control>c",
      execute: () => {
        const text = this.getCurrentCell()?.text ?? "";
        this.lastCellContentArray = [[text]];
        setClipboardContent(text);
      },
    },
    {
      key: "dd",
      desc: "Delete current row",
      execute: () => {
        this.removeRowAt();
        this.updateContentMapChangedForView();
        return true;
      },
    },
    {
      key: "e",
      execute: () => {
        let nextColWithContent = NaN;
        let nextRowWithContent = NaN;
        const [nextCol, nextRow] = this.getNextCellCoords();
        this.iterateOverAllCells(
          (col, row) => {
            if (nextColWithContent) return;
            const content = this.getCurrentCell(col, row)?.text ?? "";
            if (content) {
              nextColWithContent = col;
              nextRowWithContent = row;
              return true;
            }
          },
          {
            startCol: nextCol,
            startRow: nextRow,
          },
        );

        if (
          !Number.isNaN(nextColWithContent) &&
          !Number.isNaN(nextRowWithContent)
        ) {
          const newCellDirection = this.getNewCellDirection(
            nextColWithContent,
            nextRowWithContent,
          );
          this.setAndUpdateSingleCellSelection(
            nextColWithContent,
            nextRowWithContent,
          );
          this.scrollToCell(
            nextColWithContent,
            nextRowWithContent,
            newCellDirection,
          );
        }
      },
      preventUndoRedo: true,
    },
    {
      key: "<Shift>E",
      desc: "Word end",
      execute: () => {
        const cell = this.getCurrentCell();
        const cellText = measureTextWidth(cell.text);
        const xy = this.getXYOfSelection();
        const width = xy.left + cellText + PADDING;
        const nextColNew = this.getNextColFromWidth(width);
        this.setAndUpdateSingleCellSelection(nextColNew);

        return;
        let nextColWithContent = NaN;
        let nextRowWithContent = NaN;
        const [nextCol, nextRow] = this.getNextCellCoords();
        this.iterateOverAllCells(
          (col, row) => {
            if (nextColWithContent) return;
            const content = this.getCurrentCell(col, row)?.text ?? "";
            if (content) {
              nextColWithContent = col;
              nextRowWithContent = row;
              return true;
            }
          },
          {
            startCol: nextCol,
            startRow: nextRow,
          },
        );

        if (
          !Number.isNaN(nextColWithContent) &&
          !Number.isNaN(nextRowWithContent)
        ) {
          const newCellDirection = this.getNewCellDirection(
            nextColWithContent,
            nextRowWithContent,
          );
          this.setAndUpdateSingleCellSelection(
            nextColWithContent,
            nextRowWithContent,
          );
          this.scrollToCell(
            nextColWithContent,
            nextRowWithContent,
            newCellDirection,
          );
        }
      },
      preventUndoRedo: true,
    },
    {
      key: "<Shift>J",
      desc: "Join current cell with cell below",
      execute: (_, vimState, vimCore) => {
        const thisText = (this.getCurrentCell()?.text ?? "").trim();
        const belowText = (
          this.getCurrentCell(
            this.dragStartColumnIndex,
            this.dragStartRowIndex + 1,
          )?.text ?? ""
        ).trim();
        let concat = `${thisText} ${belowText}`;
        if (!thisText) {
          concat = belowText;
        }
        this.setCurrentCellContent(concat);
        this.removeCellAt(
          this.dragStartColumnIndex,
          this.dragStartRowIndex + 1,
        );
        vimState.lines[vimState.cursor.line].text = concat;
        vimCore.setVimState(vimState);
        this.updateContentMapChangedForView();
      },
    },
    {
      key: "<Control>k",
      execute: () => {
        // this.scrollEditor("up", 1);
      },
    },
    {
      key: "gg",
      execute: () => {
        this.setAndUpdateSingleCellSelection(0, 0);
        this.spreadsheetContainerRef.scrollTop = 0;
        this.spreadsheetContainerRef.scrollLeft = 0;
      },
    },
    {
      key: "<Shift>G",
      execute: () => {
        this.setAndUpdateSingleCellSelection(0, this.rowSize - 1);
        const height = this.rowSize * CELL_HEIGHT;
        this.spreadsheetContainerRef.scrollTop = height;
        this.spreadsheetContainerRef.scrollLeft = 0;
      },
    },
    {
      key: "i",
      command: VIM_COMMAND.enterInsertMode,
      execute: () => {
        this.putCellIntoEdit();
        return true;
      },
    },
    {
      key: "m",
      desc: "Enter [M]ove mode",
      execute: () => {
        this.vimInit.executeCommand(VIM_COMMAND.enterCustomMode, "");
        this.mode = "Move";
      },
    },
    {
      key: "o",
      desc: "Insert one row below",
      execute: () => {
        this.addRowBelow();
        this.updateContentMapChangedForView();
        this.moveSelectedCellBy(1, "y");
        this.putCellIntoEdit();
        this.vimInit.executeCommand(VIM_COMMAND.enterInsertMode, "");
        return true;
      },
    },
    {
      key: "<Shift>O",
      desc: "Insert one row above",
      execute: () => {
        this.contentMap.splice(Math.max(0, this.dragStartRowIndex - 1), 0, []);
        this.updateContentMapChangedForView();
        this.moveSelectedCellBy(-1, "y");
        this.putCellIntoEdit();
        this.vimInit.executeCommand(VIM_COMMAND.enterInsertMode, "");
        return true;
      },
    },
    {
      key: "<Control>x",
      execute: () => {
        const text = this.getCurrentCell()?.text ?? "";
        this.lastCellContentArray = [[text]];
        setClipboardContent(text);
        this.clearCurrentCellContent();
      },
    },
    {
      key: "zt",
      execute: () => {
        const col = this.dragStartColumnIndex;
        const row = this.dragStartRowIndex;
        const rect = this.getXYOfSelection(col, row);
        const { top, height } = rect;
        const { height: normContainerHeight } =
          this.getNormalizedContainerDimension();
        const topPart = normContainerHeight / 5;

        const scrollDiff = topPart - top - height * 1.5;
        this.spreadsheetContainerRef.scrollTop -= scrollDiff;
      },
    },
    {
      key: "zz",
      execute: () => {
        const col = this.dragStartColumnIndex;
        const row = this.dragStartRowIndex;
        const rect = this.getXYOfSelection(col, row);
        const { top, height } = rect;
        const { height: normContainerHeight } =
          this.getNormalizedContainerDimension();
        const center = normContainerHeight / 2;

        const scrollDiff = center - top - height * 1.5;
        this.spreadsheetContainerRef.scrollTop -= scrollDiff;
      },
      preventUndoRedo: true,
    },
    {
      key: "zc",
      desc: "Scroll to [C]enter",
      execute: () => {
        this.scrollSelectdeIntoView();
      },
      preventUndoRedo: true,
    },
    {
      key: "zb",
      execute: () => {
        const col = this.dragStartColumnIndex;
        const row = this.dragStartRowIndex;
        const rect = this.getXYOfSelection(col, row);
        const { top, height } = rect;
        const { height: normContainerHeight } =
          this.getNormalizedContainerDimension();
        const topPart = normContainerHeight * 0.95;

        const scrollDiff = topPart - top - height * 1.5;
        this.spreadsheetContainerRef.scrollTop -= scrollDiff;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Shift>><Shift>>",
      desc: "Move cell right",
      execute: () => {
        console.log("indent right >>");
        this.addCellEmptyAt(0);
        this.updateContentMapChangedForView();
      },
    },
    {
      key: "<Shift><<Shift><",
      desc: "Move cell left",
      execute: () => {
        const content = this.getCurrentCell(0)?.text ?? "";
        if (content) return;
        this.removeCellAt(0);
      },
    },
    {
      key: "<Space>pn",
      desc: "[P]anel [N]ext",
      execute: () => {
        const activePanelId = this.activePanel?.id ?? this.gridPanels[0]?.id;

        if (activePanelId === undefined) return;

        const currentIndex = this.gridPanels.findIndex(
          (p) => p.id === activePanelId,
        );

        const nextIndex = cycleInRange(
          0,
          this.gridPanels.length,
          currentIndex + 1,
        );
        const nextPanel = this.gridPanels[nextIndex];

        if (!nextPanel) return;
        this.setActivePanel(nextPanel);
      },
    },
    {
      key: "<Space>ecla",
      desc: "[E]ditor [Cl]ear [A]ll",
      execute: () => {
        this.contentMap = [];
        this.contentMapForView = {};
        this.getActiveSheet().content = [];
      },
    },
    {
      key: "<Space>sh",
      desc: "[S]croll left",
      execute: () => {
        this.spreadsheetContainerRef.scrollLeft -= this.CELL_WIDTH;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Space>sl",
      desc: "[S]croll right",
      execute: () => {
        this.spreadsheetContainerRef.scrollLeft += this.CELL_WIDTH;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Space>su",
      desc: "[S]croll down",
      execute: () => {
        this.spreadsheetContainerRef.scrollTop += this.CELL_HEIGHT;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Space>sk",
      desc: "[S]croll up",
      execute: () => {
        this.spreadsheetContainerRef.scrollTop -= this.CELL_HEIGHT;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Enter>",
      desc: "Enter Normal mode",
      execute: () => {
        this.putCellIntoEdit();
        // this.vimInit.executeCommand(VIM_COMMAND.enterInsertMode, "");
        return true;
      },
      preventUndoRedo: true,
    },
  ];
  private mappingByVisualMode: VimCommand[] = [
    //{
    //  key: "<Escape>",
    //  command: VIM_COMMAND.enterNormalMode,
    //  execute: () => {
    //    console.log("hi");
    //    this.putCellIntoUnfocus();
    //    this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
    //  },
    //},

    {
      command: VIM_COMMAND.cursorRight,
      execute: () => {
        this.unselectAllSelecedCells();
        const b = this.dragEndColumnIndex + 1;
        this.dragEndColumnIndex = cycleInRange(0, this.colSize, b);
        this.updateAllSelecedCells();
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorLeft,
      execute: () => {
        this.unselectAllSelecedCells();
        const b = this.dragEndColumnIndex - 1;
        this.dragEndColumnIndex = cycleInRange(0, this.colSize, b);
        this.updateAllSelecedCells();
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorUp,
      execute: () => {
        this.unselectAllSelecedCells();
        const b = this.dragEndRowIndex - 1;
        this.dragEndRowIndex = cycleInRange(0, this.rowSize, b);
        this.updateAllSelecedCells();
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorDown,
      execute: () => {
        this.unselectAllSelecedCells();
        const b = this.dragEndRowIndex + 1;
        this.dragEndRowIndex = cycleInRange(0, this.rowSize, b);
        this.updateAllSelecedCells();
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.visualDelete,
      execute: () => {
        const collectDeleted = [];
        const [start, end] = this.getSelectedArea();
        iterateOverRange(start, end, (col, row) => {
          if (!collectDeleted[row]) {
            collectDeleted[row] = [];
          }
          const text = this.getCurrentCell(col, row)?.text;
          collectDeleted[row].push(text ?? "");
        });
        iterateOverRangeBackwards(start, end, (col, row) => {
          this.removeCellAt(col, row, { skipUpdate: true });
        });
        const filtered = collectDeleted.filter((a) => a);
        this.lastCellContentArray = filtered;
        this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
        this.setAndUpdateSingleCellSelection(
          this.dragStartColumnIndex,
          this.dragStartRowIndex,
        );
        this.updateContentMapChangedForView();
      },
    },
    {
      command: VIM_COMMAND.copy,
      desc: "Copy selected cells to clipboard",
      execute: () => {
        const collectToCopy = [];
        /*prettier-ignore*/ console.log("[grid-test-page.ts,981] collectToCopy: ", collectToCopy);
        const [start, end] = this.getSelectedArea();
        /*prettier-ignore*/ console.log("[grid-test-page.ts,983] start: ", start);
        /*prettier-ignore*/ console.log("[grid-test-page.ts,983] end: ", end);
        iterateOverRange(start, end, (col, row) => {
          if (!collectToCopy[row]) {
            collectToCopy[row] = [];
          }
          const text = this.getCurrentCell(col, row)?.text;
          collectToCopy[row].push(text ?? "");
        });
        // const asString = JSON.stringify(collectToCopy, null, 2)
        /*prettier-ignore*/ console.log("[grid-test-page.ts,994] collectToCopy: ", collectToCopy);
        const filtered = collectToCopy.filter((a) => a);
        const asString = JSON.stringify(filtered);
        /*prettier-ignore*/ console.log("[grid-test-page.ts,991] asString: ", asString);
        setClipboardContent(asString);
        this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
        this.setAndUpdateSingleCellSelection();
      },
    },
    {
      command: VIM_COMMAND.enterVisualMode,
      execute: () => {
        /*prettier-ignore*/ console.log("[grid-test-page.ts,161] enterVisualMode: ");
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.yank,
      execute: () => {
        const collectDeleted = [];
        this.iterateOverCol(
          (col, row) => {
            collectDeleted.push(this.getCurrentCell(col, row)?.text ?? "");
          },
          {
            startRow: this.dragStartRowIndex,
            endRow: this.dragEndRowIndex,
          },
        );
        this.lastCellContentArray = collectDeleted;
        this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
        this.setAndUpdateSingleCellSelection(
          this.dragStartColumnIndex,
          this.dragStartRowIndex,
        );
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.jumpPreviousBlock,
      execute: () => {
        const colRange: GridSelectionRange = [
          [this.dragStartColumnIndex, 0],
          [this.dragStartColumnIndex, this.rowSize - 1],
        ];
        const start = this.getSelectedArea()[0];
        const vimState = convertRangeToVimState(
          this.contentMap,
          colRange,
          start,
        );
        this.vimInit.vimCore.setVimState(vimState);
        const result = this.vimInit.executeCommand(
          VIM_COMMAND.jumpPreviousBlock,
        );
        const nextEmptyRow = result.cursor.line;

        this.unselectAllSelecedCells();
        this.dragEndRowIndex = nextEmptyRow + 1;
        this.updateAllSelecedCells();
        this.spreadsheetContainerRef.scrollTop = nextEmptyRow * CELL_HEIGHT;
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.jumpNextBlock,
      execute: () => {
        const colRange: GridSelectionRange = [
          [this.dragStartColumnIndex, 0],
          [this.dragStartColumnIndex, this.rowSize - 1],
        ];
        const start = this.getSelectedArea()[0];
        const vimState = convertRangeToVimState(
          this.contentMap,
          colRange,
          start,
        );
        this.vimInit.vimCore.setVimState(vimState);
        const result = this.vimInit.executeCommand(VIM_COMMAND.jumpNextBlock);
        const nextEmptyRow = result.cursor.line;
        this.unselectAllSelecedCells();
        this.dragEndRowIndex = nextEmptyRow - 1;
        this.updateAllSelecedCells();
        this.spreadsheetContainerRef.scrollTop =
          (nextEmptyRow - 5) * CELL_HEIGHT;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Space>pa",
      execute: () => {
        console.log("space pa");
        this.addPanel();
        this.unselectAllSelecedCells();
        this.dragEndColumnIndex = this.dragStartColumnIndex;
        this.dragEndRowIndex = this.dragStartRowIndex;
        this.updateAllSelecedCells();
        this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
      },
    },
    {
      key: "<Enter>",
      execute: () => {
        // Add new panel
        const newPanel = this.addPanel();
        this.unselectAllSelecedCells();
        this.dragEndColumnIndex = this.dragStartColumnIndex;
        this.dragEndRowIndex = this.dragStartRowIndex;
        this.updateAllSelecedCells();
        this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");

        // Focus new panel
        this.activePanelElement = document.querySelector(
          `[data-panel-id="${newPanel.id}"] textarea`,
        ) as HTMLElement;
        this.activePanelElement?.focus();
        return true;
      },
    },
  ];
  private mappingByCustomMode: VimCommand[] = [
    {
      command: VIM_COMMAND.cursorRight,
      execute: () => {
        const panel = this.getPanelUnderCursor();
        panel.col += 1;
        this.setCursorAtPanel(panel);
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorLeft,
      execute: () => {
        const panel = this.getPanelUnderCursor();
        panel.col -= 1;
        this.setCursorAtPanel(panel);
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorUp,
      execute: () => {
        const panel = this.getPanelUnderCursor();
        panel.row -= 1;
        this.setCursorAtPanel(panel);
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorDown,
      execute: () => {
        const panel = this.getPanelUnderCursor();
        panel.row += 1;
        this.setCursorAtPanel(panel);
      },
      preventUndoRedo: true,
    },
  ];
  private mappingByMode: KeyBindingModes = {
    //{
    //  key: "b",
    //  execute: () => {},
    //},
    [VimMode.NORMAL]: this.mappingByNormalMode,
    [VimMode.VISUAL]: this.mappingByVisualMode,
    [VimMode.INSERT]: [],
    [VimMode.CUSTOM]: this.mappingByCustomMode,
    [VimMode.ALL]: [
      //{
      //  key: "<Space>c",
      //  desc: "[c]ear console",
      //  execute: () => {
      //    console.clear();
      //  },
      //  preventUndoRedo: true
      //},
      {
        key: "<Control>s",
        desc: "[S]ave",
        execute: () => {
          console.log("save");
          this.save();
          return true;
        },
        preventUndoRedo: true,
      },
    ],
  };

  public get orderedSelectedRangeToString(): string {
    const ordered = this.getSelectedArea();
    const [[startColumn, startRow], [endColumn, endRow]] = ordered;
    // const result = `${this.numberToAlphabet(startColumn)}${startRow + 1} - ${this.numberToAlphabet(endColumn)}${endRow + 1}`;
    const result = `${startColumn},${startRow}:${endColumn},${endRow}`;
    return result;
  }

  activeSheetIdChanged() {
    if (!this.activeSheetId) return;
    this.sheetsData.selectedSheetId = this.activeSheetId;
    this.updateContentMap(this.sheetsData, this.activeSheetId);
  }

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
    private vimInit: VimInit = resolve(VimInit),
    private store: Store = resolve(Store),
  ) {
    this.sheetsData = gridDatabase.getItem();
    this.initSheets(this.sheetsData);
    this.gridUndoRedo = new UndoRedo<ContentMap>();
  }

  attaching() {
    this.panelCRUD = new CRUDService(this.gridPanels);

    this.sheetTabHooks = {
      newTabAdded: (newTab) => {
        this.sheetsData.sheets.push({
          id: newTab.id,
          title: newTab.name,
          content: [],
        });
        console.log("newTabAdded", newTab);
      },
      tabRenamed: (tab) => {
        const sheet = this.sheetsData.sheets.find((s) => s.id === tab.id);
        if (!sheet) return;
        sheet.title = tab.name;
      },
      tabDeleted: (tab) => {
        this.sheetsData.sheets = this.sheetsData.sheets.filter(
          (s) => s.id !== tab.id,
        );
      },
    };

    this.contentMap;
    // this.sheetsData.sheets[this.sheetsData.selectedSheetId].content;

    this.autosave();
  }

  attached() {
    this.initGridNavigation();
    const [start, end] = this.activeSheet.selectedRange ?? [[], []];
    if (start[0] !== end[0] && start[1] !== end[1]) {
      this.vimInit.executeCommand(VIM_COMMAND.enterVisualMode, "");
    }

    // @ts-ignore
    window.test = this;

    this.selectedMap[
      EV_CELL_SELECTED(this.dragStartColumnIndex, this.dragStartRowIndex)
    ] = true;

    this.gridUndoRedo.init(structuredClone(this.contentMap));
    this.addEventListeners();
    this.scrollSelectdeIntoView();
  }

  public startMouseDragGridCell = (columnIndex: number, rowIndex: number) => {
    this.isStartDragGridCell = true;
    this.unselectAllSelecedCells();
    this.dragStartColumnIndex = columnIndex;
    this.dragStartRowIndex = rowIndex;
    this.dragEndColumnIndex = columnIndex;
    this.dragEndRowIndex = rowIndex;
    this.updateAllSelecedCells();
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
        this.selectedMap[EV_CELL_SELECTED(columnIndex, rowIndex)] = false;
      });
    }

    this.iterateOverSelectedCells((columnIndex, rowIndex) => {
      if (!this.isInArea(columnIndex, rowIndex)) return;
      this.selectedMap[EV_CELL_SELECTED(columnIndex, rowIndex)] = true;
    });
  };

  public onMouseUpGridCell(): void {
    // this.addGridPanelToSelection();
    this.resetDrag();
    // this.vimInit.executeCommand(VIM_COMMAND.enterVisualMode, "");
  }

  public onPanelClicked(panel: GridPanel): void {
    this.setActivePanelFromHTMLElement();
  }

  public addPanel(): GridPanel {
    this.unselectAllSelecedCells();
    const newPanel = this.addGridPanelToSelection();
    return newPanel;
  }

  public updatePanelCoords = (panel: GridPanel): ((a, b) => void) => {
    return (moveByX, moveByY) => {
      const updatedCol = panel.col + moveByX;
      panel.col = updatedCol;
      const updatedRow = panel.row + moveByY;
      panel.row = updatedRow;

      this.unselectAllSelecedCells();
      this.setCursorAtPanel(panel);
      this.updateAllSelecedCells();
    };
  };

  public onTextareaWidthChanged(panel: GridPanel): (a) => void {
    return (newWidth: number) => {
      const adjustedWidth = Math.floor(newWidth / CELL_WIDTH);
      panel.width = adjustedWidth;
    };
  }

  public onTextareaHeightChanged(panel: GridPanel): (a) => void {
    return (newHeight: number) => {
      const adjustedHeight = Math.floor(newHeight / CELL_HEIGHT);
      panel.height = adjustedHeight;
    };
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

  public onEscape = (): void => {
    this.putCellIntoUnfocus();
    this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
    popVimInstanceId();
  };

  public onEnter = (): void => {
    // console.log("6");
    const active = getIsInputActive();
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,1338] active: ", active);
    if (!active) {
      this.putCellIntoUnfocus();
      this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
      popVimInstanceId();
    } else {
      this.putCellIntoEdit();
      this.vimInit.executeCommand(VIM_COMMAND.enterInsertMode, "");
    }
  };

  public onResizeColumns = (colIndex: number) => {
    const sheet = this.activeSheet;
    if (!sheet?.colHeaderMap?.[colIndex]) {
      sheet.colHeaderMap = {
        ...sheet.colHeaderMap,
        [colIndex]: { colWidth: this.CELL_WIDTH },
      };
    }
    const beforeWidth = sheet.colHeaderMap?.[colIndex]?.colWidth ?? CELL_WIDTH; // TODO: fix, need to have it adjust to new drag start positions
    // // // // /*prettier-ignore*/ console.log("[grid-test-page.ts,1651] beforeWidth: ", beforeWidth);
    return (movedByX: number) => {
      if (!sheet?.colHeaderMap?.[colIndex]) {
        sheet.colHeaderMap = {
          [colIndex]: { colWidth: this.CELL_WIDTH },
        };
      }
      sheet.colHeaderMap[colIndex].colWidth = beforeWidth + movedByX;
      // console.log("colindex", colIndex);
      // // // /*prettier-ignore*/ console.log("[grid-test-page.ts,1673] sheet.colHeaderMap[colIndex].colWidth: ", sheet.colHeaderMap[colIndex].colWidth);
    };
  };

  public updateResizeColumns = (): void => {};

  public selectColumn(col: number): void {
    this.vimInit.executeCommand(VIM_COMMAND.enterVisualMode, "");
    this.setSelectionFromRange([
      [col, 0],
      [col, this.rowSize - 1],
    ]);
  }

  public undo = (): void => {
    this.getCommand(VIM_COMMAND.undo)?.execute();
  };

  public redo = (): void => {
    this.getCommand(VIM_COMMAND.redo)?.execute();
  };

  public onCellUpdate = (col: number, row: number, cell: Cell): void => {
    if (!this.contentMap) return;
    // /*prettier-ignore*/ console.log("C.1 [grid-test-page.ts,1713] cell.text: ", col, row,cell.text);
    this.setCurrentCellContent(cell.text, col, row);
    this.onCellContentChangedInternal(col, row);
  };

  public save(): void {
    this.getActiveSheet().selectedRange = this.getSelectedArea();
    gridDatabase.setItem(this.sheetsData);
  }

  public onUpload = (result: string) => {
    const asObj = JSON.parse(result);
    this.initSheets(asObj);
  };

  private initSheets(sheetsData: GridDatabaseType): void {
    let updatedSheetData = runGridMigrations(sheetsData);
    updatedSheetData = checkCellOverflow(updatedSheetData);
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,488] updatedSheetData: ", updatedSheetData);
    this.sheetsData = updatedSheetData;
    this.sheetTabs = updatedSheetData.sheets.map((sheet) => ({
      id: sheet.id,
      name: sheet.title,
    }));
    const sheetId = updatedSheetData.selectedSheetId;
    this.activeSheetId = sheetId;
    this.updateContentMap(updatedSheetData, sheetId);
  }

  private updateContentMap(
    sheetsData: GridDatabaseType,
    sheetId: string,
  ): void {
    const activeIndex = this.sheetTabs.findIndex(
      (sheet) => sheet.id === sheetId,
    );
    const activeSheet = sheetsData.sheets[activeIndex];
    if (!activeSheet) return;
    this.activeSheet = activeSheet;
    this.rowSize = Math.max(this.rowSize, this.activeSheet.content.length);
    this.colSize = Math.max(
      this.colSize,
      this.getColSize(this.activeSheet.content),
    );
    this.store.activeSheet = activeSheet;
    this.contentMap = activeSheet.content;
    if (!this.activeSheet.selectedRange) {
      this.activeSheet.selectedRange = defaultGridSelectionRange;
    }
    this.setSelectionFromRange(activeSheet.selectedRange);
    this.updateContentMapChangedForView();
  }

  private getColSize(contentMap: ContentMap): number {
    let biggestCol = 0;
    contentMap.forEach((row) => {
      if (!row) return;
      biggestCol = Math.max(biggestCol, row.length);
    });
    return biggestCol;
  }

  private setSelectionFromRange(range: GridSelectionRange | undefined) {
    //range = [
    //  [6, 3],
    //  [6, 3],
    //];
    if (!range) return;
    this.unselectAllSelecedCells();
    const [start, end] = range;
    this.dragStartColumnIndex = start[0];
    this.dragStartRowIndex = start[1];
    this.dragEndColumnIndex = end[0];
    this.dragEndRowIndex = end[1];
    this.updateAllSelecedCells();
  }

  private updateContentMapChangedForView() {
    const converted = {};
    this.contentMap.forEach((col, colIndex) => {
      if (!col) return;
      col.forEach((cell, cellIndex) => {
        if (!cell) return;
        converted[CELL_COORDS(colIndex, cellIndex)] = cell;
      });
    });
    // this.contentMapForView = structuredClone(converted);
    this.contentMapForView = converted;
  }

  private addEventListeners() {
    const { autopasteIntoRow } = featureFlags.copy;
    if (autopasteIntoRow.enabled && autopasteIntoRow.method.includes["copy"]) {
      this.spreadsheetContainerRef.addEventListener("copy", () => {
        console.log("bruh");
        const selection = document.getSelection();
        const text = selection.toString();
        const col = featureFlags.copy.autopasteIntoRow.col;
        const isCellEmpty = this.isCellEmpty(col);
        /*prettier-ignore*/ console.log("[grid-test-page.ts,1554] isCellEmpty: ", isCellEmpty);
        if (isCellEmpty) {
          this.setCurrentCellContent(text, col);
          return;
        }
        this.addCellBelow(text, col);

        //let nextEmptyCol = col;
        //while (this.getCurrentCell(nextEmptyCol)?.text) {
        //  nextEmptyCol++;
        //}
        //this.setCurrentCellContent(text, nextEmptyCol);
      });
    }
  }

  private getActiveSheet(): Sheet {
    const sheetId = this.sheetsData.selectedSheetId;
    const activeIndex = this.sheetTabs.findIndex(
      (sheet) => sheet.id === sheetId,
    );
    return this.sheetsData.sheets[activeIndex];
  }

  private isCursorInsidePanel(panel: GridPanel): boolean {
    const { col, row, width, height } = panel;
    const endColumn = col + width - 1; // one cell should have same end columns
    const endRow = row + height - 1; // one cell should have same end row

    const isInColumn =
      this.dragStartColumnIndex >= col &&
      this.dragStartColumnIndex <= endColumn;
    const isInRow =
      this.dragStartRowIndex >= row && this.dragStartRowIndex <= endRow;
    const is = isInRow && isInColumn;
    return is;
  }

  private initGridNavigation(): void {
    const mappingByKey = {
      //"<Control>r": () => {
      //  // return true;
      //},
      Tab: () => {
        return this.setActivePanelFromHTMLElement();
      },
      "<Shift>Tab": () => {
        return this.setActivePanelFromHTMLElement();
      },
    };

    // const vimState = convertGridToVimState(
    const vimState = convertRangeToVimState(
      this.contentMap,
      this.activeSheet.selectedRange,
    );
    window.activeVimInstancesIdMap.push(vimState.id);

    const vimOptions: VimOptions = {
      container: this.gridTestContainerRef,
      vimState,
      allowChaining: true,
      allowExtendedChaining: false,
      hooks: {
        modeChanged: (payload) => {
          this.mode = payload.vimState.mode;
        },
        commandListener: (result) => {
          // // // /*prettier-ignore*/ console.log("[grid-test-page.ts,1165] result: ", result);
          window.setTimeout(() => {
            if (!this.contentMap) return;
            if (
              result.targetCommand === VIM_COMMAND.redo ||
              result.targetCommand === VIM_COMMAND.undo
            ) {
              return;
            }
            if (!result.targetCommandFull.preventUndoRedo) {
              this.gridUndoRedo.setState(structuredClone(this.contentMap));
              return;
            }
          }, 0);
        },
      },
    };
    // console.log("1.");
    this.vimInit.init(vimOptions, mappingByKey, this.mappingByMode);
  }

  private setAndUpdateSingleCellSelection(
    col: number = this.dragStartColumnIndex,
    row: number = this.dragStartRowIndex,
  ) {
    this.unselectAllSelecedCells();
    this.dragStartColumnIndex = col;
    this.dragEndColumnIndex = col;
    this.dragStartRowIndex = row;
    this.dragEndRowIndex = row;
    this.updateAllSelecedCells();
  }

  private getPreviousCellCoords(): GridSelectionCoord {
    let prevCol = this.dragStartColumnIndex - 1;
    let prevRow = this.dragStartRowIndex;
    if (prevCol === -1) {
      prevCol = this.colSize - 1;
      prevRow = prevRow - 1;
    }

    return [prevCol, prevRow];
  }

  private getNextCellCoords(): GridSelectionCoord {
    let prevCol = this.dragStartColumnIndex + 1;
    let prevRow = this.dragStartRowIndex;
    if (prevCol === this.colSize) {
      prevCol = 0;
      prevRow = prevRow + 1;
    }

    return [prevCol, prevRow];
  }

  private getCurrentCell(
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
  ): Cell {
    const cell = this.contentMap[row]?.[col];
    // const cell = this.sheetsData.sheets[1].content[row]?.[col];
    return cell;
  }

  private setCurrentCellContent(
    content: string,
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
    option?: { skipUpdate: boolean },
  ) {
    if (this.contentMap[row] === undefined) {
      this.contentMap[row] = [];
    }
    this.contentMap[row][col] = { text: content } as Cell;
    this.onCellContentChangedInternal(col, row);

    if (option?.skipUpdate) return;
    this.updateContentMapChangedForView();
  }

  private addColAt(colIndex: number): void {
    this.contentMap.forEach((_, rowIndex) => {
      this.addCellEmptyAt(colIndex, rowIndex);
    });

    this.addEntryToColHeaderMap(colIndex);
  }

  private addEntryToColHeaderMap(col: number): void {
    if (!this.activeSheet.colHeaderMap) {
      this.activeSheet.colHeaderMap = {};
    }
    if (!this.activeSheet.colHeaderMap[col]) {
      this.activeSheet.colHeaderMap[col] = { colWidth: this.CELL_WIDTH };
    }
  }

  private addColLeft(): void {
    const left = Math.max(0, this.dragStartColumnIndex - 1);
    this.colSize += 1
    this.addColAt(left);
  }

  private addColRight(): void {
    const right = this.dragStartColumnIndex + 1;
    this.addColAt(right);
    if (right === this.colSize) {
      this.colSize += 1;
    }
  }

  private addRowAt(rowIndex: number): void {
    this.contentMap.splice(rowIndex, 0, []);
  }

  private removeRowAt(
    row: number = this.dragStartRowIndex,
    amount: number = 1,
  ): void {
    this.contentMap.splice(row, amount);
  }

  private addRowAbove(): void {
    const next = Math.max(0, this.dragStartRowIndex - 1);
    this.rowSize += 1;
    this.addRowAt(next);
  }

  private addRowBelow(): void {
    this.rowSize += 1;
    this.addRowAt(this.dragStartRowIndex + 1);
  }

  private addCellEmptyAt(
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
  ) {
    if (this.contentMap[row] == null) {
      this.contentMap[row] = [];
    }
    this.contentMap[row].splice(col, 0, undefined);
  }

  private addCellAt(
    content: string,
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
    option?: { skipUpdate: boolean },
  ) {
    if (this.contentMap[row] == null) {
      this.contentMap[row] = [];
    }
    this.contentMap[row].splice(col, 0, undefined);
    this.setCurrentCellContent(content, col, row, option);
  }

  private removeCellAt(
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
    option?: { skipUpdate: boolean },
  ) {
    if (this.contentMap[row] == null) {
      this.contentMap[row] = [];
    }
    // const cell = this.contentMap[row][col];
    // // // /*prettier-ignore*/ console.log("[grid-test-page.ts,1220] cell: ", cell);
    this.contentMap[row].splice(col, 1);
    //this.contentMap[row] = this.contentMap[row].filter(
    //  (_, index) => index !== col,
    //);
    // const afterCell = this.contentMap[row][col];
    // // // /*prettier-ignore*/ console.log("[grid-test-page.ts,1223] afterCell: ", afterCell);
    this.onCellContentChangedInternal(col, row);
    if (option?.skipUpdate) return;
    this.updateContentMapChangedForView();
  }

  private clearCurrentCellContent(
    col?: number,
    row?: number,
    option?: { skipUpdate: boolean },
  ): void {
    this.setCurrentCellContent(undefined, col, row, option);
  }

  /**
   * When panel gets focused, set `activePanel` entity based on that element.
   */
  private setActivePanelFromHTMLElement(): boolean {
    window.setTimeout(() => {
      const active = document.activeElement as HTMLElement;
      const panelElement = findParentElement(
        active,
        (element) => !!element.dataset.panelId,
      );
      if (!panelElement) return;
      const panelId = panelElement.dataset.panelId;
      const targetPanel = this.gridPanels.find((p) => p.id === panelId);
      this.setActivePanel(targetPanel);
    }, 100);
    return false;
  }

  private setActivePanel(panel: GridPanel): void {
    this.setCursorAtPanel(panel);
    this.activePanel = panel;
  }

  /**
   * Set cursor at panel, and update the selected cells.
   */
  private setCursorAtPanel(panel: GridPanel): void {
    this.unselectAllSelecedCells();
    this.dragStartColumnIndex = panel.col;
    this.dragEndColumnIndex = panel.col;
    this.dragStartRowIndex = panel.row;
    this.dragEndRowIndex = panel.row;
    this.updateAllSelecedCells();
  }

  private getPanelUnderCursor(): GridPanel | undefined {
    const target = this.gridPanels.find((p) => {
      const is = this.isCursorInsidePanel(p);
      return is;
    });
    return target;
  }

  private addPanelAtCursor(panel: GridPanel): void {
    this.unselectAllSelecedCells();
    panel.col = this.dragStartColumnIndex;
    panel.row = this.dragStartRowIndex;
    this.panelCRUD.create(panel);
    this.updateAllSelecedCells();
  }

  private addGridPanelToSelection(): GridPanel {
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
    return newPanel;
  }

  private getSelectedArea(): GridSelectionRange {
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

  private moveSelectedCellBy(amount: number, direction: "x" | "y"): void {
    this.unselectAllSelecedCells();
    switch (direction) {
      case "y": {
        this.dragStartRowIndex += amount;
        this.dragEndRowIndex += amount;
        break;
      }
      case "x": {
        this.dragStartColumnIndex += amount;
        this.dragEndColumnIndex += amount;
      }
    }
    this.updateAllSelecedCells();
  }

  private updateAllSelecedCells(): void {
    this.iterateOverSelectedCells((columnIndex, rowIndex) => {
      if (this.isInArea(columnIndex, rowIndex)) {
        this.selectedMap[EV_CELL_SELECTED(columnIndex, rowIndex)] = true;
      }
    });
  }

  private unselectAllSelecedCells(): void {
    this.iterateOverSelectedCells((columnIndex, rowIndex) => {
      if (this.isInArea(columnIndex, rowIndex)) {
        this.selectedMap[EV_CELL_SELECTED(columnIndex, rowIndex)] = false;
      }
    });
  }

  private iterateOverSelectedCells(
    callback: (columnIndex: number, rowIndex: number) => void,
  ) {
    const selected = this.getSelectedArea();
    const [[startColumn, startRow], [endColumn, endRow]] = selected;
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

  private iterateOverAllCells(
    callback: (columnIndex: number, rowIndex: number) => void,
    options: GridIteratorOptions = defaultGridIteratorOptions,
  ) {
    iterateOverGrid(
      [options.startCol, options.startRow],
      [this.colSize - 1, this.rowSize - 1],
      callback,
      options,
    );
  }

  /**
   * Enhanced with more data and methods
   */
  private iterateOverAllCellsEnhanced(
    callback: (
      columnIndex: number,
      rowIndex: number,
      options: { content: string; set: Function },
    ) => void,
    options: GridIteratorOptions = defaultGridIteratorOptions,
  ) {
    iterateOverGrid(
      [options.startCol, options.startRow],
      [this.colSize - 1, this.rowSize - 1],
      (columnIndex, rowIndex) => {
        const content = this.getCurrentCell(columnIndex, rowIndex)?.text ?? "";
        callback(columnIndex, rowIndex, {
          content,
          set: (newContent: string) =>
            this.setCurrentCellContent(newContent, columnIndex, rowIndex),
        });
      },
      options,
    );
  }

  private iterateOverCol(
    callback: (columnIndex: number, rowIndex: number) => void,
    options?: GridIteratorOptions,
  ) {
    iterateOverRange(
      [this.dragStartColumnIndex, 0],
      [this.dragStartColumnIndex, this.rowSize - 1],
      callback,
      options,
    );
  }

  private iterateOverWholeRow(
    callback: (columnIndex: number, rowIndex: number) => void,
    options?: GridIteratorOptions,
  ) {
    iterateOverRange(
      [0, this.dragStartRowIndex],
      [this.colSize - 1, this.dragStartRowIndex],
      callback,
      options,
    );
  }

  private iterateOverRowFromCurrent(
    callback: (columnIndex: number, rowIndex: number) => void,
    options?: GridIteratorOptions,
  ) {
    iterateOverRange(
      [this.dragStartColumnIndex, this.dragStartRowIndex],
      [this.colSize - 1, this.dragStartRowIndex],
      callback,
      options,
    );
  }

  private iterateOverRowUntil(
    callback: (columnIndex: number, rowIndex: number) => void,
    options?: GridIteratorOptions,
  ) {
    iterateOverRange(
      [0, this.dragStartRowIndex],
      [this.dragStartColumnIndex, this.dragStartRowIndex],
      callback,
      options,
    );
  }

  private iterateOverColBackwards(
    callback: (columnIndex: number, rowIndex: number) => void,
    options?: GridIteratorOptions,
  ) {
    iterateOverRangeBackwards(
      [this.dragStartColumnIndex, 0],
      [this.dragStartColumnIndex, this.rowSize - 1],
      callback,
      options,
    );
  }

  private iterateOverRowBackwards(
    callback: (columnIndex: number, rowIndex: number) => void,
    options?: GridIteratorOptions,
  ) {
    iterateOverRangeBackwards(
      [0, this.dragStartRowIndex],
      [this.dragStartColumnIndex, this.dragStartRowIndex],
      callback,
      options,
    );
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
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,1457] all: ", all);
  }

  private autosave(): void {
    if (!featureFlags.autosave) {
      return;
    }
    gridDatabase.autosave(() => {
      this.save();
    });
  }

  private readonly scrollEditor = (
    direction: Direction,
    delta: number,
  ): void => {
    const activeElement = document.querySelector(".selected-cell");

    const cursor = activeElement;
    if (!cursor) return;
    const editor = this.spreadsheetContainerRef;
    if (!editor) return;
    const containerRect = editor.getBoundingClientRect();

    /** Relative to container */
    const cursorRect = cursor.getBoundingClientRect();
    const lineHeight = CELL_HEIGHT;
    const cursorWidth = cursorRect.width;
    const relCursorTop = cursorRect.top; // - containerRect.top;
    const relCursorLeft = cursorRect.left; // - containerRect.top;
    const relCursorBottom = cursorRect.bottom; //  - containerRect.top;
    const relCursorRight = cursorRect.right; //  - containerRect.top;

    const THRESHOLD_VALUE = 70; // - 40: 40 away from <direction>, then should scroll
    // bottom = right, up = left

    const bottomThreshold = containerRect.bottom - THRESHOLD_VALUE;
    const shouldScrollDown = relCursorBottom > bottomThreshold;
    const topThreshold = containerRect.top + THRESHOLD_VALUE;
    const shouldScrollUp = relCursorTop < topThreshold;

    const rightThreshold = containerRect.right - THRESHOLD_VALUE;
    const shouldScrollRight = relCursorRight > rightThreshold;
    const leftThreshold = containerRect.left + THRESHOLD_VALUE;
    const shouldScrollLeft = relCursorLeft < leftThreshold;

    const horiChange = delta * lineHeight;
    const vertiChange = delta * cursorWidth;
    switch (direction) {
      case "up":
        if (shouldScrollUp) {
          editor.scrollTop -= horiChange;
        }
        break;
      case "down":
        if (shouldScrollDown) {
          editor.scrollTop += horiChange;
        }
        break;
      case "left":
        if (shouldScrollLeft) {
          editor.scrollLeft -= vertiChange;
        }
        break;
      case "right":
        if (shouldScrollRight) {
          editor.scrollLeft += vertiChange;
        }
        break;
      default: {
        break;
      }
    }
  };

  private onCellContentChangedInternal(col: number, row: number): void {
    this.updateCellOverflow(col, row);
  }

  private updateCellOverflow(col: number, row: number) {
    /*prettier-ignore*/ debugLog && console.log("0000000. updateCellOverflow", col, row);
    const cell = this.getCurrentCell(col, row);
    let previousCellInRow: Cell | undefined;
    let previousCellInRowCol: number;
    let nextColInRow: number | undefined;
    // 1. If cell has content, then update the overflow of PREVIOUS and NEXT cell
    if (cell?.text) {
      /*prettier-ignore*/ debugLog && console.log("11111111.");
      // 1.1 PREVIOUS cell
      /*prettier-ignore*/ debugLog && console.log("1.0 col", col);
      /*prettier-ignore*/ debugLog && console.log("1.1 Previous cell");
      this.iterateOverRowBackwards(
        (col, row) => {
          const cell = this.getCurrentCell(col, row);
          const content = cell?.text;
          if (content) {
            /*prettier-ignore*/ debugLog && console.log("1.1.0 [grid-test-page.ts,1580] content: ", content);
            previousCellInRow = cell;
            previousCellInRowCol = col;
          }
          return content;
        },
        { endCol: col - 1, endRow: row },
      );
      /*prettier-ignore*/ debugLog && console.log("1.1.1 [grid-test-page.ts] previousCellInRow: ", previousCellInRowCol, previousCellInRow?.row, previousCellInRow?.text);

      // 1.2 NEXT cell
      /*prettier-ignore*/ debugLog && console.log("1.2 Next cell");
      this.iterateOverRowFromCurrent(
        (col, row) => {
          const cell = this.getCurrentCell(col, row);
          const content = cell?.text;
          if (content) {
            nextColInRow = col;
          }
          return content;
        },
        { startCol: col + 1, startRow: row },
      );
      /*prettier-ignore*/ debugLog && console.log("1.2.1 [grid-test-page.ts,1602] nextColInRow: ", nextColInRow);

      /*prettier-ignore*/ debugLog && console.log("1.3 Adjust");
      if (previousCellInRow) {
        const toNext = col - previousCellInRowCol;
        /*prettier-ignore*/ debugLog && console.log("1.3.1.1 [grid-test-page.ts] previousCellInRow: ", previousCellInRowCol, previousCellInRow?.row, previousCellInRow?.text);
        /*prettier-ignore*/ debugLog && console.log("1.3.1.2 [grid-test-page.ts,1609] toNext: ", toNext);
        previousCellInRow.colsToNextText = toNext;
      }
      if (nextColInRow !== null) {
        const toNext = nextColInRow - col;
        /*prettier-ignore*/ debugLog && console.log("1.3.2.1 [grid-test-page.ts,1492] cell: ", cell?.col, cell?.row, '"', cell?.text);
        /*prettier-ignore*/ debugLog && console.log("1.3.2.2 [grid-test-page.ts,1615] toNext: ", toNext);
        cell.colsToNextText = toNext;
      }
    } else {
      /*prettier-ignore*/ debugLog && console.log("2222222.");
      // 2. Just previous, but also check if content to long for next
      this.iterateOverRowBackwards(
        (col, row) => {
          const cell = this.getCurrentCell(col, row);
          const content = cell?.text;
          if (content) {
            previousCellInRow = cell;
            previousCellInRowCol = col;
          }
          return content;
        },
        { endCol: col - 1, endRow: row },
      );
      this.iterateOverRowFromCurrent(
        (col, row) => {
          const cell = this.getCurrentCell(col, row);
          const content = cell?.text;
          if (content) {
            nextColInRow = col;
          }
          return content;
        },
        { startCol: col + 1, startRow: row },
      );

      if (previousCellInRow && nextColInRow !== null) {
        previousCellInRow.colsToNextText = nextColInRow - previousCellInRowCol;
      }
    }
  }

  private getCommand(
    command: VIM_COMMAND,
    mode = VimMode.NORMAL,
  ): VimCommand | undefined {
    const target = this.mappingByMode[mode].find((c) => c.command === command);
    return target;
  }

  private putCellIntoUnfocus(): void {
    this.editedCellCoords = "";
    (document.activeElement as HTMLElement).blur();
    // this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
  }

  private putCellIntoEdit(): void {
    const cell = this.getCurrentCell();
    if (!cell) {
      this.setCurrentCellContent("");
    }

    this.editedCellCoords = this.CELL_COORDS(
      this.dragStartColumnIndex,
      this.dragStartRowIndex,
    );
  }

  private getScrollLeftOfCurrentSelection(): number {
    const scrollLeft = this.spreadsheetContainerRef.scrollLeft;
    const rowHeaderElement = document.querySelector<HTMLElement>(
      ".column-header-corner",
    );
    const rowHeaderWidth = getComputedValueFromPixelString(
      rowHeaderElement,
      "width",
    );
    const transposed = scrollLeft - rowHeaderWidth;
    return transposed;
  }

  private getScrollRightOfCurrentSelection(): number {
    const scrollLeft = this.getScrollLeftOfCurrentSelection();
    const width = getComputedValueFromPixelString(
      this.spreadsheetContainerRef,
      "width",
    );
    const scrollRight = scrollLeft + width;
    return scrollRight;
  }

  private scrollToCol(col: number): void {
    const colHeaderElement = document.querySelector(
      `[data-col-index='${col}']`,
    );
    const width = getComputedValueFromPixelString(colHeaderElement, "width");
    this.spreadsheetContainerRef.scrollLeft -= width;
  }

  private getSpreadSsheetContainer(): HTMLElement {
    return document.querySelector(".spreadsheet-container");
  }

  private getNormalizedContainerDimension() {
    const $container = this.getSpreadSsheetContainer();
    const containerRect = $container.getBoundingClientRect();
    const { width, height } = document
      .querySelector<HTMLElement>(".column-header-corner")
      .getBoundingClientRect();
    const normContainerWidth = containerRect.width - width;
    const normContainerHeight = containerRect.height - height;
    const result = {
      width: normContainerWidth,
      height: normContainerHeight,
    };
    return result;
  }

  private getXYOfSelection(
    col: number = this.dragStartColumnIndex,
    row: number = this.dragStartRowIndex,
    direction: Direction = "right",
  ): CellRect {
    const $container = this.getSpreadSsheetContainer();
    const containerRect = $container.getBoundingClientRect();
    const $colHeader = document.querySelector(`[data-col-index='${col}']`);
    const colHeaderRect = $colHeader.getBoundingClientRect();
    const { width, height } = document
      .querySelector<HTMLElement>(".column-header-corner")
      .getBoundingClientRect();
    let normalizedLeft = colHeaderRect.left - containerRect.left - width;
    if (direction === "right") {
      normalizedLeft += $container.scrollLeft;
    }
    const $rowHeader = document.querySelector(`[data-row-index='${row}']`);
    const rowHeaderRect = $rowHeader.getBoundingClientRect();
    let normalizedTop = rowHeaderRect.top - containerRect.top - height;
    if (direction === "down") {
      normalizedTop += $container.scrollTop;
    }
    const rect: CellRect = {
      top: normalizedTop,
      y: normalizedTop,
      bottom: normalizedTop + rowHeaderRect.height,
      left: normalizedLeft,
      x: normalizedLeft,
      right: normalizedLeft + colHeaderRect.width,
      width: colHeaderRect.width,
      height: rowHeaderRect.height,
    };
    return rect;
  }

  private scrollSelectdeIntoView(
    options: ScrollIntoViewOptions = { block: "center", inline: "center" },
  ): void {
    const $selected = document.querySelector(".selection");
    $selected?.scrollIntoView(options);
  }

  private getColWidth(col: number, delta: number = 0): number {
    let width = 0;
    if (delta > 0) {
      this.iterateOverRowFromCurrent(
        (c) => {
          width +=
            this.activeSheet.colHeaderMap[c]?.colWidth ?? this.CELL_WIDTH;
        },
        { endCol: col + delta },
      );
    } else {
      this.iterateOverRowUntil(
        (c) => {
          width +=
            this.activeSheet.colHeaderMap?.[c]?.colWidth ?? this.CELL_WIDTH;
        },
        { startCol: col + delta },
      );
    }

    return width;
  }

  private getNextColFromWidth(width: number): number {
    let nextCol = 0;
    let widthTracker = width;
    this.iterateOverRowFromCurrent((c, row) => {
      widthTracker -=
        this.activeSheet.colHeaderMap[c]?.colWidth ?? this.CELL_WIDTH;
      const stop = widthTracker < 0;
      if (stop) {
        nextCol = c + 1;
        return true;
      }
    });

    return nextCol;
  }

  private getRowHeight(col: number, delta: number = 0): number {
    let height = 0;
    if (delta > 0) {
      this.iterateOverRowFromCurrent(
        (_, r) => {
          height +=
            this.activeSheet.rowHeaderMap?.[r]?.height ?? this.CELL_HEIGHT;
        },
        { endCol: col + delta },
      );
    } else {
      this.iterateOverRowUntil(
        (_, r) => {
          height +=
            this.activeSheet.rowHeaderMap?.[r]?.height ?? this.CELL_HEIGHT;
        },
        { startCol: col + delta },
      );
    }

    return height;
  }

  private scrollUpToCell(col: number, row: number) {
    const result = this.getXYOfSelection(col, row, "up");
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2126] result: ", result);
    const { top } = result;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2125] top: ", top);
    const $container = this.getSpreadSsheetContainer();
    const topBorder = $container.scrollTop;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2111] topBorder: ", topBorder);
    const bottomBorder =
      topBorder + this.getNormalizedContainerDimension().height;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2113] bottomBorder: ", bottomBorder);
    const isInViewport = topBorder < top && top < bottomBorder;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2111] isInViewport: ", isInViewport);
    if (!isInViewport) {
      const bufferHeight = this.getRowHeight(row);
      const diff = top - bufferHeight;
      // /*prettier-ignore*/ console.log("[grid-test-page.ts,2113] diff: ", diff);
      $container.scrollTop = diff;
    }
  }

  private scrollDownToCell(col: number, row: number): void {
    const result = this.getXYOfSelection(col, row, "up");
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2136] result: ", result);
    const { bottom } = result;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2138] bottom: ", bottom);
    const $container = this.getSpreadSsheetContainer();
    const { height: containerHeight } = this.getNormalizedContainerDimension();
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2141] containerHeight: ", containerHeight);
    const bottomOfContainer = $container.scrollTop + containerHeight;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2143] bottomOfContainer: ", bottomOfContainer);
    const shouldScroll = bottom > bottomOfContainer;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2145] shouldScroll: ", shouldScroll);
    const bufferWidth = this.getRowHeight(col, 2);
    const diff = bottom - bottomOfContainer + bufferWidth;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2148] diff: ", diff);
    if (shouldScroll) {
      $container.scrollTop += diff;
    }
  }

  private scrollLeftToSelection(col: number, row: number) {
    const { left } = this.getXYOfSelection(col, row, "right");
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2108] left: ", left);
    const $container = this.getSpreadSsheetContainer();
    const leftBorder = $container.scrollLeft;
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2111] leftBorder: ", leftBorder);
    const rightBorder =
      leftBorder + this.getNormalizedContainerDimension().width;
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2113] rightBorder: ", rightBorder);
    const isInViewport = leftBorder < left && left < rightBorder;
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2111] isInViewport: ", isInViewport);
    if (!isInViewport) {
      const bufferWidth = this.getColWidth(col);
      const diff = left - bufferWidth;
      // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2113] diff: ", diff);
      $container.scrollLeft = diff;
    }
  }

  private scrollRightToSelection(col: number, row: number): void {
    const result = this.getXYOfSelection(col, row, "right");
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2078] result: ", result);
    const { left } = result;
    const $container = this.getSpreadSsheetContainer();
    const { width: containerWidth } = this.getNormalizedContainerDimension();
    const rightOfContainer = $container.scrollLeft + containerWidth;
    const shouldScroll = left > rightOfContainer;
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2081] left: ", left);
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2077] rightOfContainer: ", rightOfContainer);
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2084] shouldScroll: ", shouldScroll);
    const bufferWidth = this.getColWidth(col, 2);
    const diff = left - rightOfContainer + bufferWidth;
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2087] diff: ", diff);
    if (shouldScroll) {
      $container.scrollLeft += diff;
      // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2091] $container.scrollLeft: ", $container.scrollLeft);
    }
  }

  private getNewCellDirection(newCol: number, newRow: number): DirectionMap {
    const direction: DirectionMap = { x: "none", y: "none" };
    const beforeCol = this.dragStartColumnIndex;
    const beforeRow = this.dragStartRowIndex;
    const isSameCol = newCol === beforeCol;
    const isSameRow = newRow === beforeRow;
    if (isSameCol) {
      direction.x = "none";
    }
    if (isSameRow) {
      direction.y = "none";
    }
    if (newCol > beforeCol) {
      direction.x = "right";
    }
    if (newCol < beforeCol) {
      direction.x = "left";
    }
    if (newRow > beforeRow) {
      direction.y = "down";
    }
    if (newRow < beforeRow) {
      direction.y = "up";
    }
    return direction;
  }

  private scrollToCell(
    col: number,
    row: number,
    directionMap: DirectionMap,
  ): void {
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2225] directionMap: ", directionMap);
    const { x, y } = directionMap;
    if (x === "right") {
      this.scrollRightToSelection(col, row);
    } else if (x === "left") {
      this.scrollLeftToSelection(col, row);
    }

    if (y === "down") {
      this.scrollDownToCell(col, row);
    } else if (y === "up") {
      this.scrollUpToCell(col, row);
    }
  }
}
