import { inject, EventAggregator, resolve } from "aurelia";
import {
  INITIAL_APP_STATE,
  SELECTED_TAB_TITLE,
  STORE_KEYS,
  WORD_TO_LOOK_UP,
} from "./constants";
import { Sheet, Topic } from "../../types";
import { ON_TOPIC_CHANGE } from "./eventMessages";

//export type IStore = Store;
//export const IStore = DI.createInterface<IStore>('IStore');

type ServicesStorageKeys = "RecentlyUsedService";

// @inject(EventAggregator)
export class Store {
  public isDrawerOpen: boolean;
  public isCommandPaletteOpen: boolean;
  public isZen: boolean;
  public activeTabName: string;
  public wordToLookUp: string;
  public dictionaryLookedUpList: Set<string>;
  public servicesDatabase: Record<ServicesStorageKeys, any> = {
    RecentlyUsedService: {},
  };
  public audioTime: number = 0;
  public audioTimeStart: number = 0;
  public audioTimeEnd: number = 0;

  // Grid
  public activeSheet: Sheet;

  constructor(private ea: EventAggregator = resolve(EventAggregator)) {
    this.setVariables();
  }

  public setServiceItem(key: ServicesStorageKeys, item: any): void {
    this.servicesDatabase[key] = item;
  }
  public getServiceItem(key: ServicesStorageKeys) {
    return this.servicesDatabase[key];
  }

  public onTopicChange = (topic: Topic): void => {
    this.ea?.publish(ON_TOPIC_CHANGE, topic);
  };

  public toggleZenMode = (): void => {
    this.isZen = !this.isZen;
    this.updateLocalStorage();
  };

  public closeCommandPalette = (): void => {
    this.isCommandPaletteOpen = false;
    this.updateLocalStorage();
  };

  public toggleCommandPaletteOpen = (): void => {
    this.isCommandPaletteOpen = !this.isCommandPaletteOpen;
    this.updateLocalStorage();
  };

  private setVariables(): void {
    const localState = this.loadLocalStorage();

    this.isDrawerOpen =
      localState?.isDrawerOpen ?? INITIAL_APP_STATE.typing.tabs.isDrawerOpen;
    this.isZen = localState?.isZen ?? INITIAL_APP_STATE.zen;
    this.activeTabName = localState?.activeTabName ?? SELECTED_TAB_TITLE;
    this.wordToLookUp = localState?.wordToLookUp ?? WORD_TO_LOOK_UP;
    this.dictionaryLookedUpList =
      localState?.dictionaryLookedUpList ?? new Set();
    this.servicesDatabase =
      localState?.servicesDatabase ?? this.servicesDatabase;
    this.audioTime = localState?.audioTime ?? 0;
    this.audioTimeStart = localState?.audioTimeStart ?? 0;
    this.audioTimeEnd = localState?.audioTimeEnd ?? 0;
  }

  private loadLocalStorage() {
    const raw = localStorage.getItem(STORE_KEYS.APP_STATE);
    const result = JSON.parse(raw ?? "{}") as Store;
    return result;
  }

  private updateLocalStorage(): void {
    localStorage.setItem(STORE_KEYS.APP_STATE, JSON.stringify(this));
  }
}
