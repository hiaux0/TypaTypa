import { bindable } from "aurelia";
import "./grid-cell-html.scss";
import { Cell, CellKindConfigElementType } from "../../../../types";

export class GridCellHtml {
  @bindable cell: Cell;
  @bindable public selected: boolean = false;
  @bindable onChange: (time: number, progress: number) => void;

  public message = "grid-cell-html.html";
  public CellKindConfigElementType = CellKindConfigElementType;

  public onStateChange(isPlaying: boolean, event: Event) {
    console.log("isPlaying", isPlaying);
  }
}
