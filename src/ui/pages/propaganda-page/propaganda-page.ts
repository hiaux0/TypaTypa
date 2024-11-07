import "./propaganda-page.scss";
// import * as Data from "./data/PropagandaData.json";
const Data = {}
import { PropagandaSchema } from "../../../domain/types/propgandaTypes";
import { observable } from "aurelia";
import { UiSuggestion } from "../../../domain/types/uiTypes";
import { translations } from "../../../common/modules/translations";

const data = Data as PropagandaSchema;

export interface PropagandaRow {
  propaganda: string;
  topics: string;
  tags: string;
}

export class PropagandaPage {
  @observable public searchPropagandaValue = "";
  @observable public searchTopicValue = "";
  @observable public searchTagValue = "fre";
  public initialRowData: PropagandaRow[] = [];
  public propagandaTableRows: PropagandaRow[] = [];
  public translations = translations;
  public allPropaganda: string[];
  public allTopics: string[];
  public allTags: string[];

  private searchPropagandaValueChanged(): void {
    this.filterRowData();
  }
  private searchTopicValueChanged(): void {
    this.filterRowData();
  }
  private searchTagValueChanged(): void {
    this.filterRowData();
  }

  created() {
    this.allPropaganda = Object.keys(data.propaganda);
    this.allTopics = Object.keys(data.topics);
    this.allTags = Object.keys(data.tags);
  }

  attached() {
    this.initRowData();
  }

  private initRowData(): void {
    const rows: PropagandaRow[] = [];
    for (const propaganda in data.propaganda) {
      const topics = data.propaganda[propaganda].topics.join(", ");
      const tags = data.propaganda[propaganda].tags.join(", ");
      rows.push({ propaganda, topics, tags });
    }
    this.initialRowData = rows;
    this.propagandaTableRows = rows;
  }

  private filterRowData(): void {
    const filteredByPropaganda = this.initialRowData.filter((row) => {
      return row.propaganda
        .toLowerCase()
        .includes(this.searchPropagandaValue.toLowerCase());
    });

    const filteredByTopic = filteredByPropaganda.filter((row) => {
      return row.topics
        .toLowerCase()
        .includes(this.searchTopicValue.toLowerCase());
    });

    const filteredByTag = filteredByTopic.filter((row) => {
      return row.tags.toLowerCase().includes(this.searchTagValue.toLowerCase());
    });

    this.propagandaTableRows = filteredByTag;
  }
}
