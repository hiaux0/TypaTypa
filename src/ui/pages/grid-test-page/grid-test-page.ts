import { EventAggregator, observable, resolve } from "aurelia";
import "./grid-test-page.scss";
import { EV_CELL_SELECTED } from "../../../common/modules/eventMessages";
import {
  Cell,
  ContentMap,
  Direction,
  GridDatabaseType,
  GridSelectionCoord,
  GridSelectionRange,
  Sheet,
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
import { KeyMappingService } from "../../../features/vim/vimCore/commands/KeyMappingService";
import {
  findParentElement,
  getIsInputActive,
} from "../../../common/modules/htmlElements";
import { CRUDService } from "../../../common/services/CRUDService";
import {
  CELL_COORDS,
  CELL_HEIGHT,
  CELL_WIDTH,
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
} from "./grid-modules/gridModules";
import { Store } from "../../../common/modules/store";
import { Logger } from "../../../common/logging/logging";

const logger = new Logger("GridTestPage");
const debugLog = false;

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
  public rowSize = 20;
  public columnSize = 10;
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
  @observable activeSheetId = "";
  public gridUndoRedo: UndoRedo<ContentMap>;
  public editedCellCoords = "";

  private activePanel: GridPanel;
  private activePanelElement: HTMLElement;
  private lastCellContentArray: string[] = [];
  private sheetTabs: ITab[] = [];
  private sheetsData: GridDatabaseType;
  private isStartDragGridCell = false;
  private panelCRUD: CRUDService<GridPanel>;
  private mappingByMode: KeyBindingModes = {
    //{
    //  key: "b",
    //  execute: () => {},
    //},
    [VimMode.NORMAL]: [
      {
        command: VIM_COMMAND.cursorRight,
        execute: () => {
          this.unselectAllSelecedCells();
          const a = Math.min(
            this.columnSize - 1,
            this.dragStartColumnIndex + 1,
          );
          this.dragStartColumnIndex = a;
          this.dragEndColumnIndex = a;
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
          const a = Math.max(0, this.dragStartColumnIndex - 1);
          this.dragStartColumnIndex = a;
          this.dragEndColumnIndex = a;
          this.updateAllSelecedCells();
          if (this.dragStartColumnIndex === this.columnSize - 1) {
            this.spreadsheetContainerRef.scrollLeft =
              this.columnSize * CELL_WIDTH;
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
          const a = Math.max(0, this.dragStartRowIndex - 1);
          this.dragStartRowIndex = a;
          this.dragEndRowIndex = a;
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
          const a = Math.min(this.rowSize - 1, this.dragStartRowIndex + 1);
          this.dragStartRowIndex = a;
          this.dragEndRowIndex = a;
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
            this.lastCellContentArray = [this.getCurrentCell()?.text ?? ""];
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
          const nextCol = this.dragStartColumnIndex + 1;
          let index = 0;
          this.iterateOverCol(
            (col, row) => {
              this.addCellEmptyAt(col, row);
              const content = this.lastCellContentArray[index++];
              this.setCurrentCellContent(content, col, row, {
                skipUpdate: true,
              });
            },
            {
              startCol: nextCol,
              startRow: this.dragStartRowIndex,
              endCol: nextCol,
              endRow:
                this.dragStartRowIndex + this.lastCellContentArray.length - 1,
            },
          );
          this.updateContentMapChangedForView();
        },
      },
      {
        command: VIM_COMMAND.pasteVimBefore,
        execute: () => {
          if (this.lastCellContentArray.length === 0) return;
          let index = 0;
          this.iterateOverCol(
            (col, row) => {
              this.addCellEmptyAt(col, row);
              const content = this.lastCellContentArray[index++];
              this.setCurrentCellContent(content, col, row, {
                skipUpdate: true,
              });
            },
            {
              startRow: this.dragStartRowIndex,
              endCol: this.dragStartColumnIndex,
              endRow:
                this.dragStartRowIndex + this.lastCellContentArray.length - 1,
            },
          );
          this.updateContentMapChangedForView();
        },
      },
      {
        command: VIM_COMMAND.paste,
        execute: async () => {
          const text = await getClipboardContent();
          const split = text.trim().split("\n");
          const len = split.length;
          this.dragEndRowIndex = this.dragStartRowIndex + len - 1;
          this.iterateOverSelectedCells((col, row) => {
            const content = split.shift();
            this.setCurrentCellContent(content, col, row);
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
          let nextEmptyRow = NaN;
          this.iterateOverColBackwards(
            (col, row) => {
              const content = this.getCurrentCell(col, row)?.text ?? "";
              const empty = !content;
              nextEmptyRow = row;
              return empty;
            },
            { endRow: this.dragStartRowIndex - 1 },
          );
          if (Number.isNaN(nextEmptyRow)) return;
          this.setAndUpdateSingleCell(this.dragStartColumnIndex, nextEmptyRow);
          this.updateAllSelecedCells();
          this.spreadsheetContainerRef.scrollTop = nextEmptyRow * CELL_HEIGHT;
        },
        preventUndoRedo: true,
      },
      {
        command: VIM_COMMAND.jumpNextBlock,
        execute: () => {
          let nextEmptyRow = NaN;
          this.iterateOverCol(
            (col, row) => {
              const content = this.getCurrentCell(col, row)?.text ?? "";
              const empty = !content;
              nextEmptyRow = row;
              return empty;
            },
            { startRow: this.dragStartRowIndex + 1 },
          );
          if (Number.isNaN(nextEmptyRow)) return;
          this.setAndUpdateSingleCell(this.dragStartColumnIndex, nextEmptyRow);
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
          this.setAndUpdateSingleCell(0, this.dragStartRowIndex);
          this.spreadsheetContainerRef.scrollLeft = 0;
        },
        preventUndoRedo: true,
      },
      {
        command: VIM_COMMAND.cursorLineEnd,
        execute: () => {
          this.setAndUpdateSingleCell(
            this.columnSize - 1,
            this.dragStartRowIndex,
          );
          this.spreadsheetContainerRef.scrollLeft =
            this.columnSize * CELL_WIDTH;
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
              colSize: this.columnSize,
            },
          );

          if (
            !Number.isNaN(nextColWithContent) &&
            !Number.isNaN(nextRowWithContent)
          ) {
            this.setAndUpdateSingleCell(nextColWithContent, nextRowWithContent);
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
          this.lastCellContentArray = [text];
          setClipboardContent(text);
        },
      },
      {
        key: "dd",
        desc: "Delete current row",
        execute: () => {
          this.contentMap.splice(this.dragStartRowIndex, 1);
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
            const cell = this.getCurrentCell();
            if (cell) {
              const amount = cell.colsToNextText;
              this.scrollEditor("right", amount);
            }

            this.setAndUpdateSingleCell(nextColWithContent, nextRowWithContent);
          }
        },
        preventUndoRedo: true,
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
          this.setAndUpdateSingleCell(0, 0);
          this.spreadsheetContainerRef.scrollTop = 0;
        },
      },
      {
        key: "<Shift>G",
        execute: () => {
          this.setAndUpdateSingleCell(0, this.rowSize - 1);
          const height = this.rowSize * CELL_HEIGHT;
          this.spreadsheetContainerRef.scrollTop = height;
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
          this.contentMap.splice(this.dragStartRowIndex + 1, 0, []);
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
          this.contentMap.splice(
            Math.max(0, this.dragStartRowIndex - 1),
            0,
            [],
          );
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
          this.lastCellContentArray = [text];
          setClipboardContent(text);
          this.clearCurrentCellContent();
        },
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
    ],
    [VimMode.VISUAL]: [
      {
        command: VIM_COMMAND.cursorRight,
        execute: () => {
          this.unselectAllSelecedCells();
          const b = this.dragEndColumnIndex + 1;
          this.dragEndColumnIndex = cycleInRange(0, this.columnSize, b);
          this.updateAllSelecedCells();
        },
        preventUndoRedo: true,
      },
      {
        command: VIM_COMMAND.cursorLeft,
        execute: () => {
          this.unselectAllSelecedCells();
          const b = this.dragEndColumnIndex - 1;
          this.dragEndColumnIndex = cycleInRange(0, this.columnSize, b);
          this.updateAllSelecedCells();
        },
        preventUndoRedo: true,
      },
      {
        command: VIM_COMMAND.cursorUp,
        execute: () => {
          console.log("up");
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
          console.log("down");
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
          this.iterateOverCol(
            (col, row) => {
              collectDeleted.push(this.getCurrentCell(col, row)?.text ?? "");
              this.removeCellAt(col, row, { skipUpdate: true });
            },
            {
              startRow: this.dragStartRowIndex,
              endRow: this.dragEndRowIndex,
            },
          );
          this.lastCellContentArray = collectDeleted;
          this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
          this.setAndUpdateSingleCell(
            this.dragStartColumnIndex,
            this.dragStartRowIndex,
          );
          this.updateContentMapChangedForView();
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
          this.setAndUpdateSingleCell(
            this.dragStartColumnIndex,
            this.dragStartRowIndex,
          );
        },
        preventUndoRedo: true,
      },
      {
        command: VIM_COMMAND.jumpPreviousBlock,
        execute: () => {
          let nextEmptyRow = NaN;
          this.iterateOverColBackwards(
            (col, row) => {
              const content = this.getCurrentCell(col, row)?.text ?? "";
              const empty = !content;
              nextEmptyRow = row;
              return empty;
            },
            { startRow: this.dragStartRowIndex },
          );
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
          let nextEmptyRow = NaN;
          this.iterateOverCol(
            (col, row) => {
              const content = this.getCurrentCell(col, row)?.text ?? "";
              const empty = !content;
              nextEmptyRow = row;
              return empty;
            },
            { startRow: this.dragStartRowIndex },
          );
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
    ],
    [VimMode.INSERT]: [],
    [VimMode.CUSTOM]: [
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
    ],
    [VimMode.ALL]: [
      {
        key: "<Control>s",
        execute: () => {
          this.save();
          return true;
        },
      },
    ],
  };

  activeSheetIdChanged() {
    if (!this.activeSheetId) return;
    this.sheetsData.selectedSheetId = this.activeSheetId;
    this.updateContentMap(this.sheetsData, this.activeSheetId);
  }

  updateContentMapChangedForView() {
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

  public get orderedSelectedRangeToString(): string {
    const ordered = this.getSelectedArea();
    const [[startColumn, startRow], [endColumn, endRow]] = ordered;
    // const result = `${this.numberToAlphabet(startColumn)}${startRow + 1} - ${this.numberToAlphabet(endColumn)}${endRow + 1}`;
    const result = `${startColumn},${startRow}:${endColumn},${endRow}`;
    return result;
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

  private initSheets(sheetsData: GridDatabaseType): void {
    let updatedSheetData = runGridMigrations(sheetsData);
    updatedSheetData = checkCellOverflow(updatedSheetData);
    /*prettier-ignore*/ console.log("[grid-test-page.ts,488] updatedSheetData: ", updatedSheetData);
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
    this.store.activeSheet = activeSheet;
    this.contentMap = activeSheet.content;
    this.setSelectionFromRange(activeSheet.selectedRange);
    this.updateContentMapChangedForView();
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
    // @ts-ignore
    window.test = this;

    this.selectedMap[
      EV_CELL_SELECTED(this.dragStartColumnIndex, this.dragStartRowIndex)
    ] = true;

    // this.contentMap[this.CELL_COORDS(0, 0)] = "Hi";
    // this.contentMap[this.CELL_COORDS(1, 0)] = "Bye";

    this.gridPanels = [
      // { id: "1", row: 0, col: 0, type: "button", content: "Hi" },
      //{ row: 1, col: 1, width: 2, type: "button" },
      // { id: "2", col: 3, row: 4, width: 4, height: 4, type: "button" },
      // { id: "3", col: 8, row: 5, width: 2, height: 2, type: "button" },
      // { id: "5", col: 3, row: 3, width: 1, height: 1, type: "button" },
      // { id: "6", col: 4, row: 4, width: 1, height: 1, type: "button" },
    ];
    this.gridUndoRedo.init(structuredClone(this.contentMap));
    this.addEventListeners();
    // this.vimInit.executeCommand(VIM_COMMAND.enterVisualMode, "");
  }

  private addEventListeners() {}

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

  private getActiveSheet(): Sheet {
    const sheetId = this.sheetsData.selectedSheetId;
    const activeIndex = this.sheetTabs.findIndex(
      (sheet) => sheet.id === sheetId,
    );
    return this.sheetsData.sheets[activeIndex];
  }

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

  public deletePanel(panel: GridPanel): void {
    const filtered = this.gridPanels.filter((p) => p !== panel);
    this.gridPanels = filtered;
  }

  private initGridNavigation(): void {
    const mappingByKey = {
      //"<Control>r": () => {
      //  // return true;
      //},

      Enter: () => {
        if (getIsInputActive()) {
          this.putCellIntoUnfocus();
          this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
        } else {
          this.putCellIntoEdit();
          this.vimInit.executeCommand(VIM_COMMAND.enterInsertMode, "");
        }
      },
      Escape: () => {
        this.putCellIntoUnfocus();
      },
      Tab: () => {
        return this.setActivePanelFromHTMLElement();
      },
      "<Shift>Tab": () => {
        return this.setActivePanelFromHTMLElement();
      },
    };
    new KeyMappingService().init(mappingByKey, this.mappingByMode);

    // const vimState = convertGridToVimState(
    const vimState = convertRangeToVimState(
      this.contentMap,
      this.activeSheet.selectedRange,
    );

    const vimOptions: VimOptions = {
      container: this.gridTestContainerRef,
      vimState,
      hooks: {
        modeChanged: (payload) => {
          this.mode = payload.vimState.mode;
        },
        commandListener: (result) => {
          // /*prettier-ignore*/ console.log("[grid-test-page.ts,1165] result: ", result);
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
    this.vimInit.init(vimOptions);
  }

  private setAndUpdateSingleCell(col: number, row: number) {
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
      prevCol = this.columnSize - 1;
      prevRow = prevRow - 1;
    }

    return [prevCol, prevRow];
  }

  private getNextCellCoords(): GridSelectionCoord {
    let prevCol = this.dragStartColumnIndex + 1;
    let prevRow = this.dragStartRowIndex;
    if (prevCol === this.columnSize) {
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
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,1220] cell: ", cell);
    this.contentMap[row].splice(col, 1);
    //this.contentMap[row] = this.contentMap[row].filter(
    //  (_, index) => index !== col,
    //);
    // const afterCell = this.contentMap[row][col];
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,1223] afterCell: ", afterCell);
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
      [this.columnSize - 1, this.rowSize - 1],
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
      [this.columnSize - 1, this.rowSize - 1],
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

  private iterateOverRow(
    callback: (columnIndex: number, rowIndex: number) => void,
    options?: GridIteratorOptions,
  ) {
    iterateOverRange(
      [this.dragStartColumnIndex, this.dragStartRowIndex],
      [this.columnSize - 1, this.dragStartRowIndex],
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
    /*prettier-ignore*/ console.log("[grid-test-page.ts,1457] all: ", all);
  }

  private autosave(): void {
    return;
    gridDatabase.autosave(() => {
      this.save();
    });
  }

  public save(): void {
    this.getActiveSheet().selectedRange = this.getSelectedArea();
    gridDatabase.setItem(this.sheetsData);
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

  public onUpload = (result: string) => {
    const asObj = JSON.parse(result);
    this.initSheets(asObj);
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
      this.iterateOverRow(
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
      this.iterateOverRow(
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

  public onResizeColumns = (colIndex: number) => {
    const sheet = this.activeSheet;
    if (!sheet?.colHeaderMap?.[colIndex]) {
      sheet.colHeaderMap = {
        ...sheet.colHeaderMap,
        [colIndex]: { colWidth: this.CELL_WIDTH },
      };
    }
    const beforeWidth = sheet.colHeaderMap?.[colIndex]?.colWidth ?? CELL_WIDTH; // TODO: fix, need to have it adjust to new drag start positions
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,1651] beforeWidth: ", beforeWidth);
    return (movedByX: number) => {
      if (!sheet?.colHeaderMap?.[colIndex]) {
        sheet.colHeaderMap = {
          [colIndex]: { colWidth: this.CELL_WIDTH },
        };
      }
      sheet.colHeaderMap[colIndex].colWidth = beforeWidth + movedByX;
      // console.log("colindex", colIndex);
      // /*prettier-ignore*/ console.log("[grid-test-page.ts,1673] sheet.colHeaderMap[colIndex].colWidth: ", sheet.colHeaderMap[colIndex].colWidth);
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

  private getCommand(
    command: VIM_COMMAND,
    mode = VimMode.NORMAL,
  ): VimCommand | undefined {
    const target = this.mappingByMode[mode].find((c) => c.command === command);
    return target;
  }

  public undo = (): void => {
    this.getCommand(VIM_COMMAND.undo)?.execute();
  };
  public redo = (): void => {
    this.getCommand(VIM_COMMAND.redo)?.execute();
  };

  public onCellUpdate = (col: number, row: number, cell: Cell): void => {
    if (!this.contentMap) return;
    /*prettier-ignore*/ console.log("C.1 [grid-test-page.ts,1713] cell.text: ", col, row,cell.text);
    this.setCurrentCellContent(cell.text, col, row);
    this.onCellContentChangedInternal(col, row);
  };

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
}
