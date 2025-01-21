import { EventAggregator, resolve, singleton } from "aurelia";
import { AnyObject, Cell, IdObject } from "../../types";
import { CELL_EVENT_SOURCE_MAP, CellEventsKey } from "../modules/constants";
import { CRUDService } from "./CRUDService";
import { ICellEventsPayload } from "../../domain/entities/grid/CellFunctionEntities";

type EventKey = string;

@singleton()
export class CellEventMessagingService {
  public events = new CRUDService();

  private eventAggregator = resolve(EventAggregator);

  public addEvent(cell: Cell) {
    const key = this.getKey(cell.col, cell.row);
    this.events.create({ id: key });
  }

  public publish<T = ICellEventsPayload>(eventKeyOrCell: EventKey | Cell, payload: T) {
    const eventKey =
      typeof eventKeyOrCell === "string"
        ? eventKeyOrCell
        : this.getKey(eventKeyOrCell.col, eventKeyOrCell.row);
    this.events.create({ id: eventKey });
    /*prettier-ignore*/ console.log("[CellEventMessagingService.ts,26] eventKey: ", eventKey);
    this.eventAggregator.publish(eventKey, payload);
  }

  public subscribe(
    eventKeyOrCell: EventKey | Cell,
    callback: (payload: ICellEventsPayload) => void,
  ) {
    const eventKey =
      typeof eventKeyOrCell === "string"
        ? eventKeyOrCell
        : this.getKey(eventKeyOrCell.col, eventKeyOrCell.row);
    /*prettier-ignore*/ console.log("[CellEventMessagingService.ts,38] eventKey: ", eventKey);
    return this.eventAggregator.subscribe(eventKey, callback);
  }

  public getKey(col: number | undefined, row: number | undefined): EventKey {
    return `${CELL_EVENT_SOURCE_MAP.cellEvents}:[${col}-${row}]`;
  }
}
