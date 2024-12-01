import { AutocompleteSource } from "../../types";

export interface UiSuggestion extends AutocompleteSource {
  highlighted: string;
}
