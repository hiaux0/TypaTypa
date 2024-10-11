import { Cell, ContentMap, GridDatabaseType } from "../../../types";

/**
 * content items: `string` -> `Cell` object
 */
function migrateToV0_0_2(sheetsData: GridDatabaseType): GridDatabaseType {
  /*prettier-ignore*/ console.log("[gridMigrations.ts,7] sheetsData: ", sheetsData);
  if (!sheetsData.version) {
    sheetsData.version = "v0.0.2";
    sheetsData.sheets.forEach((sheet) => {
      const updatedContent = sheet.content.map((row) =>
        row.map((text) => {
          const beforeText = text as unknown as string; // had type `string` only
          const updatedCell = { text: beforeText };
          return updatedCell;
        }),
      );
      sheet.content = updatedContent;
    });
    /*prettier-ignore*/ console.log("[gridMigrations.ts,21] sheetsData: ", sheetsData);
    return sheetsData;
  }
  return sheetsData;
}

export function runGridMigrations(
  sheetsData: GridDatabaseType,
): GridDatabaseType {
  let updated = migrateToV0_0_2(sheetsData);
  return updated;
}
