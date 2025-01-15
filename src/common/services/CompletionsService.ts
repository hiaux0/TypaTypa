import { singleton } from "aurelia";
import { CompletionsMapKeys } from "../modules/constants";

export interface CompletionItem {
  text: string;
}

@singleton()
export class CompletionsService {
  public completionsMap: Record<CompletionsMapKeys, CompletionItem[]> = {
    gridFunctions: ["SUB"].sort().map((v) => ({ text: v })),
    slashCommands: [],
  };

  public register(id: CompletionsMapKeys, mappings: CompletionItem[]): void {
    if (!this.completionsMap[id]) {
      this.completionsMap[id] = [];
    }
    this.completionsMap[id] = this.completionsMap[id].concat(mappings);
  }

  public getItems(id: CompletionsMapKeys): CompletionItem[] {
    return this.completionsMap[id];
  }
}
