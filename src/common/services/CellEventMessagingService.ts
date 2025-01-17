import { EventAggregator, resolve, singleton } from "aurelia";
import { Cell } from "../../types";
import { CELL_EVENTS_MAP, CellEventsKey } from "../modules/constants";

export interface IEventMessagingPayload {
  source: keyof typeof CELL_EVENTS_MAP;
  payload: unknown;
}

@singleton()
export class CellEventMessagingService {
  public events: string[] = [];

  private eventAggregator = resolve(EventAggregator);

  public addEvent(cell: Cell) {
    const key = this.getKey(cell.col, cell.row);
    this.events.push(key);
  }

  public publish(key: string, source: CellEventsKey, payload: any) {
    const final: IEventMessagingPayload = {
      source,
      payload,
    };
    this.eventAggregator.publish(key, final);
  }

  public subscribe(
    eventName: string,
    callback: (payload: IEventMessagingPayload) => void,
  ) {
    return this.eventAggregator.subscribe(eventName, callback);
  }

  public getKey(col: number | undefined, row: number | undefined) {
    return `${CELL_EVENTS_MAP.cellEvents}:[${col}-${row}]`;
  }
}
