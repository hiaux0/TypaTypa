import { bindable, resolve } from "aurelia";
import "./completions-provider.scss";
import {
  CompletionItem,
  CompletionsService,
} from "../../../common/services/CompletionsService";
import {
  GRID_FUNCTION_TRIGGER,
  TAB,
} from "../../../common/modules/keybindings/app-keys";
import { COMPLETIONS_MAP, PADDING } from "../../../common/modules/constants";
import { ArrayUtils } from "../../../common/modules/array/array-utils";
import { measureTextWidth } from "../../pages/grid-test-page/grid-modules/gridModules";

export class CompletionsProvider {
  @bindable host: HTMLInputElement | HTMLTextAreaElement;
  @bindable onCompletion: (item: CompletionItem) => void;

  public listRef: HTMLElement;
  public showCompletionsPopover = false;
  public completionItems: CompletionItem[] = [];
  public activeCursorIndex = 0;

  public get listWidth(): number {
    const padding = PADDING;
    const longest = ArrayUtils.getLongestElement(
      this.completionItems.map((i) => i.text),
    );
    const width = measureTextWidth(longest);
    const final = width + 2 * padding;
    return final;
  }

  private completionsService = resolve(CompletionsService);

  attached() {
    const items = this.completionsService.getItems(
      COMPLETIONS_MAP.gridFunctions,
    );
    this.completionItems = items;

    this.host.addEventListener("keydown", (_event: Event) => {
      const event = _event as KeyboardEvent;
      const key = event.key;
      if (key !== TAB) return;
      event.preventDefault();
    });

    this.host.addEventListener("keyup", (_event: Event) => {
      const event = _event as KeyboardEvent;
      const key = event.key;
      const handled = this.handleListNavigation(key, event);
      if (handled) return;

      const text = this.host.value.trim();
      // 1. '=', then letter(s)
      const startsWithTrigger = text.startsWith(GRID_FUNCTION_TRIGGER);
      if (!startsWithTrigger) {
        this.showCompletionsPopover = false;
        return;
      }

      const functionName = text.slice(1);
      const items = this.completionsService.getItems(
        COMPLETIONS_MAP.gridFunctions,
      );
      const filtered = items.filter(
        // (v) => fuzzySearch([v.text], functionName).length,
        (v) => v.text.startsWith(functionName),
      );
      this.completionItems = filtered;

      this.showCompletionsPopover = true;
    });

    this.host.focus();
  }

  private handleListNavigation(key: string, event: Event): boolean {
    let handled = false;
    switch (key) {
      case "Tab": {
        const targetItem = this.completionItems[this.activeCursorIndex];
        this.onCompletion?.(targetItem);
        this.host.value += targetItem.text;

        // reset
        this.activeCursorIndex = 0;
        this.showCompletionsPopover = false;
        this.completionItems = [];
        event.preventDefault();
        handled = true;
        break;
      }
      case "ArrowUp": {
        this.activeCursorIndex = Math.max(0, this.activeCursorIndex - 1);
        this.scrollToSuggestion();
        event.preventDefault();
        handled = true;
        break;
      }
      case "ArrowDown": {
        this.activeCursorIndex = Math.min(
          this.completionItems.length - 1,
          this.activeCursorIndex + 1,
        );
        this.scrollToSuggestion();
        event.preventDefault();
        handled = true;
        break;
      }
    }
    return handled;
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
    const elementRect = element.getBoundingClientRect();
    const parent = this.listRef;
    if (!parent) return false;
    const parentRect = parent.getBoundingClientRect();

    return (
      elementRect.top >= parentRect.top &&
      elementRect.bottom <= parentRect.bottom
    );
  }
}
