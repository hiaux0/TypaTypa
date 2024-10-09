import { observable, resolve } from "aurelia";
import "./grid-test-page.scss";
import { EV_CELL_SELECTED } from "../../../common/modules/eventMessages";
import {
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
  VimMode,
  VimOptions,
} from "../../../features/vim/vim-types";
import { VIM_COMMAND } from "../../../features/vim/vim-commands-repository";
import { cycleInRange } from "../../../common/modules/numbers";
import { KeyMappingService } from "../../../features/vim/vimCore/commands/KeyMappingService";
import {
  findParentElement,
  getIsInputActive,
} from "../../../common/modules/htmlElements";
import { CRUDService } from "../../../common/services/CRUDService";
import { CELL_COORDS } from "../../../common/modules/constants";
import { gridDatabase } from "../../../common/modules/database/gridDatabase";
import { ITab, ITabHooks } from "../../molecules/or-tabs/or-tabs";
import { SPACE } from "../../../common/modules/keybindings/app-keys";
import { isArrowMovement } from "../../../features/vim/key-bindings";
import { downloadText } from "../../../common/modules/downloadText";
import { getComputedValueFromPixelString } from "../../../common/modules/css/css-variables";

type GridPanelTypes = "button" | "text";

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

interface GridIteratorOptions {
  startCol?: number;
  colSize?: number;
  startRow?: number;
}
const defaultGridIteratorOptions: GridIteratorOptions = {
  startCol: 0,
  startRow: 0,
};

const CELL_HEIGHT = 32;
const CELL_WIDTH = 64;

export class GridTestPage {
  public gridTestContainerRef: HTMLElement;
  public spreadsheetContainerRef: HTMLElement;
  public rowSize = 20;
  public columnSize = 20;
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
  // public contentMap: Record<string, string> = {};
  public contentMap: ContentMap = [];
  public contentMapForView: {};
  public selectedMap: Record<string, boolean> = {};
  public textareaValue = "";
  public downloadData = () => downloadText(this.sheetsData);

  public gridPanels: GridPanel[] = [];
  public START_PANEL_TOP = 32;
  public START_PANEL_LEFT = 64;
  private activePanel: GridPanel;
  private activePanelElement: HTMLElement;
  private lastGridPanel: GridPanel | undefined = undefined;
  private lastCellContent: string | undefined = undefined;

  private isStartDragGridCell = false;
  private mode: VimMode | "Move" = VimMode.NORMAL;
  private lastMode: VimMode | "Move" = VimMode.NORMAL;
  private panelCRUD: CRUDService<GridPanel>;

  public activeContent = "initial";
  public sheetTabHooks: ITabHooks;
  @observable activeSheetId = "";
  private sheetTabs: ITab[] = [];
  private sheetsData: GridDatabaseType;

  activeSheetIdChanged() {
    if (!this.activeSheetId) return;
    const activeIndex = this.sheetTabs.findIndex(
      (sheet) => sheet.id === this.activeSheetId,
    );
    this.contentMap = this.sheetsData.sheets[activeIndex].content;
    this.sheetsData.selectedSheetId = this.activeSheetId;
  }

  updateContentMapChangedForView() {
    const converted = {};
    this.contentMap.forEach((col, colIndex) => {
      col.forEach((cell, cellIndex) => {
        converted[CELL_COORDS(colIndex, cellIndex)] = cell;
      });
    });
    this.contentMapForView = converted;
  }

  public get orderedSelectedRangeToString(): string {
    const ordered = this.getSelectedArea();
    const [[startColumn, startRow], [endColumn, endRow]] = ordered;
    // const result = `${this.numberToAlphabet(startColumn)}${startRow + 1} - ${this.numberToAlphabet(endColumn)}${endRow + 1}`;
    const result = `${startColumn},${startRow}:${endColumn},${endRow}`;
    return result;
  }

  constructor(private vimInit: VimInit = resolve(VimInit)) {
    this.sheetsData = gridDatabase.getItem();
    this.sheetTabs = this.sheetsData.sheets.map((sheet) => ({
      id: sheet.id,
      name: sheet.title,
    }));
    const sheetId = this.sheetsData.selectedSheetId;
    const activeIndex = this.sheetTabs.findIndex(
      (sheet) => sheet.id === sheetId,
    );
    const activeSheet = this.sheetsData.sheets[activeIndex];
    this.contentMap = activeSheet.content;
    const selectedRange = activeSheet.selectedRange;
    //const selectedRange = [
    //  [0, 9],
    //  [0, 9],
    //];
    if (selectedRange) {
      /*prettier-ignore*/ console.log("[grid-test-page.ts,142] selectedRange: ", selectedRange);
      const [start, end] = selectedRange;
      this.dragStartColumnIndex = start[0];
      this.dragStartRowIndex = start[1];
      this.dragEndColumnIndex = end[0];
      this.dragEndRowIndex = end[1];
    }
    this.updateContentMapChangedForView();
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
    };
    /*prettier-ignore*/ console.log("[grid-test-page.ts,160] this.sheetsData: ", this.sheetsData);
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
    this.vimInit.executeCommand(VIM_COMMAND.enterVisualMode, "");
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
    // const vimInit = new VimInit();
    // this.vimInit = vimInit;

    const mappingByKey = {
      Enter: () => {
        if (this.mode === VimMode.NORMAL) return;

        if (getIsInputActive()) {
          (document.activeElement as HTMLElement).blur();
          if (this.activePanel) {
            this.activePanel.isEdit = false;
            this.setCurrentCellContent(
              this.textareaValue,
              this.activePanel.col,
              this.activePanel.row,
            );
          }
          this.activePanel = undefined;
          // this.moveSelectedCellBy(1, "y");
          //mappingByMode[VimMode.NORMAL]
          //  .find((mapping) => mapping.key === "<Enter>")
          //  .execute();
        } else {
          mappingByMode[VimMode.NORMAL]
            .find((mapping) => mapping.key === "<Enter>")
            .execute();
        }

        window.setTimeout(() => {
          //if (this.mode === VimMode.INSERT) return; // stay in insert mode
          //if (this.lastMode === VimMode.INSERT) return; // stay in insert mode
          this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
        }, 0);
      },
      Escape: () => {
        (document.activeElement as HTMLElement).blur();
        if (this.activePanel) {
          this.activePanel.isEdit = false;
        }
        this.activePanel = undefined;
      },
      Tab: () => {
        return this.setActivePanelFromHTMLElement();
      },

      "<Shift>Tab": () => {
        return this.setActivePanelFromHTMLElement();
      },
    };
    const mappingByMode: KeyBindingModes = {
      [VimMode.NORMAL]: [
        {
          key: "b",
          execute: () => {
            let nextColWithContent = NaN;
            let nextRowWithContent = NaN;
            const [prevCol, prevRow] = this.getPreviousCellCoords();

            iterateOverRangeBackwards(
              [prevCol, prevRow],
              (col, row) => {
                if (nextColWithContent) return;
                this.textareaValue;
                const content = this.getCurrentCellContent(col, row);
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
              this.setAndUpdateCells(nextColWithContent, nextRowWithContent);
            }
          },
        },
        {
          key: "cc",
          desc: "Clear cell and go into Insert",
          execute: () => {
            this.clearCurrentCellContent();
            mappingByMode[VimMode.NORMAL]
              .find((mapping) => mapping.key === "<Enter>")
              .execute();
            /*prettier-ignore*/ console.log("[grid-test-page.ts,385] this.textareaValue: ", this.textareaValue);
            return true;
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
                const content = this.getCurrentCellContent(col, row);
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
              this.setAndUpdateCells(nextColWithContent, nextRowWithContent);
            }
          },
        },
        {
          key: "gg",
          execute: () => {
            this.setAndUpdateCells(0, 0);
            this.spreadsheetContainerRef.scrollTop = 0;
          },
        },
        {
          key: "<Shift>G",
          execute: () => {
            this.setAndUpdateCells(0, this.rowSize - 1);
            const height = getComputedValueFromPixelString(
              this.spreadsheetContainerRef,
              "height",
            );
            this.spreadsheetContainerRef.scrollTop = height;
          },
        },
        {
          key: "i",
          command: VIM_COMMAND.enterInsertMode,
          execute: () => {
            mappingByMode[VimMode.NORMAL]
              .find((mapping) => mapping.key === "<Enter>")
              .execute();

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
            mappingByMode[VimMode.NORMAL]
              .find((mapping) => mapping.key === "<Enter>")
              .execute();
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
            mappingByMode[VimMode.NORMAL]
              .find((mapping) => mapping.key === "<Enter>")
              .execute();
            return true;
          },
        },
        {
          key: "<Enter>",
          desc: "Focus Panel at cursor",
          execute: () => {
            const targetPanel = this.getPanelUnderCursor();
            if (!targetPanel) {
              // Add new panel
              const newPanel = this.addPanel();
              this.activePanel = newPanel;
              newPanel.isEdit = true;
              this.textareaValue = this.getCurrentCellContent();

              this.unselectAllSelecedCells();
              this.dragEndColumnIndex = this.dragStartColumnIndex;
              this.dragEndRowIndex = this.dragStartRowIndex;
              this.updateAllSelecedCells();
              this.vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");

              // Focus new panel
              this.activePanelElement = document.querySelector(
                `[data-panel-id="${newPanel.id}"] textarea`,
              ) as HTMLElement;
              this.activePanelElement.focus();
              this.vimInit.executeCommand(VIM_COMMAND.enterInsertMode, "");
              return true;
            }

            // Focus panel
            targetPanel.isEdit = true;
            this.textareaValue = this.getCurrentCellContent(
              targetPanel.col,
              targetPanel.row,
            );

            this.activePanel = targetPanel;
            this.activePanelElement = document.querySelector(
              `[data-panel-id="${targetPanel.id}"] textarea`,
            ) as HTMLElement;
            this.activePanelElement.focus();
            this.vimInit.executeCommand(VIM_COMMAND.enterInsertMode, "");
            return true;
          },
        },
        {
          key: "<Shift>><Shift>>",
          desc: "Move cell right",
          execute: () => {
            console.log("indent right >>");
            this.addCellBeforeCurrent(0);
          },
        },
        {
          key: "<Shift><<Shift><",
          desc: "Move cell left",
          execute: () => {
            this.removeCellAtStart(0);
          },
        },
        {
          key: "<Space>pn",
          desc: "[P]anel [N]ext",
          execute: () => {
            const activePanelId =
              this.activePanel?.id ?? this.gridPanels[0]?.id;

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
      [VimMode.CUSTOM]: [],
    };
    new KeyMappingService().init(mappingByKey, mappingByMode);

    const mappingByCommandName = {
      [VimMode.NORMAL]: {
        [VIM_COMMAND.cursorLineEnd]: () => {
          this.setAndUpdateCells(this.columnSize - 1, this.dragStartRowIndex);
          this.spreadsheetContainerRef.scrollLeft =
            this.columnSize * CELL_WIDTH;
        },
        [VIM_COMMAND.cursorLineStart]: () => {
          this.setAndUpdateCells(0, this.dragStartRowIndex);
          this.spreadsheetContainerRef.scrollLeft = 0;
        },
        [VIM_COMMAND.cursorRight]: () => {
          this.unselectAllSelecedCells();
          const a = this.dragStartColumnIndex + 1;
          this.dragStartColumnIndex = cycleInRange(0, this.columnSize, a);
          const b = this.dragEndColumnIndex + 1;
          this.dragEndColumnIndex = cycleInRange(0, this.columnSize, b);
          this.updateAllSelecedCells();
          if (this.dragStartColumnIndex === 0) {
            this.spreadsheetContainerRef.scrollLeft = 0;
          } else {
            this.scrollEditor("right", 1);
          }
        },
        [VIM_COMMAND.cursorLeft]: () => {
          this.unselectAllSelecedCells();
          const a = this.dragStartColumnIndex - 1;
          this.dragStartColumnIndex = cycleInRange(0, this.columnSize, a);
          const b = this.dragEndColumnIndex - 1;
          this.dragEndColumnIndex = cycleInRange(0, this.columnSize, b);
          this.updateAllSelecedCells();
          if (this.dragStartColumnIndex === this.columnSize - 1) {
            this.spreadsheetContainerRef.scrollLeft =
              this.columnSize * CELL_WIDTH;
          } else {
            this.scrollEditor("left", 1);
          }
        },
        [VIM_COMMAND.cursorUp]: () => {
          this.unselectAllSelecedCells();
          const a = this.dragStartRowIndex - 1;
          this.dragStartRowIndex = cycleInRange(0, this.rowSize, a);
          const b = this.dragEndRowIndex - 1;
          this.dragEndRowIndex = cycleInRange(0, this.rowSize, b);
          this.updateAllSelecedCells();
          if (this.dragStartRowIndex === this.rowSize - 1) {
            this.spreadsheetContainerRef.scrollTop = this.rowSize * CELL_HEIGHT;
          } else {
            this.scrollEditor("up", 1);
          }
        },
        [VIM_COMMAND.cursorDown]: () => {
          this.unselectAllSelecedCells();
          const a = this.dragStartRowIndex + 1;
          this.dragStartRowIndex = cycleInRange(0, this.rowSize, a);
          const b = this.dragEndRowIndex + 1;
          this.dragEndRowIndex = cycleInRange(0, this.rowSize, b);
          this.updateAllSelecedCells();
          if (this.dragStartRowIndex === 0) {
            this.spreadsheetContainerRef.scrollTop = 0;
          } else {
            this.scrollEditor("down", 1);
          }
        },
        [VIM_COMMAND.delete]: () => {
          const panel = this.getPanelUnderCursor();
          if (!panel) {
            this.lastCellContent = this.getCurrentCellContent();
            this.clearCurrentCellContent();
            return;
          }

          this.lastGridPanel = panel;
          this.panelCRUD.delete(panel.id);
          this.gridPanels = this.panelCRUD.readAll();
        },
        [VIM_COMMAND.pasteVim]: () => {
          console.log("pasteVim");
          this.setCurrentCellContent(this.lastCellContent);
          // this.addPanelAtCursor(this.lastGridPanel);
        },
        [VIM_COMMAND.enterNormalMode]: () => {
          this.unselectAllSelecedCells();
          this.dragEndColumnIndex = this.dragStartColumnIndex;
          this.dragEndRowIndex = this.dragStartRowIndex;
          this.updateAllSelecedCells();
        },
      },
      [VimMode.VISUAL]: {
        [VIM_COMMAND.cursorRight]: () => {
          this.unselectAllSelecedCells();
          const b = this.dragEndColumnIndex + 1;
          this.dragEndColumnIndex = cycleInRange(0, this.columnSize, b);
          this.updateAllSelecedCells();
        },
        [VIM_COMMAND.cursorLeft]: () => {
          this.unselectAllSelecedCells();
          const b = this.dragEndColumnIndex - 1;
          this.dragEndColumnIndex = cycleInRange(0, this.columnSize, b);
          this.updateAllSelecedCells();
        },
        [VIM_COMMAND.cursorUp]: () => {
          this.unselectAllSelecedCells();
          const b = this.dragEndRowIndex - 1;
          this.dragEndRowIndex = cycleInRange(0, this.rowSize, b);
          this.updateAllSelecedCells();
        },
        [VIM_COMMAND.cursorDown]: () => {
          this.unselectAllSelecedCells();
          const b = this.dragEndRowIndex + 1;
          this.dragEndRowIndex = cycleInRange(0, this.rowSize, b);
          this.updateAllSelecedCells();
        },
        [VIM_COMMAND.enterVisualMode]: () => {
          /*prettier-ignore*/ console.log("[grid-test-page.ts,161] enterVisualMode: ");
        },
        // [VIM_COMMAND.]: () => {},
      },
      [VimMode.INSERT]: {
        //[VIM_COMMAND.enterInsertMode]: () => {
        //  console.log("iiiii");
        //  mappingByMode[VimMode.NORMAL]
        //    .find((mapping) => mapping.key === "<Enter>")
        //    .execute();
        //  return true;
        //},
      },
      [VimMode.CUSTOM]: {
        [VIM_COMMAND.cursorRight]: () => {
          const panel = this.getPanelUnderCursor();
          panel.col += 1;
          this.setCursorAtPanel(panel);
        },
        [VIM_COMMAND.cursorLeft]: () => {
          const panel = this.getPanelUnderCursor();
          panel.col -= 1;
          this.setCursorAtPanel(panel);
        },
        [VIM_COMMAND.cursorUp]: () => {
          const panel = this.getPanelUnderCursor();
          panel.row -= 1;
          this.setCursorAtPanel(panel);
        },
        [VIM_COMMAND.cursorDown]: () => {
          const panel = this.getPanelUnderCursor();
          panel.row += 1;
          this.setCursorAtPanel(panel);
        },
      },
    };
    const vimOptions: VimOptions = {
      container: this.gridTestContainerRef,
      vimState: {
        id: "grid-navigation",
        mode: VimMode.NORMAL,
        cursor: { line: 0, col: 0 },
        lines: [{ text: "    " }],
      },
      hooks: {
        modeChanged: (payload) => {
          this.lastMode = this.mode;

          this.mode = payload.vimState.mode;
        },
        commandListener: (result) => {
          const mode = mappingByCommandName[result.vimState.mode];
          if (!mode) return;
          const command = mode[result.targetCommand];
          if (!command) return;
          command();
        },
        //onInsertInput: (key) => {
        //  mappingByMode[VimMode.NORMAL]
        //    .find((mapping) => mapping.key === "<Enter>")
        //    .execute();
        //
        //  /*prettier-ignore*/ console.log("[grid-test-page.ts,561] key: ", key);
        //  const isArrow = isArrowMovement(key);
        //  /*prettier-ignore*/ console.log("[grid-test-page.ts,563] isArrow: ", isArrow);
        //  const asht = {
        //    [VIM_COMMAND.cursorRight]: () => {
        //      console.log("hi");
        //      this.unselectAllSelecedCells();
        //      const a = this.dragStartColumnIndex + 1;
        //      this.dragStartColumnIndex = cycleInRange(0, this.columnSize, a);
        //      const b = this.dragEndColumnIndex + 1;
        //      this.dragEndColumnIndex = cycleInRange(0, this.columnSize, b);
        //      this.updateAllSelecedCells();
        //    },
        //    [VIM_COMMAND.cursorLeft]: () => {
        //      this.unselectAllSelecedCells();
        //      const a = this.dragStartColumnIndex - 1;
        //      this.dragStartColumnIndex = cycleInRange(0, this.columnSize, a);
        //      const b = this.dragEndColumnIndex - 1;
        //      this.dragEndColumnIndex = cycleInRange(0, this.columnSize, b);
        //      this.updateAllSelecedCells();
        //    },
        //    [VIM_COMMAND.cursorUp]: () => {
        //      this.unselectAllSelecedCells();
        //      const a = this.dragStartRowIndex - 1;
        //      this.dragStartRowIndex = cycleInRange(0, this.rowSize, a);
        //      const b = this.dragEndRowIndex - 1;
        //      this.dragEndRowIndex = cycleInRange(0, this.rowSize, b);
        //      this.updateAllSelecedCells();
        //    },
        //    [VIM_COMMAND.cursorDown]: () => {
        //      this.unselectAllSelecedCells();
        //      const a = this.dragStartRowIndex + 1;
        //      this.dragStartRowIndex = cycleInRange(0, this.rowSize, a);
        //      const b = this.dragEndRowIndex + 1;
        //      this.dragEndRowIndex = cycleInRange(0, this.rowSize, b);
        //      this.updateAllSelecedCells();
        //    },
        //  };
        //
        //  if (key === SPACE) {
        //    this.textareaValue = this.textareaValue + " ";
        //  } else {
        //    this.textareaValue = this.textareaValue + key;
        //  }
        //  return true;
        //},
      },
    };
    this.vimInit.init(vimOptions);
  }

  private setAndUpdateCells(col: number, row: number) {
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

  private getCurrentCellContent(
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
  ): string {
    const content = this.contentMap[row]?.[col];
    return content ?? "";
  }

  private setCurrentCellContent(
    content: string,
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
  ) {
    if (this.contentMap[row] === undefined) {
      this.contentMap[row] = [];
    }
    this.contentMap[row][col] = content;
    this.updateContentMapChangedForView();
  }

  private addCellBeforeCurrent(
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
  ) {
    this.contentMap[row].splice(col, 0, "");
    this.updateContentMapChangedForView();
  }

  private removeCellAtStart(
    col = this.dragStartColumnIndex,
    row = this.dragStartRowIndex,
  ) {
    const content = this.getCurrentCellContent(col, row);
    if (content) return;
    this.contentMap[row].splice(col, 1);
    this.updateContentMapChangedForView();
  }

  private clearCurrentCellContent(): void {
    this.setCurrentCellContent(undefined);
    this.updateContentMapChangedForView();
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
    iterateOverRange(
      [options.startCol, options.startRow],
      [this.columnSize - 1, this.rowSize - 1],
      callback,
      options,
    );
  }

  private iterateOverAllCellsBackwards(
    callback: (columnIndex: number, rowIndex: number) => void,
    options: GridIteratorOptions = defaultGridIteratorOptions,
  ) {}

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
  }

  private autosave(): void {
    gridDatabase.autosave(() => {
      this.getActiveSheet().selectedRange = this.getSelectedArea();
      gridDatabase.setItem(this.sheetsData);
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

    // cursor.scrollIntoView({
    //   behavior: 'smooth',
    //   block: 'nearest',
    //   inline: 'nearest',
    // });
  };
}

function calculateDiff(
  before: GridSelectionRange,
  after: GridSelectionRange,
): GridSelectionRange {
  const diff: any = [];

  const [beforeStartColumn, beforeStartRow] = before[0]; // Top-left corner of first rectangle
  const [beforeEndColumn, beforeEndRow] = before[1]; // Bottom-right corner of first rectangle
  const [x2Start, y2Start] = after[0]; // Top-left corner of second rectangle
  const [afterEndColumn, afterEndRow] = after[1]; // Bottom-right corner of second rectangle

  // Iterate over the first rectangle's selection
  for (let col = beforeStartColumn; col <= beforeEndColumn; col++) {
    for (let row = beforeStartRow; row <= beforeEndRow; row++) {
      // If the current point is not within the bounds of the second rectangle, add it to the diff
      if (
        col < x2Start ||
        col > afterEndColumn ||
        row < y2Start ||
        row > afterEndRow
      ) {
        diff.push([col, row]);
      }
    }
  }

  return diff;
}

function orderByMinMaxRange(
  startCol: number,
  startRow: number,
  endCol: number,
  endRow: number,
): GridSelectionRange {
  const minColumnIndex = Math.min(startCol, endCol);
  const maxColumnIndex = Math.max(startCol, endCol);
  const minRowIndex = Math.min(startRow, endRow);
  const maxRowIndex = Math.max(startRow, endRow);
  const result: GridSelectionRange = [
    [minColumnIndex, minRowIndex],
    [maxColumnIndex, maxRowIndex],
  ];
  return result;
}

/**
 * Iterate row first
 */
function iterateOverRange(
  start: GridSelectionCoord,
  end: GridSelectionCoord,
  callback: (columnIndex: number, rowIndex: number) => boolean | void,
  options: GridIteratorOptions,
) {
  const startRow = options.startRow ?? start[1];
  let startCol = options.startCol ?? start[0];

  let stopAll = false;
  for (let rowIndex = startRow; rowIndex <= end[1]; rowIndex++) {
    if (stopAll) break;
    if (rowIndex > startRow) {
      startCol = 0;
    }
    for (let columnIndex = startCol; columnIndex <= end[0]; columnIndex++) {
      stopAll = !!callback(columnIndex, rowIndex);
      if (stopAll) {
        break;
      }
    }
  }
}

/**
 * Iterate row first
 */
function iterateOverRangeBackwards(
  end: GridSelectionCoord,
  callback: (columnIndex: number, rowIndex: number) => boolean | void,
  options: GridIteratorOptions,
) {
  let startCol = options.startCol ?? end[0];
  const startRow = options.startRow ?? end[1];

  let stopAll = false;
  for (let rowIndex = startRow; rowIndex >= 0; rowIndex--) {
    if (stopAll) break;
    if (rowIndex < end[1]) {
      startCol = options.colSize;
    }
    for (let columnIndex = startCol; columnIndex >= 0; columnIndex--) {
      stopAll = !!callback(columnIndex, rowIndex);
      if (stopAll) {
        break;
      }
    }
  }
}
