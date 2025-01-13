import { singleton } from "aurelia";

@singleton()
export class CellEventMessagingService {
  public events: string[] = [];

  public addEvent(event: string) {
    this.events.push(event);
  }
}
