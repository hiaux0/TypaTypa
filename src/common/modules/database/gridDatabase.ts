import {
  ContentMap as GridContentMap,
  GridDatabaseType,
  Sheet,
  defaultGridDatabaseType,
} from "../../../types";
import { Database } from "./database";

class GridDatabase extends Database<GridDatabaseType> {
  constructor(
    storageKey: string,
    defaultData: GridDatabaseType = defaultGridDatabaseType,
  ) {
    super(storageKey, defaultData as any);

    // @ts-ignore
    window.debug_setGridData = this.setItem.bind(this);
    // @ts-ignore
    window.debug_getGridData = this.getItem.bind(this);
  }

  public getSelectedSheet(): Sheet | undefined {
    const { sheets, selectedSheetId } = this.getItem();
    const targetSheet = sheets.find((sheet) => sheet.id === selectedSheetId);
    return targetSheet;
  }
}

const gridStorageKey = "grid-app-v0.1";
export const gridDatabase = new GridDatabase(gridStorageKey);
