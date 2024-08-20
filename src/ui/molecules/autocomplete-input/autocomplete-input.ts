import { bindable } from "aurelia";
import "./autocomplete-input.scss";
import { UiSuggestion } from "../../../types/uiTypes";
import { translations } from "../../../modules/translations";

export class AutocompleteInput {
  @bindable() value = "";
  @bindable() placeholder = `${translations.search}...`;
  @bindable() source: string[] = [];
  public suggestions: UiSuggestion[] = [];
  public translations = translations;
  public autocompleteContainerRef: HTMLElement | null = null;
  public suggesionListRef: HTMLElement | null = null;
  public searchInputRef: HTMLElement | null = null;

  private activeCursorIndex = 0;

  private valueChanged(newValue: string): void {
    this.clearSuggestions();
    this.updateSuggestions(newValue);
  }

  attached() {
    this.updateSuggestions(this.value);

    this.autocompleteContainerRef?.addEventListener("keydown", (event) => {
      const isActive = document.activeElement === this.searchInputRef;
      if (!isActive) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.activeCursorIndex = Math.min(
          this.suggestions.length - 1,
          this.activeCursorIndex + 1,
        );
        this.scrollToSuggestion();
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this.activeCursorIndex = Math.max(0, this.activeCursorIndex - 1);
        this.scrollToSuggestion();
      }
    });
  }

  private suggestionIsVisible(element): boolean {
    const parent = this.suggesionListRef;
    const elementRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    return (
      elementRect.top >= parentRect.top &&
      elementRect.bottom <= parentRect.bottom
    );
  }

  private scrollToSuggestion(): void {
    const elementToScroll = document.querySelector(
      `[data-scroll-index="${this.activeCursorIndex}"]`,
    );
    const is = this.suggestionIsVisible(elementToScroll);
    if (is) return;

    elementToScroll?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  private updateSuggestions(searchValue: string): void {
    this.source.forEach((word) => {
      const included = word.toLowerCase().includes(searchValue.toLowerCase());
      if (!included) return;

      this.collectSuggestion(word);
    });
  }

  private collectSuggestion(searchValue: string): void {
    if (this.value.length === 0) return;

    const index = searchValue.toLowerCase().indexOf(this.value.toLowerCase());
    const before = searchValue.substring(0, index);
    const match = searchValue.substring(index, index + this.value.length);
    const after = searchValue.substring(index + this.value.length);

    this.suggestions.push({
      highlighted: `${before}<span class="highlight">${match}</span>${after}`,
      original: searchValue,
    });
  }

  private clearSuggestions(): void {
    this.suggestions = [];
  }
}
