import { resolve } from "aurelia";
import "./grid-test-page.scss";
import { EV_CELL_SELECTED } from "../../../common/modules/eventMessages";
import { GridSelectionCoord, GridSelectionRange } from "../../../types";
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
import { findParentElement } from "../../../common/modules/htmlElements";
import { CRUDService } from "../../../common/services/CRUDService";
import { CELL_COORDS } from "../../../common/modules/constants";
import { gridDatabase } from "../../../common/modules/database/gridDatabase";

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

const CELL_HEIGHT = 32;
const CELL_WIDTH = 64;

export class GridTestPage {
  public gridTestContainerRef: HTMLElement;
  public rowSize = 10;
  public columnSize = 8;
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
  public contentMap: Record<string, string> = {};
  public editMap: Record<string, string> = {};
  public selectedMap: Record<string, boolean> = {};
  public textareaValue = "";

  public gridPanels: GridPanel[] = [];
  public START_PANEL_TOP = 32;
  public START_PANEL_LEFT = 64;
  private activePanel: GridPanel;
  private activePanelElement: HTMLElement;
  private lastGridPanel: GridPanel | undefined = undefined;
  private lastCellContent: string | undefined = undefined;

  private isStartDragGridCell = false;
  private mode: VimMode | "Move" = VimMode.NORMAL;
  private panelCRUD: CRUDService<GridPanel>;

  public get orderedSelectedRangeToString(): string {
    const ordered = this.getSelectedArea();
    const [[startColumn, startRow], [endColumn, endRow]] = ordered;
    // const result = `${this.numberToAlphabet(startColumn)}${startRow + 1} - ${this.numberToAlphabet(endColumn)}${endRow + 1}`;
    const result = `${startColumn},${startRow}:${endColumn},${endRow}`;
    return result;
  }

  constructor(private vimInit: VimInit = resolve(VimInit)) {}

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

    this.panelCRUD = new CRUDService(this.gridPanels);
    this.contentMap = gridDatabase.getItem();
    this.autosave();
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

        (document.activeElement as HTMLElement).blur();
        if (this.activePanel) {
          this.activePanel.isEdit = false;
          this.contentMap[
            CELL_COORDS(this.activePanel.col, this.activePanel.row)
          ] = this.textareaValue;
        }
        this.activePanel = undefined;
        window.setTimeout(() => {
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
          key: "m",
          desc: "Enter [M]ove mode",
          execute: () => {
            this.vimInit.executeCommand(VIM_COMMAND.enterCustomMode, "");
            this.mode = "Move";
          },
        },
        {
          key: "<Enter>",
          desc: "Focus Panel at cursor",
          execute: () => {
            const targetPanel = this.getPanelUnderCursor();
            /*prettier-ignore*/ console.log("[grid-test-page.ts,257] targetPanel: ", targetPanel);
            if (!targetPanel) {
              // Add new panel
              const newPanel = this.addPanel();
              this.activePanel = newPanel;
              newPanel.isEdit = true;
              this.textareaValue =
                this.contentMap[CELL_COORDS(newPanel.col, newPanel.row)];
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
              this.vimInit.executeCommand(VIM_COMMAND.enterCustomMode, "");
              return true;
            }

            // Focus panel
            console.log("Enter focus");
            targetPanel.isEdit = true;
            this.textareaValue =
              this.contentMap[CELL_COORDS(targetPanel.col, targetPanel.row)];
            this.activePanel = targetPanel;
            this.activePanelElement = document.querySelector(
              `[data-panel-id="${targetPanel.id}"] textarea`,
            ) as HTMLElement;
            this.activePanelElement.focus();
            this.vimInit.executeCommand(VIM_COMMAND.enterCustomMode, "");
            return true;
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
          key: "a",
          execute: () => {
            console.log("enter");
            const targetPanel = this.getPanelUnderCursor();
            if (!targetPanel) return;

            this.activePanelElement = document.querySelector(
              `[data-panel-id="${targetPanel.id}"] textarea`,
            ) as HTMLElement;
            this.activePanelElement.focus();
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
      [VimMode.CUSTOM]: [],
    };
    new KeyMappingService().init(mappingByKey, mappingByMode);

    const mappingByCommandName = {
      [VimMode.NORMAL]: {
        [VIM_COMMAND.cursorRight]: () => {
          this.unselectAllSelecedCells();
          const a = this.dragStartColumnIndex + 1;
          this.dragStartColumnIndex = cycleInRange(0, this.columnSize, a);
          const b = this.dragEndColumnIndex + 1;
          this.dragEndColumnIndex = cycleInRange(0, this.columnSize, b);
          this.updateAllSelecedCells();
        },
        [VIM_COMMAND.cursorLeft]: () => {
          this.unselectAllSelecedCells();
          const a = this.dragStartColumnIndex - 1;
          this.dragStartColumnIndex = cycleInRange(0, this.columnSize, a);
          const b = this.dragEndColumnIndex - 1;
          this.dragEndColumnIndex = cycleInRange(0, this.columnSize, b);
          this.updateAllSelecedCells();
        },
        [VIM_COMMAND.cursorUp]: () => {
          this.unselectAllSelecedCells();
          const a = this.dragStartRowIndex - 1;
          this.dragStartRowIndex = cycleInRange(0, this.rowSize, a);
          const b = this.dragEndRowIndex - 1;
          this.dragEndRowIndex = cycleInRange(0, this.rowSize, b);
          this.updateAllSelecedCells();
        },
        [VIM_COMMAND.cursorDown]: () => {
          this.unselectAllSelecedCells();
          const a = this.dragStartRowIndex + 1;
          this.dragStartRowIndex = cycleInRange(0, this.rowSize, a);
          const b = this.dragEndRowIndex + 1;
          this.dragEndRowIndex = cycleInRange(0, this.rowSize, b);
          this.updateAllSelecedCells();
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
          console.log("VISUAL");
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
          this.mode = payload.vimState.mode;
          /*prettier-ignore*/ console.log("[grid-test-page.ts,408] this.mode: ", this.mode);
        },
        commandListener: (result) => {
          const mode = mappingByCommandName[result.vimState.mode];
          if (!mode) return;
          const command = mode[result.targetCommand];
          if (!command) return;
          command();
        },
      },
    };
    this.vimInit.init(vimOptions);
  }

  private getCurrentCellContent(): string {
    const content =
      this.contentMap[
        CELL_COORDS(this.dragStartColumnIndex, this.dragStartRowIndex)
      ];
    return content;
  }

  private setCurrentCellContent(content: string) {
    this.contentMap[
      CELL_COORDS(this.dragStartColumnIndex, this.dragStartRowIndex)
    ] = content;
  }

  private clearCurrentCellContent(): void {
    this.contentMap[
      CELL_COORDS(this.dragStartColumnIndex, this.dragStartRowIndex)
    ] = undefined;
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

  private getSelectedArea() {
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
    /*prettier-ignore*/ console.log("[grid-test-page.ts,631] all: ", all);
  }

  private autosave(): void {
    gridDatabase.autosave(() => {
      gridDatabase.setItem(this.contentMap);
    });
  }
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
  for (let x = beforeStartColumn; x <= beforeEndColumn; x++) {
    for (let y = beforeStartRow; y <= beforeEndRow; y++) {
      // If the current point is not within the bounds of the second rectangle, add it to the diff
      if (x < x2Start || x > afterEndColumn || y < y2Start || y > afterEndRow) {
        diff.push([x, y]);
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

function iterateOverRange(
  start: GridSelectionCoord,
  end: GridSelectionCoord,
  callback: (columnIndex: number, rowIndex: number) => void,
) {
  for (let columnIndex = start[0]; columnIndex <= end[0]; columnIndex++) {
    for (let rowIndex = start[1]; rowIndex <= end[1]; rowIndex++) {
      callback(rowIndex, columnIndex);
    }
  }
}

function iterateOverAllCells(
  callback: (columnIndex: number, rowIndex: number) => void,
) {
  for (let columnIndex = 0; columnIndex < this.columnSize; columnIndex++) {
    for (let rowIndex = 0; rowIndex < this.rowSize; rowIndex++) {
      callback(rowIndex, columnIndex);
    }
  }
}
