import { bindable } from "aurelia";
import "./grid-cell-html.scss";
import { Cell, CellKindConfigElementType } from "../../../../types";
import { UI_CONSTANTS } from "../../../../common/modules/constants";

export class GridCellHtml {
  @bindable public column: number;
  @bindable public row: number;
  @bindable cell: Cell;
  @bindable public selected: boolean = false;
  @bindable onChange: (
    cell: Cell,
    elementType: CellKindConfigElementType,
    payload: any,
  ) => void;

  attached() {
    this.cell.col = this.column;
    this.cell.row = this.row;
  }

  public UI_CONSTANTS = UI_CONSTANTS;
  public message = "grid-cell-html.html";
  public CellKindConfigElementType = CellKindConfigElementType;

  public onTimeChange = (time: number, progress: number) => {
    if (!this.onChange) return;
    if (typeof this.onChange !== "function") return;
    this.onChange(this.cell, CellKindConfigElementType.AUDIO, {
      time,
      progress,
    });
  };

  public onStateChange = (isPlaying: boolean, event: Event) => {
    if (!this.onChange) return;
    if (typeof this.onChange !== "function") return;
    this.onChange(this.cell, CellKindConfigElementType.AUDIO, {
      isPlaying,
      event,
    });
  };
}
