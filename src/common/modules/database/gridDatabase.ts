import { ContentMap as GridContentMap } from "../../../types";
import { Database } from "./database";

class GridDatabase extends Database<GridContentMap> {
  constructor(storageKey: string, defaultData: GridContentMap) {
    super(storageKey, defaultData);

    // @ts-ignore
    window.debug_setGridData = this.setItem.bind(this);
  }
}

const gridStorageKey = "grid-app-v0.1";
export const gridDatabase = new GridDatabase(gridStorageKey, {});
