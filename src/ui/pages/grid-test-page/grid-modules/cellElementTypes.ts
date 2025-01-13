import { Cell, CellKind, CellKindConfig } from "../../../../types";

export class CellKindConfigService {
  public static isHTML(cell: Cell) {
    return cell.kind === CellKind.HTML;
  }
  public static action(cell: Cell) {
    cell.kindConfig = {
      ...cell.kindConfig,
      ...cellKindConfigButton,
    };
    if (typeof cell.kindConfig.action === "function") {
      cell.kindConfig.action();
    }
  }
}

export const cellKindConfigButton: CellKindConfig = {
  action: () => {
    console.log("cellKindConfigButton");
  },
};
