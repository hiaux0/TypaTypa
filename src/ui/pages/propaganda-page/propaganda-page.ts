import "./propaganda-page.scss";
import * as Data from "./data/PropagandaData.json";
import { PropagandaSchema } from "../../../types/propgandaTypes";
import { observable } from "aurelia";
import { UiSuggestion } from "../../../types/uiTypes";

const data = Data as PropagandaSchema;

export interface PropagandaRow {
  propaganda: string;
  topics: string;
  tags: string;
}

export class PropagandaPage {
  public propagandaTableRows: PropagandaRow[] = [];
  @observable public searchPropagandaValue = "";
  public searchTopicsValue = "";
  public searchTagsValue = "";
  public propagandaSuggestions: UiSuggestion[] = [];

  private searchPropagandaValueChanged(): void {
    this.resetSuggestions();
    this.generateRows();
  }

  attached() {
    this.generateRows();
  }

  public selectSuggestion(suggestion: string): void {
    /*prettier-ignore*/ console.log("[propaganda-page.ts,50] suggestion: ", suggestion);
    this.searchPropagandaValue = suggestion;
    this.generateRows();
    // this.searchPropagandaValue = "";
  }

  private generateRows(): void {
    const rows: PropagandaRow[] = [];
    for (const propaganda in data.propaganda) {
      // Filter propaganda
      const included = propaganda
        .toLowerCase()
        .includes(this.searchPropagandaValue.toLowerCase());
      if (!included) continue;
      this.highlightSearchPropagandaValue(propaganda);

      const topics = data.propaganda[propaganda].topics.join(", ");
      const tags = data.propaganda[propaganda].tags.join(", ");

      rows.push({ propaganda, topics, tags });
    }
    this.propagandaTableRows = rows;
  }

  private resetSuggestions(): void {
    this.propagandaSuggestions = [];
  }

  private highlightSearchPropagandaValue(propaganda: string): void {
    if (this.searchPropagandaValue.length > 0) {
      const index = propaganda
        .toLowerCase()
        .indexOf(this.searchPropagandaValue.toLowerCase());
      const before = propaganda.substring(0, index);
      const match = propaganda.substring(
        index,
        index + this.searchPropagandaValue.length,
      );
      const after = propaganda.substring(
        index + this.searchPropagandaValue.length,
      );
      this.propagandaSuggestions.push({
        highlighted: `${before}<span class="highlight">${match}</span>${after}`,
        original: propaganda,
      });
    }
  }

  //public filterRows() {
  //  const filteredRows: PropagandaRow[] = [];
  //  for (const row of this.propagandaTableRows) {
  //    filteredRows.push(row);
  //  }
  //  this.propagandaTableRows = filteredRows;
  //}
}
