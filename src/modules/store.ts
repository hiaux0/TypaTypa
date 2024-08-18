import { IContainer, Registration } from "aurelia";
import {
  INITIAL_APP_STATE,
  SELECTED_TAB_TITLE,
  WORD_TO_LOOK_UP,
} from "./constants";

//export type IStore = Store;
//export const IStore = DI.createInterface<IStore>('IStore');

export class Store {
  public static register(container: IContainer): void {
    container.register(Registration.singleton(Store, Store));
  }

  message = "store.html";
  isDrawerOpen = INITIAL_APP_STATE.typing.tabs.isDrawerOpen ?? false;
  activeTabName = SELECTED_TAB_TITLE;
  wordToLookUp = WORD_TO_LOOK_UP;
  dictionaryLookedUpList: Set<string> = new Set();
}
