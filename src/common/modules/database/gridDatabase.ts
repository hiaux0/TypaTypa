import { Database } from "./database";

class GridDatabase extends Database<any> {
  constructor(storageKey: string, defaultData: any) {
    super(storageKey, defaultData as any);
  }
}

const gridStorageKey = "grid-app-v0.1";
export const gridDatabase = new GridDatabase(gridStorageKey, {});
