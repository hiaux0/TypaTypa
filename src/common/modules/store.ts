import { inject, EventAggregator, resolve } from "aurelia";
import {
  INITIAL_APP_STATE,
  SELECTED_TAB_TITLE,
  WORD_TO_LOOK_UP,
} from "./constants";
import { Topic } from "../types";
import { ON_TOPIC_CHANGE } from "./eventMessages";

//export type IStore = Store;
//export const IStore = DI.createInterface<IStore>('IStore');

// @inject(EventAggregator)
export class Store {
  public message = "store.html";
  public isDrawerOpen = INITIAL_APP_STATE.typing.tabs.isDrawerOpen ?? false;
  public activeTabName = SELECTED_TAB_TITLE;
  public wordToLookUp = WORD_TO_LOOK_UP;
  public dictionaryLookedUpList: Set<string> = new Set();

  constructor(private ea: EventAggregator = resolve(EventAggregator)) {}

  public onTopicChange = (topic: Topic): void => {
    this.ea?.publish(ON_TOPIC_CHANGE, topic);
  };
}
