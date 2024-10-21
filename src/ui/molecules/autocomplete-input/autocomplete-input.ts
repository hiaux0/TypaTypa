import { bindable } from "aurelia";
import "./autocomplete-input.scss";
import { UiSuggestion } from "../../../domain/types/uiTypes";
import { translations } from "../../../common/modules/translations";
import { getLongestCommonSubstring } from "../../../common/modules/strings";

const debugLog = false;

export class AutocompleteInput {
  @bindable() value = "";
  @bindable() placeholder = `${translations.search}...`;
  @bindable() source: string[] = [];
  /**
   * If is a string, that means, in the view just the attribute was used
   */
  @bindable() hideInput: boolean | string = false;
  @bindable() width: string = "400px";
  /**
   * Container of the input.
   * Note: for now, need both container and target
   */
  @bindable() container: HTMLElement;
  /**
   * Provide your own input
   */
  @bindable() target: HTMLElement;
  @bindable() onAccept: (suggestion: string) => void;
  @bindable() onPartialAccept: (suggestion: string) => void;

  public suggestions: UiSuggestion[] = [];
  public translations = translations;
  public autocompleteContainerRef: HTMLElement | null = null;
  public suggesionListRef: HTMLElement | null = null;
  public searchInputRef: HTMLElement | null = null;

  private activeCursorIndex = 0;
  private attachCount = 0;

  valueChanged(newValue: string): void {
    this.updateSuggestions(newValue);
  }

  attached() {
    this.attachCount++;
    if (!this.container && this.target) {
      /*prettier-ignore*/ console.error("[ERROR:<autocomplete-input>]: Need also to provide a container if you provide a target");
    }

    /*prettier-ignore*/ debugLog && console.log("AI.1. [autocomplete-input.ts,46] this.value: ", this.value);
    this.hideInput = this.hideInput === "" || this.hideInput;
    this.updateSuggestions(this.value);
    this.initKeyboardEvents();
  }

  public selectSuggestion(suggestionName: string): void {
    this.value = suggestionName;
    // console.log("B.3 suggestionName: ", suggestionName);
    this.onAccept?.(suggestionName);
    this.clearSuggestions();
  }

  private clearSuggestions(): void {
    this.suggestions = [];
  }

  private updateSuggestions(searchValue: string): void {
    this.clearSuggestions();
    //*prettier-ignore*/ console.log("[autocomplete-input.ts,63] searchValue: ", searchValue);
    //*prettier-ignore*/ console.log("[autocomplete-input.ts,65] this.source: ", this.source);
    this.source.forEach((word) => {
      const included = word.toLowerCase().includes(searchValue.toLowerCase());
      if (!included) return;

      this.collectSuggestion(word);
    });
    // /*prettier-ignore*/ console.log("[autocomplete-input.ts,71] this.suggestions: ", this.suggestions);
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

  private initKeyboardEvents(): void {
    if (this.attachCount > 1) return;
    const host = this.container ?? this.autocompleteContainerRef;
    host?.addEventListener("keydown", (event) => {
      if (this.container && !this.target) {
        /*prettier-ignore*/ console.error("[ERROR:<autocomplete-input>]: Need also to provide a target if you provide a container");
      }

      const finalInput = this.target ?? this.searchInputRef;
      const isActive = document.activeElement === finalInput;
      if (!isActive) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        this.activeCursorIndex = Math.min(
          this.suggestions.length - 1,
          this.activeCursorIndex + 1,
        );
        /*prettier-ignore*/ console.log("[autocomplete-input.ts,97] this.activeCursorIndex: ", this.activeCursorIndex);
        this.scrollToSuggestion();
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        this.activeCursorIndex = Math.max(0, this.activeCursorIndex - 1);
        this.scrollToSuggestion();
        return;
      }
      if (event.key === "Enter") {
        if (
          typeof this.onAccept !== "function" &&
          typeof this.onPartialAccept !== "function"
        ) {
          /*prettier-ignore*/ console.error("[WARNING:<autocomplete-input>]: You need to provide a function to the onAccept attribute. Consider the `this` context. You may want to provide an arrow function");
          return;
        }
        event.preventDefault();
        const suggestion = this.suggestions[this.activeCursorIndex];
        if (!suggestion) return;

        this.selectSuggestion(suggestion.original);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        this.value = "";
        this.clearSuggestions();
        return;
      }
      if (event.key === "Tab") {
        if (
          typeof this.onPartialAccept !== "function" &&
          typeof this.onAccept !== "function"
        ) {
          /*prettier-ignore*/ console.error("[WARNING:<autocomplete-input>]: You need to provide a function to the onPartialAccept attribute. Consider the `this` context. You may want to provide an arrow function");
          return;
        }
        event.preventDefault();
        /*prettier-ignore*/ console.log("----------------------------");
        const rawSuggestions = this.suggestions.map((s) => s.original);
        // /*prettier-ignore*/ console.log("AI.0 [autocomplete-input.ts,148] rawSuggestions: ", rawSuggestions);
        const substring = getLongestCommonSubstring(rawSuggestions);
        // /*prettier-ignore*/ console.log("AI.1.1 [autocomplete-input.ts,149] substring: ", substring);
        /*prettier-ignore*/ console.log("AI.1.2 [autocomplete-input.ts,151] this.value: ", this.value);
        const isSame = substring === this.value;
        // /*prettier-ignore*/ console.log("AI.2. [autocomplete-input.ts,151] isSame: ", isSame);
        const useSuggestion = isSame && substring.length > 0;
        // /*prettier-ignore*/ console.log("AI.3. [autocomplete-input.ts,153] useSuggestion: ", useSuggestion);
        let completion = substring;
        if (useSuggestion) {
          const suggestion = this.suggestions[this.activeCursorIndex]?.original;
          completion = suggestion;
        }
        // /*prettier-ignore*/ console.log("AI.4. [autocomplete-input.ts,155] completion: ", completion);
        this.value = completion;
        /*prettier-ignore*/ console.log(">>>> [autocomplete-input.ts,165] this.value: ", this.value);
        this.onPartialAccept?.(completion);
        return;
      }
    });
  }

  private scrollToSuggestion(): void {
    const elementToScroll = document.querySelector(
      `[data-scroll-index="${this.activeCursorIndex}"]`,
    );
    if (!elementToScroll) return;
    const is = this.suggestionIsVisible(elementToScroll as HTMLElement);
    if (is) return;

    elementToScroll.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  private suggestionIsVisible(element: HTMLElement): boolean {
    const parent = this.suggesionListRef;
    const elementRect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    return (
      elementRect.top >= parentRect.top &&
      elementRect.bottom <= parentRect.bottom
    );
  }
}
