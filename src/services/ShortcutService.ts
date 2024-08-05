import { getIsInputActive } from "../modules/htmlElements";

export class ShortcutService {
  public static clickGlobalShortcut(key: string): void {
    const isActive = getIsInputActive();
    if (isActive) return;

    const hits = document.querySelectorAll(`[data-shortcut="${key}"]`);
    if (hits.length === 0) return;
    if (hits.length > 1) {
      console.warn("Multiple elements with the same shortcut:");
      console.log(hits);
    }
    (hits[0] as HTMLElement).click();
  }
}
