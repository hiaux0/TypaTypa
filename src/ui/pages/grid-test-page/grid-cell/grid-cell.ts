import { EventAggregator, bindable, resolve } from "aurelia";
import "./grid-cell.scss";
import { EV_CELL_SELECTED } from "../../../../common/modules/eventMessages";

export class GridCell {
  @bindable public column: number;
  @bindable public row: number;
  @bindable public selected: boolean = false;

  selectedChanged(newSelected) {
    // /*prettier-ignore*/ console.log("[grid-cell.ts,11] newSelected: ", newSelected);
  }

  constructor(
    private eventAggregator: EventAggregator = resolve(EventAggregator),
  ) {}

  attached() {
    //this.eventAggregator.subscribe(
    //  EV_CELL_SELECTED(this.column, this.row),
    //  (payload: any) => {
    //    if (!payload) return;
    //    const selected = payload.selected;
    //    this.selected = selected;
    //    //if (!selected) {
    //    //  /*prettier-ignore*/ console.log("[grid-cell.ts,26] selected: ", selected);
    //    //  const logMe = `${this.column},${this.row}`;
    //    //  /*prettier-ignore*/ console.log("[grid-cell.ts,23] logMe: ", logMe);
    //    //}
    //    // /*prettier-ignore*/ console.log("[grid-cell.ts,25] this.selected: ", this.selected);
    //  },
    //);
  }
}
