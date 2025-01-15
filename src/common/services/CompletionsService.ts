import { singleton } from "aurelia";
import { CompletionsMapKeys } from "../modules/constants";

export interface CompletionItem {
  text: string;
}

@singleton()
export class CompletionsService {
  // @ts-ignore
  public completionsMap: Record<CompletionsMapKeys, any> = {};

  public register(id: CompletionsMapKeys, mappings: any): void {
    this.completionsMap[id] = mappings;
  }

  public getItems(id: CompletionsMapKeys): CompletionItem[] {
    return this.completionsMap[id];
  }
}
