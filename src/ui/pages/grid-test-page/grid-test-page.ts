import { EventAggregator, resolve } from "aurelia";
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

interface GridPanel {
  id: string;
  row: number;
  col: number;
  width?: number;
  height?: number;
  type: "button";
}

const CELL_HEIGHT = 32;
const CELL_WIDTH = 64;

export class GridTestPage {
  public gridTestContainerRef: HTMLElement;
  public rowSize = 12;
  public columnSize = 13;
  public CELL_HEIGHT = CELL_HEIGHT;
  public CELL_WIDTH = CELL_WIDTH;
  public EV_CELL_SELECTED = EV_CELL_SELECTED;
  // Drag and select //
  // Container needs to keep track of these values, because the grid cells are not aware of each other
  public dragStartColumnIndex = 5;
  public dragEndColumnIndex = 5;
  public dragStartRowIndex = 5;
  public dragEndRowIndex = 5;
  public selectedMap = new Map<string, boolean>();

  public gridPanels: GridPanel[] = [];
  public START_PANEL_TOP = 32;
  public START_PANEL_LEFT = 64;
  private activePanel: GridPanel;
  private activePanelElement: HTMLElement;

  private isStartDragGridCell = false;

  public get orderedSelectedRangeToString(): string {
    const ordered = this.getSelectedArea();
    const [[startColumn, startRow], [endColumn, endRow]] = ordered;
    // const result = `${this.numberToAlphabet(startColumn)}${startRow + 1} - ${this.numberToAlphabet(endColumn)}${endRow + 1}`;
    const result = `${startColumn},${startRow}:${endColumn},${endRow}`;
    return result;
  }

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
  ) {}

  attached() {
    this.initGridNavigation();
    this.selectedMap[
      EV_CELL_SELECTED(this.dragStartColumnIndex, this.dragStartRowIndex)
    ] = true;

    this.gridPanels = [
      // { id: "1", row: 0, col: 0, type: "button" },
      //{ row: 1, col: 1, width: 2, type: "button" },
      { id: "2", col: 3, row: 4, width: 4, height: 4, type: "button" },
      { id: "3", col: 8, row: 5, width: 2, height: 2, type: "button" },
    ];
    this.gridTestContainerRef.addEventListener("mouseup", () => {
      //this.unselectAllSelecedCells();
      //this.addGridPanelToSelection();
      //this.resetDrag();
    });
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
        this.selectedMap[EV_CELL_SELECTED(columnIndex, rowIndex)] = true;
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
  }

  public onPanelClicked(panel: GridPanel): void {
    this.setActivePanelFromHTMLElement();
  }

  public addPanel(): void {
    this.unselectAllSelecedCells();
    this.addGridPanelToSelection();
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
    const endColumn = col + width;
    const endRow = row + height;

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
    const vimInit = new VimInit();
    const mappingByKey = {
      Escape: () => {
        (document.activeElement as HTMLElement).blur();
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
          key: "<Enter>",
          desc: "Focus Panel at cursor",
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
            vimInit.executeCommand(VIM_COMMAND.enterNormalMode, "");
          },
        },
      ],
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
        commandListener: (result) => {
          const mode = mappingByCommandName[result.vimState.mode];
          if (!mode) return;
          const command = mode[result.targetCommand];
          if (!command) return;
          command();
        },
      },
    };
    vimInit.init(vimOptions);
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

  private addGridPanelToSelection(): void {
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
    const [[startColumn, startRow], [endColumn, endRow]] =
      this.getSelectedArea();
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
