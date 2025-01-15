import { bindable, customElement, resolve } from "aurelia";
import "./completions-provider.scss";
import {
  CompletionItem,
  CompletionsService,
} from "../../../common/services/CompletionsService";
import { GRID_FUNCTION_TRIGGER } from "../../../common/modules/keybindings/app-keys";
import { COMPLETIONS_MAP } from "../../../common/modules/constants";
import { ArrayUtils } from "../../../common/modules/array/array-utils";
import { measureTextWidth } from "../../pages/grid-test-page/grid-modules/gridModules";
import {
  getComputedValueFromPixelString,
  getValueFromComputed,
} from "../../../common/modules/css/css-variables";

export class CompletionsProvider {
  @bindable host: HTMLInputElement | HTMLTextAreaElement;

  public listRef: HTMLElement;
  public showCompletionsPopover = false;
  public completionItems: CompletionItem[] = [];

  public get listWidth(): number {
    this.listRef;
    const padding = getValueFromComputed(this.listRef, "paddingLeft");
    const longest = ArrayUtils.getLongestElement(
      this.completionItems.map((i) => i.text),
    );
    const width = measureTextWidth(longest);
    /*prettier-ignore*/ console.log("[completions-provider.ts,23] width: ", width);
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
      const isTrigger = key === GRID_FUNCTION_TRIGGER;
      const guard =
        !isTrigger && !this.host.value.startsWith(GRID_FUNCTION_TRIGGER);
      if (guard) return;
      const items = this.completionsService.getItems(
        COMPLETIONS_MAP.gridFunctions,
      );
      this.completionItems = items;
      this.showCompletionsPopover = true;
      /*prettier-ignore*/ console.log("[completions-provider.ts,20] mappings: ", items);
    });
  }
}
