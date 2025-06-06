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
  ColHeaderMap,
  ColHeaderMapData,
  RowHeaderMapData,
  CellKind,
  CellKindConfigElementType,
} from "../../../types";
import { generateId } from "../../../common/modules/random";
import { VimInit } from "../../../features/vim/VimInit";
import {
  KeyBindingModes,
  QueueInputReturn,
  VimHooks,
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
  VIM_ID_MAP,
  COLORS,
  BORDER_WIDTH,
  COMPLETIONS_MAP,
  UI_CONSTANTS,
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
  GridIteratorOptionsWithDefaults,
  calculateDiff,
  checkCellOverflow,
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
import { getComputedValueFromPixelString } from "../../../common/modules/css/css-variables";
import { popVimInstanceId } from "../../../features/vim/mulitple-vim-instances-handle";
import { FF, featureFlags } from "./grid-modules/featureFlags";
import { splitByEndingAndSeparator } from "../../../common/modules/strings";
import { VisualMode } from "../../../features/vim/modes/VisualMode";
import {
  IVimInputHandlerV2,
  VimInputHandlerV2,
} from "../../../features/vim/VimInputHandlerV2";
import { openFullscreen } from "../../../common/modules/platform/fullscreen";
import { debugFlags } from "../../../common/modules/debug/debugFlags";
import { ICommandsService } from "../../../common/services/CommandsService";
import {
  SheetsService,
  addMarkdownStyling,
  addMarkdownStylingToCell,
} from "./grid-modules/SheetsService";
import { ArrayUtils } from "../../../common/modules/array/array-utils";
import { OllamaApi, ollamaApi } from "../../../common/api/OllamaApi";
import {
  AI_PROMPTS,
  AI_SYSTEM,
} from "../../../common/modules/constants/aiConstants";
import {
  CellKindConfigService,
  cellKindConfigButton,
} from "./grid-modules/cellElementTypes";
import { GRID_FUNCTION_TRIGGER } from "../../../common/modules/keybindings/app-keys";
import { CompletionsService } from "../../../common/services/CompletionsService";

const l = new Logger("GridTestPage");
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
  public resizeHandlerRef: HTMLElement;
  public colSize = INITIAL_COLUMN_COUNT;
  public rowSize = INITIAL_ROW_COUNT;
  public CELL_HEIGHT = CELL_HEIGHT;
  public BORDER_WIDTH = BORDER_WIDTH;
  public CELL_WIDTH = CELL_WIDTH;
  public EV_CELL_SELECTED = EV_CELL_SELECTED;
  public CELL_COORDS = CELL_COORDS;
  public openFullscreen = openFullscreen;
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
  public vimEditorHooks: VimHooks;
  public UI_CONSTANTS = UI_CONSTANTS;
  public mappingByModeForCell: KeyBindingModes = {
    [VimMode.NORMAL]: [
      {
        key: "<Control>Enter",
        execute: (_, vimState, vimCore) => {
          const cellText =
            this.contentMap[this.dragStartRowIndex]?.[this.dragStartColumnIndex]
              ?.text;
          if (!cellText) return;
          if (!vimState?.lines) return;
          if (!vimState?.cursor) return;
          const col = vimState.cursor.col;
          const beforeText = cellText.slice(0, col).trim();
          const afterText = cellText.slice(col).trim();
          // set current cell
          const update = this.setCurrentCellContent(beforeText);
          update?.();
          vimState.lines[vimState.cursor.line].text = beforeText;
          vimCore?.setVimState(vimState);
          // add new cell, and set
          this.addRowBelow();
          this.addCellInRowAt(
            afterText,
            this.dragStartColumnIndex,
            this.dragStartRowIndex + 1,
          );
          this.updateContentMapChangedForView();
        },
      },
      {
        command: VIM_COMMAND.cursorDown,
        desc: "Move to below cell when in INSERT mode",
        context: [VIM_ID_MAP.gridNavigation],
        execute: () => {
          if (!featureFlags.grid.cells.modes.insert.allowMoveCellVertically)
            return;
          this.onEscape();
          popVimInstanceId();
          this.getCommand(VIM_COMMAND.cursorDown, VimMode.NORMAL)?.execute?.();
          this.putCellIntoEdit();
        },
      },
      {
        command: VIM_COMMAND.cursorUp,
        desc: "Move to above cell when in INSERT mode",
        context: [VIM_ID_MAP.gridNavigation],
        execute: () => {
          if (!featureFlags.grid.cells.modes.insert.allowMoveCellVertically)
            return;
          this.onEscape();
          popVimInstanceId();
          this.getCommand(VIM_COMMAND.cursorUp, VimMode.NORMAL)?.execute?.();
          this.putCellIntoEdit();
        },
      },
    ],
    [VimMode.VISUAL]: [
      {
        key: "y",
        desc: "yank",
        context: [VIM_ID_MAP.gridNavigation],
        command: VIM_COMMAND.yank,
        afterExecute: async (mode, _, vimCore) => {
          const { autopasteIntoRow } = featureFlags.copy;
          const autopaste =
            autopasteIntoRow.enabled &&
            autopasteIntoRow.method.includes("yank");
          if (autopaste) {
            const modeHandler = vimCore?.manager.getModeClass(
              mode,
            ) as VisualMode;
            const text = modeHandler.getSelectedText();
            const col = featureFlags.copy.autopasteIntoRow.col;
            const isCellEmpty = this.isCellEmpty(col);
            if (isCellEmpty) {
              const update = this.setCurrentCellContent(text, col);
              update?.();
              return false;
            }
            if (text) this.addCellBelowAndMaybeNewRow(text, col);
            return true;
          }
          return false;
        },
      },
    ],
  };
  @observable public activeSheetId: string;

  private isRowEmpty(row: number): boolean {
    return !this.contentMap[row]?.some((cell) => cell.text);
  }
  private addCellBelowAndMaybeNewRow(
    content: string,
    col = this.dragStartColumnIndex,
  ): void {
    const nextRow = this.dragStartRowIndex + 1;
    const rowEmpty = this.isRowEmpty(this.dragStartRowIndex);
    if (rowEmpty) {
      const update = this.setCurrentCellContent(content, col, nextRow);
      update?.();
      return;
    }
    this.addRowBelow();
    const update = this.setCurrentCellContent(content, col, nextRow);
    update?.();
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
  // ccc N
  private mappingByNormalMode: VimCommand[] = [
    {
      command: VIM_COMMAND.cursorRight,
      desc: "cursorRight",
      context: [VIM_ID_MAP.gridNavigation],
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
          this.scrollEditor(
            "right",
            featureFlags.grid.cursor.cell.scrollAmountHorizontal,
          );
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
          this.scrollEditor(
            "right",
            featureFlags.grid.cursor.cell.scrollAmountHorizontal,
          );
        }
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorLeft,
      desc: "cursorLeft",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.unselectAllSelecedCells();
        let next = this.dragStartColumnIndex - 1;
        if (next < 0 && featureFlags.mode.autoExpandGrid) {
          this.addColLeft();
          this.dragStartColumnIndex = 0;
          this.dragEndColumnIndex = 0;
          this.updateAllSelecedCells();
          this.updateContentMapChangedForView();
          this.scrollEditor(
            "left",
            featureFlags.grid.cursor.cell.scrollAmountHorizontal,
          );
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
          this.scrollEditor(
            "left",
            featureFlags.grid.cursor.cell.scrollAmountHorizontal,
          );
        }
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorUp,
      desc: "cursorUp",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.cursorUp(1);
        if (featureFlags.grid.cursor.keepCursorAtCenter) {
          this.scrollToMiddle();
        }
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorDown,
      desc: "cursorDown",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.cursorDown(1);
        if (featureFlags.grid.cursor.keepCursorAtCenter) {
          this.scrollToMiddle();
        }
        return true;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Space>csa",
      desc: "[C]ell [S]wap [A]bove - Swap cell with cell above",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        if (this.dragStartRowIndex === 0) return;
        const currentCell = this.getCurrentCell();
        const curCellText = currentCell?.text ?? "";
        const aboveCell = this.getCurrentCell(undefined, this.prevRow);
        const aboveCellText = aboveCell?.text ?? "";
        this.setCurrentCellContent(aboveCellText, undefined, undefined, {
          skipUpdate: true,
        });
        this.setCurrentCellContent(curCellText, undefined, this.prevRow, {
          skipUpdate: true,
        });
        this.setAndUpdateSingleCellSelection(undefined, this.prevRow);
        this.updateContentMapChangedForView();

        return;
      },
    },
    {
      key: "<Space>csb",
      desc: "[C]ell [S]wap [B]elow - Swap cell with cell above",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        if (this.dragStartRowIndex === this.rowSize - 1) return;
        const currentCell = this.getCurrentCell();
        const curCellText = currentCell?.text ?? "";
        const belowCell = this.getCurrentCell(undefined, this.nextRow);
        const belowCellText = belowCell?.text ?? "";
        this.setCurrentCellContent(belowCellText, undefined, undefined, {
          skipUpdate: true,
        });
        this.setCurrentCellContent(curCellText, undefined, this.nextRow, {
          skipUpdate: true,
        });
        this.setAndUpdateSingleCellSelection(undefined, this.nextRow);
        this.updateContentMapChangedForView();

        return;
      },
    },
    // aaa
    {
      key: "<Space>ag",
      desc: "[A]i [G]enerate",
      context: [VIM_ID_MAP.gridNavigation],
      execute: async () => {
        const content = this.getCurrentCell()?.text ?? "";
        const response = await ollamaApi.generateCompletion(
          AI_PROMPTS.translate(content),
          undefined,
          {
            system: AI_SYSTEM.translator,
            stream: false,
          },
        );
        const translation = response.response;
        const update = this.setCurrentCellContent(translation, this.nextCol);
        update?.();
        return true;
      },
    },
    {
      command: VIM_COMMAND.delete,
      desc: "delete",
      context: [VIM_ID_MAP.gridNavigation],
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
      desc: "pasteVim",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        if (this.lastCellContentArray.length === 0) return;
        const startCol = this.dragStartColumnIndex + 1;
        const startRow = this.dragStartRowIndex;
        const endCol = startCol + this.lastCellContentArray[0]?.length - 1;
        const endRow =
          this.dragStartRowIndex + this.lastCellContentArray.length - 1;
        //
        ///*prettier-ignore*/ console.log("[grid-test-page.ts,422] this.lastCellContentArray: ", this.lastCellContentArray);
        //if (
        //  Array.isArray(this.lastCellContentArray) &&
        //  typeof this.lastCellContentArray[0] === "string"
        //) {
        //  this.lastCellContentArray = this.lastCellContentArray.map((a) => [a]);
        //}
        iterateOverRangeBackwards(
          [startCol, startRow],
          [endCol, endRow],
          (col, row) => {
            this.addCellEmptyInRowAt(col, row);
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
      desc: "pasteVimBefore",
      context: [VIM_ID_MAP.gridNavigation],
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
            this.addCellEmptyInRowAt(col, row);
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
      desc: "paste",
      context: [VIM_ID_MAP.gridNavigation],
      execute: async () => {
        const text = (await getClipboardContent()).trim();
        try {
          const is1Dor2DimStringArray = JSON.parse(text);

          // 1D
          if (
            Array.isArray(is1Dor2DimStringArray) &&
            typeof is1Dor2DimStringArray[0] === "string"
          ) {
            /*prettier-ignore*/ l.culogger.debug(["Is 1 dim string array, convert, and then invoke pasteVimBefore"])
            this.lastCellContentArray = is1Dor2DimStringArray.map((a) => [a]);
            this.getCommand(
              VIM_COMMAND.pasteVimBefore,
              VimMode.NORMAL,
            )?.execute?.();
            return;
          } else if (
            // 2D
            Array.isArray(is1Dor2DimStringArray) &&
            Array.isArray(is1Dor2DimStringArray[0]) &&
            typeof is1Dor2DimStringArray[0][0] === "string"
          ) {
            /*prettier-ignore*/ l.culogger.debug(["Is 2 dim string array, so invoke pasteVimBefore"])
            this.lastCellContentArray = is1Dor2DimStringArray;
            const pasteVimBeforeCommand = this.mappingByNormalMode.find(
              (a) => a.command === VIM_COMMAND.pasteVimBefore,
            );
            pasteVimBeforeCommand?.execute?.();
            return;
          }
        } catch {}

        const splitByNewLine = text.split("\n");
        let split = splitByNewLine;
        if (FF.canPasteAutoSplitFlag()) {
          split = splitByEndingAndSeparator(text);
        }

        const len = split.length;
        this.rowSize = Math.max(this.rowSize, this.dragStartRowIndex + len);
        this.dragEndRowIndex = this.dragStartRowIndex + len - 1;
        this.iterateOverSelectedCells((col, row) => {
          const content = split.shift();
          if (!content) return;
          this.setCurrentCellContent(content, col, row, { skipUpdate: true });
        });
        this.dragEndRowIndex = this.dragStartRowIndex;
        this.updateContentMapChangedForView();
      },
    },
    {
      command: VIM_COMMAND.enterNormalMode,
      desc: "enterNormalMode",
      context: [VIM_ID_MAP.gridNavigation],
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
      desc: "jumpPreviousBlock",
      context: [VIM_ID_MAP.gridNavigation],
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
        if (!result?.cursor) return;
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
      desc: "jumpNextBlock",
      context: [VIM_ID_MAP.gridNavigation],
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
        if (!result?.cursor) return;
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
      desc: "undo",
      context: [VIM_ID_MAP.gridNavigation],
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
      desc: "redo",
      context: [VIM_ID_MAP.gridNavigation],
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
      desc: "cursorLineStart",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.setAndUpdateSingleCellSelection(0, this.dragStartRowIndex);
        this.spreadsheetContainerRef.scrollLeft = 0;
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.cursorLineEnd,
      desc: "cursorLineEnd",
      context: [VIM_ID_MAP.gridNavigation],
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
      // bbb
      key: "b",
      desc: "back",
      context: [VIM_ID_MAP.gridNavigation],
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
      // ccc
      key: "cc",
      desc: "Clear cell and go into Insert",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.clearCurrentCellContent();
        this.putCellIntoEdit();
        this.vimInit.executeCommand(VIM_COMMAND.enterInsertMode, "");

        return true;
      },
    },
    {
      key: "<Control>c",
      desc: "Copy current cell",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const text = this.getCurrentCell()?.text ?? "";
        this.lastCellContentArray = [[text]];
        setClipboardContent(text);
      },
    },
    {
      key: "<Space>cah",
      desc: "[C]ell [A]dd [H]TML",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const cell = this.getOrCreateCell();
        if (!cell) return;
        cell.kind = CellKind.HTML;
        cell.kindConfig = {
          // elementType: CellKindConfigElementType.BUTTON,
          elementType: CellKindConfigElementType.AUDIO,
        };
      },
    },
    {
      // ddd
      key: "dd",
      desc: "Delete current row",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.removeRowAt();
        this.updateContentMapChangedForView();
        return true;
      },
    },
    {
      // eee
      key: "e",
      desc: "Word end",
      context: [VIM_ID_MAP.gridNavigation],
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
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const cell = this.getCurrentCell();
        if (!cell) return;
        const cellText = measureTextWidth(cell.text);
        const xy = this.getXYOfSelection();
        if (!xy) return;
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
      key: "<Space>eacb",
      desc: "[E]ditor [a]add [c]ell [b]elow",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.addCellInColAndShiftDown();
      },
    },
    {
      key: "<Space>ecar",
      desc: "[E]ditor [c]olumn [a]dd [r]ight",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.addColRight();
      },
    },
    {
      key: "<Space>ecal",
      desc: "[E]ditor [c]olumn [a]dd [l]eft",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.addColLeft();
      },
    },
    {
      key: "<Space>ecla",
      desc: "[E]ditor [Cl]ear [A]ll",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.contentMap = [];
        this.contentMapForView = {};
        this.getActiveSheet().content = [];
      },
    },
    {
      // jjj
      key: "<Shift>J",
      desc: "Join current cell with cell below",
      context: [VIM_ID_MAP.gridNavigation],
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
        const update = this.setCurrentCellContent(concat);
        update?.();
        this.removeCellAt(
          this.dragStartColumnIndex,
          this.dragStartRowIndex + 1,
        );
        if (!vimState?.lines) return;
        if (!vimState?.cursor) return;
        vimState.lines[vimState.cursor.line].text = concat;
        vimCore?.setVimState(vimState);
        this.updateContentMapChangedForView();
      },
    },
    {
      // ggg
      key: "gg",
      desc: "Go to top",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.setAndUpdateSingleCellSelection(0, 0);
        this.spreadsheetContainerRef.scrollTop = 0;
        this.spreadsheetContainerRef.scrollLeft = 0;
      },
    },
    {
      key: "<Shift>G",
      desc: "Go to bottom",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.setAndUpdateSingleCellSelection(0, this.rowSize - 1);
        const height = this.rowSize * CELL_HEIGHT;
        this.spreadsheetContainerRef.scrollTop = height;
        this.spreadsheetContainerRef.scrollLeft = 0;
      },
    },
    {
      key: "<Space>gar",
      desc: "[G]rid [A]dd [R]ow",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.addRowAtBottom();
      },
    },
    {
      key: "i",
      command: VIM_COMMAND.enterInsertMode,
      desc: "Put cell into edit",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.putCellIntoEdit();
        return true;
      },
    },
    {
      key: "m",
      desc: "Enter [M]ove mode",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.vimInit.executeCommand(VIM_COMMAND.enterCustomMode, "");
        this.mode = "Move";
      },
    },
    {
      key: "o",
      desc: "Insert one row below",
      context: [VIM_ID_MAP.gridNavigation],
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
      context: [VIM_ID_MAP.gridNavigation],
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
      desc: "Cut current cell",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const text = this.getCurrentCell()?.text ?? "";
        this.lastCellContentArray = [[text]];
        setClipboardContent(text);
        this.clearCurrentCellContent();
      },
    },
    {
      key: "yiw",
      desc: "yank cell",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        console.log("yiw");
        const { autopasteIntoRow } = featureFlags.copy;
        const autopaste =
          autopasteIntoRow.enabled && autopasteIntoRow.method.includes("yank");
        if (autopaste) {
          const text = this.getCurrentCell()?.text;
          if (!text) return;
          const col = featureFlags.copy.autopasteIntoRow.col;
          const isCellEmpty = this.isCellEmpty(col);
          if (isCellEmpty) {
            const update = this.setCurrentCellContent(text, col);
            update?.();
            return;
          }
          this.addCellBelowAndMaybeNewRow(text, col);
          return true;
        }
      },
    },
    {
      key: "zt",
      desc: "Scroll to top",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const col = this.dragStartColumnIndex;
        const row = this.dragStartRowIndex;
        const rect = this.getXYOfSelection(col, row);
        if (!rect) return;
        const { top, height } = rect;
        const norm = this.getNormalizedContainerDimension();
        if (!norm) return;
        const { height: normContainerHeight } = norm;
        const topPart = normContainerHeight / 5;

        const scrollDiff = topPart - top - height * 1.5;
        this.spreadsheetContainerRef.scrollTop -= scrollDiff;
      },
    },
    {
      key: "zz",
      desc: "Scroll to middle",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.scrollToMiddle();
      },
      preventUndoRedo: true,
    },
    {
      key: "zc",
      desc: "Scroll to [C]enter",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.scrollSelectdeIntoView();
      },
      preventUndoRedo: true,
    },
    {
      key: "zb",
      desc: "Scroll to [b]ottom",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const col = this.dragStartColumnIndex;
        const row = this.dragStartRowIndex;
        const rect = this.getXYOfSelection(col, row);
        if (!rect) return;
        const { top, height } = rect;
        const norm = this.getNormalizedContainerDimension();
        if (!norm) return;
        const { height: normContainerHeight } = norm;
        const topPart = normContainerHeight * 0.95;

        const scrollDiff = topPart - top - height * 1.5;
        this.spreadsheetContainerRef.scrollTop -= scrollDiff;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Shift>><Shift>>",
      desc: "Move cell right",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        console.log("indent right >>");
        this.addCellEmptyInRowAt(0);
        this.updateContentMapChangedForView();
      },
    },
    {
      key: "<Shift><<Shift><",
      desc: "Move cell left",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const content = this.getCurrentCell(0)?.text ?? "";
        if (content) return;
        this.removeCellAt(0);
      },
    },
    {
      key: "<Space>pn",
      desc: "[P]anel [N]ext",
      context: [VIM_ID_MAP.gridNavigation],
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
      key: "<Space>sh",
      desc: "[S]croll left",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.spreadsheetContainerRef.scrollLeft -= this.CELL_WIDTH;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Space>sl",
      desc: "[S]croll right",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.spreadsheetContainerRef.scrollLeft += this.CELL_WIDTH;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Space>su",
      desc: "[S]croll down",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.spreadsheetContainerRef.scrollTop += this.CELL_HEIGHT;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Space>sk",
      desc: "[S]croll up",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        this.spreadsheetContainerRef.scrollTop -= this.CELL_HEIGHT;
      },
      preventUndoRedo: true,
    },
    {
      key: "<Enter>",
      desc: "Enter Normal mode",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const cell = this.getCurrentCell();
        if (!cell) return;

        if (CellKindConfigService.isHTML(cell)) {
          CellKindConfigService.action(cell);
          return;
        }

        this.putCellIntoEdit();
        return true;
      },
      preventUndoRedo: true,
    },
    {
      desc: "Copy link",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        console.log("copy link");
        const cell = this.getCurrentCell();
        if (!cell) return;
        /*prettier-ignore*/ console.log("[grid-test-page.ts,1146] cell: ", cell);
        const httpsRegex = /https?:\/\/[^\s]+/g;
        const cellText = cell.text;
        let match = cellText.match(httpsRegex)?.[0];
        if (match?.endsWith(")")) match = match.slice(0, -1); // ")" from markdown links with text syntax [](http://...)
        if (match?.endsWith(").")) match = match.slice(0, -2); // ")" from markdown links with text syntax [](http://...)
        if (!match) return;
        setClipboardContent(match);
        return true;
      },
      preventUndoRedo: true,
    },
    {
      desc: "Delete new lines in column",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const colData = this.getCurrentColumnData();
        const withoutEmpty = colData.filter((a) => a);
        this.clearColumn();
        this.setColumn(withoutEmpty);

        return true;
      },
      preventUndoRedo: true,
    },
    {
      desc: "Get current time",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const time = this.store.audioTime;
        if (!time) return;
        const update = this.setCurrentCellContent(time.toString());
        update?.();
      },
      preventUndoRedo: true,
    },
  ];
  private mappingByVisualMode: VimCommand[] = [
    {
      command: VIM_COMMAND.cursorRight,
      desc: "expand selection right",
      context: [VIM_ID_MAP.gridNavigation],
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
      desc: "expand selection left",
      context: [VIM_ID_MAP.gridNavigation],
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
      desc: "expand selection up",
      context: [VIM_ID_MAP.gridNavigation],
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
      desc: "expand selection down",
      context: [VIM_ID_MAP.gridNavigation],
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
      desc: "visualDelete",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const collectDeleted: string[][] = [];
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
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const collectToCopy: string[][] = [];
        const [start, end] = this.getSelectedArea();
        iterateOverRange(start, end, (col, row) => {
          if (!collectToCopy[row]) {
            collectToCopy[row] = [];
          }
          const text = this.getCurrentCell(col, row)?.text ?? "";
          collectToCopy[row].push(text);
        });
          /*prettier-ignore*/ console.log("[grid-test-page.ts,1377] collectToCopy: ", collectToCopy);
        const filtered = collectToCopy.filter((a) => a);
        let asString = JSON.stringify(filtered);
        if (featureFlags.copy.copyRowRaw) {
          asString = filtered.flatMap((a) => a).join("\n");
        }
        setClipboardContent(asString);
        this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
        this.setAndUpdateSingleCellSelection();
        if (featureFlags.llm.printPrompts) {
          const translatePrompt =
            "Translate the following words from vietnamese to english. Note, the empty strings. Please also include those in your answer.";
          const words = JSON.stringify(collectToCopy.flat(), null);
          const out = `\n\n${translatePrompt}\n${words}\n\n`;
          /*prettier-ignore*/ console.log("[grid-test-page.ts,1101] out: ", out);
        }
      },
    },
    {
      command: VIM_COMMAND.enterVisualMode,
      desc: "enterVisualMode",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        /*prettier-ignore*/ console.log("[grid-test-page.ts,161] enterVisualMode: ");
      },
      preventUndoRedo: true,
    },
    {
      command: VIM_COMMAND.yank,
      desc: "yank",
      context: [VIM_ID_MAP.gridNavigation],
      execute: () => {
        const collectDeleted: string[][] = [];
        this.iterateOverCol(
          (col, row) => {
            collectDeleted.push([this.getCurrentCell(col, row)?.text ?? ""]);
          },
          {
            startRow: this.dragStartRowIndex,
            endRow: this.dragEndRowIndex,
          },
        );
        this.lastCellContentArray = collectDeleted;
        /*prettier-ignore*/ console.log("[grid-test-page.ts,1248] this.lastCellContentArray: ", this.lastCellContentArray);
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
      desc: "jumpPreviousBlock",
      context: [VIM_ID_MAP.gridNavigation],
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
        if (!result?.cursor) return;
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
      desc: "jumpNextBlock",
      context: [VIM_ID_MAP.gridNavigation],
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
        if (!result?.cursor) return;
        const nextEmptyRow = result.cursor.line;
        this.unselectAllSelecedCells();
        this.dragEndRowIndex = nextEmptyRow - 1;
        this.updateAllSelecedCells();
        this.spreadsheetContainerRef.scrollTop =
          (nextEmptyRow - 5) * CELL_HEIGHT;
      },
      preventUndoRedo: true,
    },
    //{
    //  key: "<Space>pa",
    //  desc: "[P]anel [A]dd",
    //  execute: () => {
    //    console.log("space pa");
    //    this.addPanel();
    //    this.unselectAllSelecedCells();
    //    this.dragEndColumnIndex = this.dragStartColumnIndex;
    //    this.dragEndRowIndex = this.dragStartRowIndex;
    //    this.updateAllSelecedCells();
    //    this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
    //  },
    //},
    //{
    //  key: "<Enter>",
    //  execute: () => {
    //    // Add new panel
    //    const newPanel = this.addPanel();
    //    this.unselectAllSelecedCells();
    //    this.dragEndColumnIndex = this.dragStartColumnIndex;
    //    this.dragEndRowIndex = this.dragStartRowIndex;
    //    this.updateAllSelecedCells();
    //    this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
    //
    //    // Focus new panel
    //    this.activePanelElement = document.querySelector(
    //      `[data-panel-id="${newPanel.id}"] textarea`,
    //    ) as HTMLElement;
    //    this.activePanelElement?.focus();
    //    return true;
    //  },
    //},
  ];
  private mappingByCustomMode: VimCommand[] = [
    {
      command: VIM_COMMAND.cursorUp,
      desc: "cursorUp",
      context: ["Grid:Custom"],
      execute: () => {
        const { scrollAmount } = featureFlags.grid.cursor.cell;
        this.cursorUp(scrollAmount);
      },
      preventUndoRedo: true,
    },

    {
      command: VIM_COMMAND.cursorDown,
      desc: "cursorDown",
      context: ["Grid:Custom"],
      execute: () => {
        const { scrollAmount } = featureFlags.grid.cursor.cell;
        this.cursorDown(scrollAmount);
      },
      preventUndoRedo: true,
    },

    //{
    //  command: VIM_COMMAND.cursorRight,
    //  execute: () => {
    //    const panel = this.getPanelUnderCursor();
    //    panel.col += 1;
    //    this.setCursorAtPanel(panel);
    //  },
    //  preventUndoRedo: true,
    //},
    //{
    //  command: VIM_COMMAND.cursorLeft,
    //  execute: () => {
    //    const panel = this.getPanelUnderCursor();
    //    panel.col -= 1;
    //    this.setCursorAtPanel(panel);
    //  },
    //  preventUndoRedo: true,
    //},
    //{
    //  command: VIM_COMMAND.cursorUp,
    //  execute: () => {
    //    const panel = this.getPanelUnderCursor();
    //    panel.row -= 1;
    //    this.setCursorAtPanel(panel);
    //  },
    //  preventUndoRedo: true,
    //},
    //{
    //  command: VIM_COMMAND.cursorDown,
    //  execute: () => {
    //    const panel = this.getPanelUnderCursor();
    //    panel.row += 1;
    //    this.setCursorAtPanel(panel);
    //  },
    //  preventUndoRedo: true,
    //},
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
        context: [VIM_ID_MAP.gridNavigation],
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

  private get nextCol(): number {
    return this.dragStartColumnIndex + 1;
  }

  private get nextRow(): number {
    const next = this.dragStartRowIndex + 1;
    return next;
  }

  private get prevCol(): number {
    const prev = this.dragStartColumnIndex - 1;
    return prev;
  }

  private get prevRow(): number {
    const prev = this.dragStartRowIndex - 1;
    return prev;
  }

  activeSheetIdChanged(_: string, before: string) {
    if (!before) return;
    if (!this.activeSheetId) return;
    this.sheetsData.selectedSheetId = this.activeSheetId;
    this.updateContentMap(this.sheetsData, this.activeSheetId);
  }

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
    private vimInit: VimInit = resolve(VimInit),
    private store: Store = resolve(Store),
    private vimInputHandlerV2: IVimInputHandlerV2 = resolve(IVimInputHandlerV2),
    private commandsService: ICommandsService = resolve(ICommandsService),
    private completionsService = resolve(CompletionsService),
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

    this.autosave();
  }

  attached() {
    /*prettier-ignore*/ if(l.shouldLog([, 1])) console.log("[VimUi.ts,329] getTextFromHtml: ", );

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

    if (debugFlags.grid.scroll.scrollIntoView) this.scrollSelectdeIntoView();
    if (debugFlags.grid.scroll.scrollTop)
      this.spreadsheetContainerRef.scrollTop = 0;
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

  public updatePanelCoords = (
    panel: GridPanel,
  ): ((a: number, b: number) => void) => {
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

  public onTextareaWidthChanged(panel: GridPanel): (a: number) => void {
    return (newWidth) => {
      const adjustedWidth = Math.floor(newWidth / CELL_WIDTH);
      panel.width = adjustedWidth;
    };
  }

  public onTextareaHeightChanged(panel: GridPanel): (a: number) => void {
    return (newHeight) => {
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

  public onEnterPressedInCell = (): void => {
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

  public selectColumn(col: number, event: Event): void {
    const prevent = (event.target as HTMLElement)?.dataset.preventClick;
    if (prevent) return;
    this.vimInit.executeCommand(VIM_COMMAND.enterVisualMode, "");
    this.setSelectionFromRange([
      [col, 0],
      [col, this.rowSize - 1],
    ]);
  }

  private getColHeaderMap(col: number): ColHeaderMapData {
    const sheet = this.activeSheet;
    if (!sheet?.colHeaderMap?.[col]) {
      sheet.colHeaderMap = {
        ...sheet.colHeaderMap,
        [col]: { colWidth: this.CELL_WIDTH },
      };
    }

    return sheet.colHeaderMap[col];
  }

  private getRowHeaderMap(row: number): RowHeaderMapData {
    const sheet = this.activeSheet;
    if (!sheet?.rowHeaderMap?.[row]) {
      sheet.rowHeaderMap = {
        ...sheet.rowHeaderMap,
        [row]: { height: this.CELL_HEIGHT },
      };
    }

    return sheet.rowHeaderMap[row];
  }

  public autoAdjustWidth(col: number): void {
    // /*prettier-ignore*/ console.log("----------------------------");
    // const currentWidth = this.getColHeaderMap(col).colWidth;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,1881] currentWidth: ", currentWidth);

    const colData = this.getCurrentColumnData(col);
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,1884] colData: ", colData);
    const longest = ArrayUtils.getLongestElement(colData);
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,1885] longest: ", longest);
    const longestWidth = measureTextWidth(longest);
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,1886] longestWidth: ", longestWidth);

    const map = this.getColHeaderMap(col);
    const adjusted = longestWidth + PADDING * 2;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,1888] adjusted: ", adjusted);
    map.colWidth = adjusted;
  }

  public makeSticky(row: number): void {
    const map = this.getRowHeaderMap(row);
    if (!map) return;
    map.isSticky = !map.isSticky;
  }

  public undo = (): void => {
    this.getCommand(VIM_COMMAND.undo)?.execute?.();
  };

  public redo = (): void => {
    this.getCommand(VIM_COMMAND.redo)?.execute?.();
  };

  public onCellUpdate = (col: number, row: number, cell: Cell): void => {
    if (!this.contentMap) return;
    cell = addMarkdownStylingToCell(cell);
    // /*prettier-ignore*/ console.log("C.1 [grid-test-page.ts,1713] cell.text: ", col, row,cell.text);
    this.setCurrentCell(cell, col, row);
    this.onCellContentChangedInternal(col, row);
    this.updateContentMapChangedForView();
  };

  public save(): void {
    this.getActiveSheet().selectedRange = this.getSelectedArea();
    gridDatabase.setItem(this.sheetsData);
  }

  public onUpload = (result: string) => {
    const asObj = JSON.parse(result);
    this.initSheets(asObj);
  };

  public onHtmlCellChange = (
    cell: Cell,
    kind: CellKindConfigElementType,
    payload: any,
  ): void => {
    ///*prettier-ignore*/ this.setCurrentCellContent( payload.time?.toString(), cell.col, cell.row + 1, { skipUpdate: true },);
    ///*prettier-ignore*/ this.setCurrentCellContent( payload.time?.toString(), cell.col + 1, cell.row + 1, { skipUpdate: true },);
    ///*prettier-ignore*/ this.setCurrentCellContent( payload.time?.toString(), cell.col + 1, cell.row + 2, { skipUpdate: true },);
    ///*prettier-ignore*/ this.setCurrentCellContent( payload.time?.toString(), cell.col + 2, cell.row + 2, { skipUpdate: true },);
    ///*prettier-ignore*/ this.setCurrentCellContent( payload.time?.toString(), cell.col + 2, cell.row + 3, { skipUpdate: true },);
    ///*prettier-ignore*/ this.setCurrentCellContent( payload.time?.toString(), cell.col + 3, cell.row + 3, { skipUpdate: true },);
    ///*prettier-ignore*/ const update = this.setCurrentCellContent( payload.time?.toString(), cell.col, cell.row + 2,);
    //update?.();
    //this.updateContentMapChangedForView();
  };

  public changeActiveId(id: string) {
    /*prettier-ignore*/ console.log("[grid-cell.ts,436] id: ", id);
    this.vimInputHandlerV2.moveIdToLatest(id);
  }

  // pri. private.

  private initSheets(sheetsData: GridDatabaseType): void {
    let updatedSheetData = runGridMigrations(sheetsData);
    updatedSheetData = checkCellOverflow(updatedSheetData);
    this.sheetsData = updatedSheetData;
    this.sheetTabs = updatedSheetData.sheets.map((sheet) => ({
      id: sheet.id,
      name: sheet.title,
    }));

    const sheetId = updatedSheetData.selectedSheetId;
    if (!sheetId) return;
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
    let activeSheet = sheetsData.sheets[activeIndex];
    if (!activeSheet) return;
    // activeSheet = addMarkdownStyling(activeSheet);
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
    const converted: Record<string, Cell> = {};
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
    if (autopasteIntoRow.enabled && autopasteIntoRow.method.includes("copy")) {
      this.spreadsheetContainerRef.addEventListener("copy", () => {
        console.log("bruh");
        const selection = document.getSelection();
        const text = selection?.toString();
        if (!text) return;
        const col = featureFlags.copy.autopasteIntoRow.col;
        const isCellEmpty = this.isCellEmpty(col);
        /*prettier-ignore*/ console.log("[grid-test-page.ts,1554] isCellEmpty: ", isCellEmpty);
        if (isCellEmpty) {
          const update = this.setCurrentCellContent(text, col);
          update?.();
          return;
        }
        this.addCellBelowAndMaybeNewRow(text, col);

        //let nextEmptyCol = col;
        //while (this.getCurrentCell(nextEmptyCol)?.text) {
        //  nextEmptyCol++;
        //}
        //this.setCurrentCellContent(text, nextEmptyCol);
      });
    }

    this.spreadsheetContainerRef.addEventListener("click", () => {
      // this.vimInputHandlerV2.setActiveId(VIM_ID_MAP.gridNavigation);
    });
  }

  private getActiveSheet(): Sheet {
    const sheetId = this.sheetsData.selectedSheetId;
    const activeIndex = this.sheetTabs.findIndex(
      (sheet) => sheet.id === sheetId,
    );
    const finalIndex = Math.max(0, activeIndex);
    return this.sheetsData.sheets[finalIndex];
  }

  private isCursorInsidePanel(panel: GridPanel): boolean {
    const { col, row, width, height } = panel;
    if (!width) return false;
    if (!height) return false;
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
    // const vimState = convertGridToVimState(
    if (!this.activeSheet.selectedRange) return;
    const vimState = convertRangeToVimState(
      this.contentMap,
      this.activeSheet.selectedRange,
    );
    window.activeVimInstancesIdMap.push(vimState.id);

    this.vimEditorHooks = {
      modeChanged: (payload) => {
        if (!payload?.vimState?.mode) return;
        this.mode = payload.vimState.mode;
      },
      commandListener: (result) => {
        window.setTimeout(() => {
          if (!this.contentMap) return;
          if (
            result.targetCommand === VIM_COMMAND.redo ||
            result.targetCommand === VIM_COMMAND.undo
          ) {
            return;
          }
          if (!result.targetCommandFull?.preventUndoRedo) {
            this.gridUndoRedo.setState(structuredClone(this.contentMap));
            return;
          }
        }, 0);
      },
      onInsertInput: (...args) => {},
    };
    const vimOptions: VimOptions = {
      container: this.gridTestContainerRef,
      vimId: vimState.id,
      vimState,
      allowChaining: false,
      allowExtendedChaining: false,
      hooks: this.vimEditorHooks,
    };
    // console.log("1.");
    this.vimInputHandlerV2.registerAndInit(vimOptions); // 1. init vimCore
    this.vimInit.init(vimOptions); // 2. need vimCore
    this.commandsService.registerCommands(vimOptions.vimId, this.mappingByMode);
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

  private getPreviousCellCoords(
    col: number = this.dragStartColumnIndex,
    row: number = this.dragStartRowIndex,
  ): GridSelectionCoord {
    let prevCol = col - 1;
    let prevRow = row;
    if (prevCol === -1) {
      prevCol = this.colSize - 1;
      prevRow = prevRow - 1;
    }

    return [prevCol, prevRow];
  }

  private getNextCellCoords(
    col: number = this.dragStartColumnIndex,
    row: number = this.dragStartRowIndex,
  ): GridSelectionCoord {
    let nextCol = col + 1;
    let nextRow = row;
    if (nextCol === this.colSize) {
      nextCol = 0;
      nextRow = nextRow + 1;
    }

    return [nextCol, nextRow];
  }

  public getNextCell(
    col: number = this.dragStartColumnIndex,
    row: number = this.dragStartRowIndex,
  ): Cell | undefined {
    const [nextCol, nextRow] = this.getNextCellCoords(col, row);
    return this.getCurrentCell(nextCol, nextRow);
  }

  public getCurrentCell(
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
  ): Cell | undefined {
    const cell = this.contentMap[row]?.[col];
    return cell;
  }

  private getOrCreateCell(
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
  ): Cell | undefined {
    const cell = this.contentMap[row]?.[col];
    if (!cell) {
      const created = this.createCell();
      return created;
    }
    return cell;
  }

  private createCell(
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
  ): Cell {
    if (this.contentMap[row] == null) {
      this.contentMap[row] = [];
    }
    const cell: Cell = {
      text: "hi",
      kind: CellKind.HTML,
    };
    this.contentMap[row][col] = cell;
    this.onCellContentChangedInternal(col, row);

    this.updateContentMapChangedForView();
    return cell;
  }

  private setCurrentCell(
    cell: Cell,
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
    option?: { skipUpdate: boolean },
  ) {
    if (this.contentMap[row] == null) {
      this.contentMap[row] = [];
    }
    this.contentMap[row][col] = cell;
    this.onCellContentChangedInternal(col, row);

    if (option?.skipUpdate) return;
    this.updateContentMapChangedForView();
  }

  private setCurrentCellContent(
    content: string | undefined,
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
    option?: { skipUpdate: boolean },
  ) {
    let updateCalled = false;
    if (this.contentMap[row] == null) {
      this.contentMap[row] = [];
    }
    this.contentMap[row][col] = { text: content } as Cell;
    this.onCellContentChangedInternal(col, row);

    if (option?.skipUpdate) return;
    //this.updateContentMapChangedForView();

    window.setTimeout(() => {
      if (updateCalled) return;
      /*prettier-ignore*/ console.error( `Need to call update when setting: ${content} at [${col}, ${row}].\n "setCurrentCellContent" is returning an update function, that should be called `, updateCalled,);
    });

    return () => {
      updateCalled = true;
      this.updateContentMapChangedForView();
    };
  }

  private addColAt(colIndex: number): void {
    this.contentMap.forEach((_, rowIndex) => {
      this.addCellEmptyInRowAt(colIndex, rowIndex);
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
    this.colSize += 1;
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

  private addRowAtBottom(): void {
    /*prettier-ignore*/ console.log("[grid-test-page.ts,2144] this.contentMap: ", this.contentMap);
    const last = this.contentMap.length;
    /*prettier-ignore*/ console.log("[grid-test-page.ts,2144] last: ", last);
    this.contentMap.splice(last, 0, []);
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

  private addCellEmptyInRowAt(
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
  ) {
    if (this.contentMap[row] == null) {
      this.contentMap[row] = [];
    }
    this.contentMap[row].splice(col, 0, undefined as unknown as Cell);
  }

  private addCellInRowAt(
    content: string,
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
    option?: { skipUpdate: boolean },
  ) {
    if (this.contentMap[row] == null) {
      this.contentMap[row] = [];
    }
    this.contentMap[row].splice(col, 0, undefined as unknown as Cell);
    const update = this.setCurrentCellContent(content, col, row, option);
    update?.();
  }

  private addCellInColAndShiftDown(): void {
    const startRow = this.dragStartRowIndex + 1;
    let beforeValue = "";
    this.iterateOverCol(
      (col, row) => {
        const currentText = this.getCurrentCell(col, row)?.text;
        if (!currentText) return;
        this.setCurrentCellContent(beforeValue, col, row, {
          skipUpdate: true,
        });

        beforeValue = currentText;
      },
      { startRow },
    );
    this.updateContentMapChangedForView();
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
    const update = this.setCurrentCellContent(undefined, col, row, option);
    update?.();
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

  private setActivePanel(panel: GridPanel | undefined): void {
    if (!panel) return;
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
    options: GridIteratorOptionsWithDefaults = defaultGridIteratorOptions,
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
    options: GridIteratorOptionsWithDefaults = defaultGridIteratorOptions,
  ) {
    iterateOverGrid(
      [options.startCol, options.startRow],
      [this.colSize - 1, this.rowSize - 1],
      (columnIndex, rowIndex) => {
        const content = this.getCurrentCell(columnIndex, rowIndex)?.text ?? "";
        callback(columnIndex, rowIndex, {
          content,
          set: (newContent: string) =>
            this.setCurrentCellContent(newContent, columnIndex, rowIndex, {
              skipUpdate: true,
            }),
        });
      },
      options,
    );
    this.updateContentMapChangedForView();
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

  private iterateOverRangeEnhanced(
    start: GridSelectionCoord,
    end: GridSelectionCoord,
    callback: (
      columnIndex: number,
      rowIndex: number,
      options: { content: string; set: Function },
    ) => void,
    options?: GridIteratorOptions,
  ) {
    iterateOverRange(
      start,
      end,
      (columnIndex, rowIndex) => {
        const content = this.getCurrentCell(columnIndex, rowIndex)?.text ?? "";
        callback(columnIndex, rowIndex, {
          content,
          set: (newContent: string) =>
            this.setCurrentCellContent(newContent, columnIndex, rowIndex, {
              skipUpdate: true,
            }),
        });
      },
      options,
    );
    this.updateContentMapChangedForView();
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

    const { scrollOffset } = featureFlags.grid.cursor.cell;
    const THRESHOLD_VALUE = scrollOffset * delta;
    const SCROLL_UP_THRESHOLD_ADJUST = 20;
    // bottom = right, up = left

    const bottomThreshold = containerRect.bottom - THRESHOLD_VALUE;
    const shouldScrollDown = relCursorBottom > bottomThreshold;
    const topThreshold =
      containerRect.top + THRESHOLD_VALUE + SCROLL_UP_THRESHOLD_ADJUST;
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
    let previousCellInRowCol: number = NaN;
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
      if (nextColInRow != null) {
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

      if (previousCellInRow && nextColInRow != null) {
        previousCellInRow.colsToNextText = nextColInRow - previousCellInRowCol;
      }
    }
  }

  private getCommand(
    command: VIM_COMMAND,
    mode = VimMode.NORMAL,
  ): VimCommand | undefined {
    const target = this.mappingByMode[mode]?.find((c) => c.command === command);
    return target;
  }

  private putCellIntoUnfocus(): void {
    this.editedCellCoords = "";
    (document.activeElement as HTMLElement).blur();
    // this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
    this.vimInputHandlerV2.popId();
  }

  private putCellIntoEdit(): void {
    // /*prettier-ignore*/ console.log("1. [grid-test-page.ts,2618] putCellIntoEdit: ");
    const cell = this.getCurrentCell();
    if (cell?.kind === CellKind.HTML) return;
    if (!cell) {
      const update = this.setCurrentCellContent("");
      update?.();
    }

    this.editedCellCoords = this.CELL_COORDS(
      this.dragStartColumnIndex,
      this.dragStartRowIndex,
    );
    this.vimInputHandlerV2.setActiveId(VIM_ID_MAP.vimEditorVtwo);
  }

  private getScrollLeftOfCurrentSelection(): number {
    const scrollLeft = this.spreadsheetContainerRef.scrollLeft;
    const rowHeaderElement = document.querySelector<HTMLElement>(
      ".column-header-corner",
    );
    if (!rowHeaderElement) return NaN;
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
    if (!colHeaderElement) return;
    const width = getComputedValueFromPixelString(colHeaderElement, "width");
    this.spreadsheetContainerRef.scrollLeft -= width;
  }

  private getSpreadSsheetContainer(): HTMLElement | null {
    return document.querySelector(".spreadsheet-container");
  }

  private getNormalizedContainerDimension() {
    const $container = this.getSpreadSsheetContainer();
    if (!$container) return;
    const containerRect = $container.getBoundingClientRect();
    const rect = document
      .querySelector<HTMLElement>(".column-header-corner")
      ?.getBoundingClientRect();
    if (!rect) return;
    const { width, height } = rect;
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
  ): CellRect | undefined {
    const $container = this.getSpreadSsheetContainer();
    if (!$container) return;
    const containerRect = $container.getBoundingClientRect();
    const $colHeader = document.querySelector(`[data-col-index='${col}']`);
    if (!$colHeader) return;
    const colHeaderRect = $colHeader.getBoundingClientRect();
    const rect = document
      .querySelector<HTMLElement>(".column-header-corner")
      ?.getBoundingClientRect();
    if (!rect) return;
    const { width, height } = rect;
    let normalizedLeft = colHeaderRect.left - containerRect.left - width;
    if (direction === "right") {
      normalizedLeft += $container.scrollLeft;
    }
    const $rowHeader = document.querySelector(`[data-row-index='${row}']`);
    if (!$rowHeader) return;
    const rowHeaderRect = $rowHeader.getBoundingClientRect();
    let normalizedTop = rowHeaderRect.top - containerRect.top - height;
    if (direction === "down") {
      normalizedTop += $container.scrollTop;
    }
    const cellRect: CellRect = {
      top: normalizedTop,
      y: normalizedTop,
      bottom: normalizedTop + rowHeaderRect.height,
      left: normalizedLeft,
      x: normalizedLeft,
      right: normalizedLeft + colHeaderRect.width,
      width: colHeaderRect.width,
      height: rowHeaderRect.height,
    };
    return cellRect;
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
            this.activeSheet.colHeaderMap?.[c]?.colWidth ?? this.CELL_WIDTH;
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
    this.iterateOverRowFromCurrent((c) => {
      widthTracker -=
        this.activeSheet.colHeaderMap?.[c]?.colWidth ?? this.CELL_WIDTH;
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
    if (!result) return;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2126] result: ", result);
    const { top } = result;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2125] top: ", top);
    const $container = this.getSpreadSsheetContainer();
    if (!$container) return;
    const topBorder = $container.scrollTop;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2111] topBorder: ", topBorder);
    const norm = this.getNormalizedContainerDimension();
    if (!norm) return;
    const bottomBorder = topBorder + norm.height;
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
    if (!result) return;
    const { bottom } = result;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2138] bottom: ", bottom);
    const $container = this.getSpreadSsheetContainer();
    const norm = this.getNormalizedContainerDimension();
    if (!norm) return;
    const { height: containerHeight } = norm;
    // /*prettier-ignore*/ console.log("[grid-test-page.ts,2141] containerHeight: ", containerHeight);
    if (!$container) return;
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
    const xy = this.getXYOfSelection(col, row, "right");
    if (!xy) return;
    const { left } = xy;
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2108] left: ", left);
    const $container = this.getSpreadSsheetContainer();
    if (!$container) return;
    const leftBorder = $container.scrollLeft;
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2111] leftBorder: ", leftBorder);
    const norm = this.getNormalizedContainerDimension();
    if (!norm) return;
    const rightBorder = leftBorder + norm.width;
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
    if (!result) return;
    // // /*prettier-ignore*/ console.log("[grid-test-page.ts,2078] result: ", result);
    const { left } = result;
    const $container = this.getSpreadSsheetContainer();
    if (!$container) return;
    const norm = this.getNormalizedContainerDimension();
    if (!norm) return;
    const { width: containerWidth } = norm;
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

  private cursorUp(scrollAmount: number) {
    this.unselectAllSelecedCells();
    let next = this.dragStartRowIndex - scrollAmount;

    // 1. Add new row above
    if (next < 0 && featureFlags.mode.autoExpandGrid) {
      this.addRowAbove();
      this.dragStartRowIndex = 0;
      this.dragEndRowIndex = 0;
      this.updateAllSelecedCells();
      this.updateContentMapChangedForView();
      this.scrollEditor("up", scrollAmount);
      return;
    } else {
      next = Math.max(0, next);
    }

    // 2. Move normally
    this.dragStartRowIndex = next;
    this.dragEndRowIndex = next;
    this.updateAllSelecedCells();
    if (this.dragStartRowIndex === this.rowSize - 1) {
      this.spreadsheetContainerRef.scrollTop =
        this.rowSize * (CELL_HEIGHT * scrollAmount);
    } else {
      this.scrollEditor("up", scrollAmount);
    }
  }

  private cursorDown(scrollAmount: number) {
    this.unselectAllSelecedCells();
    let next = this.dragStartRowIndex + scrollAmount;
    const mostBottom = this.rowSize;
    if (next >= mostBottom && featureFlags.mode.autoExpandGrid) {
      this.addRowBelow();
      this.dragStartRowIndex = mostBottom;
      this.dragEndRowIndex = mostBottom;
      this.updateAllSelecedCells();
      this.updateContentMapChangedForView();
      this.scrollEditor("down", scrollAmount);
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
      this.scrollEditor("down", scrollAmount);
    }
  }

  private scrollToMiddle() {
    const col = this.dragStartColumnIndex;
    const row = this.dragStartRowIndex;
    const rect = this.getXYOfSelection(col, row);
    if (!rect) return;
    const { top, height } = rect;
    const norm = this.getNormalizedContainerDimension();
    if (!norm) return;
    const { height: normContainerHeight } = norm;
    const center = normContainerHeight / 2;

    const scrollDiff = center - top - height * 1.5;
    this.spreadsheetContainerRef.scrollTop -= scrollDiff;
  }

  private clearColumn(col = this.dragEndColumnIndex): void {
    const startCol = col;
    const startRow = 0;
    const endCol = startCol;
    const endRow = this.contentMap?.length - 1;
    iterateOverRangeBackwards(
      [startCol, startRow],
      [endCol, endRow],
      (col, row) => {
        this.setCurrentCellContent(undefined, col, row, {
          skipUpdate: true,
        });
      },
    );
    this.updateContentMapChangedForView();
  }

  private setColumn(
    data: string[] | string[][],
    col = this.dragStartColumnIndex,
  ): void {
    const twoDimData = ArrayUtils.ensureTwoDimArray<string>(data);
    const startCol = col;
    const startRow = 0;
    const endCol = startCol + twoDimData[0]?.length - 1;
    const endRow = twoDimData.length - 1;
    iterateOverRangeBackwards(
      [startCol, startRow],
      [endCol, endRow],
      (col, row) => {
        const rowIndex = row - startRow;
        const colIdnex = col - startCol;
        const content = twoDimData[rowIndex][colIdnex];
        if (content) {
          this.setCurrentCellContent(content, col, row, {
            skipUpdate: true,
          });
        }
      },
    );
    this.updateContentMapChangedForView();
  }

  private getCurrentColumnData(
    givenCol: number = this.dragStartColumnIndex,
  ): string[] {
    const colData: string[] = [];
    this.iterateOverCol(
      (col, row) => {
        const cell = this.getCurrentCell(col, row);
        if (!cell) return;
        const text = cell.text;
        colData.push(text);
      },
      { startCol: givenCol },
    );
    return colData;
  }
}
