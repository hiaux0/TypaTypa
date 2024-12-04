import { Sheet } from "../../../../types";
import { SheetsService } from "./SheetsService";


export function extractMarkdownStyling(sheet: Sheet): Sheet {
    /*prettier-ignore*/ console.log("-------------------------------------------------------------------");
    /*prettier-ignore*/ console.log("[grid-test-page.ts,2889] sheet: ", sheet);
    const ss = new SheetsService(sheet);
    const [start, end] = ss.getGridCoordsFromSheet();
    ss.iterateOverGrid(start, end, (col, row) => {
        const cell = ss.getCell(col, row);
        if (cell.text.startsWith("#")) {
            cell.styles = {
                color: COLORS.headings.h1,
            };
        }
        /*prettier-ignore*/ console.log("[grid-test-page.ts,2893] cell: ", cell);
    });
    return sheet;
}

