import { EventAggregator, bindable, resolve } from "aurelia";
import "./grid-cell.scss";
import { Cell } from "../../../../types";
import { CELL_WIDTH } from "../../../../common/modules/constants";
const PADDING = 8;

export class GridCell {
  @bindable public cell: Cell;
  @bindable public column: number;
  @bindable public row: number;
  @bindable public selected: boolean = false;
  @bindable public content: string;

  public cellContentRef: HTMLElement;
  public contentWidth = NaN;

  public PADDING = PADDING;
  public CELL_WIDTH = CELL_WIDTH;

  get widthPx() {
    if (!this.cell?.colOfNextText) return "unset";
    const diff = this.cell.colOfNextText - this.column;
    const width = diff * CELL_WIDTH - PADDING;
    const asPx = `${width}px`;
    return asPx;
  }

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
  ) {}

  attached() {
    if (this.cell) {
      this.cell.scrollWidth = this.cellContentRef.scrollWidth;
    }
  }
}
