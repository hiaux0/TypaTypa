import { AutocompleteSource } from "../../types";

export interface UiSuggestion<T> extends AutocompleteSource<T> {
  highlighted: string;
}
