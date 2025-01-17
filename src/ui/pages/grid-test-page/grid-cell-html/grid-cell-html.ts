import { bindable, resolve } from "aurelia";
import "./grid-cell-html.scss";
import { Cell, CellKindConfigElementType } from "../../../../types";
import {
  CELL_EVENTS_MAP,
  UI_CONSTANTS,
} from "../../../../common/modules/constants";
import { CellEventMessagingService } from "../../../../common/services/CellEventMessagingService";

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

  public cellEventMessagingService = resolve(CellEventMessagingService);

  attached() {
    this.cell.col = this.column;
    this.cell.row = this.row;

    this.cellEventMessagingService.addEvent(this.cell);
  }

  public UI_CONSTANTS = UI_CONSTANTS;
  public message = "grid-cell-html.html";
  public CellKindConfigElementType = CellKindConfigElementType;

  public onTimeChange = (time: number, progress: number) => {
    if (!this.onChange) return;
    if (typeof this.onChange !== "function") return;
    const payload = {
      time,
      progress,
    };
    this.onChange(this.cell, CellKindConfigElementType.AUDIO, payload);
    const key = this.cellEventMessagingService.getKey(
      this.cell.col,
      this.cell.row,
    );
    this.cellEventMessagingService.publish(
      key,
      CELL_EVENTS_MAP.audioPlayer,
      payload,
    );
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
