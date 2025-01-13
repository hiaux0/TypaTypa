import { bindable } from "aurelia";
import "./grid-cell-html.scss";
import { Cell, CellKindConfigElementType } from "../../../../types";

export class GridCellHtml {
  @bindable cell: Cell;
  @bindable public selected: boolean = false;

  public message = "grid-cell-html.html";
  public CellKindConfigElementType = CellKindConfigElementType

  attached() {
    /*prettier-ignore*/ console.log("[grid-cell-html.ts,14] this.cell: ", this.cell);
  }
}
